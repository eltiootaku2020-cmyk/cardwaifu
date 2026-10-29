@echo off
setlocal
title UMBRA - Copia de seguridad
cd /d "%~dp0"

echo.
echo ==========================================
echo   UMBRA: Card Frontier - copia de datos
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo No se encontro Node.js 20 o superior.
  echo Instala Node.js desde https://nodejs.org/ y vuelve a intentarlo.
  start "" "https://nodejs.org/"
  pause
  exit /b 1
)

node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 20 ? 0 : 1)"
if errorlevel 1 (
  echo Necesitas Node.js 20 o superior.
  pause
  exit /b 1
)

if not exist ".env" (
  if exist ".env.example" (
    copy /Y ".env.example" ".env" >nul
  ) else (
    echo Falta .env.example. Descarga de nuevo el repositorio.
    pause
    exit /b 1
  )
)

if not exist "node_modules\.bin\tsx.cmd" goto install_dependencies
if not exist "node_modules\.bin\vite.cmd" goto install_dependencies
goto create_backup

:install_dependencies
echo Preparando dependencias necesarias para crear la copia...
call npm install
if errorlevel 1 (
  echo No se pudieron preparar las dependencias.
  pause
  exit /b 1
)

:create_backup
call npm run backup:db
if errorlevel 1 (
  echo.
  echo La copia de seguridad no se completo. No se modifico la base de datos original.
  pause
  exit /b 1
)

echo.
echo Guarda la carpeta backups fuera del PC si quieres protegerte frente a un fallo del disco.
pause
endlocal
