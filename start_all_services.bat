@echo off
echo Starting ShopSmart - AI Discount Finder
echo ======================================

echo.
echo [1/3] Starting ML Service...
cd ml-service
start "ML Service" powershell -Command "python app_simple.py"
cd ..

echo.
echo [2/3] Starting Backend Server...
cd backend
start "Backend Server" powershell -Command "node server_standalone.js"
cd ..

echo.
echo [3/3] Starting Frontend...
cd frontend
start "Frontend" powershell -Command "npm start"
cd ..

echo.
echo ✅ All services started!
echo.
echo Services will open in separate windows:
echo - ML Service: http://localhost:5000
echo - Backend API: http://localhost:3001/api/health
echo - Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul
