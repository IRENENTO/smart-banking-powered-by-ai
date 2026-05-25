@echo off
echo Stopping Smart Banking services...

:: Kill backend (port 4000)
for /f "tokens=5" %%a in ('netstat -ano ^| find ":4000 " ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Kill frontend (port 3000)
for /f "tokens=5" %%a in ('netstat -ano ^| find ":3000 " ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Kill AI engine (port 8000)
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8000 " ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Services stopped.
