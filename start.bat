@echo off
title Anmol Art Gallery Launcher
color 0A

echo ================================================================
echo             ANMOL ART GALLERY - FULLSTACK LAUNCHER
echo ================================================================
echo.
echo [1/3] Checking XAMPP MySQL Status...
echo Make sure MySQL is running in XAMPP Control Panel (Port 3306).
echo.
echo [2/3] Launching Node.js Express Backend on Port 5000...
start "Anmol Art Backend (MySQL API)" cmd /k "color 0B && node backend/server.js"
timeout /t 2 >nul

echo [3/3] Launching Frontend Development Server (Vite)...
start "Anmol Art Frontend (Vite)" cmd /k "color 0E && cd Front-end && npm run dev"

echo.
echo ================================================================
echo  Both Servers are starting in separate windows!
echo  Backend API:  http://localhost:5000
echo  Frontend Web: http://localhost:5173
echo ================================================================
echo.
pause
