@echo off
echo ========================================
echo    ALONIX MOBILE APP STARTER
echo ========================================
echo.
echo Starting the Expo development server...
echo.
echo Once it starts, you will see:
echo   1. A QR code in your terminal
echo   2. URLs to access the app
echo.
echo To view the app on your phone:
echo   - Install "Expo Go" from your app store
echo   - Scan the QR code with your phone camera
echo.
echo ========================================
echo.
cd /d "%~dp0"
call npx expo start
pause
