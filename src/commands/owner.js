/**
 * ═══════════════════════════════════════════════════════════════
 * ⚡ COMANDOS DEL OWNER
 * Gestión premium, broadcast, configuración
 * ═══════════════════════════════════════════════════════════════
 */

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const db = require('../database');
const config = require('../config');
const { delay, formatTime } = require('../utils/helpers');

const execPromise = util.promisify(exec);

/**
 * Dar premium a un usuario
 */
async function premiumCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */premium @5493704052049 30*\n\n(Días: 7, 15, 30, 90)',
      quoted: message
    });
  }

  const parts = args.split(' ');
  const targetMention = parts[0];
  const days = parseInt(parts[1]) || 30;

  // Extraer número del mention
  let targetNumber = targetMention.replace(/[^0-9]/g, '');
  if (!targetNumber.startsWith('54')) {
    targetNumber = '54' + targetNumber;
  }
  const targetJid = targetNumber + '@s.whatsapp.net';

  try {
    const expiry = db.addPremium(targetJid, days);
    
    await sock.sendMessage(chatId, {
      text: `💎 *PREMIUM ACTIVADO*\n\n👤 Usuario: @${targetNumber}\n📅 Días: ${days}\n⏰ Expira: ${expiry.toLocaleDateString('es-AR')}\n\n✅ El usuario ahora tiene acceso ilimitado.`,
      mentions: [targetJid],
      quoted: message
    });

    // Notificar al usuario
    try {
      await sock.sendMessage(targetJid, {
        text: `🎉 *¡Felicidades!*\n\nHas recibido *PREMIUM* por ${days} días.\n\n✨ Beneficios:\n• Descargas ilimitadas\n• Comandos ilimitados\n• Prioridad en procesamiento\n\n⏰ Expira: ${expiry.toLocaleDateString('es-AR')}\n\n💎 Disfruta de tu membresía premium!`
      });
    } catch (error) {
      console.log('No se pudo notificar al usuario premium');
    }

  } catch (error) {
    console.error('Error en premium:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *Error al activar premium*',
      quoted: message
    });
  }
}

/**
 * Quitar premium
 */
async function quitarpremiumCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */quitarpremium @5493704052049*',
      quoted: message
    });
  }

  let targetNumber = args.replace(/[^0-9]/g, '');
  if (!targetNumber.startsWith('54')) {
    targetNumber = '54' + targetNumber;
  }
  const targetJid = targetNumber + '@s.whatsapp.net';

  db.removePremium(targetJid);

  await sock.sendMessage(chatId, {
    text: `❌ *PREMIUM REMOVIDO*\n\n👤 Usuario: @${targetNumber}\n\nEl usuario ha vuelto a plan FREE.`,
    mentions: [targetJid],
    quoted: message
  });
}

/**
 * Agregar comando personalizado
 */
async function addcomandoCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */addcomando /saludo*\n\nLuego el bot te pedirá la respuesta.',
      quoted: message
    });
  }

  const commandName = args.startsWith('/') ? args : '/' + args;
  const cleanName = commandName.slice(1);

  // Verificar si ya existe
  if (db.getCustomCommand(cleanName)) {
    return await sock.sendMessage(chatId, {
      text: `❌ *El comando ${commandName} ya existe*\n\nUsa */delcomando ${cleanName}* para eliminarlo primero.`,
      quoted: message
    });
  }

  // Guardar estado de espera
  db.data.pendingCommand = {
    owner: ctx.sender,
    name: cleanName,
    step: 'waiting_response'
  };
  db.save();

  await sock.sendMessage(chatId, {
    text: `📝 *AGREGAR COMANDO: ${commandName}*\n\n*Paso 1/3:*\nEnvía la respuesta que dará el comando cuando alguien lo use.\n\nPuede ser:\n• Texto simple\n• Texto con formato (*negrita*, _cursiva_)\n• Incluir emojis\n\n*Ejemplo:* Hola! ¿Cómo estás? 👋`,
    quoted: message
  });
}

/**
 * Eliminar comando personalizado
 */
async function delcomandoCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */delcomando saludo*',
      quoted: message
    });
  }

  const cleanName = args.replace('/', '');

  if (!db.getCustomCommand(cleanName)) {
    return await sock.sendMessage(chatId, {
      text: `❌ *El comando /${cleanName} no existe*`,
      quoted: message
    });
  }

  db.removeCustomCommand(cleanName);

  await sock.sendMessage(chatId, {
    text: `✅ *Comando eliminado*\n\n/${cleanName} ya no está disponible.`,
    quoted: message
  });
}

/**
 * Listar comandos personalizados
 */
async function listcomandosCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const commands = Object.keys(db.data.customCommands);

  if (commands.length === 0) {
    return await sock.sendMessage(chatId, {
      text: '📝 *No hay comandos personalizados*\n\nUsa */addcomando <nombre>* para crear uno.',
      quoted: message
    });
  }

  let text = `📝 *COMANDOS PERSONALIZADOS*\n\n`;
  text += `Total: ${commands.length}\n\n`;
  
  commands.forEach((cmd, index) => {
    const data = db.getCustomCommand(cmd);
    text += `*${index + 1}.* /${cmd}\n`;
    text += `   Creado: ${new Date(data.createdAt).toLocaleDateString('es-AR')}\n`;
    text += `   Respuesta: ${data.response?.substring(0, 50)}...\n\n`;
  });

  await sock.sendMessage(chatId, {
    text: text,
    quoted: message
  });
}

/**
 * Broadcast a todos los usuarios
 */
async function broadcastCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */broadcast 🎉 ¡Nuevas funciones disponibles!*',
      quoted: message
    });
  }

  const users = Object.keys(db.data.users);
  let sent = 0;
  let failed = 0;

  await sock.sendMessage(chatId, {
    text: `📢 *INICIANDO BROADCAST*\n\nMensaje: ${args}\nDestinatarios: ${users.length} usuarios`,
    quoted: message
  });

  for (const userJid of users) {
    try {
      await sock.sendMessage(userJid, {
        text: `📢 *MENSAJE DEL ADMIN*\n\n${args}\n\n═══════════════════\n🤖 ${config.botName}`
      });
      sent++;
      await delay(1000); // Evitar rate limit
    } catch (error) {
      failed++;
    }
  }

  await sock.sendMessage(chatId, {
    text: `✅ *BROADCAST COMPLETADO*\n\n📤 Enviados: ${sent}\n❌ Fallidos: ${failed}`,
    quoted: message
  });
}

/**
 * Broadcast a todos los grupos
 */
async function bangruposCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */bangrupos 🎉 ¡Nuevas funciones disponibles!*',
      quoted: message
    });
  }

  const groups = Object.keys(db.data.groups);
  let sent = 0;
  let failed = 0;

  await sock.sendMessage(chatId, {
    text: `📢 *INICIANDO BROADCAST A GRUPOS*\n\nMensaje: ${args}\nDestinatarios: ${groups.length} grupos`,
    quoted: message
  });

  for (const groupJid of groups) {
    try {
      await sock.sendMessage(groupJid, {
        text: `📢 *MENSAJE DEL ADMIN*\n\n${args}\n\n═══════════════════\n🤖 ${config.botName}`
      });
      sent++;
      await delay(1000);
    } catch (error) {
      failed++;
    }
  }

  await sock.sendMessage(chatId, {
    text: `✅ *BROADCAST COMPLETADO*\n\n📤 Enviados: ${sent}\n❌ Fallidos: ${failed}`,
    quoted: message
  });
}

/**
 * Resetear usuario
 */
async function resetuserCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */resetuser @5493704052049*',
      quoted: message
    });
  }

  let targetNumber = args.replace(/[^0-9]/g, '');
  if (!targetNumber.startsWith('54')) {
    targetNumber = '54' + targetNumber;
  }
  const targetJid = targetNumber + '@s.whatsapp.net';

  const user = db.getUser(targetJid);
  user.credits = {
    videoDownloads: 15,
    audioDownloads: 15,
    commands: 50
  };
  user.warns = 0;
  user.toxicWarns = 0;
  db.save();

  await sock.sendMessage(chatId, {
    text: `🔄 *USUARIO RESETEADO*\n\n👤 Usuario: @${targetNumber}\n\n✅ Créditos y advertencias reseteados.`,
    mentions: [targetJid],
    quoted: message
  });
}

/**
 * Banear usuario
 */
async function banCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */ban @5493704052049*',
      quoted: message
    });
  }

  let targetNumber = args.replace(/[^0-9]/g, '');
  if (!targetNumber.startsWith('54')) {
    targetNumber = '54' + targetNumber;
  }
  const targetJid = targetNumber + '@s.whatsapp.net';

  const user = db.getUser(targetJid);
  user.banned = true;
  db.save();

  await sock.sendMessage(chatId, {
    text: `🚫 *USUARIO BANEADO*\n\n👤 Usuario: @${targetNumber}\n\nEl usuario ya no puede usar el bot.`,
    mentions: [targetJid],
    quoted: message
  });
}

/**
 * Desbanear usuario
 */
async function unbanCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */unban @5493704052049*',
      quoted: message
    });
  }

  let targetNumber = args.replace(/[^0-9]/g, '');
  if (!targetNumber.startsWith('54')) {
    targetNumber = '54' + targetNumber;
  }
  const targetJid = targetNumber + '@s.whatsapp.net';

  const user = db.getUser(targetJid);
  user.banned = false;
  db.save();

  await sock.sendMessage(chatId, {
    text: `✅ *USUARIO DESBANEADO*\n\n👤 Usuario: @${targetNumber}\n\nEl usuario puede usar el bot nuevamente.`,
    mentions: [targetJid],
    quoted: message
  });
}

/**
 * Listar baneados
 */
async function listbansCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const bannedUsers = Object.entries(db.data.users).filter(([_, data]) => data.banned);

  if (bannedUsers.length === 0) {
    return await sock.sendMessage(chatId, {
      text: '✅ *No hay usuarios baneados*',
      quoted: message
    });
  }

  let text = `🚫 *USUARIOS BANEADOS*\n\n`;
  text += `Total: ${bannedUsers.length}\n\n`;
  
  bannedUsers.forEach(([jid, data], index) => {
    text += `*${index + 1}.* @${jid.split('@')[0]}\n`;
    text += `   Registrado: ${new Date(data.registeredAt).toLocaleDateString('es-AR')}\n\n`;
  });

  await sock.sendMessage(chatId, {
    text: text,
    quoted: message
  });
}

/**
 * Reiniciar bot
 */
async function reiniciarCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  await sock.sendMessage(chatId, {
    text: '🔄 *Reiniciando bot...*\n\n⏳ Esto tomará unos segundos.',
    quoted: message
  });

  await delay(2000);
  process.exit(0); // El proceso se reiniciará automáticamente si usas pm2 o similar
}

/**
 * Apagar bot
 */
async function apagarCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  await sock.sendMessage(chatId, {
    text: '🛑 *Apagando bot...*\n\n👋 Hasta pronto!',
    quoted: message
  });

  await delay(2000);
  process.exit(1);
}

/**
 * Actualizar bot
 */
async function actualizarCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  await sock.sendMessage(chatId, {
    text: '📥 *Actualizando bot...*\n\n⏳ Esto puede tomar unos minutos.',
    quoted: message
  });

  try {
    const { stdout, stderr } = await execPromise('git pull');
    
    await sock.sendMessage(chatId, {
      text: `✅ *Actualización completada*\n\n\`\`\`${stdout || 'Sin cambios'}\`\`\`\n\n🔄 Reiniciando...`,
      quoted: message
    });

    await delay(3000);
    process.exit(0);

  } catch (error) {
    await sock.sendMessage(chatId, {
      text: `❌ *Error al actualizar*\n\n${error.message}`,
      quoted: message
    });
  }
}

/**
 * Configurar API
 */
async function setapiCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args || !args.includes(' ')) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */setapi gemini TU_API_KEY*',
      quoted: message
    });
  }

  const parts = args.split(' ');
  const apiName = parts[0].toLowerCase();
  const apiKey = parts.slice(1).join(' ');

  // Actualizar config
  config.apis[apiName + 'ApiKey'] = apiKey;
  
  // Guardar en archivo
  const configPath = path.join(__dirname, '../config.js');
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  const regex = new RegExp(`${apiName}ApiKey: '[^']*'`);
  if (regex.test(configContent)) {
    configContent = configContent.replace(regex, `${apiName}ApiKey: '${apiKey}'`);
    fs.writeFileSync(configPath, configContent);
  }

  await sock.sendMessage(chatId, {
    text: `🔑 *API configurada*\n\n*Nombre:* ${apiName}\n*Key:* ${apiKey.substring(0, 10)}...\n\n✅ La API ha sido configurada.`,
    quoted: message
  });
}

/**
 * Ejecutar código JavaScript
 */
async function execCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */exec console.log("Hola")*',
      quoted: message
    });
  }

  try {
    let result = eval(args);
    
    if (typeof result === 'object') {
      result = JSON.stringify(result, null, 2);
    }

    await sock.sendMessage(chatId, {
      text: `💻 *RESULTADO*\n\n\`\`\`${result}\`\`\``,
      quoted: message
    });

  } catch (error) {
    await sock.sendMessage(chatId, {
      text: `❌ *ERROR*\n\n${error.message}`,
      quoted: message
    });
  }
}

/**
 * Ejecutar comando shell
 */
async function shellCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */shell ls -la*',
      quoted: message
    });
  }

  try {
    const { stdout, stderr } = await execPromise(args);
    
    const output = stdout || stderr || 'Sin salida';
    const truncated = output.length > 3500 ? output.substring(0, 3500) + '...' : output;

    await sock.sendMessage(chatId, {
      text: `🖥️ *COMANDO EJECUTADO*\n\n\`\`\`${truncated}\`\`\``,
      quoted: message
    });

  } catch (error) {
    await sock.sendMessage(chatId, {
      text: `❌ *ERROR*\n\n${error.message}`,
      quoted: message
    });
  }
}

module.exports = {
  premium: premiumCommand,
  quitarpremium: quitarpremiumCommand,
  addcomando: addcomandoCommand,
  delcomando: delcomandoCommand,
  listcomandos: listcomandosCommand,
  broadcast: broadcastCommand,
  bangrupos: bangruposCommand,
  resetuser: resetuserCommand,
  ban: banCommand,
  unban: unbanCommand,
  listbans: listbansCommand,
  reiniciar: reiniciarCommand,
  apagar: apagarCommand,
  actualizar: actualizarCommand,
  setapi: setapiCommand,
  exec: execCommand,
  shell: shellCommand
};