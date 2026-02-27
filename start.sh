#!/bin/bash

# Colores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  🤖 FENIXBOT-WA${NC}"
echo -e "${GREEN}  ✨ Creado por: FENIXTUTORIALES${NC}"
echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo ""

# Verificar si node está instalado
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js no está instalado${NC}"
    echo "Descárgalo de: https://nodejs.org/"
    exit 1
fi

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
    echo ""
    npm install
    echo ""
fi

echo -e "${GREEN}🚀 Iniciando bot...${NC}"
echo ""

# Iniciar el bot
node src/index.js

echo ""
echo -e "${YELLOW}⚠️ El bot se ha detenido.${NC}"
echo -e "${YELLOW}🔄 Reiniciando en 5 segundos...${NC}"
sleep 5