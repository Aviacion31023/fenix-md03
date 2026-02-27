# 🤖 FENIXBOT-WA

**Bot de WhatsApp completo creado por FENIXTUTORIALES**

Un bot multifuncional para WhatsApp con más de 50 comandos, sistema de créditos, premium, subbots y mucho más.

---

## ✨ Características

### 🎵 Descargas de Música
- `/yts` - Buscar en YouTube (15 resultados)
- `/yta` - Descargar audio de YouTube
- `/play` - Buscar y descargar audio directo
- `/spoti` - Buscar en Spotify
- `/letra` - Obtener letra de canciones

### 🎬 Descargas de Videos
- `/ytv` - Descargar video de YouTube
- `/playvid` - Buscar y descargar video
- `/tiktok` - Descargar videos de TikTok
- `/tts` - Buscar videos en TikTok
- `/ig` - Descargar de Instagram
- `/fb` - Descargar de Facebook
- `/twitter` - Descargar de Twitter/X

### 🔍 Búsquedas
- `/google` - Buscar en Google
- `/wiki` - Buscar en Wikipedia
- `/imagen` - Buscar imágenes
- `/clima` - Ver clima
- `/noticias` - Buscar noticias

### 🤖 Inteligencia Artificial
- `/gemini` - Chat con Google Gemini AI
- `/resumir` - Resumir textos
- `/traducir` - Traducir a cualquier idioma
- `/corregir` - Corregir ortografía
- `/codigo` - Generar código
- `/historia` - Crear historias

### 👥 Gestión de Grupos
- `/abrir` / `/cerrar` - Abrir/cerrar grupo
- `/autoabrir` / `/autocerrar` - Automatización 09:00/02:00
- `/antilink` - Anti-enlaces
- `/antitoxic` - Filtro de insultos
- `/kick` / `/add` - Expulsar/agregar miembros
- `/promote` / `/demote` - Dar/quitar admin
- `/tagall` / `/hidetag` - Mencionar a todos

### 📱 Subbots
- `/serbotqr` - Convertir tu número en bot (QR)
- `/serbotcode` - Convertir tu número en bot (código)
- `/reconectar` - Reconectar subbot
- `/stop` - Detener subbot

### 🛠️ Herramientas
- `/qr` / `/linkqr` - Generar códigos QR
- `/sticker` - Crear stickers
- `/calcular` - Calculadora
- `/moneda` - Conversor de monedas
- `/base64` / `/binario` / `/morse` - Codificadores
- `/logo` - Crear logos

### 🎮 Diversión
- `/chiste` - Chistes aleatorios
- `/curiosidad` - Datos curiosos
- `/ppt` - Piedra, papel o tijera
- `/love` - Compatibilidad
- `/dado` / `/moneda` - Juegos de azar

---

## 📋 Requisitos

- **Node.js** 18 o superior
- **Git** (opcional, para actualizaciones)
- **WhatsApp** en tu teléfono
- **PC** con Windows, Linux o Mac

---

## 🚀 Instalación Paso a Paso

### Paso 1: Descargar e Instalar Node.js

1. Ve a [nodejs.org](https://nodejs.org/)
2. Descarga la versión **LTS** (recomendada)
3. Instálala con las opciones por defecto
4. Verifica la instalación abriendo CMD/Terminal y escribiendo:
```bash
node --version
npm --version
```

### Paso 2: Descargar el Bot

1. Descarga este proyecto como ZIP
2. Extrae el contenido en una carpeta
3. Abre CMD/Terminal en esa carpeta

**O con Git:**
```bash
git clone https://github.com/tuusuario/fenixbot-wa.git
cd fenixbot-wa
```

### Paso 3: Instalar Dependencias

En la carpeta del bot, ejecuta:

```bash
npm install
```

Esto instalará todas las librerías necesarias.

### Paso 4: Configurar el Bot

1. Abre el archivo `src/config.js`
2. Modifica los siguientes valores:

```javascript
// Tu número como owner (sin +, con código de país)
ownerNumber: '5493704052049',

// API Key de Gemini (opcional, para IA)
// Obténla gratis en: https://aistudio.google.com/app/apikey
geminiApiKey: 'TU_API_KEY_AQUI',
```

### Paso 5: Iniciar el Bot

```bash
npm start
```

O en modo desarrollo (con reinicio automático):
```bash
npm run dev
```

### Paso 6: Escanear el QR

1. Se mostrará un **código QR** en la terminal
2. Abre WhatsApp en tu teléfono
3. Ve a **Configuración > Dispositivos vinculados**
4. Toca **"Vincular un dispositivo"**
5. Escanea el código QR
6. ¡Listo! El bot está conectado

---

## 📱 Comandos del Menú

Una vez conectado, envía en WhatsApp:

| Comando | Descripción |
|---------|-------------|
| `/menu` | Menú principal |
| `/musica` | Menú de música |
| `/videos` | Menú de videos |
| `/busquedas` | Menú de búsquedas |
| `/ia` | Menú de IA |
| `/grupos` | Menú de grupos |
| `/herramientas` | Menú de herramientas |
| `/subbots` | Menú de subbots |
| `/owner` | Menú del owner |
| `/premiuminfo` | Info de premium |

---

## 💎 Sistema de Créditos

### Usuarios FREE:
- 🎥 15 descargas de video/día
- 🎵 15 descargas de audio/día
- ⚡ 50 comandos/día

### Usuarios PREMIUM:
- 🎥 Descargas ilimitadas
- 🎵 Audio ilimitado
- ⚡ Comandos ilimitados
- 🚀 Prioridad en procesamiento

### Dar Premium (solo owner):
```
/premium @numerodetelefono 30
```
(Donde 30 son los días)

---

## 🤖 Subbots (Ser Bot)

Permite a otros usuarios usar su propio número como bot.

### Crear subbot:
```
/serbotqr      - Genera QR para escanear
/serbotcode    - Genera código de vinculación
```

### Gestionar subbot:
```
/reconectar CODIGO    - Reconectar si se cae
/stop CODIGO          - Detener y eliminar
/misbots              - Ver tus subbots
```

---

## ⚙️ Configuración de Grupos

### Automatización:
- `/autoabrir` - Abre el grupo a las 09:00 AM (ARG)
- `/autocerrar` - Cierra el grupo a las 02:00 AM (ARG)

### Moderación:
- `/antilink on/off` - Elimina mensajes con enlaces
- `/antitoxic on/off` - Elimina mensajes con insultos
- `/bienvenida on/off` - Mensaje de bienvenida
- `/despedida on/off` - Mensaje de despedida

---

## 🔧 Solución de Problemas

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Session expired"
1. Elimina la carpeta `sessions/`
2. Vuelve a iniciar el bot
3. Escanea el QR nuevamente

### Error: "Rate limit"
El bot está enviando mensajes muy rápido. Espera unos minutos.

### El bot no responde
1. Verifica que esté conectado a internet
2. Reinicia el bot: `npm start`
3. Verifica los logs en la terminal

---

## 📝 Comandos Owner

Solo el número configurado como owner puede usar:

```
/premium @usuario dias     - Dar premium
/broadcast mensaje          - Mensaje a todos
/bangrupos mensaje          - Mensaje a grupos
/ban @usuario               - Banear usuario
/reiniciar                  - Reiniciar bot
/apagar                     - Apagar bot
/exec codigo                - Ejecutar JS
/shell comando              - Ejecutar shell
```

---

## 🔄 Actualizar el Bot

```bash
git pull
npm install
npm start
```

---

## 📊 Estadísticas

El bot guarda automáticamente:
- Usuarios registrados
- Comandos ejecutados
- Descargas realizadas
- Grupos configurados

Ver estadísticas con: `/estadisticas`

---

## 🛡️ Seguridad

- Los usuarios baneados no pueden usar el bot
- Sistema de advertencias (3 = expulsión)
- Anti-spam integrado
- Filtro de palabras prohibidas

---

## 🌐 APIs Utilizadas

- **Baileys** - Conexión con WhatsApp
- **Google Gemini** - Inteligencia artificial
- **YouTube-DL** - Descargas de YouTube
- **ExchangeRate-API** - Conversión de monedas
- **WTTR.in** - Clima
- **Lyrics.ovh** - Letras de canciones

---

## 📞 Soporte

¿Problemas? Contacta al creador:

**FENIXTUTORIALES**
- WhatsApp: `+54 9 370 405-2049`

---

## 📄 Licencia

Este proyecto es de código abierto. Puedes modificarlo y distribuirlo libremente.

**Créditos:** FENIXTUTORIALES

---

## ⭐ Contribuir

¿Quieres agregar más comandos? Edita los archivos en `src/commands/` siguiendo la estructura existente.

---

**¡Disfruta tu bot de WhatsApp! 🤖✨**