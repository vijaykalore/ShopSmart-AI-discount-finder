import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle common error cases
    if (error.response?.status === 404) {
      throw new Error('Resource not found');
    }
    
    if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    
    throw error;
  }
);

// Products API
export const productsAPI = {
  // Get all products with optional search and filtering
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get specific product by ID
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Search products
  searchProducts: async (searchData) => {
    const response = await api.post('/products/search', searchData);
    return response.data;
  },

  // Get categories and brands
  getCategories: async () => {
    const response = await api.get('/products/categories/list');
    return response.data;
  }
};

// Predictions API  
export const predictionsAPI = {
  // Get price prediction for a product
  getPrediction: async (predictionData) => {
    const response = await api.post('/predictions/predict', predictionData);
    return response.data;
  },

  // Get batch predictions
  getBatchPredictions: async (productIds) => {
    const response = await api.post('/predictions/batch', { productIds });
    return response.data;
  },

  // Get prediction history for a product
  getPredictionHistory: async (productId) => {
    const response = await api.get(`/predictions/history/${productId}`);
    return response.data;
  }
};

// Health check API
export const healthAPI = {
  checkBackend: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

// Utility functions
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const calculatePriceChange = (currentPrice, previousPrice) => {
  if (!previousPrice || previousPrice === 0) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
};

export const getPriceTrendIcon = (trend) => {
  if (trend > 0) return '📈';
  if (trend < 0) return '📉';
  return '➡️';
};

export const getConfidenceColor = (confidence) => {
  if (confidence >= 0.8) return '#059669'; // Green
  if (confidence >= 0.6) return '#d97706'; // Orange
  return '#dc2626'; // Red
};

export const getRecommendationIcon = (recommendation) => {
  const rec = recommendation?.toLowerCase() || '';
  if (rec.includes('buy') && rec.includes('now')) return '🛒';
  if (rec.includes('wait')) return '⏳';
  if (rec.includes('good')) return '👍';
  return '💡';
};

export default api;
