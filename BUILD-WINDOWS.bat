@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  npm install
)
echo Building METASURE Windows installer...
npm run desktop:build
if exist release\Metasure-Setup-1.0.0.exe echo Installer created: release\Metasure-Setup-1.0.0.exe
pause
