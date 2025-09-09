import json
import random
import math
from datetime import datetime, timedelta
import uuid

def generate_sample_data():
    """Generate sample product data with realistic price histories"""
    
    products = [
        {
            "name": "iPhone 15 Pro",
            "category": "Electronics",
            "brand": "Apple",
            "description": "Latest iPhone with Pro camera system and titanium design",
            "imageUrl": "https://example.com/iphone15pro.jpg",
            "averageRating": 4.7,
            "tags": ["smartphone", "apple", "5g", "camera", "premium"]
        },
        {
            "name": "Samsung Galaxy S24 Ultra",
            "category": "Electronics", 
            "brand": "Samsung",
            "description": "Flagship Android smartphone with S Pen and advanced AI features",
            "imageUrl": "https://example.com/galaxys24.jpg",
            "averageRating": 4.6,
            "tags": ["smartphone", "samsung", "android", "s-pen", "camera"]
        },
        {
            "name": "MacBook Air M3",
            "category": "Electronics",
            "brand": "Apple", 
            "description": "Ultra-thin laptop with M3 chip and all-day battery life",
            "imageUrl": "https://example.com/macbookair.jpg",
            "averageRating": 4.8,
            "tags": ["laptop", "apple", "m3", "ultrabook", "macos"]
        },
        {
            "name": "Sony WH-1000XM5",
            "category": "Electronics",
            "brand": "Sony",
            "description": "Industry-leading noise canceling wireless headphones",
            "imageUrl": "https://example.com/sonywh1000xm5.jpg", 
            "averageRating": 4.5,
            "tags": ["headphones", "wireless", "noise-canceling", "sony", "audio"]
        },
        {
            "name": "Nike Air Max 270",
            "category": "Fashion",
            "brand": "Nike",
            "description": "Lifestyle sneakers with Max Air unit for all-day comfort",
            "imageUrl": "https://example.com/airmax270.jpg",
            "averageRating": 4.3,
            "tags": ["sneakers", "nike", "air-max", "casual", "comfort"]
        },
        {
            "name": "Instant Pot Duo 7-in-1",
            "category": "Home & Kitchen",
            "brand": "Instant Pot",
            "description": "Electric pressure cooker with 7 cooking functions",
            "imageUrl": "https://example.com/instantpot.jpg",
            "averageRating": 4.6,
            "tags": ["pressure-cooker", "kitchen", "appliance", "multi-function"]
        },
        {
            "name": "The Psychology of Money",
            "category": "Books",
            "brand": "Harriman House",
            "description": "Timeless lessons on wealth, greed, and happiness by Morgan Housel",
            "imageUrl": "https://example.com/psychologyofmoney.jpg",
            "averageRating": 4.7,
            "tags": ["finance", "psychology", "investing", "money", "bestseller"]
        },
        {
            "name": "Fitbit Charge 6",
            "category": "Electronics",
            "brand": "Fitbit",
            "description": "Advanced fitness tracker with built-in GPS and heart rate monitoring",
            "imageUrl": "https://example.com/fitbitcharge6.jpg",
            "averageRating": 4.4,
            "tags": ["fitness", "tracker", "health", "gps", "heart-rate"]
        },
        {
            "name": "Dyson V15 Detect",
            "category": "Home & Kitchen", 
            "brand": "Dyson",
            "description": "Cordless vacuum with laser dust detection and powerful suction",
            "imageUrl": "https://example.com/dysonv15.jpg",
            "averageRating": 4.5,
            "tags": ["vacuum", "cordless", "dyson", "cleaning", "laser-detect"]
        },
        {
            "name": "Levi's 501 Original Jeans",
            "category": "Fashion",
            "brand": "Levi's", 
            "description": "Classic straight-leg jeans with authentic fit and feel",
            "imageUrl": "https://example.com/levis501.jpg",
            "averageRating": 4.2,
            "tags": ["jeans", "denim", "levis", "classic", "straight-leg"]
        }
    ]
    
    # Generate price histories for each product
    for product in products:
        price_history = generate_price_history(product)
        product["priceHistory"] = price_history
        product["currentPrice"] = price_history[-1]["price"]
        product["isActive"] = True
        product["_id"] = str(uuid.uuid4())[:24]
    
    return products

def generate_price_history(product):
    """Generate realistic price history for a product"""
    
    # Base prices by category
    base_prices = {
        "Electronics": {"iPhone": 999, "Samsung": 899, "MacBook": 1199, "Sony": 349, "Fitbit": 159},
        "Fashion": {"Nike": 130, "Levi's": 59},
        "Home & Kitchen": {"Instant Pot": 89, "Dyson": 749},
        "Books": {"default": 16}
    }
    
    # Determine base price
    category = product["category"]
    name = product["name"]
    
    if category == "Electronics":
        if "iPhone" in name:
            base_price = base_prices[category]["iPhone"]
        elif "Samsung" in name:
            base_price = base_prices[category]["Samsung"] 
        elif "MacBook" in name:
            base_price = base_prices[category]["MacBook"]
        elif "Sony" in name:
            base_price = base_prices[category]["Sony"]
        elif "Fitbit" in name:
            base_price = base_prices[category]["Fitbit"]
        else:
            base_price = 299
    elif category == "Fashion":
        if "Nike" in name:
            base_price = base_prices[category]["Nike"]
        elif "Levi's" in name:
            base_price = base_prices[category]["Levi's"]
        else:
            base_price = 79
    elif category == "Home & Kitchen":
        if "Instant Pot" in name:
            base_price = base_prices[category]["Instant Pot"]
        elif "Dyson" in name:
            base_price = base_prices[category]["Dyson"]
        else:
            base_price = 149
    else:
        base_price = base_prices["Books"]["default"]
    
    # Generate 90 days of price history
    price_history = []
    current_date = datetime.now() - timedelta(days=90)
    current_price = base_price
    
    for day in range(90):
        # Add some seasonality and trends
        seasonal_factor = 1 + 0.1 * math.sin(day * 2 * 3.14159 / 30)  # Monthly cycle
        trend_factor = 1 + (day * 0.001 * random.uniform(-1, 1))  # Small random trend
        
        # Add random daily fluctuation
        daily_change = random.uniform(-0.05, 0.05)  # +/- 5% daily change
        
        # Calculate new price
        price_change = current_price * daily_change * seasonal_factor * trend_factor
        current_price = max(base_price * 0.7, current_price + price_change)  # Don't go below 70% of base
        current_price = min(base_price * 1.4, current_price)  # Don't go above 140% of base
        
        # Add occasional sales (10% chance of significant discount)
        if random.random() < 0.1:
            current_price *= random.uniform(0.8, 0.95)  # 5-20% discount
        
        price_history.append({
            "date": current_date.isoformat(),
            "price": round(current_price, 2),
            "source": "sample_data"
        })
        
        current_date += timedelta(days=1)
    
    return price_history

def save_to_files():
    """Save sample data to JSON files"""
    products = generate_sample_data()
    
    # Save all products to one file
    with open('sample_products.json', 'w') as f:
        json.dump(products, f, indent=2, default=str)
    
    # Save individual product files for testing
    for i, product in enumerate(products[:3]):  # Save first 3 for individual testing
        filename = f'product_{i+1}.json'
        with open(filename, 'w') as f:
            json.dump(product, f, indent=2, default=str)
    
    print(f"Generated {len(products)} sample products")
    print("Files created:")
    print("- sample_products.json (all products)")
    print("- product_1.json, product_2.json, product_3.json (individual products)")

if __name__ == "__main__":
    save_to_files()
