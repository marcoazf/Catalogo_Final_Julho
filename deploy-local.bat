@echo off
echo 🚀 Iniciando servidor local para testar PWA...

:: Verifica se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Instale Node.js primeiro.
    pause
    exit /b 1
)

:: Verifica se http-server está instalado
http-server --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Instalando http-server...
    npm install -g http-server
)

:: Inicia servidor na porta 8080
echo 🌐 Servidor rodando em: http://localhost:8080
echo 📱 Abra no navegador e instale como PWA!
echo 🔧 Pressione Ctrl+C para parar
echo.

http-server . -p 8080 --host 0.0.0.0

pause