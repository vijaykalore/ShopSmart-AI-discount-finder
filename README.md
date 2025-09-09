# 🛍️ ShopSmart - AI Discount Finder

An intelligent e-commerce platform that helps users find the best deals using AI-powered price prediction and comparison features.

## 🚀 Features

- **Smart Product Search**: Advanced search with filters and sorting options
- **AI Price Predictions**: Machine learning algorithms predict future price trends
- **Real-time Price Tracking**: Monitor price changes across different retailers  
- **Discount Alerts**: Get notifications when prices drop on your favorite items
- **Product Comparison**: Compare prices, features, and reviews side-by-side
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React.js 18.2.0** - Modern UI library with hooks
- **React Router 6.13.0** - Client-side routing
- **Chart.js 4.3.0** - Data visualization for price trends
- **Responsive CSS** - Mobile-first design approach

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB/Mongoose** - Database and ODM (with mock data fallback)
- **CORS & Helmet** - Security middleware
- **Rate Limiting** - API protection

### ML Service
- **Python Flask** - Lightweight web framework
- **Pandas & NumPy** - Data processing
- **Custom Algorithms** - Price prediction models

## 📁 Project Structure

```
ShopSmart - AI Discount Finder/
├── 📁 frontend/                 # React.js frontend application
│   ├── 📁 public/              # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components
│   │   ├── 📁 pages/          # Application pages
│   │   ├── 📁 styles/         # CSS stylesheets
│   │   └── 📄 App.js          # Main application component
│   └── 📄 package.json
│
├── 📁 backend/                 # Node.js Express API server
│   ├── 📁 models/             # Database models
│   ├── 📁 routes/             # API route handlers
│   ├── 📄 server.js           # MongoDB version
│   ├── 📄 server_standalone.js # Mock data version
│   └── 📄 package.json
│
├── 📁 ml-service/             # Python Flask ML service
│   ├── 📄 app_simple.py      # Simplified ML algorithms
│   ├── 📄 requirements.txt   # Python dependencies
│   └── 📄 models/           # ML model files
│
├── 📄 start_all_services.bat  # Windows startup script
├── 📄 setup_project.bat      # Project setup script
└── 📄 README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vijaykalore/ShopSmart-AI-discount-finder.git
   cd ShopSmart-AI-discount-finder
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Install ML Service Dependencies**
   ```bash
   cd ml-service
   pip install -r requirements.txt
   cd ..
   ```

### Running the Application

#### Option 1: Quick Start (Windows)
```bash
start_all_services.bat
```

#### Option 2: Manual Start
1. **Start ML Service** (Terminal 1)
   ```bash
   cd ml-service
   python app_simple.py
   ```

2. **Start Backend Server** (Terminal 2)
   ```bash
   cd backend
   npm run standalone
   ```

3. **Start Frontend** (Terminal 3)
   ```bash
   cd frontend
   npm start
   ```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **ML Service**: http://localhost:5000

## 📊 API Endpoints

### Products
- `GET /api/products` - Get all products with pagination and filters
- `GET /api/products/:id` - Get single product by ID
- `GET /api/search` - Search products with advanced filters

### Predictions
- `POST /api/predictions/product/:id` - Get AI price predictions for a product

### Health Check
- `GET /api/health` - Service status and health information

## 🤖 ML Features

### Price Prediction Algorithms
- **Linear Regression**: Trend-based price forecasting
- **Moving Averages**: Smooth price trend analysis  
- **Volatility Calculation**: Market stability assessment
- **Seasonal Analysis**: Holiday and seasonal price patterns

### Prediction Confidence
- **High Confidence**: 80-100% (Green indicator)
- **Medium Confidence**: 60-79% (Yellow indicator) 
- **Low Confidence**: Below 60% (Red indicator)

## 🎨 UI Components

### Core Components
- **Header**: Navigation and branding
- **ProductCard**: Individual product display
- **ProductGrid**: Product listing layout
- **ProductSearch**: Advanced search interface
- **PriceChart**: Interactive price trend visualization
- **Footer**: Links and information

### Pages
- **HomePage**: Featured products and categories
- **SearchResultsPage**: Search results with filters
- **ProductDetailsPage**: Detailed product information
- **AboutPage**: Application information

## 🔧 Configuration

### Environment Variables
Create `.env` files in respective directories:

**Backend** (`.env`)
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/shopsmart
```

**ML Service** (`.env`)
```env
FLASK_PORT=5000
FLASK_DEBUG=true
MODEL_PATH=./models/
```

## 🚀 Deployment

### Local Development
Use the provided startup scripts for easy local development.

### Production Deployment

#### Backend (Heroku/Vercel)
1. Set environment variables
2. Deploy using Git or CLI tools
3. Ensure ML service endpoint is accessible

#### Frontend (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy the `build` folder
3. Configure API proxy settings

#### ML Service (Railway/PythonAnywhere)
1. Deploy Flask application
2. Install Python dependencies
3. Update backend ML service URL

## 🧪 Testing

### Backend API Testing
```bash
cd backend
npm test
```

### Frontend Component Testing
```bash
cd frontend
npm test
```

### ML Service Testing
```bash
cd ml-service
python -m pytest tests/
```

## 📈 Performance

- **Frontend**: Optimized with React.memo and lazy loading
- **Backend**: Rate limiting and caching strategies
- **ML Service**: Efficient algorithms with minimal dependencies
- **Database**: Indexed queries and pagination

## 🛡️ Security Features

- **CORS Protection**: Configured for specific origins
- **Rate Limiting**: Prevents API abuse
- **Helmet.js**: Security headers
- **Input Validation**: Sanitized user inputs
- **Environment Variables**: Sensitive data protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Vijay Kalore**
- GitHub: [@vijaykalore](https://github.com/vijaykalore)
- LinkedIn: [Vijay Kalore](https://linkedin.com/in/vijaykalore)

## 🙏 Acknowledgments

- React.js community for excellent documentation
- Chart.js for beautiful data visualizations
- Express.js for robust backend framework
- Flask community for lightweight ML service framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/vijaykalore/ShopSmart-AI-discount-finder/issues) page
2. Create a new issue with detailed information
3. Contact via email or LinkedIn

---

⭐ **Star this repository if you found it helpful!** ⭐
