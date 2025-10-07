@echo off
echo ========================================
echo   EMAIL & SERVER CONFIGURATION TEST
echo ========================================
echo.

cd /d "%~dp0server"

echo [Step 1] Checking .env file...
echo.
if exist .env (
    echo ✅ .env file exists
    echo.
    echo Environment Variables:
    node -e "require('dotenv').config(); console.log('  PORT:', process.env.PORT || '5000 (default)'); console.log('  EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET'); console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET ✓' : 'NOT SET ✗'); console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');"
) else (
    echo ❌ .env file NOT FOUND!
    echo.
    echo Please create .env file in the server directory
    pause
    exit /b 1
)

echo.
echo ========================================
echo [Step 2] Testing Email Configuration...
echo ========================================
echo.
node test-email.js

echo.
echo ========================================
echo [Step 3] Checking if server is running...
echo ========================================
echo.
curl -s http://localhost:5000/api/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Server is running on port 5000
    curl http://localhost:5000/api/health
) else (
    echo ❌ Server is NOT running
    echo.
    echo Please start the server with: npm start
)

echo.
echo ========================================
echo   TEST COMPLETE
echo ========================================
echo.
pause
