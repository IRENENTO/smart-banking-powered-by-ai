@echo off

echo ========================================
echo STARTING SMART BANKING POWERED BY AI
echo ========================================

:: START AI ENGINE
start cmd /k "cd ai-engine && call venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: START BACKEND
start cmd /k "cd backend && npm run dev"

:: START FRONTEND
start cmd /k "cd web && npm start"

echo ========================================
echo ALL SERVERS STARTED
echo ========================================

pause