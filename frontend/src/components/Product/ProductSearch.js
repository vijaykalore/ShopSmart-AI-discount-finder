import React, { useState, useEffect, useRef } from 'react';
import { productsAPI } from '../../services/api';
import './ProductSearch.css';

const ProductSearch = ({ 
  onSearch, 
  loading = false, 
  placeholder = "Search for products...",
  showFilters = true,
  initialQuery = "",
  initialCategory = ""
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const timeoutRef = useRef(null);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Handle query changes with debounced suggestions
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length >= 2) {
      timeoutRef.current = setTimeout(() => {
        loadSuggestions(query);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !searchInputRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await productsAPI.getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSuggestions = async (searchQuery) => {
    try {
      setLoadingSuggestions(true);
      const data = await productsAPI.getProducts({
        q: searchQuery,
        limit: 5
      });
      
      const productSuggestions = (data.products || []).map(product => ({
        id: product._id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        type: 'product'
      }));
      
      setSuggestions(productSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!query.trim() && !category) {
      return;
    }

    setShowSuggestions(false);
    onSearch(query.trim(), { category });
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    onSearch(suggestion.name, { category: suggestion.category });
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setCategory('');
    setSuggestions([]);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  return (
    <div className="product-search">
      <form onSubmit={handleSubmit} className="search-form">
        {/* Main Search Input */}
        <div className="search-input-container">
          <div className="search-input-wrapper">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={handleQueryChange}
              onFocus={handleInputFocus}
              placeholder={placeholder}
              className="search-input"
              aria-label="Search for products"
              autoComplete="off"
            />
            
            {/* Search Icon */}
            <div className="search-icon">
              🔍
            </div>

            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="clear-button"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}

            {/* Loading indicator for suggestions */}
            {loadingSuggestions && (
              <div className="suggestions-loading">
                <div className="loading-spinner"></div>
              </div>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestionsRef} className="suggestions-dropdown">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="suggestion-icon">📦</div>
                  <div className="suggestion-content">
                    <div className="suggestion-name">{suggestion.name}</div>
                    <div className="suggestion-meta">
                      {suggestion.brand && (
                        <span className="suggestion-brand">{suggestion.brand}</span>
                      )}
                      <span className="suggestion-category">{suggestion.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Filter */}
        {showFilters && (
          <div className="filter-container">
            <select
              value={category}
              onChange={handleCategoryChange}
              className="category-select"
              aria-label="Select category"
              disabled={loadingCategories}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className="search-button"
          disabled={loading || (!query.trim() && !category)}
          aria-label="Search"
        >
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <span>Search</span>
          )}
        </button>
      </form>

      {/* Search Tips */}
      <div className="search-tips">
        <span className="tip-label">Try:</span>
        <button 
          type="button" 
          className="tip-button"
          onClick={() => { setQuery('iPhone'); onSearch('iPhone', {}); }}
        >
          iPhone
        </button>
        <button 
          type="button" 
          className="tip-button"
          onClick={() => { setQuery('MacBook'); onSearch('MacBook', {}); }}
        >
          MacBook
        </button>
        <button 
          type="button" 
          className="tip-button"
          onClick={() => { setQuery('Nike'); onSearch('Nike', {}); }}
        >
          Nike
        </button>
      </div>
    </div>
  );
};

export default ProductSearch;
