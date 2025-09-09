@echo off
echo ============================================
echo    ShopSmart - AI Discount Finder Setup
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

REM Check if MongoDB is running
echo Checking MongoDB connection...
mongo --eval "db.adminCommand('ismaster')" >nul 2>nul
if %errorlevel% neq 0 (
    echo Warning: MongoDB is not running or not accessible
    echo Please start MongoDB service or ensure MongoDB is installed
    echo.
)

echo Setting up backend dependencies...
cd backend
if not exist node_modules (
    call npm install
)
if %errorlevel% neq 0 (
    echo Error: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Setting up ML service dependencies...
cd ..\ml-service
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install ML service dependencies
    pause
    exit /b 1
)

echo.
echo Setting up frontend dependencies...
cd ..\frontend
if not exist node_modules (
    call npm install
)
if %errorlevel% neq 0 (
    echo Error: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo ============================================
echo         Setup Complete!
echo ============================================
echo.
echo To start the application:
echo 1. Start MongoDB (if not already running)
echo 2. Run start-all.bat to start all services
echo 3. Open http://localhost:3000 in your browser
echo.
pause
