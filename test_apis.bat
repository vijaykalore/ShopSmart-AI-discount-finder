@echo off
echo ShopSmart - API Testing Script
echo ================================
echo.

echo Testing Backend Health Check...
curl -s http://localhost:3001/api/health
echo.
echo.

echo Testing Products API...
curl -s http://localhost:3001/api/products?limit=2
echo.
echo.

echo Testing Single Product API...
curl -s http://localhost:3001/api/products/1
echo.
echo.

echo Testing Search API...
curl -s "http://localhost:3001/api/search?q=iPhone"
echo.
echo.

echo Testing ML Service Health...
curl -s http://localhost:5000/health
echo.
echo.

echo ✅ All APIs tested!
echo.
echo You can now access:
echo - Backend API: http://localhost:3001/api
echo - ML Service: http://localhost:5000
echo - Frontend: Start with 'cd frontend && npm start'
echo.
pause
