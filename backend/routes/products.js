const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');

const router = express.Router();

// Validation middleware
const validateProductSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('category')
    .optional()
    .isIn(['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Automotive', 'Other'])
    .withMessage('Invalid category'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
];

// Error handler for validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        details: errors.array()
      }
    });
  }
  next();
};

// GET /api/products - Get all products with optional search and filtering
router.get('/', validateProductSearch, handleValidationErrors, async (req, res) => {
  try {
    const { q, category, brand, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const options = {
      limit: parseInt(limit),
      skip: skip,
      category,
      brand,
      sort: { updatedAt: -1 }
    };
    
    const products = await Product.searchProducts(q, options);
    
    // Get total count for pagination
    const searchQuery = { isActive: true };
    if (q) {
      searchQuery.$or = [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    if (category) searchQuery.category = category;
    if (brand) searchQuery.brand = { $regex: brand, $options: 'i' };
    
    const total = await Product.countDocuments(searchQuery);
    
    res.json({
      products: products.map(product => ({
        _id: product._id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        description: product.description,
        imageUrl: product.imageUrl,
        currentPrice: product.latestPrice,
        priceTrend: product.priceTrend,
        averageRating: product.averageRating,
        tags: product.tags,
        priceStats: product.getPriceStats()
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: skip + limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch products',
        details: error.message
      }
    });
  }
});

// GET /api/products/:id - Get specific product with full price history
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: {
          message: 'Invalid product ID format'
        }
      });
    }
    
    const product = await Product.findById(id);
    
    if (!product || !product.isActive) {
      return res.status(404).json({
        error: {
          message: 'Product not found'
        }
      });
    }
    
    // Sort price history by date
    product.priceHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json({
      product: {
        _id: product._id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        description: product.description,
        imageUrl: product.imageUrl,
        currentPrice: product.latestPrice,
        priceTrend: product.priceTrend,
        averageRating: product.averageRating,
        tags: product.tags,
        priceHistory: product.priceHistory,
        priceStats: product.getPriceStats(),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch product',
        details: error.message
      }
    });
  }
});

// POST /api/products/search - Advanced product search
router.post('/search', [
  body('query')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  body('filters')
    .optional()
    .isObject()
    .withMessage('Filters must be an object'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], handleValidationErrors, async (req, res) => {
  try {
    const { query, filters = {}, limit = 20, page = 1 } = req.body;
    const skip = (page - 1) * limit;
    
    const options = {
      limit: parseInt(limit),
      skip: skip,
      ...filters,
      sort: { score: { $meta: 'textScore' }, updatedAt: -1 }
    };
    
    const products = await Product.searchProducts(query, options);
    
    res.json({
      products: products.map(product => ({
        _id: product._id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        description: product.description,
        imageUrl: product.imageUrl,
        currentPrice: product.latestPrice,
        priceTrend: product.priceTrend,
        averageRating: product.averageRating,
        tags: product.tags,
        priceStats: product.getPriceStats()
      })),
      query: query || '',
      resultsCount: products.length
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      error: {
        message: 'Failed to search products',
        details: error.message
      }
    });
  }
});

// GET /api/products/categories/list - Get all available categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    const brands = await Product.distinct('brand', { isActive: true });
    
    res.json({
      categories: categories.sort(),
      brands: brands.filter(Boolean).sort(),
      totalProducts: await Product.countDocuments({ isActive: true })
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch categories',
        details: error.message
      }
    });
  }
});

module.exports = router;
