import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './ProductDetailsPage.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('6m');
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchPrediction();
    }
  }, [product, selectedTimeframe]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error('Failed to fetch product details');
      }
      
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async () => {
    try {
      setPredictionLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/predictions/product/${product._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe: selectedTimeframe,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch price prediction');
      }
      
      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      console.error('Error fetching prediction:', err);
      // Don't set error for prediction failures, just log them
    } finally {
      setPredictionLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDiscountPercentage = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const getPredictionTrend = () => {
    if (!prediction || !prediction.predictions || prediction.predictions.length < 2) {
      return 'stable';
    }
    
    const first = prediction.predictions[0].predicted_price;
    const last = prediction.predictions[prediction.predictions.length - 1].predicted_price;
    
    const changePercent = ((last - first) / first) * 100;
    
    if (changePercent > 5) return 'increasing';
    if (changePercent < -5) return 'decreasing';
    return 'stable';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return '📈';
      case 'decreasing':
        return '📉';
      default:
        return '📊';
    }
  };

  const getChartData = () => {
    if (!product || !product.priceHistory) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const history = product.priceHistory.slice(-30); // Last 30 data points
    const predictions = prediction?.predictions || [];

    const historyLabels = history.map(item => formatDate(item.date));
    const predictionLabels = predictions.map(item => formatDate(item.date));
    
    const allLabels = [...historyLabels, ...predictionLabels];
    const historyPrices = history.map(item => item.price);
    const predictionPrices = new Array(historyLabels.length).fill(null).concat(
      predictions.map(item => item.predicted_price)
    );

    return {
      labels: allLabels,
      datasets: [
        {
          label: 'Historical Price',
          data: [...historyPrices, ...new Array(predictionLabels.length).fill(null)],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.1,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
        },
        {
          label: 'Predicted Price',
          data: predictionPrices,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderDash: [5, 5],
          fill: false,
          tension: 0.1,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Price History & Predictions',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatPrice(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price (USD)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return formatPrice(value);
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const timeframeOptions = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
  ];

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-page">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2 className="error-title">Error Loading Product</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate(-1)} className="btn btn-secondary">
              Go Back
            </button>
            <button onClick={fetchProduct} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="error-container">
          <div className="error-icon">🔍</div>
          <h2 className="error-title">Product Not Found</h2>
          <p className="error-message">
            The product you're looking for doesn't exist or may have been removed.
          </p>
          <div className="error-actions">
            <button onClick={() => navigate(-1)} className="btn btn-secondary">
              Go Back
            </button>
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const discountPercentage = getDiscountPercentage(product.originalPrice, product.currentPrice);
  const trend = getPredictionTrend();
  
  return (
    <div className="product-details-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <nav aria-label="Breadcrumb">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/search">Search</Link></li>
              <li><span>{product.category}</span></li>
              <li aria-current="page">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container">
        {/* Product Header */}
        <div className="product-header">
          <div className="product-image">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              onError={(e) => {
                e.target.src = '/placeholder-product.png';
              }}
            />
            {discountPercentage > 0 && (
              <div className="discount-badge">
                -{discountPercentage}%
              </div>
            )}
          </div>

          <div className="product-info">
            <div className="product-meta">
              <span className="category">{product.category}</span>
              <span className="brand">{product.brand}</span>
            </div>

            <h1 className="product-title">{product.name}</h1>

            <div className="product-rating" aria-label={`Rating: ${product.rating} out of 5 stars`}>
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`star ${i < Math.floor(product.rating) ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-text">
                {product.rating} ({product.reviewCount || 0} reviews)
              </span>
            </div>

            <div className="price-section">
              <div className="current-price">{formatPrice(product.currentPrice)}</div>
              {product.originalPrice && product.originalPrice > product.currentPrice && (
                <div className="original-price">{formatPrice(product.originalPrice)}</div>
              )}
            </div>

            <div className="product-availability">
              <span className={`availability ${product.availability ? 'in-stock' : 'out-of-stock'}`}>
                {product.availability ? '✅ In Stock' : '❌ Out of Stock'}
              </span>
            </div>

            <div className="product-actions">
              <a 
                href={product.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary btn-large"
              >
                View on {product.retailer}
              </a>
              <button className="btn btn-secondary btn-large">
                Add to Watchlist
              </button>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="product-description">
          <h2>Product Description</h2>
          <div className={`description-text ${showFullDescription ? 'expanded' : ''}`}>
            <p>{product.description || 'No description available for this product.'}</p>
          </div>
          {product.description && product.description.length > 300 && (
            <button 
              className="toggle-description"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>

        {/* Price Analysis */}
        <div className="price-analysis">
          <div className="analysis-header">
            <h2>Price Analysis & Predictions</h2>
            <div className="timeframe-selector">
              <label htmlFor="timeframe">Prediction Timeframe:</label>
              <select 
                id="timeframe"
                value={selectedTimeframe} 
                onChange={(e) => setSelectedTimeframe(e.target.value)}
              >
                {timeframeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prediction Summary */}
          {prediction && (
            <div className="prediction-summary">
              <div className="prediction-card">
                <div className="prediction-icon">{getTrendIcon(trend)}</div>
                <div className="prediction-content">
                  <h3>Price Trend</h3>
                  <p className={`trend ${trend}`}>
                    {trend === 'increasing' && 'Expected to increase'}
                    {trend === 'decreasing' && 'Expected to decrease'}
                    {trend === 'stable' && 'Expected to remain stable'}
                  </p>
                </div>
              </div>

              <div className="prediction-card">
                <div className="prediction-icon">🎯</div>
                <div className="prediction-content">
                  <h3>Confidence</h3>
                  <p className="confidence">
                    {Math.round((prediction.confidence || 0.5) * 100)}%
                  </p>
                </div>
              </div>

              {prediction.predictions && prediction.predictions.length > 0 && (
                <div className="prediction-card">
                  <div className="prediction-icon">💰</div>
                  <div className="prediction-content">
                    <h3>Predicted Price</h3>
                    <p className="predicted-price">
                      {formatPrice(prediction.predictions[prediction.predictions.length - 1].predicted_price)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chart */}
          <div className="chart-container">
            {predictionLoading ? (
              <div className="chart-loading">
                <div className="loading-spinner"></div>
                <p>Generating predictions...</p>
              </div>
            ) : (
              <div className="chart-wrapper">
                <Line data={getChartData()} options={chartOptions} />
              </div>
            )}
          </div>

          {/* Price Statistics */}
          {product.priceHistory && product.priceHistory.length > 0 && (
            <div className="price-statistics">
              <h3>Price Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Lowest Price</div>
                  <div className="stat-value">
                    {formatPrice(Math.min(...product.priceHistory.map(p => p.price)))}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Highest Price</div>
                  <div className="stat-value">
                    {formatPrice(Math.max(...product.priceHistory.map(p => p.price)))}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Average Price</div>
                  <div className="stat-value">
                    {formatPrice(
                      product.priceHistory.reduce((sum, p) => sum + p.price, 0) / 
                      product.priceHistory.length
                    )}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Price Changes</div>
                  <div className="stat-value">
                    {product.priceHistory.length} records
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="product-specifications">
            <h2>Specifications</h2>
            <div className="specs-grid">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="spec-item">
                  <div className="spec-label">{key}</div>
                  <div className="spec-value">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Products */}
        <div className="similar-products">
          <h2>Similar Products</h2>
          <p className="coming-soon">Similar product recommendations coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
