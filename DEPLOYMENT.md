# 🚀 Deployment Guide

## Local Development

### Prerequisites
- Node.js 16+
- Python 3.8+
- Git

### Quick Setup
```bash
git clone https://github.com/vijaykalore/ShopSmart-AI-discount-finder.git
cd ShopSmart-AI-discount-finder
```

**Windows Users:**
```bash
start_all_services.bat
```

**Manual Setup:**
```bash
# Install dependencies
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
cd ml-service && pip install -r requirements.txt && cd ..

# Start services
cd ml-service && python app_simple.py &
cd backend && npm run standalone &  
cd frontend && npm start
```

## 🌐 Web Deployment Options

### 1. Vercel (Recommended for Full-Stack)

#### Frontend + Backend on Vercel
1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import from GitHub: `vijaykalore/ShopSmart-AI-discount-finder`

2. **Configure Build Settings**
   - Framework Preset: `Create React App`
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/build`
   - Install Command: `cd frontend && npm install && cd backend && npm install`

3. **Environment Variables**
   ```
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```

4. **Deploy**
   - Vercel will auto-deploy from the `master` branch
   - Backend API will be available at `/api/*` routes

#### ML Service on Railway
1. **Deploy ML Service Separately**
   ```bash
   # Create railway.toml in ml-service/
   [build]
   builder = "NIXPACKS"
   
   [deploy]
   startCommand = "python app_simple.py"
   
   [env]
   FLASK_PORT = "5000"
   ```

2. **Update Backend ML Service URL**
   - Update `server_standalone.js` with Railway ML service URL

### 2. Netlify + Heroku

#### Frontend on Netlify
1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - New site from Git → GitHub → Select repository

2. **Build Settings**
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/build`

3. **Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend.herokuapp.com
   ```

#### Backend on Heroku
1. **Create Heroku App**
   ```bash
   heroku create shopsmart-backend
   heroku git:remote -a shopsmart-backend
   ```

2. **Configure Build**
   ```bash
   # Add heroku/nodejs buildpack
   heroku buildpacks:add heroku/nodejs
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set PORT=3001
   ```

3. **Deploy**
   ```bash
   git subtree push --prefix backend heroku master
   ```

#### ML Service on PythonAnywhere
1. **Upload Files**
   - Upload `ml-service/` folder to PythonAnywhere
   
2. **Install Dependencies**
   ```bash
   pip3.8 install --user -r requirements.txt
   ```

3. **Configure Web App**
   - Create new web app with Flask
   - Set source code path to `/home/username/ml-service/`
   - Set WSGI file to import from `app_simple.py`

### 3. All-in-One Solutions

#### Railway (Full-Stack)
1. **Deploy from GitHub**
   - Go to [railway.app](https://railway.app)
   - Deploy from GitHub repository

2. **Configure Services**
   ```yaml
   # railway.yaml
   services:
     frontend:
       source: frontend/
       build:
         command: npm run build
       start:
         command: npm run start
     
     backend:
       source: backend/
       start:
         command: npm run standalone
     
     ml-service:
       source: ml-service/
       start:
         command: python app_simple.py
   ```

#### DigitalOcean App Platform
1. **Connect GitHub**
   - Create new app from GitHub repository

2. **Configure Components**
   - **Frontend**: Node.js, Build: `cd frontend && npm run build`
   - **Backend**: Node.js, Run: `cd backend && npm run standalone`  
   - **ML Service**: Python, Run: `cd ml-service && python app_simple.py`

### 4. Docker Deployment

#### Create Dockerfiles

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "standalone"]
```

**ML Service Dockerfile:**
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app_simple.py"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    depends_on:
      - ml-service
      
  ml-service:
    build: ./ml-service
    ports:
      - "5000:5000"
```

## 🔗 Live Demo URLs

Once deployed, your application will be available at:

- **Frontend**: `https://your-app.vercel.app` or `https://your-app.netlify.app`
- **Backend API**: `https://your-app.vercel.app/api` or `https://your-backend.herokuapp.com/api`
- **ML Service**: `https://your-ml-service.railway.app` or `https://username.pythonanywhere.com`

## 🛠️ Production Configuration

### Environment Variables Setup

**Frontend (.env.production):**
```env
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_ML_URL=https://your-ml-service-url.com
```

**Backend (.env):**
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-url.com
ML_SERVICE_URL=https://your-ml-service-url.com
```

**ML Service (.env):**
```env
FLASK_ENV=production
FLASK_PORT=5000
```

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure frontend URL is added to backend CORS configuration
   - Update `server_standalone.js` with production URLs

2. **Build Failures**
   - Check Node.js version compatibility (use Node 16-18)
   - Ensure all dependencies are installed

3. **API Connection Issues**
   - Verify environment variables are set correctly
   - Check API endpoint URLs in frontend configuration

4. **ML Service Errors**
   - Ensure Python version 3.8+ is used
   - Verify all Python packages are installed

### Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Configure CDN for static assets
   - Implement lazy loading for routes

2. **Backend**
   - Enable request caching
   - Configure rate limiting
   - Use connection pooling

3. **ML Service**
   - Cache prediction results
   - Implement batch processing
   - Use model serialization

## 📊 Monitoring

### Health Checks
- **Frontend**: Check if React app loads
- **Backend**: `GET /api/health`
- **ML Service**: `GET /health`

### Performance Metrics
- Response times for API endpoints
- Frontend loading speed
- ML prediction accuracy

## 🚀 Continuous Deployment

### GitHub Actions (Optional)
```yaml
name: Deploy to Production
on:
  push:
    branches: [ master ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
```

---

**Need Help?** 
- Check the [Issues](https://github.com/vijaykalore/ShopSmart-AI-discount-finder/issues) page
- Create a new issue with deployment details
- Follow the step-by-step guides above
