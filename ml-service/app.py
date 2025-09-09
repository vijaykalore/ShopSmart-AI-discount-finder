import os
import logging
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
import warnings

# Suppress sklearn warnings
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://localhost:3001'])

class PricePredictionEngine:
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = LinearRegression()
        
    def preprocess_data(self, price_history):
        """Convert price history to DataFrame and prepare features"""
        try:
            df = pd.DataFrame(price_history)
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date').reset_index(drop=True)
            
            # Create time-based features
            df['days_since_start'] = (df['date'] - df['date'].min()).dt.days
            df['day_of_week'] = df['date'].dt.dayofweek
            df['month'] = df['date'].dt.month
            df['week_of_year'] = df['date'].dt.isocalendar().week
            
            # Create price features
            df['price_ma_7'] = df['price'].rolling(window=min(7, len(df)), center=True).mean()
            df['price_ma_30'] = df['price'].rolling(window=min(30, len(df)), center=True).mean()
            df['price_change'] = df['price'].pct_change()
            df['price_volatility'] = df['price'].rolling(window=min(7, len(df))).std()
            
            # Fill NaN values
            df = df.fillna(method='bfill').fillna(method='ffill')
            
            return df
        except Exception as e:
            logger.error(f"Error preprocessing data: {str(e)}")
            raise
    
    def detect_seasonality(self, df):
        """Detect seasonal patterns in price data"""
        try:
            if len(df) < 12:  # Not enough data for seasonal analysis
                return None
            
            # Group by month and calculate average prices
            monthly_avg = df.groupby('month')['price'].mean()
            
            # Simple seasonality detection based on coefficient of variation
            cv = monthly_avg.std() / monthly_avg.mean()
            
            if cv > 0.1:  # Threshold for seasonal variation
                best_months = monthly_avg.nsmallest(3).index.tolist()
                worst_months = monthly_avg.nlargest(3).index.tolist()
                
                return {
                    'has_seasonality': True,
                    'best_months': best_months,
                    'worst_months': worst_months,
                    'variation_coefficient': round(cv, 3)
                }
            
            return {'has_seasonality': False}
        except Exception as e:
            logger.warning(f"Seasonality detection failed: {str(e)}")
            return None
    
    def calculate_trend(self, df):
        """Calculate price trend using linear regression"""
        try:
            X = df[['days_since_start']].values
            y = df['price'].values
            
            trend_model = LinearRegression()
            trend_model.fit(X, y)
            
            slope = trend_model.coef_[0]
            r2 = r2_score(y, trend_model.predict(X))
            
            if slope > 0.1:
                trend = 'increasing'
            elif slope < -0.1:
                trend = 'decreasing'
            else:
                trend = 'stable'
            
            return {
                'trend': trend,
                'slope': round(slope, 4),
                'r2_score': round(r2, 3)
            }
        except Exception as e:
            logger.warning(f"Trend calculation failed: {str(e)}")
            return {'trend': 'stable', 'slope': 0, 'r2_score': 0}
    
    def predict_future_prices(self, df, days_ahead=30):
        """Predict future prices using machine learning"""
        try:
            # Prepare features
            feature_columns = ['days_since_start', 'day_of_week', 'month', 'price_ma_7']
            X = df[feature_columns].values
            y = df['price'].values
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model.fit(X_scaled, y)
            
            # Make predictions for future dates
            last_date = df['date'].max()
            future_dates = [last_date + timedelta(days=i) for i in range(1, days_ahead + 1)]
            
            predictions = []
            for future_date in future_dates:
                days_since_start = (future_date - df['date'].min()).days
                day_of_week = future_date.weekday()
                month = future_date.month
                price_ma_7 = df['price'].tail(7).mean()  # Use recent average
                
                future_features = np.array([[days_since_start, day_of_week, month, price_ma_7]])
                future_features_scaled = self.scaler.transform(future_features)
                
                predicted_price = self.model.predict(future_features_scaled)[0]
                predictions.append({
                    'date': future_date.isoformat(),
                    'predicted_price': round(max(0, predicted_price), 2)  # Ensure non-negative
                })
            
            return predictions
        except Exception as e:
            logger.error(f"Future price prediction failed: {str(e)}")
            return []
    
    def analyze_best_buy_time(self, df, future_predictions, current_price):
        """Determine the best time to buy based on predictions"""
        try:
            if not future_predictions:
                return self._fallback_recommendation(df, current_price)
            
            # Find the minimum predicted price in the next 30 days
            future_prices = [p['predicted_price'] for p in future_predictions]
            min_future_price = min(future_prices)
            min_price_index = future_prices.index(min_future_price)
            best_buy_date = future_predictions[min_price_index]['date']
            
            # Calculate potential savings
            savings_percentage = ((current_price - min_future_price) / current_price) * 100
            
            # Determine confidence based on model performance and price stability
            historical_prices = df['price'].values
            price_volatility = np.std(historical_prices) / np.mean(historical_prices)
            
            if price_volatility < 0.1:
                confidence = 0.8
            elif price_volatility < 0.2:
                confidence = 0.7
            else:
                confidence = 0.6
            
            # Generate recommendation
            days_to_wait = min_price_index + 1
            
            if savings_percentage > 10:
                recommendation = f"Wait {days_to_wait} days for potential {savings_percentage:.1f}% savings"
                best_buy_time = f"In {days_to_wait} days"
            elif savings_percentage > 5:
                recommendation = f"Consider waiting {days_to_wait} days for {savings_percentage:.1f}% savings"
                best_buy_time = f"In {days_to_wait} days"
            elif current_price <= np.percentile(historical_prices, 25):
                recommendation = "Good time to buy! Current price is in the lower 25% of historical range"
                best_buy_time = "Now"
                confidence = min(confidence + 0.1, 0.9)
            else:
                recommendation = "Price is stable. Buy when convenient"
                best_buy_time = "Anytime in the next 2 weeks"
            
            return {
                'best_buy_time': best_buy_time,
                'confidence': round(confidence, 2),
                'expected_price': round(min_future_price, 2),
                'savings_percentage': round(max(0, savings_percentage), 2),
                'recommendation': recommendation,
                'days_to_wait': days_to_wait
            }
        except Exception as e:
            logger.error(f"Best buy time analysis failed: {str(e)}")
            return self._fallback_recommendation(df, current_price)
    
    def _fallback_recommendation(self, df, current_price):
        """Fallback recommendation when ML prediction fails"""
        historical_prices = df['price'].values
        avg_price = np.mean(historical_prices)
        min_price = np.min(historical_prices)
        
        if current_price <= min_price * 1.1:
            return {
                'best_buy_time': 'Now',
                'confidence': 0.7,
                'expected_price': current_price,
                'savings_percentage': 0,
                'recommendation': 'Good time to buy! Price is near historical low',
                'days_to_wait': 0
            }
        elif current_price <= avg_price:
            return {
                'best_buy_time': 'Within 1 week',
                'confidence': 0.6,
                'expected_price': current_price * 0.98,
                'savings_percentage': 2,
                'recommendation': 'Decent time to buy. Price is below average',
                'days_to_wait': 3
            }
        else:
            return {
                'best_buy_time': 'Wait 2-4 weeks',
                'confidence': 0.5,
                'expected_price': avg_price,
                'savings_percentage': ((current_price - avg_price) / current_price) * 100,
                'recommendation': 'Consider waiting. Price is above average',
                'days_to_wait': 14
            }

# Initialize prediction engine
predictor = PricePredictionEngine()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'message': 'ShopSmart ML Service is running',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/predict', methods=['POST'])
def predict_price():
    """Main prediction endpoint"""
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['product_name', 'price_history', 'current_price']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        price_history = data['price_history']
        current_price = data['current_price']
        product_name = data['product_name']
        analysis_type = data.get('analysis_type', 'full')
        
        if len(price_history) < 5:
            return jsonify({
                'error': 'Insufficient price history. Minimum 5 data points required'
            }), 400
        
        logger.info(f"Processing prediction for {product_name} with {len(price_history)} data points")
        
        # Preprocess data
        df = predictor.preprocess_data(price_history)
        
        # Perform analysis based on type
        result = {'product_name': product_name}
        
        if analysis_type in ['trend', 'full']:
            trend_analysis = predictor.calculate_trend(df)
            result.update(trend_analysis)
        
        if analysis_type in ['seasonal', 'full']:
            seasonality = predictor.detect_seasonality(df)
            if seasonality:
                result['seasonality'] = seasonality
        
        if analysis_type == 'full':
            # Full analysis with price prediction
            future_predictions = predictor.predict_future_prices(df)
            buy_analysis = predictor.analyze_best_buy_time(df, future_predictions, current_price)
            
            result.update(buy_analysis)
            result['future_predictions'] = future_predictions[:7]  # Return first 7 days
            result['volatility'] = round(np.std(df['price']) / np.mean(df['price']), 3)
        
        logger.info(f"Prediction completed for {product_name}")
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({
            'error': 'Internal server error during prediction',
            'details': str(e)
        }), 500

@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    """Batch prediction endpoint for multiple products"""
    try:
        data = request.get_json()
        products = data.get('products', [])
        
        if not products or len(products) > 10:
            return jsonify({
                'error': 'Products array must contain 1-10 items'
            }), 400
        
        results = []
        errors = []
        
        for product_data in products:
            try:
                # Process individual product prediction
                df = predictor.preprocess_data(product_data['price_history'])
                trend_analysis = predictor.calculate_trend(df)
                buy_analysis = predictor.analyze_best_buy_time(
                    df, [], product_data['current_price']
                )
                
                result = {
                    'product_id': product_data.get('product_id'),
                    'product_name': product_data['product_name'],
                    **trend_analysis,
                    **buy_analysis
                }
                results.append(result)
                
            except Exception as e:
                errors.append({
                    'product_id': product_data.get('product_id'),
                    'error': str(e)
                })
        
        return jsonify({
            'results': results,
            'errors': errors,
            'total_processed': len(results),
            'total_errors': len(errors)
        }), 200
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        return jsonify({
            'error': 'Internal server error during batch prediction',
            'details': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info("Starting ShopSmart ML Service")
    app.run(host='0.0.0.0', port=5000, debug=True)
