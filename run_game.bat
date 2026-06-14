@echo off
echo ===================================================
echo   Starting Minesweeper Development Environments
echo ===================================================
echo.

echo [1/2] Launching Backend (.NET API) on http://localhost:5045...
start "Minesweeper Backend API" cmd /k "cd backend && dotnet run"

echo [2/2] Launching Frontend (React + Vite) on http://localhost:5173...
start "Minesweeper Frontend UI" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   Both servers are launching in separate windows!
echo   - Frontend: http://localhost:5173
echo   - Backend API: http://localhost:5045/swagger
echo ===================================================
echo.
pause
