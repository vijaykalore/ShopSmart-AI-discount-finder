import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductSearch from '../components/Product/ProductSearch';
import ProductGrid from '../components/Product/ProductGrid';
import { productsAPI } from '../services/api';
import './HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load featured products on component mount
  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await productsAPI.getProducts({ 
        limit: 8,
        page: 1 
      });
      
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error loading featured products:', err);
      setError('Failed to load featured products. Please try again.');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query, filters = {}) => {
    if (!query.trim() && !filters.category) {
      toast.warning('Please enter a search term or select a category');
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);

      // Navigate to search results page with query parameters
      const searchParams = new URLSearchParams();
      if (query.trim()) {
        searchParams.set('q', query.trim());
      }
      if (filters.category) {
        searchParams.set('category', filters.category);
      }

      navigate(`/search?${searchParams.toString()}`);
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content fade-in">
            <h1 className="hero-title">
              Find the Best Time to Buy
            </h1>
            <p className="hero-subtitle">
              Use AI-powered price predictions to make smarter purchasing decisions. 
              Save money by knowing when prices will drop.
            </p>
            
            {/* Search Component */}
            <div className="hero-search">
              <ProductSearch 
                onSearch={handleSearch}
                loading={searchLoading}
                placeholder="Search for products... (e.g., iPhone, MacBook, Nike shoes)"
              />
            </div>

            {/* Quick Stats */}
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Products Tracked</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">85%</div>
                <div className="stat-label">Accuracy Rate</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">$2M+</div>
                <div className="stat-label">Money Saved</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How ShopSmart Works</h2>
            <p className="section-subtitle">
              Our AI analyzes millions of data points to predict the best time to buy
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card slide-in-right">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Price Analysis</h3>
              <p className="feature-description">
                Advanced algorithms analyze historical price data, seasonal trends, 
                and market patterns to predict future prices.
              </p>
            </div>

            <div className="feature-card slide-in-right">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI Predictions</h3>
              <p className="feature-description">
                Machine learning models provide accurate predictions on when 
                prices are likely to drop, helping you save money.
              </p>
            </div>

            <div className="feature-card slide-in-right">
              <div className="feature-icon">⏰</div>
              <h3 className="feature-title">Perfect Timing</h3>
              <p className="feature-description">
                Get personalized recommendations on the optimal time to make 
                your purchase based on predicted price movements.
              </p>
            </div>

            <div className="feature-card slide-in-right">
              <div className="feature-icon">💰</div>
              <h3 className="feature-title">Save Money</h3>
              <p className="feature-description">
                Users save an average of 15-25% on purchases by following 
                our AI-powered buying recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">
              Popular products with active price tracking and predictions
            </p>
          </div>

          {error && (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <h3 className="error-title">Unable to Load Products</h3>
              <p className="error-message">{error}</p>
              <button 
                className="btn btn-primary"
                onClick={loadFeaturedProducts}
              >
                Try Again
              </button>
            </div>
          )}

          {!error && (
            <ProductGrid
              products={products}
              loading={loading}
              onProductClick={handleProductClick}
              emptyMessage="No featured products available at the moment."
            />
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Save Money?</h2>
            <p className="cta-subtitle">
              Start using ShopSmart today and never overpay for products again
            </p>
            <div className="cta-buttons">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => document.querySelector('.hero-search input')?.focus()}
              >
                Start Searching
              </button>
              <button 
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/about')}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
