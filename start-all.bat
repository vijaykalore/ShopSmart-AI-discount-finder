@echo off
echo ============================================
echo    Starting ShopSmart - AI Discount Finder
echo ============================================
echo.

REM Start MongoDB (if using local installation)
echo Starting MongoDB (if not already running)...
start "MongoDB" cmd /k "mongod --dbpath data/db 2>nul || echo MongoDB may already be running or using default path"

REM Wait a moment for MongoDB to start
timeout /t 3 /nobreak >nul

echo Starting Backend Server...
cd backend
start "ShopSmart Backend" cmd /k "node server.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo Starting ML Service...
cd ..\ml-service
start "ShopSmart ML Service" cmd /k "venv\Scripts\activate.bat && python app.py"

REM Wait a moment for ML service to start
timeout /t 3 /nobreak >nul

echo Starting Frontend Development Server...
cd ..\frontend
start "ShopSmart Frontend" cmd /k "npm start"

echo.
echo ============================================
echo         All Services Started!
echo ============================================
echo.
echo Services running on:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:3001
echo - ML Service: http://localhost:5000
echo - MongoDB: mongodb://localhost:27017
echo.
echo The application will automatically open in your default browser.
echo.
echo To stop all services, close all command windows or press Ctrl+C in each.
echo.
pause
