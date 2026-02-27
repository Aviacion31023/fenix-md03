@echo off
chcp 65001 >nul
title FENIXBOT-WA
color 0a

echo.
echo  ═══════════════════════════════════════════
echo   🤖 FENIXBOT-WA
echo   ✨ Creado por: FENIXTUTORIALES
echo  ═══════════════════════════════════════════
echo.

if not exist node_modules (
    echo  📦 Instalando dependencias...
    echo.
    npm install
    echo.
)

echo  🚀 Iniciando bot...
echo.
node src/index.js

echo.
echo  ⚠️ El bot se ha detenido.
echo  🔄 Reiniciando en 5 segundos...
timeout /t 5 /nobreak >nul
goto :eof