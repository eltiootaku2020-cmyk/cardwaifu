@echo off
setlocal
title UMBRA - Lanzador local
cd /d "%~dp0"

echo.
echo ==========================================
echo   UMBRA: Card Frontier - inicio local
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo No se encontro Node.js.
  echo Instala Node.js 20 o superior desde https://nodejs.org/
  echo Despues vuelve a abrir este archivo.
  start "" "https://nodejs.org/"
  pause
  exit /b 1
)

node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 20 ? 0 : 1)"
if errorlevel 1 (
  echo Necesitas Node.js 20 o superior.
  echo Abre https://nodejs.org/ para instalar una version compatible.
  start "" "https://nodejs.org/"
  pause
  exit /b 1
)

if not exist ".env" (
  if exist ".env.example" (
    copy /Y ".env.example" ".env" >nul
    echo Se preparo .env para uso local. No contiene credenciales del bot.
  ) else (
    echo Falta .env.example. Descarga de nuevo el repositorio.
    pause
    exit /b 1
  )
)

if not exist "node_modules\.bin\vite.cmd" goto install_dependencies
if not exist "node_modules\.bin\tsx.cmd" goto install_dependencies
if not exist "node_modules\.bin\concurrently.cmd" goto install_dependencies
goto launch_server

:install_dependencies
echo Preparando dependencias del proyecto. Esto solo se necesita al inicio o al actualizarlo...
call npm install
if errorlevel 1 (
  echo.
  echo No se pudieron preparar las dependencias.
  echo Revisa tu conexion a internet y que Node.js/npm funcionen.
  pause
  exit /b 1
)

:launch_server
echo.
echo Iniciando UMBRA en una ventana visible.
echo Para detenerlo, cierra la ventana titulada "UMBRA - Servidor".
start "UMBRA - Servidor" /D "%CD%" cmd /k "npm run dev"
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo Se abrio el navegador en http://localhost:5173
echo Esta ventana solo muestra estas instrucciones.
echo Cuando termines de jugar, cierra la ventana "UMBRA - Servidor".
pause
endlocal
