import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductSearch from '../components/Product/ProductSearch';
import ProductGrid from '../components/Product/ProductGrid';
import { productsAPI } from '../services/api';
import './SearchResultsPage.css';

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    if (query || category) {
      performSearch();
    }
  }, [query, category, page]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchData = {
        query: query,
        filters: category ? { category } : {},
        limit: 12,
        page: page
      };

      const data = await productsAPI.searchProducts(searchData);
      
      setProducts(data.products || []);
      setTotalResults(data.resultsCount || data.products?.length || 0);
      
      // If using the regular products API, set pagination info
      if (data.pagination) {
        setPagination(data.pagination);
      }

    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search products. Please try again.');
      toast.error('Search failed. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = (newQuery, filters = {}) => {
    const params = new URLSearchParams();
    
    if (newQuery.trim()) {
      params.set('q', newQuery.trim());
    }
    
    if (filters.category) {
      params.set('category', filters.category);
    }
    
    // Reset to page 1 for new searches
    params.set('page', '1');
    
    setSearchParams(params);
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setProducts([]);
    setTotalResults(0);
    setPagination(null);
  };

  return (
    <div className="search-results-page">
      <div className="container">
        {/* Search Header */}
        <div className="search-header">
          <div className="search-container">
            <ProductSearch
              onSearch={handleNewSearch}
              loading={loading}
              initialQuery={query}
              initialCategory={category}
              placeholder="Search for products..."
            />
          </div>
        </div>

        {/* Search Results Info */}
        {(query || category) && (
          <div className="search-info">
            <div className="search-summary">
              <h1 className="results-title">
                {loading ? 'Searching...' : `Search Results`}
              </h1>
              
              {!loading && (
                <div className="results-meta">
                  <span className="results-count">
                    {totalResults} {totalResults === 1 ? 'result' : 'results'}
                  </span>
                  
                  {query && (
                    <span className="search-query">
                      for "<strong>{query}</strong>"
                    </span>
                  )}
                  
                  {category && (
                    <span className="search-category">
                      in <strong>{category}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Active Filters */}
            {(query || category) && (
              <div className="active-filters">
                <span className="filters-label">Active filters:</span>
                
                {query && (
                  <span className="filter-tag">
                    Search: {query}
                    <button
                      onClick={() => handleNewSearch('', { category })}
                      className="remove-filter"
                      aria-label="Remove search filter"
                    >
                      ✕
                    </button>
                  </span>
                )}
                
                {category && (
                  <span className="filter-tag">
                    Category: {category}
                    <button
                      onClick={() => handleNewSearch(query, {})}
                      className="remove-filter"
                      aria-label="Remove category filter"
                    >
                      ✕
                    </button>
                  </span>
                )}
                
                <button
                  onClick={clearFilters}
                  className="clear-all-filters"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Content */}
        <div className="results-content">
          {error && (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <h3 className="error-title">Search Error</h3>
              <p className="error-message">{error}</p>
              <button 
                className="btn btn-primary"
                onClick={performSearch}
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
              emptyMessage={
                query || category
                  ? "No products found matching your search criteria."
                  : "Enter a search term or select a category to find products."
              }
            />
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && !loading && !error && (
          <div className="pagination-container">
            <div className="pagination">
              {/* Previous Button */}
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={!pagination.hasPrev}
                aria-label="Previous page"
              >
                ← Previous
              </button>

              {/* Page Numbers */}
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum;
                  
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.current <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.current >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.current - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`page-number ${pageNum === pagination.current ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={!pagination.hasNext}
                aria-label="Next page"
              >
                Next →
              </button>
            </div>

            {/* Pagination Info */}
            <div className="pagination-info">
              Showing {((pagination.current - 1) * 12) + 1} - {Math.min(pagination.current * 12, pagination.total)} of {pagination.total} results
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
