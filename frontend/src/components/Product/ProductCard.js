import React from 'react';
import { formatPrice, getPriceTrendIcon } from '../../services/api';
import './ProductCard.css';

const ProductCard = ({ product, onClick, animationDelay = 0 }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i}>⭐</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half">⭐</span>);
    }
    
    return stars;
  };

  const getTrendClass = (trend) => {
    const trendValue = parseFloat(trend);
    if (trendValue > 0) return 'trend-up';
    if (trendValue < 0) return 'trend-down';
    return 'trend-stable';
  };

  const getTrendText = (trend) => {
    const trendValue = parseFloat(trend);
    if (trendValue > 0) return `+${Math.abs(trendValue).toFixed(1)}%`;
    if (trendValue < 0) return `-${Math.abs(trendValue).toFixed(1)}%`;
    return 'Stable';
  };

  return (
    <div 
      className="product-card fade-in"
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${product.name}`}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      {/* Product Image */}
      <div className="product-image-container">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback placeholder */}
        <div 
          className="product-image-placeholder"
          style={{ display: product.imageUrl ? 'none' : 'flex' }}
        >
          📦
        </div>

        {/* Category Badge */}
        {product.category && (
          <div className="category-badge">
            {product.category}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        {/* Brand */}
        {product.brand && (
          <div className="product-brand">
            {product.brand}
          </div>
        )}

        {/* Name */}
        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        {/* Price */}
        <div className="product-price">
          {product.currentPrice ? formatPrice(product.currentPrice) : 'Price unavailable'}
        </div>

        {/* Price Trend */}
        {product.priceTrend !== undefined && (
          <div className={`product-trend ${getTrendClass(product.priceTrend)}`}>
            <span className="trend-icon">
              {getPriceTrendIcon(parseFloat(product.priceTrend))}
            </span>
            <span className="trend-text">
              {getTrendText(product.priceTrend)}
            </span>
          </div>
        )}

        {/* Rating */}
        {product.averageRating && product.averageRating > 0 && (
          <div className="product-rating">
            <div className="stars">
              {renderStars(product.averageRating)}
            </div>
            <span className="rating-text">
              {product.averageRating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Price Stats */}
        {product.priceStats && (
          <div className="price-stats">
            <div className="stat-item">
              <span className="stat-label">Min:</span>
              <span className="stat-value">{formatPrice(product.priceStats.min)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Max:</span>
              <span className="stat-value">{formatPrice(product.priceStats.max)}</span>
            </div>
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="product-tags">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="tag tag-more">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="product-actions">
          <button 
            className="view-details-btn"
            onClick={handleClick}
            aria-label={`Get price prediction for ${product.name}`}
          >
            Get Price Prediction
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
