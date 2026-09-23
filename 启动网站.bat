@echo off
setlocal
cd /d "%~dp0"

if not exist "node_modules\vite\bin\vite.js" (
  echo 正在安装依赖，请稍候...
  call npm.cmd install
  if errorlevel 1 (
    echo 依赖安装失败，请确认 Node.js 已安装。
    pause
    exit /b 1
  )
)

echo 正在启动网站...
start "Portfolio" http://localhost:5173/
call npm.cmd run dev -- --host 127.0.0.1
pause
