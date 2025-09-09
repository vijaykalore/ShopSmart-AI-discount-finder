const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mock Data
const mockProducts = [
  {
    _id: '1',
    name: 'iPhone 15 Pro',
    description: 'Latest Apple iPhone with advanced camera system and A17 Pro chip',
    currentPrice: 999.99,
    originalPrice: 1099.99,
    category: 'Electronics',
    brand: 'Apple',
    rating: 4.7,
    reviewCount: 2847,
    availability: true,
    retailer: 'Apple Store',
    url: 'https://apple.com/iphone-15-pro',
    imageUrl: 'https://via.placeholder.com/400x300/007acc/ffffff?text=iPhone+15+Pro',
    priceHistory: [
      { date: '2024-01-01', price: 1099.99 },
      { date: '2024-01-15', price: 1049.99 },
      { date: '2024-02-01', price: 1029.99 },
      { date: '2024-02-15', price: 999.99 }
    ]
  },
  {
    _id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android smartphone with S Pen and advanced photography features',
    currentPrice: 1199.99,
    originalPrice: 1299.99,
    category: 'Electronics',
    brand: 'Samsung',
    rating: 4.6,
    reviewCount: 1923,
    availability: true,
    retailer: 'Samsung',
    url: 'https://samsung.com/galaxy-s24-ultra',
    imageUrl: 'https://via.placeholder.com/400x300/1f1f1f/ffffff?text=Galaxy+S24+Ultra',
    priceHistory: [
      { date: '2024-01-01', price: 1299.99 },
      { date: '2024-01-15', price: 1249.99 },
      { date: '2024-02-01', price: 1199.99 }
    ]
  },
  {
    _id: '3',
    name: 'MacBook Air M2',
    description: 'Lightweight laptop with Apple M2 chip, perfect for productivity and creativity',
    currentPrice: 1099.99,
    originalPrice: 1199.99,
    category: 'Electronics',
    brand: 'Apple',
    rating: 4.8,
    reviewCount: 3421,
    availability: true,
    retailer: 'Apple Store',
    url: 'https://apple.com/macbook-air-m2',
    imageUrl: 'https://via.placeholder.com/400x300/007acc/ffffff?text=MacBook+Air+M2',
    priceHistory: [
      { date: '2024-01-01', price: 1199.99 },
      { date: '2024-01-15', price: 1149.99 },
      { date: '2024-02-01', price: 1099.99 }
    ]
  },
  {
    _id: '4',
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling wireless headphones',
    currentPrice: 349.99,
    originalPrice: 399.99,
    category: 'Electronics',
    brand: 'Sony',
    rating: 4.5,
    reviewCount: 1567,
    availability: true,
    retailer: 'Amazon',
    url: 'https://amazon.com/sony-wh1000xm5',
    imageUrl: 'https://via.placeholder.com/400x300/000000/ffffff?text=Sony+WH-1000XM5',
    priceHistory: [
      { date: '2024-01-01', price: 399.99 },
      { date: '2024-01-15', price: 379.99 },
      { date: '2024-02-01', price: 349.99 }
    ]
  },
  {
    _id: '5',
    name: 'iPad Pro 12.9"',
    description: 'Professional tablet with M2 chip and Liquid Retina XDR display',
    currentPrice: 1099.99,
    originalPrice: 1199.99,
    category: 'Electronics',
    brand: 'Apple',
    rating: 4.7,
    reviewCount: 892,
    availability: true,
    retailer: 'Apple Store',
    url: 'https://apple.com/ipad-pro',
    imageUrl: 'https://via.placeholder.com/400x300/007acc/ffffff?text=iPad+Pro+12.9',
    priceHistory: [
      { date: '2024-01-01', price: 1199.99 },
      { date: '2024-01-15', price: 1149.99 },
      { date: '2024-02-01', price: 1099.99 }
    ]
  },
  {
    _id: '6',
    name: 'Dell XPS 13',
    description: 'Premium ultrabook with InfinityEdge display and long battery life',
    currentPrice: 999.99,
    originalPrice: 1149.99,
    category: 'Electronics',
    brand: 'Dell',
    rating: 4.4,
    reviewCount: 756,
    availability: true,
    retailer: 'Dell',
    url: 'https://dell.com/xps-13',
    imageUrl: 'https://via.placeholder.com/400x300/0078d4/ffffff?text=Dell+XPS+13',
    priceHistory: [
      { date: '2024-01-01', price: 1149.99 },
      { date: '2024-01-15', price: 1099.99 },
      { date: '2024-02-01', price: 999.99 }
    ]
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ShopSmart Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const { page = 1, limit = 20, category, minPrice, maxPrice, brand, search } = req.query;
    
    let filteredProducts = [...mockProducts];
    
    // Apply filters
    if (category) {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.currentPrice >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.currentPrice <= parseFloat(maxPrice));
    }
    
    if (brand) {
      filteredProducts = filteredProducts.filter(p => 
        p.brand.toLowerCase() === brand.toLowerCase()
      );
    }
    
    if (search) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    res.json({
      products: paginatedProducts,
      totalProducts: filteredProducts.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredProducts.length / limit),
      hasNextPage: endIndex < filteredProducts.length,
      hasPrevPage: page > 1
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const product = mockProducts.find(p => p._id === id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
    
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search products
app.get('/api/search', (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, brand, sort = 'relevance', page = 1, limit = 20 } = req.query;
    
    let results = [...mockProducts];
    
    // Apply search query
    if (q) {
      results = results.filter(p => 
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.description.toLowerCase().includes(q.toLowerCase()) ||
        p.brand.toLowerCase().includes(q.toLowerCase())
      );
    }
    
    // Apply filters (same as above)
    if (category) {
      results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    
    if (minPrice) {
      results = results.filter(p => p.currentPrice >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      results = results.filter(p => p.currentPrice <= parseFloat(maxPrice));
    }
    
    if (brand) {
      results = results.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    }
    
    // Sort results
    switch (sort) {
      case 'price_low':
        results.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case 'price_high':
        results.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      default: // relevance
        break;
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = results.slice(startIndex, endIndex);
    
    res.json({
      products: paginatedResults,
      totalProducts: results.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(results.length / limit),
      query: q,
      filters: { category, minPrice, maxPrice, brand, sort }
    });
    
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Prediction routes
app.post('/api/predictions/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { timeframe = '6m' } = req.body;
    
    const product = mockProducts.find(p => p._id === id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Call ML service
    const mlResponse = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: id,
        price_history: product.priceHistory,
        timeframe: timeframe
      }),
    });
    
    if (!mlResponse.ok) {
      throw new Error('ML service unavailable');
    }
    
    const mlData = await mlResponse.json();
    res.json(mlData);
    
  } catch (error) {
    console.error('Error getting prediction:', error);
    
    // Fallback prediction if ML service is down
    const mockPrediction = {
      product_id: req.params.id,
      predictions: [
        { date: '2024-03-01', predicted_price: 999.99 },
        { date: '2024-04-01', predicted_price: 979.99 },
        { date: '2024-05-01', predicted_price: 959.99 }
      ],
      confidence: 0.75,
      trend: 'decreasing',
      timeframe: req.body.timeframe || '6m'
    };
    
    res.json(mockPrediction);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ShopSmart Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API available at: http://localhost:${PORT}/api`);
  console.log(`❤️ Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
