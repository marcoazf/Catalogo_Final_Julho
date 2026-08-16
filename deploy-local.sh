#!/bin/bash

# Script de deploy simples para testar PWA localmente
echo "🚀 Iniciando servidor local para testar PWA..."

# Verifica se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js primeiro."
    exit 1
fi

# Verifica se http-server está instalado
if ! command -v http-server &> /dev/null; then
    echo "📦 Instalando http-server..."
    npm install -g http-server
fi

# Inicia servidor na porta 8080
echo "🌐 Servidor rodando em: http://localhost:8080"
echo "📱 Abra no navegador e instale como PWA!"
echo "🔧 Pressione Ctrl+C para parar"
echo ""

http-server . -p 8080 --host 0.0.0.0