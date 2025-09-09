# Vercel Deployment Steps for ShopSmart

## Option 1: Deploy Frontend Only (Recommended)

Since Vercel works best with single-service deployments, let's deploy the frontend first:

### Step 1: Create a new Vercel project for frontend
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub: `vijaykalore/ShopSmart-AI-discount-finder`
4. **Root Directory**: `frontend`
5. **Framework Preset**: Create React App
6. **Build Command**: `npm run build`
7. **Output Directory**: `build`
8. **Install Command**: `npm install`

### Step 2: Environment Variables
Add these environment variables in Vercel dashboard:
```
REACT_APP_API_URL=https://shopsmart-backend.vercel.app
NODE_ENV=production
```

## Option 2: Deploy Backend Separately

### Step 1: Create another Vercel project for backend
1. Create new project from same repository
2. **Root Directory**: `backend`
3. **Framework Preset**: Other
4. **Build Command**: `npm install`
5. **Output Directory**: Leave empty
6. **Install Command**: `npm install`

### Step 2: Environment Variables for Backend
```
NODE_ENV=production
PORT=3001
```

## Option 3: Use Alternative Deployment

If Vercel continues to have issues, try these alternatives:

### Netlify (Frontend)
1. Go to [netlify.com](https://netlify.com)
2. New site from Git
3. **Base directory**: `frontend`
4. **Build command**: `npm run build`
5. **Publish directory**: `frontend/build`

### Railway (Backend + ML Service)
1. Go to [railway.app](https://railway.app)
2. Deploy from GitHub
3. Select services: backend and ml-service
4. Auto-configured deployment

## Quick Fix for Current Vercel Issue

The 404 error suggests Vercel can't find the build files. Try this simpler vercel.json:

```json
{
  "version": 2,
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

## Recommended Deployment Strategy

**Best approach for your project:**

1. **Frontend**: Deploy to Netlify (easier for React apps)
   - URL: https://shopsmart-frontend.netlify.app

2. **Backend**: Deploy to Railway or Render
   - URL: https://shopsmart-backend.railway.app

3. **ML Service**: Deploy to Railway or PythonAnywhere
   - URL: https://shopsmart-ml.railway.app

This approach avoids Vercel's monorepo complexity and gives you better control over each service.
