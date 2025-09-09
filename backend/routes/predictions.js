const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');

const router = express.Router();

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// Validation middleware
const validatePredictionRequest = [
  body('productId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('analysisType')
    .optional()
    .isIn(['trend', 'seasonal', 'full'])
    .withMessage('Invalid analysis type')
];

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

// POST /api/predictions/predict - Get price prediction for a product
router.post('/predict', validatePredictionRequest, handleValidationErrors, async (req, res) => {
  try {
    const { productId, analysisType = 'full' } = req.body;
    
    // Fetch product and its price history
    const product = await Product.findById(productId);
    
    if (!product || !product.isActive) {
      return res.status(404).json({
        error: {
          message: 'Product not found or inactive'
        }
      });
    }
    
    if (!product.priceHistory || product.priceHistory.length < 5) {
      return res.status(400).json({
        error: {
          message: 'Insufficient price history for prediction (minimum 5 data points required)'
        }
      });
    }
    
    // Prepare data for ML service
    const priceData = product.priceHistory
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(point => ({
        date: point.date.toISOString(),
        price: point.price
      }));
    
    const mlPayload = {
      product_name: product.name,
      price_history: priceData,
      analysis_type: analysisType,
      current_price: product.latestPrice,
      category: product.category
    };
    
    // Call ML service
    try {
      const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, mlPayload, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const prediction = mlResponse.data;
      
      // Add additional business logic and formatting
      const response = {
        productId: product._id,
        productName: product.name,
        currentPrice: product.latestPrice,
        prediction: {
          bestBuyTime: prediction.best_buy_time,
          confidence: prediction.confidence,
          expectedPrice: prediction.expected_price,
          savingsPercentage: prediction.savings_percentage,
          trend: prediction.trend,
          recommendation: prediction.recommendation
        },
        analysis: {
          type: analysisType,
          dataPoints: priceData.length,
          priceRange: {
            min: Math.min(...priceData.map(p => p.price)),
            max: Math.max(...priceData.map(p => p.price)),
            current: product.latestPrice
          },
          volatility: prediction.volatility || 'medium',
          seasonality: prediction.seasonality || null
        },
        generatedAt: new Date().toISOString()
      };
      
      res.json(response);
      
    } catch (mlError) {
      console.error('ML Service Error:', mlError.message);
      
      // Fallback simple prediction if ML service is unavailable
      const fallbackPrediction = generateFallbackPrediction(product);
      
      res.status(200).json({
        productId: product._id,
        productName: product.name,
        currentPrice: product.latestPrice,
        prediction: fallbackPrediction,
        analysis: {
          type: 'fallback',
          dataPoints: priceData.length,
          priceRange: {
            min: Math.min(...priceData.map(p => p.price)),
            max: Math.max(...priceData.map(p => p.price)),
            current: product.latestPrice
          },
          note: 'Using simplified analysis (ML service unavailable)'
        },
        generatedAt: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Error generating prediction:', error);
    res.status(500).json({
      error: {
        message: 'Failed to generate prediction',
        details: error.message
      }
    });
  }
});

// POST /api/predictions/batch - Get predictions for multiple products
router.post('/batch', [
  body('productIds')
    .isArray({ min: 1, max: 10 })
    .withMessage('Product IDs must be an array with 1-10 items'),
  body('productIds.*')
    .isMongoId()
    .withMessage('Each product ID must be valid')
], handleValidationErrors, async (req, res) => {
  try {
    const { productIds } = req.body;
    
    const predictions = [];
    const errors = [];
    
    for (const productId of productIds) {
      try {
        const product = await Product.findById(productId);
        
        if (!product || !product.isActive) {
          errors.push({
            productId,
            error: 'Product not found or inactive'
          });
          continue;
        }
        
        if (!product.priceHistory || product.priceHistory.length < 5) {
          errors.push({
            productId,
            error: 'Insufficient price history'
          });
          continue;
        }
        
        const fallbackPrediction = generateFallbackPrediction(product);
        
        predictions.push({
          productId: product._id,
          productName: product.name,
          currentPrice: product.latestPrice,
          prediction: fallbackPrediction
        });
        
      } catch (error) {
        errors.push({
          productId,
          error: error.message
        });
      }
    }
    
    res.json({
      predictions,
      errors,
      total: productIds.length,
      successful: predictions.length,
      failed: errors.length
    });
    
  } catch (error) {
    console.error('Error generating batch predictions:', error);
    res.status(500).json({
      error: {
        message: 'Failed to generate batch predictions',
        details: error.message
      }
    });
  }
});

// GET /api/predictions/history/:productId - Get prediction history for a product
router.get('/history/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        error: {
          message: 'Product not found'
        }
      });
    }
    
    // This would typically fetch from a predictions history collection
    // For now, return the price history with trend analysis
    const priceHistory = product.priceHistory
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const trendData = analyzePriceTrend(priceHistory);
    
    res.json({
      productId: product._id,
      productName: product.name,
      priceHistory: priceHistory.map(point => ({
        date: point.date,
        price: point.price,
        trend: point.trend || 'stable'
      })),
      trendAnalysis: trendData,
      lastUpdated: product.updatedAt
    });
    
  } catch (error) {
    console.error('Error fetching prediction history:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch prediction history',
        details: error.message
      }
    });
  }
});

// Helper function to generate fallback prediction
function generateFallbackPrediction(product) {
  const prices = product.priceHistory.map(p => p.price);
  const currentPrice = product.latestPrice;
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  // Simple trend calculation
  const recentPrices = prices.slice(-5);
  const trend = recentPrices[recentPrices.length - 1] > recentPrices[0] ? 'increasing' : 'decreasing';
  
  // Simple recommendation logic
  let recommendation = 'Monitor prices';
  let bestBuyTime = 'Within 2-4 weeks';
  let confidence = 0.6;
  let expectedPrice = currentPrice;
  let savingsPercentage = 0;
  
  if (currentPrice <= minPrice * 1.1) {
    recommendation = 'Great time to buy! Price is near historical low.';
    bestBuyTime = 'Now';
    confidence = 0.8;
  } else if (currentPrice >= maxPrice * 0.9) {
    recommendation = 'Consider waiting. Price is near historical high.';
    bestBuyTime = 'Wait 4-8 weeks';
    confidence = 0.7;
    expectedPrice = avgPrice;
    savingsPercentage = ((currentPrice - avgPrice) / currentPrice * 100);
  } else if (trend === 'decreasing') {
    recommendation = 'Price is trending down. Good time to buy soon.';
    bestBuyTime = 'Within 1-2 weeks';
    confidence = 0.65;
    expectedPrice = currentPrice * 0.95;
    savingsPercentage = 5;
  }
  
  return {
    bestBuyTime,
    confidence: Math.round(confidence * 100) / 100,
    expectedPrice: Math.round(expectedPrice * 100) / 100,
    savingsPercentage: Math.round(savingsPercentage * 100) / 100,
    trend,
    recommendation
  };
}

// Helper function to analyze price trend
function analyzePriceTrend(priceHistory) {
  if (priceHistory.length < 2) return null;
  
  const prices = priceHistory.map(p => p.price);
  const dates = priceHistory.map(p => new Date(p.date));
  
  // Calculate moving averages
  const movingAvg7 = [];
  const movingAvg30 = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i >= 6) {
      const avg7 = prices.slice(i - 6, i + 1).reduce((a, b) => a + b, 0) / 7;
      movingAvg7.push(avg7);
    }
    
    if (i >= 29) {
      const avg30 = prices.slice(i - 29, i + 1).reduce((a, b) => a + b, 0) / 30;
      movingAvg30.push(avg30);
    }
  }
  
  return {
    totalDataPoints: prices.length,
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((a, b) => a + b, 0) / prices.length
    },
    movingAverages: {
      sevenDay: movingAvg7,
      thirtyDay: movingAvg30
    },
    volatility: calculateVolatility(prices),
    dateRange: {
      start: dates[0],
      end: dates[dates.length - 1]
    }
  };
}

// Helper function to calculate price volatility
function calculateVolatility(prices) {
  if (prices.length < 2) return 0;
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - avgReturn, 2), 0) / returns.length;
  
  return Math.sqrt(variance);
}

module.exports = router;
