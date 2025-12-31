@echo off
echo Starting LifeTracker Production Server on Port 3001...
cd /d "%~dp0"
npx next start -p 3001
pause
