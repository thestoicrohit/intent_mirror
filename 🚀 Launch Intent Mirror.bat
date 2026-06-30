@echo off
title Intent Mirror v3.0 — Launcher
color 0A

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   Intent Mirror v3.0  —  Full Stack      ║
echo  ║   Starting backend + frontend...         ║
echo  ╚══════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo  [1/2] Starting API server on port 3001...
start "Intent Mirror — API Server" cmd /k "node server/index.js"

timeout /t 2 /nobreak >nul

echo  [2/2] Starting Vite dev server on port 5180...
start "Intent Mirror — Frontend" cmd /k "npx vite --port 5180"

timeout /t 3 /nobreak >nul

echo.
echo  ✅ Both servers are starting!
echo.
echo  Frontend  →  http://localhost:5180
echo  API       →  http://localhost:3001/api/health
echo.
echo  Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:5180

echo.
echo  Close this window or press any key to exit.
pause >nul
