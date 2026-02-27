# 📖 GUÍA COMPLETA DE USO - FENIXBOT-WA

## 🎯 Índice
1. [Instalación Paso a Paso](#instalación)
2. [Primer Inicio](#primer-inicio)
3. [Comandos Básicos](#comandos-básicos)
4. [Descargas](#descargas)
5. [Gestión de Grupos](#gestión-de-grupos)
6. [Sistema Premium](#sistema-premium)
7. [Subbots](#subbots)
8. [Solución de Problemas](#solución-de-problemas)

---

## 📥 INSTALACIÓN

### Requisitos Previos
- **Windows 10/11**, **Linux** o **Mac**
- **Node.js** 18 o superior
- **WhatsApp** en tu teléfono
- Conexión a **Internet**

### Paso 1: Instalar Node.js

#### Windows:
1. Ve a https://nodejs.org/
2. Descarga la versión **LTS** (botón verde grande)
3. Ejecuta el instalador
4. Siguiente → Siguiente → Instalar → Finalizar
5. **NO cambies** las opciones por defecto

#### Verificar instalación:
Abre **CMD** (símbolo del sistema) y escribe:
```cmd
node --version
```
Debe mostrar algo como: `v20.11.0`

### Paso 2: Extraer el Bot

1. Descarga el archivo **fenixbot-wa.rar**
2. Extrae el contenido en tu **Escritorio** o **Documentos**
3. Debe quedar una carpeta llamada `fenixbot-wa`

### Paso 3: Instalar Dependencias

#### Método 1 - Automático (Windows):
1. Abre la carpeta `fenixbot-wa`
2. **Doble clic** en `INSTALAR.bat`
3. Espera que termine la instalación
4. Listo!

#### Método 2 - Manual:
1. Abre **CMD** en la carpeta del bot:
   - Presiona `Shift + Clic derecho` en la carpeta
   - Selecciona "Abrir ventana de PowerShell aquí" o "Abrir en Terminal"

2. Escribe:
```bash
npm install
```

3. Espera (puede tardar 2-5 minutos)

### Paso 4: Configurar el Bot

1. Abre la carpeta `src`
2. Abre el archivo `config.js` con **Bloc de notas**
3. Busca esta línea:
```javascript
ownerNumber: '5493704052049',
```
4. **Cambia** el número por el tuyo (con código de país, sin +)
   - Ejemplo Argentina: `'5491123456789'`
   - Ejemplo México: `'5215512345678'`
   - Ejemplo Colombia: `'573001234567'`

5. **Guarda** el archivo (Ctrl + G)

---

## 🚀 PRIMER INICIO

### Iniciar el Bot

#### Windows:
- **Doble clic** en `start.bat`
- O en CMD: `npm start`

#### Linux/Mac:
```bash
npm start
```

### Conectar WhatsApp

1. Al iniciar, verás un **código QR** en la terminal:
```
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀ █ ▄▄▄▄▄ █
█ █   █ █ ▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄ █ █   █ █
...
```

2. En tu **teléfono**:
   - Abre **WhatsApp**
   - Toca los **3 puntos** (⋮) arriba a la derecha
   - "**Dispositivos vinculados**"
   - "**Vincular un dispositivo**"
   - "**Vincular con número de teléfono**" (o escanea QR)

3. **¡Listo!** El bot está conectado

### Verificar que funciona

Envía un mensaje al número del bot:
```
/menu
```

Debe responder con el menú principal.

---

## 📱 COMANDOS BÁSICOS

### Menú Principal
```
/menu        - Muestra el menú principal
/musica      - Menú de descargas de música
/videos      - Menú de descargas de video
/busquedas   - Menú de búsquedas
/ia          - Menú de inteligencia artificial
/grupos      - Menú de gestión de grupos
/herramientas - Menú de utilidades
/subbots     - Menú de subbots
/owner       - Menú del owner
/premiuminfo - Información sobre premium
```

### Información
```
/estadisticas - Ver estadísticas del bot
/ping         - Ver velocidad del bot
/hora         - Hora actual de Argentina
/fecha        - Fecha actual
```

---

## 🎵 DESCARGAS DE MÚSICA

### Buscar en YouTube
```
/yts reggaeton 2024
```
**Resultado:** Lista de 15 videos con título, canal, duración y link.

### Descargar Audio
```
/yta https://youtube.com/watch?v=xxxxx
```
**O también:**
```
/play nombre de la canción
```
**Ejemplo:**
```
/play bad bunny un verano sin ti
```

### Letra de Canciones
```
/letra despacito - luis fonsi
```

---

## 🎬 DESCARGAS DE VIDEO

### YouTube
```
/ytv https://youtube.com/watch?v=xxxxx
```
⚠️ Si pesa más de 64MB, se envía como documento.

### TikTok
```
/tiktok https://tiktok.com/@usuario/video/xxxxx
```

### Buscar en TikTok
```
/tts baile viral
```

### Instagram
```
/ig https://instagram.com/p/xxxxx
```

### Facebook
```
/fb https://facebook.com/watch?v=xxxxx
```

### Twitter/X
```
/twitter https://x.com/usuario/status/xxxxx
```

---

## 👥 GESTIÓN DE GRUPOS

### Abrir/Cerrar Grupo
```
/abrir    - Todos pueden escribir
/cerrar   - Solo admins pueden escribir
```

### Automatización (Argentina)
```
/autoabrir   - Abre automáticamente a las 09:00 AM
/autocerrar  - Cierra automáticamente a las 02:00 AM
```

Al cerrar automáticamente, el bot envía:
> 🌙 *¡Buenas noches!*  
> El grupo ha sido *CERRADO* automáticamente.  
> ⏰ Horario: 02:00 AM  
> 📅 El grupo reabrirá a las 09:00 AM

Al abrir:
> 🌅 *¡Buenos días!*  
> El grupo ha sido *ABIERTO* automáticamente.  
> ⏰ Horario: 09:00 AM

### Moderación
```
/antilink on     - Activa anti-enlaces
/antilink off    - Desactiva anti-enlaces
/antitoxic on    - Activa filtro de insultos
/antitoxic off   - Desactiva filtro de insultos
/bienvenida on   - Activa mensaje de bienvenida
/bienvenida off  - Desactiva mensaje de bienvenida
```

### Gestión de Miembros
```
/kick @usuario           - Expulsar usuario
/add 5493704052049       - Agregar por número
/promote @usuario        - Dar admin
/demote @usuario         - Quitar admin
/warn @usuario [razón]   - Advertir usuario
/warns @usuario          - Ver advertencias
/resetwarns @usuario     - Resetear advertencias
```

⚠️ **3 advertencias = expulsión automática**

### Comunicación
```
/tagall mensaje      - Mencionar a todos (visible)
/hidetag mensaje     - Mencionar a todos (oculto)
/link                - Obtener link del grupo
/revoke              - Revocar y generar nuevo link
```

---

## 💎 SISTEMA PREMIUM

### Ver tu estado
Envía cualquier comando y el bot te dice tus créditos restantes.

### Créditos FREE (por día):
- 🎥 **15 videos**
- 🎵 **15 audios**
- ⚡ **50 comandos**

### Activar Premium (solo OWNER)
```
/premium @numerodetelefono 30
```
**Ejemplo:**
```
/premium @5493704052049 30
```

El usuario recibirá:
- 🎥 Descargas ilimitadas
- 🎵 Audio ilimitado
- ⚡ Comandos ilimitados
- 🚀 Prioridad en procesamiento

### Quitar Premium
```
/quitarpremium @numerodetelefono
```

---

## 🤖 SUBBOTS (Ser Bot)

### ¿Qué es un subbot?
Permite que otros usuarios usen **su propio número de WhatsApp** como bot.

### Crear Subbot (QR)
```
/serbotqr
```
El bot genera un **código QR**. El usuario debe:
1. Abrir WhatsApp en su teléfono
2. Ir a Configuración > Dispositivos vinculados
3. Escanear el QR
4. ¡Su número ahora es un bot!

### Crear Subbot (Código de 8 dígitos)
```
/serbotcode
```
Más fácil que el QR. El usuario recibe un código para vincular.

### Reconectar Subbot
Si el subbot se desconecta:
```
/reconectar ABC12345
```
(Reemplaza ABC12345 con el código que se dio al crearlo)

### Detener Subbot
```
/stop ABC12345
```

### Ver mis subbots
```
/misbots
```

---

## 🤖 INTELIGENCIA ARTIFICIAL

### Chat con Gemini
```
/gemini explica la teoría de la relatividad
```

### Traducir
```
/traducir inglés hola cómo estás
/traducir francés buenos días
```

### Resumir Texto
```
/resumir [pega tu texto largo aquí]
```

### Corregir Ortografía
```
/corregir hola komo estaz
```

### Generar Código
```
/codigo función para calcular factorial en python
```

### Crear Historia
```
/historia un astronauta perdido en marte
```

---

## 🛠️ HERRAMIENTAS ÚTILES

### Crear Sticker
1. Envía una **imagen** o **video** (máx 10 segundos)
2. Responde al archivo con: `/sticker`

### Crear QR
```
/qr https://google.com
/linkqr https://youtube.com
```

### Acortar URL
```
/short https://google.com/muy/largo/url
```

### Calculadora
```
/calcular 50 * 2 + 10
/calcular (100 + 50) / 3
```

### Conversor de Monedas
```
/moneda 100 USD ARS    - Dólar a Pesos argentinos
/moneda 50 EUR USD     - Euro a Dólar
```

### Codificadores
```
/base64 hola mundo           - Codificar a Base64
/decode64 SGVsYSBtdW5kbw==   - Decodificar Base64
/binario hola                - Convertir a binario
/morse SOS                   - Convertir a Morse
/reverse texto               - Invertir texto
/mayus hola                  - A MAYÚSCULAS
/minus HOLA                  - a minúsculas
```

---

## 🎮 DIVERSIÓN

### Juegos
```
/dado              - Lanzar dado
/moneda            - Cara o cruz
/ppt piedra        - Piedra, papel o tijera
/ppt papel
/ppt tijera
```

### Entretenimiento
```
/chiste            - Chiste aleatorio
/curiosidad        - Dato curioso
/love @usuario     - Compatibilidad
/gay @usuario      - Porcentaje divertido
/top más graciosos - Top 5 del grupo
/random 1 100      - Número aleatorio
```

---

## 👑 COMANDOS DEL OWNER

### Gestión de Usuarios
```
/premium @usuario 30        - Dar premium 30 días
/quitarpremium @usuario     - Quitar premium
/ban @usuario               - Banear usuario
/unban @usuario             - Desbanear usuario
/listbans                   - Ver baneados
/resetuser @usuario         - Resetear créditos
```

### Comunicación Masiva
```
/broadcast mensaje          - Enviar a todos los usuarios
/bangrupos mensaje          - Enviar a todos los grupos
```

### Gestión del Bot
```
/reiniciar                  - Reiniciar el bot
/apagar                     - Apagar el bot
/actualizar                 - Actualizar desde GitHub
/estadisticas               - Ver estadísticas completas
```

### Configuración
```
/setapi gemini TU_API_KEY   - Configurar API de Gemini
/addcomando /nombre         - Agregar comando personalizado
/delcomando nombre          - Eliminar comando
/listcomandos               - Ver comandos personalizados
```

### Comandos Avanzados (⚠️ Cuidado)
```
/exec console.log("hola")    - Ejecutar código JavaScript
/shell ls -la                - Ejecutar comando de sistema
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### "Cannot find module"
```bash
npm install
```

### "Session expired" o "QR expiró"
1. Elimina la carpeta `sessions/`
2. Reinicia el bot: `npm start`
3. Escanea el QR nuevamente

### El bot no responde
1. Verifica que esté conectado a internet
2. Mira la terminal si hay errores
3. Reinicia el bot

### "No se pudo descargar el video"
- El video puede estar restringido
- Puede ser muy largo
- Intenta con otro link

### "Sin créditos"
- Espera al siguiente día (se resetean a las 00:00)
- O pide al owner que te dé premium

### Error en grupos
- Verifica que el bot sea **administrador** del grupo
- Algunos comandos requieren que tú también seas admin

---

## 💡 CONSEJOS

### Mantener el bot activo 24/7

#### Windows (con PM2):
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Linux (con systemd):
```bash
sudo nano /etc/systemd/system/fenixbot.service
```

Pegar:
```ini
[Unit]
Description=FENIXBOT-WA
After=network.target

[Service]
Type=simple
User=tuusuario
WorkingDirectory=/ruta/al/bot
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Activar:
```bash
sudo systemctl enable fenixbot
sudo systemctl start fenixbot
```

### Backup de la base de datos
Copia el archivo `database.json` regularmente.

### Actualizar el bot
```bash
git pull
npm install
npm start
```

---

## 📞 SOPORTE

¿Problemas? Contacta al creador:

**FENIXTUTORIALES**
- WhatsApp: `+54 9 370 405-2049`

---

**¡Disfruta tu bot! 🤖✨**