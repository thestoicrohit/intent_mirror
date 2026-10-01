@echo off
setlocal
title Intent Mirror — Launcher
color 0A

echo.
echo  ============================================
echo    Intent Mirror  —  your money, your mirror
echo    Starting backend + frontend...
echo  ============================================
echo.

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo  ERROR: Node.js was not found on your PATH.
    echo  Install it from https://nodejs.org/ and try again.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo  [setup] node_modules not found — running npm install...
    call npm install
    if errorlevel 1 (
        echo  ERROR: npm install failed.
        pause
        exit /b 1
    )
    echo.
)

if not exist ".env" (
    if exist ".env.example" (
        echo  [setup] .env not found — creating one from .env.example...
        copy /y ".env.example" ".env" >nul
        echo.
    )
)

echo  [1/2] Starting API server on port 3001...
start "Intent Mirror - API Server" cmd /k "node server/index.js"

timeout /t 2 /nobreak >nul

echo  [2/2] Starting Vite dev server on port 5180...
start "Intent Mirror - Frontend" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo  Both servers are starting!
echo.
echo  Frontend  -^>  http://localhost:5180
echo  API       -^>  http://localhost:3001/api/health
echo.
echo  Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:5180

echo.
echo  Close this window or press any key to exit.
pause >nul
