const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  source: {
    type: String,
    default: 'sample_data'
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Automotive', 'Other']
  },
  brand: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid image URL format'
    }
  },
  priceHistory: [priceHistorySchema],
  currentPrice: {
    type: Number,
    min: 0
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting the latest price
productSchema.virtual('latestPrice').get(function() {
  if (this.priceHistory && this.priceHistory.length > 0) {
    const sortedPrices = this.priceHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedPrices[0].price;
  }
  return this.currentPrice || 0;
});

// Virtual for price trend (percentage change from first to last price)
productSchema.virtual('priceTrend').get(function() {
  if (this.priceHistory && this.priceHistory.length >= 2) {
    const sortedPrices = this.priceHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstPrice = sortedPrices[0].price;
    const lastPrice = sortedPrices[sortedPrices.length - 1].price;
    return ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
  }
  return 0;
});

// Index for text search
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  brand: 'text',
  tags: 'text' 
});

// Index for category and brand filtering
productSchema.index({ category: 1, brand: 1 });

// Index for active products
productSchema.index({ isActive: 1 });

// Static method to search products
productSchema.statics.searchProducts = function(query, options = {}) {
  const searchQuery = { isActive: true };
  
  if (query) {
    searchQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { brand: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }
  
  if (options.category) {
    searchQuery.category = options.category;
  }
  
  if (options.brand) {
    searchQuery.brand = { $regex: options.brand, $options: 'i' };
  }
  
  return this.find(searchQuery)
    .limit(options.limit || 20)
    .skip(options.skip || 0)
    .sort(options.sort || { name: 1 });
};

// Method to add price point to history
productSchema.methods.addPricePoint = function(price, date = new Date(), source = 'manual') {
  this.priceHistory.push({
    date: date,
    price: price,
    source: source
  });
  this.currentPrice = price;
  return this.save();
};

// Method to get price statistics
productSchema.methods.getPriceStats = function() {
  if (!this.priceHistory || this.priceHistory.length === 0) {
    return null;
  }
  
  const prices = this.priceHistory.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  
  return {
    min: minPrice,
    max: maxPrice,
    average: parseFloat(avgPrice.toFixed(2)),
    current: this.latestPrice,
    dataPoints: prices.length
  };
};

module.exports = mongoose.model('Product', productSchema);
