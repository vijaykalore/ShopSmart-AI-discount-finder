import React from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

const ProductGrid = ({ 
  products = [], 
  loading = false, 
  onProductClick,
  emptyMessage = "No products found.",
  columns = "auto-fill"
}) => {
  if (loading) {
    return (
      <div className="product-grid-container">
        <div className="products-grid">
          {[...Array(8)].map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📦</div>
        <h3 className="empty-title">No Products Found</h3>
        <p className="empty-message">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="product-grid-container">
      <div className={`products-grid ${columns === 'responsive' ? 'responsive' : ''}`}>
        {products.map((product, index) => (
          <ProductCard
            key={product._id || index}
            product={product}
            onClick={onProductClick}
            animationDelay={index * 0.1}
          />
        ))}
      </div>
    </div>
  );
};

// Skeleton loader component for loading states
const ProductCardSkeleton = () => {
  return (
    <div className="product-card skeleton">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-brand"></div>
        <div className="skeleton-line skeleton-price"></div>
        <div className="skeleton-line skeleton-trend"></div>
      </div>
    </div>
  );
};

export default ProductGrid;
