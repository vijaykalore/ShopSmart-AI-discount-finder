import os
import logging
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import random
import math
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class SimplePricePredictionModel:
    """Simple price prediction model using basic statistical methods"""
    
    def __init__(self):
        self.is_trained = False
        
    def simple_linear_regression(self, x, y):
        """Simple linear regression implementation"""
        n = len(x)
        if n < 2:
            return 0, np.mean(y) if len(y) > 0 else 0
        
        # Calculate slope and intercept
        x_mean = np.mean(x)
        y_mean = np.mean(y)
        
        numerator = np.sum((x - x_mean) * (y - y_mean))
        denominator = np.sum((x - x_mean) ** 2)
        
        if denominator == 0:
            return 0, y_mean
        
        slope = numerator / denominator
        intercept = y_mean - slope * x_mean
        
        return slope, intercept
    
    def calculate_moving_average(self, prices, window=7):
        """Calculate moving average"""
        if len(prices) < window:
            return np.mean(prices)
        return np.mean(prices[-window:])
    
    def calculate_volatility(self, prices, window=7):
        """Calculate price volatility"""
        if len(prices) < window:
            return np.std(prices) if len(prices) > 1 else 0
        return np.std(prices[-window:])
    
    def predict_price(self, price_history, timeframe_days=30):
        """Predict future prices using simple statistical methods"""
        try:
            if not price_history or len(price_history) < 2:
                return [], 0.5
            
            # Convert to arrays
            dates = [datetime.fromisoformat(item['date'].replace('Z', '+00:00')) for item in price_history]
            prices = [float(item['price']) for item in price_history]
            
            # Convert dates to numeric (days from first date)
            base_date = dates[0]
            x_data = [(date - base_date).days for date in dates]
            
            # Simple linear regression
            slope, intercept = self.simple_linear_regression(np.array(x_data), np.array(prices))
            
            # Calculate moving average and volatility for trend analysis
            ma_7 = self.calculate_moving_average(prices, 7)
            volatility = self.calculate_volatility(prices, 7)
            
            # Generate future predictions
            predictions = []
            current_price = prices[-1]
            last_x = x_data[-1]
            
            # Add some randomness based on volatility
            for i in range(1, timeframe_days + 1):
                future_x = last_x + i
                
                # Linear trend prediction
                trend_price = slope * future_x + intercept
                
                # Add seasonal and noise components
                seasonal_factor = 1 + 0.1 * math.sin(2 * math.pi * i / 30)  # Monthly seasonality
                noise_factor = 1 + random.uniform(-volatility/current_price, volatility/current_price) * 0.1
                
                # Combine all factors
                predicted_price = trend_price * seasonal_factor * noise_factor
                
                # Ensure price doesn't go negative or change too dramatically
                predicted_price = max(predicted_price, current_price * 0.5)
                predicted_price = min(predicted_price, current_price * 2.0)
                
                future_date = base_date + timedelta(days=future_x)
                predictions.append({
                    'date': future_date.isoformat(),
                    'predicted_price': round(predicted_price, 2)
                })
            
            # Calculate confidence based on data quality
            confidence = self.calculate_confidence(prices, volatility)
            
            return predictions, confidence
            
        except Exception as e:
            logger.error(f"Error in price prediction: {str(e)}")
            return [], 0.1
    
    def calculate_confidence(self, prices, volatility):
        """Calculate prediction confidence based on data quality"""
        try:
            # Base confidence on data quantity and stability
            data_points = len(prices)
            
            # More data points = higher confidence
            data_confidence = min(data_points / 30, 1.0)  # Max at 30 data points
            
            # Lower volatility = higher confidence
            avg_price = np.mean(prices)
            volatility_ratio = volatility / avg_price if avg_price > 0 else 1.0
            volatility_confidence = max(1.0 - volatility_ratio, 0.1)
            
            # Combine factors
            overall_confidence = (data_confidence * 0.6 + volatility_confidence * 0.4)
            
            return round(overall_confidence, 2)
            
        except Exception as e:
            logger.error(f"Error calculating confidence: {str(e)}")
            return 0.5

# Global model instance
model = SimplePricePredictionModel()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ShopSmart ML Service',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict_single_product():
    """Predict price for a single product"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        product_id = data.get('product_id')
        price_history = data.get('price_history', [])
        timeframe = data.get('timeframe', '1m')
        
        if not product_id:
            return jsonify({'error': 'Product ID is required'}), 400
        
        if not price_history:
            return jsonify({'error': 'Price history is required'}), 400
        
        # Convert timeframe to days
        timeframe_map = {
            '1m': 30,
            '3m': 90,
            '6m': 180,
            '1y': 365
        }
        
        days = timeframe_map.get(timeframe, 30)
        
        # Generate predictions
        predictions, confidence = model.predict_price(price_history, days)
        
        # Determine trend
        if len(predictions) >= 2:
            start_price = predictions[0]['predicted_price']
            end_price = predictions[-1]['predicted_price']
            if end_price > start_price * 1.05:
                trend = 'increasing'
            elif end_price < start_price * 0.95:
                trend = 'decreasing'
            else:
                trend = 'stable'
        else:
            trend = 'stable'
        
        response = {
            'product_id': product_id,
            'predictions': predictions[:min(30, len(predictions))],  # Limit to 30 predictions
            'confidence': confidence,
            'trend': trend,
            'timeframe': timeframe,
            'generated_at': datetime.now().isoformat()
        }
        
        logger.info(f"Generated prediction for product {product_id} with confidence {confidence}")
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in predict endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """Predict prices for multiple products"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        products = data.get('products', [])
        timeframe = data.get('timeframe', '1m')
        
        if not products:
            return jsonify({'error': 'Products list is required'}), 400
        
        results = []
        
        for product in products:
            product_id = product.get('product_id')
            price_history = product.get('price_history', [])
            
            if not product_id or not price_history:
                results.append({
                    'product_id': product_id,
                    'error': 'Missing product_id or price_history'
                })
                continue
            
            # Convert timeframe to days
            timeframe_map = {
                '1m': 30,
                '3m': 90,
                '6m': 180,
                '1y': 365
            }
            
            days = timeframe_map.get(timeframe, 30)
            
            # Generate predictions
            predictions, confidence = model.predict_price(price_history, days)
            
            # Determine trend
            if len(predictions) >= 2:
                start_price = predictions[0]['predicted_price']
                end_price = predictions[-1]['predicted_price']
                if end_price > start_price * 1.05:
                    trend = 'increasing'
                elif end_price < start_price * 0.95:
                    trend = 'decreasing'
                else:
                    trend = 'stable'
            else:
                trend = 'stable'
            
            results.append({
                'product_id': product_id,
                'predictions': predictions[:min(10, len(predictions))],  # Limit for batch
                'confidence': confidence,
                'trend': trend
            })
        
        response = {
            'results': results,
            'timeframe': timeframe,
            'processed_count': len(results),
            'generated_at': datetime.now().isoformat()
        }
        
        logger.info(f"Generated batch predictions for {len(results)} products")
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in batch predict endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/analyze/trend', methods=['POST'])
def analyze_trend():
    """Analyze price trends for a product"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        price_history = data.get('price_history', [])
        
        if not price_history:
            return jsonify({'error': 'Price history is required'}), 400
        
        prices = [float(item['price']) for item in price_history]
        
        if len(prices) < 2:
            return jsonify({
                'trend': 'insufficient_data',
                'change_percent': 0,
                'volatility': 0,
                'moving_average_7': prices[0] if prices else 0
            })
        
        # Calculate trend
        start_price = prices[0]
        end_price = prices[-1]
        change_percent = ((end_price - start_price) / start_price) * 100
        
        # Calculate statistics
        volatility = model.calculate_volatility(prices)
        ma_7 = model.calculate_moving_average(prices, 7)
        
        # Determine trend direction
        if change_percent > 5:
            trend = 'increasing'
        elif change_percent < -5:
            trend = 'decreasing'
        else:
            trend = 'stable'
        
        response = {
            'trend': trend,
            'change_percent': round(change_percent, 2),
            'volatility': round(volatility, 2),
            'moving_average_7': round(ma_7, 2),
            'price_range': {
                'min': min(prices),
                'max': max(prices),
                'avg': round(np.mean(prices), 2)
            },
            'data_points': len(prices)
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in trend analysis: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info("Starting ShopSmart ML Service")
    logger.info("Available endpoints:")
    logger.info("  GET  /health - Health check")
    logger.info("  POST /predict - Single product prediction")
    logger.info("  POST /predict/batch - Batch prediction")
    logger.info("  POST /analyze/trend - Trend analysis")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
