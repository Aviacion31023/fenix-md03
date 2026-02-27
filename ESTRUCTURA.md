# 📁 Estructura del Proyecto FENIXBOT-WA

```
fenixbot-wa/
│
├── 📄 package.json              # Dependencias y scripts
├── 📄 README.md                 # Guía completa
├── 📄 LICENSE                   # Licencia MIT
├── 📄 .gitignore               # Archivos ignorados por Git
├── 📄 .env.example             # Ejemplo de variables de entorno
│
├── 🚀 Inicio rápido
│   ├── start.bat               # Iniciar en Windows
│   ├── start.sh                # Iniciar en Linux/Mac
│   ├── INSTALAR.bat            # Instalador automático Windows
│   └── ecosystem.config.js     # Configuración PM2
│
├── 📂 src/                     # Código fuente
│   │
│   ├── 📄 index.js             # Archivo principal (conexión WA)
│   ├── 📄 config.js            # Configuración del bot
│   │
│   ├── 📂 commands/            # Comandos del bot
│   │   ├── downloads.js        # Descargas (YT, TikTok, etc.)
│   │   ├── search.js           # Búsquedas (Google, Wiki, etc.)
│   │   ├── ia.js               # Inteligencia Artificial
│   │   ├── group.js            # Gestión de grupos
│   │   ├── tools.js            # Herramientas y utilidades
│   │   ├── subbot.js           # Sistema de subbots
│   │   ├── owner.js            # Comandos del owner
│   │   └── fun.js              # Comandos de diversión
│   │
│   ├── 📂 handlers/            # Manejadores de eventos
│   │   ├── commandHandler.js   # Procesador de comandos
│   │   └── groupHandler.js     # Eventos de grupos
│   │
│   ├── 📂 utils/               # Utilidades
│   │   ├── helpers.js          # Funciones auxiliares
│   │   └── menus.js            # Menús del bot
│   │
│   └── 📂 database/            # Base de datos
│       └── index.js            # Sistema de BD JSON
│
├── 📂 sessions/                # Sesiones de WhatsApp
│   └── (se crea automáticamente)
│
├── 📂 media/                   # Archivos multimedia
│   └── temp/                   # Archivos temporales
│
└── 📂 logs/                    # Logs del bot
    └── (se crea automáticamente)
```

## 📊 Estadísticas

- **Total de archivos JS:** 15
- **Total de comandos:** 50+
- **Líneas de código:** ~3000+
- **Dependencias:** 20+

## 🎯 Comandos por Categoría

| Categoría | Cantidad | Archivo |
|-----------|----------|---------|
| Descargas | 12 | `downloads.js` |
| Búsquedas | 7 | `search.js` |
| IA | 9 | `ia.js` |
| Grupos | 18 | `group.js` |
| Herramientas | 20 | `tools.js` |
| Subbots | 5 | `subbot.js` |
| Owner | 15 | `owner.js` |
| Diversión | 7 | `fun.js` |

## 🔧 Configuración Principal

Edita `src/config.js` para personalizar:

```javascript
- ownerNumber      // Tu número de teléfono
- botName          // Nombre del bot
- creator          // Tu nombre/marca
- freeLimits       // Límites de usuarios free
- apis.geminiApiKey // API key de Gemini
```

## 📝 Notas

- La carpeta `sessions/` se crea automáticamente al iniciar
- La base de datos se guarda en `database.json`
- Los archivos temporales se guardan en `media/temp/`
- Los logs se guardan en `logs/` (si usas PM2)