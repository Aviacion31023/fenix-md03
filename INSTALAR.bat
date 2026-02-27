@echo off
chcp 65001 >nul
title Instalador FENIXBOT-WA
color 0a
cls

echo.
echo  ═══════════════════════════════════════════
echo   🤖 INSTALADOR FENIXBOT-WA
echo   ✨ Creado por: FENIXTUTORIALES
echo  ═══════════════════════════════════════════
echo.

echo  📋 Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo  ❌ Node.js NO está instalado
    echo.
    echo  🌐 Descarga Node.js desde:
    echo     https://nodejs.org/
    echo.
    echo  📥 Descarga la version LTS ^(recomendada^)
    echo  ⚙️  Instala con las opciones por defecto
    echo.
    pause
    exit /b 1
)

echo  ✅ Node.js instalado
echo.

if not exist node_modules (
    echo  📦 Instalando dependencias...
    echo  ⏳ Esto puede tomar unos minutos...
    echo.
    npm install
    if errorlevel 1 (
        echo.
        echo  ❌ Error al instalar dependencias
        echo  🔄 Intenta nuevamente
        pause
        exit /b 1
    )
    echo.
    echo  ✅ Dependencias instaladas
) else (
    echo  ✅ Dependencias ya instaladas
)

echo.
echo  📝 Configuracion...
echo.

if not exist src\config.js (
    echo  ❌ Archivo de configuracion no encontrado
    pause
    exit /b 1
)

echo  📱 Configurando numero de owner...
echo.
echo  🔔 IMPORTANTE: Edita el archivo src\config.js
echo     y cambia 'ownerNumber' por tu numero.
echo.
echo  🚀 Para iniciar el bot, ejecuta: start.bat
echo.

set /p iniciar=¿Deseas iniciar el bot ahora? (S/N): 

if /i "%iniciar%"=="S" (
    echo.
    echo  🚀 Iniciando bot...
    echo.
    call start.bat
) else (
    echo.
    echo  👋 Instalacion completada!
    echo  🚀 Ejecuta 'start.bat' cuando quieras iniciar el bot.
    echo.
    pause
)