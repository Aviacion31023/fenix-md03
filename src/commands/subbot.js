/**
 * ═══════════════════════════════════════════════════════════════
 * ⚡ COMANDOS DE SUBBOTS
 * Ser bot, reconectar, detener
 * ═══════════════════════════════════════════════════════════════
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');
const QRCode = require('qrcode');
const db = require('../database');
const { generateCode, delay } = require('../utils/helpers');
const config = require('../config');

// Logger silencioso
const logger = pino({ level: 'silent' });

// Almacenamiento de sesiones de subbots
const subbotSessions = new Map();

// Carpeta de sesiones de subbots
const SUBBOT_DIR = path.join(__dirname, '../../sessions/subbots');
fs.ensureDirSync(SUBBOT_DIR);

/**
 * Ser bot con QR
 */
async function serbotqrCommand(ctx) {
  const { sock, chatId, sender, message } = ctx;
  
  await sock.sendMessage(chatId, {
    text: '📱 *Generando QR para subbot...*\n\n⏳ Esto puede tomar unos segundos.',
    quoted: message
  });

  try {
    const code = generateCode(8);
    const sessionPath = path.join(SUBBOT_DIR, code);
    fs.ensureDirSync(sessionPath);

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const subSock = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger)
      },
      browser: ['FENIXBOT Subbot', 'Chrome', '1.0.0'],
      generateHighQualityLinkPreview: true
    });

    // Guardar referencia
    subbotSessions.set(code, {
      sock: subSock,
      owner: sender,
      code,
      status: 'connecting'
    });

    // Guardar en DB
    db.addSubbot(code, {
      owner: sender,
      status: 'connecting',
      createdAt: new Date().toISOString()
    });

    // Esperar QR
    subSock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        // Generar imagen QR
        try {
          const qrBuffer = await QRCode.toBuffer(qr, {
            width: 400,
            margin: 2
          });

          await sock.sendMessage(chatId, {
            image: qrBuffer,
            caption: `📱 *QR PARA SUBBOT*\n\n*Código:* ${code}\n\n⏳ *Escanea este QR con tu WhatsApp:*\n1. Abre WhatsApp en tu teléfono\n2. Ve a Configuración > Dispositivos vinculados\n3. Toca "Vincular un dispositivo"\n4. Escanea el código QR\n\n⚠️ *Importante:*\n• No cierres esta ventana\n• El QR expira en 60 segundos\n• Si falla, usa */serbotcode*\n\n🔌 Para reconectar: */reconectar ${code}*\n🛑 Para detener: */stop ${code}*`,
            quoted: message
          });
        } catch (error) {
          console.error('Error generando QR:', error);
        }
      }

      if (connection === 'open') {
        subbotSessions.get(code).status = 'connected';
        db.addSubbot(code, {
          owner: sender,
          status: 'connected',
          number: subSock.user?.id?.split(':')[0],
          name: subSock.user?.name
        });

        await sock.sendMessage(chatId, {
          text: `✅ *SUBBOT CONECTADO*\n\n*Código:* ${code}\n*Número:* ${subSock.user?.id?.split(':')[0]}\n*Nombre:* ${subSock.user?.name}\n\n🤖 Tu número ahora funciona como bot.\n\n🔌 Para reconectar si se cae: */reconectar ${code}*\n🛑 Para detener: */stop ${code}*`,
          quoted: message
        });

        // Notificar al owner
        await sock.sendMessage(config.ownerNumber, {
          text: `📱 *Nuevo subbot conectado*\n\n*Código:* ${code}\n*Owner:* @${sender.split('@')[0]}\n*Número:* ${subSock.user?.id?.split(':')[0]}`,
          mentions: [sender]
        });
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        
        if (!shouldReconnect) {
          subbotSessions.delete(code);
          db.removeSubbot(code);
          fs.removeSync(sessionPath);
          
          await sock.sendMessage(chatId, {
            text: `🚫 *Subbot desconectado*\n\n*Código:* ${code}\n\nEl subbot fue cerrado manualmente.`,
            quoted: message
          });
        }
      }
    });

    subSock.ev.on('creds.update', saveCreds);

    // Timeout para QR
    setTimeout(async () => {
      const session = subbotSessions.get(code);
      if (session && session.status === 'connecting') {
        try {
          await subSock.logout();
        } catch (e) {}
        subbotSessions.delete(code);
        fs.removeSync(sessionPath);
        
        await sock.sendMessage(chatId, {
          text: `⏰ *QR expirado*\n\nEl código QR expiró. Intenta nuevamente con */serbotqr* o usa */serbotcode* para vincular con código.`,
          quoted: message
        });
      }
    }, 60000);

  } catch (error) {
    console.error('Error en serbotqr:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *Error al generar el QR*\n\nIntenta nuevamente o usa */serbotcode*',
      quoted: message
    });
  }
}

/**
 * Ser bot con código (pairing code)
 */
async function serbotcodeCommand(ctx) {
  const { sock, chatId, sender, message } = ctx;
  
  await sock.sendMessage(chatId, {
    text: '📱 *Generando código de vinculación...*\n\n⏳ Esto puede tomar unos segundos.',
    quoted: message
  });

  try {
    const code = generateCode(8);
    const sessionPath = path.join(SUBBOT_DIR, code);
    fs.ensureDirSync(sessionPath);

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const subSock = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger)
      },
      browser: ['FENIXBOT Subbot', 'Chrome', '1.0.0'],
      generateHighQualityLinkPreview: true
    });

    // Generar pairing code
    const phoneNumber = sender.split('@')[0];
    const pairingCode = await subSock.requestPairingCode(phoneNumber);

    subbotSessions.set(code, {
      sock: subSock,
      owner: sender,
      code,
      status: 'connecting',
      pairingCode
    });

    db.addSubbot(code, {
      owner: sender,
      status: 'connecting',
      pairingCode,
      createdAt: new Date().toISOString()
    });

    await sock.sendMessage(chatId, {
      text: `📱 *CÓDIGO DE VINCULACIÓN*\n\n*Código del bot:* ${code}\n*Código de vinculación:* ${pairingCode}\n\n⏳ *Para vincular tu número:*\n1. Abre WhatsApp en tu teléfono\n2. Ve a Configuración > Dispositivos vinculados\n3. Toca "Vincular con número de teléfono"\n4. Ingresa este código: *${pairingCode}*\n\n⚠️ *Importante:*\n• El código expira en 2 minutos\n• No compartas este código con nadie\n\n🔌 Para reconectar: */reconectar ${code}*\n🛑 Para detener: */stop ${code}*`,
      quoted: message
    });

    // Manejar conexión
    subSock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'open') {
        subbotSessions.get(code).status = 'connected';
        db.addSubbot(code, {
          owner: sender,
          status: 'connected',
          number: subSock.user?.id?.split(':')[0],
          name: subSock.user?.name
        });

        await sock.sendMessage(chatId, {
          text: `✅ *SUBBOT CONECTADO*\n\n*Código:* ${code}\n*Número:* ${subSock.user?.id?.split(':')[0]}\n*Nombre:* ${subSock.user?.name}\n\n🤖 Tu número ahora funciona como bot.\n\n🔌 Para reconectar si se cae: */reconectar ${code}*\n🛑 Para detener: */stop ${code}*`,
          quoted: message
        });

        await sock.sendMessage(config.ownerNumber, {
          text: `📱 *Nuevo subbot conectado (código)*\n\n*Código:* ${code}\n*Owner:* @${sender.split('@')[0]}\n*Número:* ${subSock.user?.id?.split(':')[0]}`,
          mentions: [sender]
        });
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        
        if (!shouldReconnect) {
          subbotSessions.delete(code);
          db.removeSubbot(code);
          fs.removeSync(sessionPath);
        }
      }
    });

    subSock.ev.on('creds.update', saveCreds);

    // Timeout
    setTimeout(async () => {
      const session = subbotSessions.get(code);
      if (session && session.status === 'connecting') {
        try {
          await subSock.logout();
        } catch (e) {}
        subbotSessions.delete(code);
        fs.removeSync(sessionPath);
        
        await sock.sendMessage(chatId, {
          text: `⏰ *Código expirado*\n\nEl código de vinculación expiró. Intenta nuevamente con */serbotcode*`,
          quoted: message
        });
      }
    }, 120000);

  } catch (error) {
    console.error('Error en serbotcode:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *Error al generar el código*\n\nIntenta nuevamente o usa */serbotqr*',
      quoted: message
    });
  }
}

/**
 * Reconectar subbot
 */
async function reconectarCommand(ctx) {
  const { sock, chatId, args, sender, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */reconectar ABC12345*',
      quoted: message
    });
  }

  const code = args.trim();
  const subbotData = db.getSubbot(code);

  if (!subbotData) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Código de subbot no encontrado*\n\nVerifica el código o crea un nuevo subbot con */serbotqr*',
      quoted: message
    });
  }

  if (subbotData.owner !== sender) {
    return await sock.sendMessage(chatId, {
      text: '❌ *No eres el dueño de este subbot*',
      quoted: message
    });
  }

  // Verificar si ya está conectado
  const existingSession = subbotSessions.get(code);
  if (existingSession && existingSession.status === 'connected') {
    return await sock.sendMessage(chatId, {
      text: `✅ *El subbot ya está conectado*\n\n*Código:* ${code}\n*Número:* ${subbotData.number || 'Desconocido'}`,
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: `🔄 *Reconectando subbot...*\n\n*Código:* ${code}`,
    quoted: message
  });

  try {
    const sessionPath = path.join(SUBBOT_DIR, code);
    
    if (!fs.existsSync(sessionPath)) {
      return await sock.sendMessage(chatId, {
        text: '❌ *Sesión no encontrada*\n\nDebes crear un nuevo subbot con */serbotqr*',
        quoted: message
      });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const subSock = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger)
      },
      browser: ['FENIXBOT Subbot', 'Chrome', '1.0.0']
    });

    subbotSessions.set(code, {
      sock: subSock,
      owner: sender,
      code,
      status: 'connecting'
    });

    subSock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'open') {
        subbotSessions.get(code).status = 'connected';
        db.addSubbot(code, {
          owner: sender,
          status: 'connected',
          number: subSock.user?.id?.split(':')[0],
          name: subSock.user?.name
        });

        await sock.sendMessage(chatId, {
          text: `✅ *SUBBOT RECONECTADO*\n\n*Código:* ${code}\n*Número:* ${subSock.user?.id?.split(':')[0]}\n*Nombre:* ${subSock.user?.name}`,
          quoted: message
        });
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        
        if (!shouldReconnect) {
          subbotSessions.delete(code);
          db.removeSubbot(code);
          fs.removeSync(sessionPath);
        }
      }
    });

    subSock.ev.on('creds.update', saveCreds);

  } catch (error) {
    console.error('Error en reconectar:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *Error al reconectar*\n\nIntenta crear un nuevo subbot con */serbotqr*',
      quoted: message
    });
  }
}

/**
 * Detener subbot
 */
async function stopCommand(ctx) {
  const { sock, chatId, args, sender, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */stop ABC12345*',
      quoted: message
    });
  }

  const code = args.trim();
  const subbotData = db.getSubbot(code);

  if (!subbotData) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Código de subbot no encontrado*',
      quoted: message
    });
  }

  if (subbotData.owner !== sender && !ctx.isOwner) {
    return await sock.sendMessage(chatId, {
      text: '❌ *No eres el dueño de este subbot*',
      quoted: message
    });
  }

  try {
    const session = subbotSessions.get(code);
    if (session && session.sock) {
      await session.sock.logout();
    }

    subbotSessions.delete(code);
    db.removeSubbot(code);
    
    const sessionPath = path.join(SUBBOT_DIR, code);
    fs.removeSync(sessionPath);

    await sock.sendMessage(chatId, {
      text: `🛑 *SUBBOT DETENIDO*\n\n*Código:* ${code}\n\nLa sesión ha sido eliminada. Puedes crear un nuevo subbot con */serbotqr*`,
      quoted: message
    });

  } catch (error) {
    console.error('Error en stop:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *Error al detener el subbot*\n\nIntenta nuevamente.',
      quoted: message
    });
  }
}

/**
 * Ver mis subbots
 */
async function misbotsCommand(ctx) {
  const { sock, chatId, sender, message } = ctx;
  
  const subbots = Object.entries(db.data.subbots).filter(([_, data]) => data.owner === sender);

  if (subbots.length === 0) {
    return await sock.sendMessage(chatId, {
      text: '📱 *No tienes subbots activos*\n\nCrea uno con */serbotqr* o */serbotcode*',
      quoted: message
    });
  }

  let text = `📱 *TUS SUBBOTS*\n\n`;
  
  subbots.forEach(([code, data], index) => {
    const status = data.status === 'connected' ? '🟢 Conectado' : '🔴 Desconectado';
    text += `*${index + 1}.* Código: ${code}\n`;
    text += `   Estado: ${status}\n`;
    text += `   Número: ${data.number || 'N/A'}\n`;
    text += `   🔌 */reconectar ${code}*\n`;
    text += `   🛑 */stop ${code}*\n\n`;
  });

  await sock.sendMessage(chatId, {
    text: text,
    quoted: message
  });
}

module.exports = {
  serbotqr: serbotqrCommand,
  serbotcode: serbotcodeCommand,
  reconectar: reconectarCommand,
  stop: stopCommand,
  misbots: misbotsCommand,
  subbotSessions
};