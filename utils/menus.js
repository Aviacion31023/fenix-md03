/**
 * ═══════════════════════════════════════════════════════════════
 * ⚡ MENÚS DEL BOT
 * ═══════════════════════════════════════════════════════════════
 */

const config = require('../config');

// Menú principal
const mainMenu = (pushName, isPremium, credits) => {
  const premiumStatus = isPremium ? '💎 PREMIUM' : '👤 FREE';
  const creditInfo = isPremium 
    ? '✨ *Créditos ilimitados*' 
    : `📊 *Tus créditos:*\n🎥 Videos: ${credits.videoDownloads}/15\n🎵 Audio: ${credits.audioDownloads}/15\n⚡ Comandos: ${credits.commands}/50`;

  return `
╔══════════════════════════════════════════╗
║     🤖 *${config.botName}* 🤖              ║
║     ✨ Creado por: *${config.creator}* ✨   ║
╚══════════════════════════════════════════╝

👋 ¡Hola *${pushName || 'Usuario'}*!

${premiumStatus}
${creditInfo}

📌 *SELECCIONA UNA CATEGORÍA:*

🎵 *1. Descargas de Música*
   ➜ Escribe: */musica*

🎬 *2. Descargas de Videos*
   ➜ Escribe: */videos*

🔍 *3. Búsquedas*
   ➜ Escribe: */busquedas*

🤖 *4. Inteligencia Artificial*
   ➜ Escribe: */ia*

👥 *5. Gestión de Grupos*
   ➜ Escribe: */grupos*

🎨 *6. Herramientas & Utilidades*
   ➜ Escribe: */herramientas*

📱 *7. Subbots (Ser Bot)*
   ➜ Escribe: */subbots*

⚙️ *8. Menú Owner*
   ➜ Escribe: */owner*

💎 *9. Información Premium*
   ➜ Escribe: */premiuminfo*

═══════════════════

📞 *Contacto Owner:*
wa.me/${config.ownerNumberRaw}

⚡ *Bot siempre activo 24/7*
`;
};

// Menú de música
const musicMenu = () => `
╔══════════════════════════════════════════╗
║     🎵 *MENÚ DE MÚSICA* 🎵               ║
╚══════════════════════════════════════════╝

🎶 *COMANDOS DE AUDIO:*

/yts <palabra clave>
   ➜ Buscar música en YouTube
   ➜ Ejemplo: */yts reggaeton 2024*

/yta <link de YouTube>
   ➜ Descargar audio de YouTube
   ➜ Ejemplo: */yta https://youtube.com/watch?v=xxxxx*

/play <nombre de canción>
   ➜ Buscar y descargar audio directo
   ➜ Ejemplo: */play bad bunny un verano*

/spoti <nombre>
   ➜ Buscar canción en Spotify
   ➜ Ejemplo: */spoti shape of you*

/letra <canción - artista>
   ➜ Obtener letra de canción
   ➜ Ejemplo: */letra despacito - luis fonsi*

═══════════════════
💡 *Consejo:* Los audios se envían en alta calidad (128kbps)
`;

// Menú de videos
const videoMenu = () => `
╔══════════════════════════════════════════╗
║     🎬 *MENÚ DE VIDEOS* 🎬               ║
╚══════════════════════════════════════════╝

📹 *COMANDOS DE VIDEO:*

/ytv <link de YouTube>
   ➜ Descargar video de YouTube
   ➜ Ejemplo: */ytv https://youtube.com/watch?v=xxxxx*
   ➜ *Nota:* Si pesa más de 64MB se envía como documento

/tts <palabra clave>
   ➜ Buscar y descargar video de TikTok
   ➜ Ejemplo: */tts baile viral*

/tiktok <link>
   ➜ Descargar video de TikTok por URL
   ➜ Ejemplo: */tiktok https://tiktok.com/@user/video/xxxxx*

/ig <link>
   ➜ Descargar video/foto de Instagram
   ➜ Ejemplo: */ig https://instagram.com/p/xxxxx*

/fb <link>
   ➜ Descargar video de Facebook
   ➜ Ejemplo: */fb https://facebook.com/watch?v=xxxxx*

/twitter <link>
   ➜ Descargar video de Twitter/X
   ➜ Ejemplo: */twitter https://x.com/user/status/xxxxx*

═══════════════════
💡 *Consejo:* Los videos HD pueden tardar más en procesarse
`;

// Menú de búsquedas
const searchMenu = () => `
╔══════════════════════════════════════════╗
║     🔍 *MENÚ DE BÚSQUEDAS* 🔍            ║
╚══════════════════════════════════════════╝

🔎 *COMANDOS DE BÚSQUEDA:*

/google <consulta>
   ➜ Buscar en Google
   ➜ Ejemplo: */google clima buenos aires*

/wiki <tema>
   ➜ Buscar en Wikipedia
   ➜ Ejemplo: */wiki argentina*

/imagen <término>
   ➜ Buscar imágenes
   ➜ Ejemplo: */imagen paisajes naturaleza*

/pinterest <término>
   ➜ Buscar en Pinterest
   ➜ Ejemplo: */ Pinterest fondos aesthetic*

/ytbuscar <término>
   ➜ Buscar videos en YouTube
   ➜ Ejemplo: */ytbuscar tutoriales javascript*

/noticias <tema>
   ➜ Buscar noticias recientes
   ➜ Ejemplo: */noticias tecnología*

/clima <ciudad>
   ➜ Ver clima actual
   ➜ Ejemplo: */clima cordoba argentina*

═══════════════════
`;

// Menú de IA
const iaMenu = () => `
╔══════════════════════════════════════════╗
║     🤖 *MENÚ DE INTELIGENCIA ARTIFICIAL* ║
╚══════════════════════════════════════════╝

🧠 *COMANDOS DE IA:*

/gemini <pregunta>
   ➜ Chat con Google Gemini AI
   ➜ Ejemplo: */gemini explica la teoría de la relatividad*

/ia <texto>
   ➜ Generar texto con IA
   ➜ Ejemplo: */ia escribe un poema sobre el amor*

/resumir <texto>
   ➜ Resumir texto largo
   ➜ Ejemplo: */resumir [pega tu texto aquí]*

/traducir <idioma> <texto>
   ➜ Traducir a cualquier idioma
   ➜ Ejemplo: */traducir inglés hola cómo estás*

/corregir <texto>
   ➜ Corregir ortografía y gramática
   ➜ Ejemplo: */corregir hola komo estaz*

/codigo <descripción>
   ➜ Generar código de programación
   ➜ Ejemplo: */codigo función fibonacci en python*

/historia <tema>
   ➜ Crear una historia corta
   ➜ Ejemplo: */historia un astronauta perdido en marte*

/chiste
   ➜ Recibir un chiste aleatorio

/curiosidad
   ➜ Dato curioso aleatorio

═══════════════════
💡 *Consejo:* Sé específico para mejores resultados
`;

// Menú de grupos
const groupMenu = () => `
╔══════════════════════════════════════════╗
║     👥 *MENÚ DE GRUPOS* 👥               ║
╚══════════════════════════════════════════╝

⚙️ *COMANDOS DE ADMINISTRACIÓN:*

/abrir
   ➜ Abrir el grupo (todos pueden escribir)

/cerrar
   ➜ Cerrar el grupo (solo admins escriben)

/autoabrir
   ➜ Activar apertura automática a las 09:00 ARG

/autocerrar
   ➜ Activar cierre automático a las 02:00 ARG

/antilink on/off
   ➜ Activar/desactivar anti-enlaces

/antitoxic on/off
   ➜ Activar/desactivar filtro de insultos

/bienvenida on/off
   ➜ Activar/desactivar mensaje de bienvenida

/despedida on/off
   ➜ Activar/desactivar mensaje de despedida

👤 *GESTIÓN DE MIEMBROS:*

/kick @usuario
   ➜ Expulsar usuario del grupo

/add <número>
   ➜ Agregar usuario al grupo
   ➜ Ejemplo: */add 5493704052049*

/promote @usuario
   ➜ Dar admin a un usuario

/demote @usuario
   ➜ Quitar admin a un usuario

/warn @usuario [razón]
   ➜ Advertir a un usuario (3 warns = kick)

/warns @usuario
   ➜ Ver advertencias de un usuario

/resetwarns @usuario
   ➜ Resetear advertencias

📢 *COMUNICACIÓN:*

/tagall <mensaje>
   ➜ Mencionar a todos los miembros

/hidetag <mensaje>
   ➜ Mencionar a todos (notificación oculta)

/setname <nombre>
   ➜ Cambiar nombre del grupo

/setdesc <descripción>
   ➜ Cambiar descripción del grupo

/setpp (responde a imagen)
   ➜ Cambiar foto del grupo

/link
   ➜ Obtener enlace de invitación

/revoke
   ➜ Revocar enlace de invitación

═══════════════════
⚠️ *La mayoría de comandos requieren ser admin*
`;

// Menú de herramientas
const toolsMenu = () => `
╔══════════════════════════════════════════╗
║     🛠️ *MENÚ DE HERRAMIENTAS* 🛠️        ║
╚══════════════════════════════════════════╝

🔧 *UTILIDADES:*

/qr <texto>
   ➜ Generar código QR
   ➜ Ejemplo: */qr https://google.com*

/linkqr <link>
   ➜ Convertir link a QR escaneable
   ➜ Ejemplo: */linkqr https://youtube.com*

/short <url>
   ➜ Acortar URL
   ➜ Ejemplo: */short https://google.com/very/long/url*

/encuesta <pregunta>|<opción1>|<opción2>
   ➜ Crear encuesta
   ➜ Ejemplo: */encuesta ¿Te gusta el bot?|Sí|No*

/estadisticas
   ➜ Ver estadísticas del bot

/ping
   ➜ Ver velocidad del bot

/hora
   ➜ Ver hora actual de Argentina

/fecha
   ➜ Ver fecha actual

/calcular <operación>
   ➜ Calculadora
   ➜ Ejemplo: */calcular 50 * 2 + 10*

/moneda <cantidad> <de> <a>
   ➜ Conversor de monedas
   ➜ Ejemplo: */moneda 100 USD ARS*

/base64 <texto>
   ➜ Codificar a Base64

/decode64 <texto>
   ➜ Decodificar Base64

/binario <texto>
   ➜ Convertir a binario

/morse <texto>
   ➜ Convertir a código Morse

/reverse <texto>
   ➜ Invertir texto

/mayus <texto>
   ➜ Convertir a MAYÚSCULAS

/minus <texto>
   ➜ Convertir a minúsculas

═══════════════════
🎨 *CREADORES:*

/logo <texto>
   ➜ Crear logo personalizado
   ➜ Ejemplo: */logo FENIX*

/sticker (responde a imagen/video)
   ➜ Crear sticker

/stickergif (responde a GIF/video)
   ➜ Crear sticker animado

/toimg (responde a sticker)
   ➜ Convertir sticker a imagen

/tovid (responde a sticker animado)
   ➜ Convertir sticker a video

═══════════════════
`;

// Menú de subbots
const subbotMenu = () => `
╔══════════════════════════════════════════╗
║     📱 *MENÚ DE SUBBOTS* 📱              ║
╚══════════════════════════════════════════╝

🤖 *CONVIÉRTETE EN BOT:*

/serbotqr
   ➜ Obtener QR para convertir tu número en bot
   ➜ Escanea el QR con tu WhatsApp
   ➜ Tu número funcionará como subbot

/serbotcode
   ➜ Obtener código de 8 dígitos para vinculación
   ➜ Más fácil que el QR en algunos casos

/reconectar <código>
   ➜ Reconectar tu subbot si se desconectó
   ➜ Ejemplo: */reconectar ABC12345*

/stop <código>
   ➜ Detener y eliminar tu sesión de subbot
   ➜ Ejemplo: */stop ABC12345*

/misbots
   ➜ Ver tus subbots activos

═══════════════════
💡 *¿Qué es un subbot?*
Un subbot te permite usar tu propio número de WhatsApp como bot, con todos los comandos disponibles.

⚠️ *Nota:*
• Tu teléfono debe estar conectado a internet
• No uses tu número principal si es importante
• Los subbots tienen los mismos límites que el bot principal
`;

// Menú owner
const ownerMenu = () => `
╔══════════════════════════════════════════╗
║     👑 *MENÚ OWNER* 👑                   ║
╚══════════════════════════════════════════╝

⚡ *COMANDOS EXCLUSIVOS DEL OWNER:*

/premium @usuario <días>
   ➜ Dar premium a un usuario
   ➜ Ejemplo: */premium @5493704052049 30*

/quitarpremium @usuario
   ➜ Quitar premium a un usuario

/addcomando <nombre>
   ➜ Agregar un nuevo comando personalizado
   ➜ El bot te guiará paso a paso

/delcomando <nombre>
   ➜ Eliminar un comando personalizado

/listcomandos
   ➜ Ver comandos personalizados

/broadcast <mensaje>
   ➜ Enviar mensaje a todos los usuarios

/bangrupos <mensaje>
   ➜ Enviar mensaje a todos los grupos

/stats
   ➜ Ver estadísticas completas del bot

/resetuser @usuario
   ➜ Resetear créditos de un usuario

/ban @usuario
   ➜ Banear usuario del bot

/unban @usuario
   ➜ Desbanear usuario

/listbans
   ➜ Ver usuarios baneados

/reiniciar
   ➜ Reiniciar el bot

/apagar
   ➜ Apagar el bot

/actualizar
   ➜ Actualizar el bot desde el repositorio

/setapi <nombre> <valor>
   ➜ Configurar API keys
   ➜ Ejemplo: */setapi gemini TU_API_KEY*

/exec <código>
   ➜ Ejecutar código JavaScript (⚠️ Peligroso)

/shell <comando>
   ➜ Ejecutar comando en shell (⚠️ Peligroso)

═══════════════════
👤 *Owner:* ${config.creator}
📞 *Contacto:* wa.me/${config.ownerNumberRaw}
`;

// Menú premium info
const premiumInfoMenu = () => `
╔══════════════════════════════════════════╗
║     💎 *INFORMACIÓN PREMIUM* 💎          ║
╚══════════════════════════════════════════╝

✨ *BENEFICIOS PREMIUM:*

🎥 *Descargas de Video:*
   👤 FREE: 15 videos/día
   💎 PREMIUM: ¡ILIMITADAS!

🎵 *Descargas de Audio:*
   👤 FREE: 15 audios/día
   💎 PREMIUM: ¡ILIMITADAS!

⚡ *Comandos:*
   👤 FREE: 50 comandos/día
   💎 PREMIUM: ¡ILIMITADOS!

🚀 *Prioridad:*
   💎 Tus solicitudes se procesan primero

🔓 *Comandos exclusivos:*
   💎 Acceso a comandos premium

═══════════════════

💰 *PRECIOS:*

📅 7 días: $2.000 ARS
📅 15 días: $3.500 ARS
📅 30 días: $6.000 ARS
📅 90 días: $15.000 ARS

═══════════════════

📞 *Contactar al Owner:*
wa.me/${config.ownerNumberRaw}

💬 *Menciona en el mensaje:*
• Tu número de teléfono
• Plan que deseas
• Método de pago preferido

═══════════════════
⚡ *¡Hazte premium y disfruta sin límites!*
`;

module.exports = {
  mainMenu,
  musicMenu,
  videoMenu,
  searchMenu,
  iaMenu,
  groupMenu,
  toolsMenu,
  subbotMenu,
  ownerMenu,
  premiumInfoMenu
};