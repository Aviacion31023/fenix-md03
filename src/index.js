/**
 * ═══════════════════════════════════════════════════════════════
 * ⚡ FENIXBOT-WA - BOT DE WHATSAPP COMPLETO
 * Creado por: FENIXTUTORIALES
 * Versión: 1.0.0
 * ═══════════════════════════════════════════════════════════════
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  getContentType,
  downloadContentFromMessage
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const moment = require('moment-timezone');

const config = require('./config');
const db = require('./database');
const { 
  isOwner, 
  isGroup, 
  isAdmin, 
  containsBannedWords,
  getArgentinaTime,
  delay 
} = require('./utils/helpers');

// Importar manejadores de comandos
const commandHandler = require('./handlers/commandHandler');
const groupHandler = require('./handlers/groupHandler');

// Logger silencioso para Baileys
const logger = pino({ level: 'silent' });

// Estado global del bot
let sock = null;
let qrCode = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Almacenamiento de sesiones de subbots
const subbotSessions = new Map();

/**
 * Inicializar conexión con WhatsApp
 */
async function connectToWhatsApp() {
  console.log(chalk.cyan('\n═══════════════════════════════════════════'));
  console.log(chalk.cyan('  🤖 INICIANDO ' + config.botName));
  console.log(chalk.cyan('  ✨ Creado por: ' + config.creator));
  console.log(chalk.cyan('═══════════════════════════════════════════\n'));

  // Crear carpeta de sesiones si no existe
  const sessionPath = path.join(__dirname, '../sessions', config.sessionName);
  fs.ensureDirSync(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    browser: ['FENIXBOT-WA', 'Chrome', '1.0.0'],
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    markOnlineOnConnect: true,
    keepAliveIntervalMs: 30000,
    retryRequestDelayMs: 250,
    maxMsgRetryCount: 5,
    fireInitQueries: true,
    shouldIgnoreJid: (jid) => {
      const isBotJid = jid === 'status@broadcast';
      const isNewsletter = jid?.endsWith('@newsletter');
      return isBotJid || isNewsletter;
    },
    getMessage: async (key) => {
      return { conversation: 'hello' };
    }
  });

  // Manejar credenciales
  sock.ev.on('creds.update', saveCreds);

  // Manejar conexión
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCode = qr;
      console.log(chalk.yellow('\n📱 ESCANEA EL QR CON TU WHATSAPP\n'));
    }

    if (connection === 'close') {
      isConnected = false;
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      
      console.log(chalk.red('\n❌ CONEXIÓN CERRADA'));
      console.log(chalk.yellow('Razón:', lastDisconnect?.error?.output?.statusCode || 'Desconocida'));

      if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(chalk.yellow(`🔄 Reintentando conexión... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`));
        await delay(5000);
        connectToWhatsApp();
      } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.log(chalk.red('❌ Máximo de intentos alcanzado. Reinicia manualmente.'));
        process.exit(1);
      }
    } else if (connection === 'open') {
      isConnected = true;
      reconnectAttempts = 0;
      qrCode = null;
      
      console.log(chalk.green('\n✅ CONEXIÓN ESTABLECIDA'));
      console.log(chalk.cyan('📱 Bot conectado como:'), chalk.yellow(sock.user?.id?.split(':')[0] || 'Desconocido'));
      console.log(chalk.cyan('👤 Nombre:'), chalk.yellow(sock.user?.name || 'Desconocido'));
      console.log(chalk.green('\n═══════════════════════════════════════════'));
      console.log(chalk.green('  🚀 BOT LISTO PARA USAR'));
      console.log(chalk.green('═══════════════════════════════════════════\n'));

      // Enviar mensaje al owner de que el bot está online
      try {
        await sock.sendMessage(config.ownerNumber, {
          text: `✅ *${config.botName}* está en línea!\n\n📅 Fecha: ${new Date().toLocaleString('es-AR')}\n🤖 Versión: 1.0.0\n\n_Escribe /menu para ver los comandos_`
        });
      } catch (error) {
        console.log(chalk.yellow('⚠️ No se pudo notificar al owner'));
      }

      // Iniciar tareas programadas
      initScheduledTasks();
    }
  });

  // Manejar mensajes entrantes
  sock.ev.on('messages.upsert', async (m) => {
    const message = m.messages[0];
    if (!message || message.key.fromMe) return;

    try {
      await handleMessage(message);
    } catch (error) {
      console.error(chalk.red('Error manejando mensaje:'), error);
    }
  });

  // Manejar actualizaciones de grupos
  sock.ev.on('groups.upsert', async (groups) => {
    for (const group of groups) {
      console.log(chalk.cyan('📥 Bot agregado a grupo:'), group.subject);
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    await groupHandler.handleParticipantsUpdate(sock, update);
  });

  return sock;
}

/**
 * Manejar mensaje entrante
 */
async function handleMessage(message) {
  const chatId = message.key.remoteJid;
  const sender = message.key.participant || chatId;
  const pushName = message.pushName || 'Usuario';
  const isGroupChat = isGroup(chatId);

  // Extraer texto del mensaje
  const messageContent = extractMessageContent(message);
  if (!messageContent) return;

  const { text, type, media } = messageContent;
  const lowerText = text.toLowerCase().trim();

  // Verificar si es comando
  const isCommand = lowerText.startsWith(config.prefix);
  const commandBody = isCommand ? lowerText.slice(config.prefix.length).trim() : lowerText;
  const args = commandBody.split(' ');
  const command = args.shift();

  // Verificar palabras prohibidas en grupos
  if (isGroupChat && !isCommand) {
    const groupData = db.getGroup(chatId);
    if (groupData.antitoxic && containsBannedWords(text)) {
      await handleBannedWord(sock, message, chatId, sender);
      return;
    }
    if (groupData.antilink && isLink(text)) {
      await handleAntiLink(sock, message, chatId, sender);
      return;
    }
  }

  // Procesar comandos
  if (isCommand) {
    // Verificar si usuario está baneado
    const user = db.getUser(sender);
    if (user.banned) {
      await sock.sendMessage(chatId, {
        text: '❌ *Has sido baneado del bot*\n\nContacta al owner si crees que es un error.',
        quoted: message
      });
      return;
    }

    // Contexto del mensaje
    const msgContext = {
      sock,
      message,
      chatId,
      sender,
      pushName,
      isGroup: isGroupChat,
      isOwner: isOwner(sender),
      isAdmin: isGroupChat ? await isAdmin(sock, chatId, sender) : false,
      args: args.join(' '),
      argsArray: args,
      command,
      text: args.join(' '),
      media,
      type
    };

    // Ejecutar comando
    await commandHandler.execute(msgContext);
  }
}

/**
 * Extraer contenido del mensaje
 */
function extractMessageContent(message) {
  try {
    const type = getContentType(message.message);
    if (!type) return null;

    let text = '';
    let media = null;

    switch (type) {
      case 'conversation':
        text = message.message.conversation;
        break;
      case 'extendedTextMessage':
        text = message.message.extendedTextMessage.text;
        break;
      case 'imageMessage':
        text = message.message.imageMessage.caption || '';
        media = { type: 'image', message: message.message };
        break;
      case 'videoMessage':
        text = message.message.videoMessage.caption || '';
        media = { type: 'video', message: message.message };
        break;
      case 'audioMessage':
        media = { type: 'audio', message: message.message };
        break;
      case 'documentMessage':
        text = message.message.documentMessage.caption || '';
        media = { type: 'document', message: message.message };
        break;
      case 'stickerMessage':
        media = { type: 'sticker', message: message.message };
        break;
      default:
        text = '';
    }

    return { text, type, media };
  } catch (error) {
    return null;
  }
}

/**
 * Verificar si es un enlace
 */
function isLink(text) {
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([^\s]+\.com[^\s]*)|([^\s]+\.net[^\s]*)|([^\s]+\.org[^\s]*)|([^\s]+\.ar[^\s]*)/i;
  return urlRegex.test(text);
}

/**
 * Manejar palabra prohibida
 */
async function handleBannedWord(sock, message, chatId, sender) {
  try {
    // Eliminar mensaje
    await sock.sendMessage(chatId, { delete: message.key });
    
    // Avisar
    await sock.sendMessage(chatId, {
      text: `⚠️ @${sender.split('@')[0]} *tu mensaje fue eliminado* por contener lenguaje inapropiado.`,
      mentions: [sender]
    });

    // Incrementar warns
    const user = db.getUser(sender);
    user.toxicWarns = (user.toxicWarns || 0) + 1;
    db.save();

    if (user.toxicWarns >= 3) {
      await sock.groupParticipantsUpdate(chatId, [sender], 'remove');
      await sock.sendMessage(chatId, {
        text: `🚫 @${sender.split('@')[0]} fue *expulsado* por acumular 3 advertencias de lenguaje tóxico.`,
        mentions: [sender]
      });
      user.toxicWarns = 0;
      db.save();
    }
  } catch (error) {
    console.error('Error manejando palabra prohibida:', error);
  }
}

/**
 * Manejar anti-link
 */
async function handleAntiLink(sock, message, chatId, sender) {
  try {
    // Verificar si es admin
    const isUserAdmin = await isAdmin(sock, chatId, sender);
    if (isUserAdmin) return;

    // Eliminar mensaje
    await sock.sendMessage(chatId, { delete: message.key });
    
    // Avisar
    await sock.sendMessage(chatId, {
      text: `🔗 @${sender.split('@')[0]} *los enlaces no están permitidos* en este grupo.`,
      mentions: [sender]
    });
  } catch (error) {
    console.error('Error manejando anti-link:', error);
  }
}

/**
 * Iniciar tareas programadas
 */
function initScheduledTasks() {
  // Verificar cada minuto si es hora de abrir/cerrar grupos
  cron.schedule('* * * * *', async () => {
    const argentinaTime = getArgentinaTime();
    
    // Abrir grupos a las 09:00
    if (argentinaTime === '09:00') {
      await autoOpenGroups();
    }
    
    // Cerrar grupos a las 02:00
    if (argentinaTime === '02:00') {
      await autoCloseGroups();
    }
  });

  console.log(chalk.green('✅ Tareas programadas iniciadas'));
}

/**
 * Abrir grupos automáticamente
 */
async function autoOpenGroups() {
  try {
    const groups = Object.values(db.data.groups).filter(g => g.autoOpen);
    
    for (const group of groups) {
      try {
        await sock.groupSettingUpdate(group.jid, 'not_announcement');
        await sock.sendMessage(group.jid, {
          text: `🌅 *¡Buenos días!*\n\nEl grupo ha sido *ABIERTO* automáticamente.\n\n⏰ Horario: 09:00 AM (Argentina)\n🤖 ${config.botName}`
        });
        console.log(chalk.green('📂 Grupo abierto:'), group.jid);
      } catch (error) {
        console.error('Error abriendo grupo:', error);
      }
    }
  } catch (error) {
    console.error('Error en autoOpenGroups:', error);
  }
}

/**
 * Cerrar grupos automáticamente
 */
async function autoCloseGroups() {
  try {
    const groups = Object.values(db.data.groups).filter(g => g.autoClose);
    
    for (const group of groups) {
      try {
        await sock.groupSettingUpdate(group.jid, 'announcement');
        await sock.sendMessage(group.jid, {
          text: `🌙 *¡Buenas noches!*\n\nEl grupo ha sido *CERRADO* automáticamente.\n\n⏰ Horario: 02:00 AM (Argentina)\n📅 El grupo reabrirá a las 09:00 AM\n\n🤖 ${config.botName}`
        });
        console.log(chalk.yellow('📕 Grupo cerrado:'), group.jid);
      } catch (error) {
        console.error('Error cerrando grupo:', error);
      }
    }
  } catch (error) {
    console.error('Error en autoCloseGroups:', error);
  }
}

/**
 * Obtener instancia del socket
 */
function getSock() {
  return sock;
}

/**
 * Verificar si está conectado
 */
function getConnectionStatus() {
  return isConnected;
}

// Exportar para uso en otros módulos
module.exports = {
  connectToWhatsApp,
  getSock,
  getConnectionStatus,
  subbotSessions
};

// Iniciar si se ejecuta directamente
if (require.main === module) {
  connectToWhatsApp().catch(console.error);
}