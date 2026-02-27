/**
 * ═══════════════════════════════════════════════════════════════
 * ⚡ COMANDOS DE GRUPOS
 * Administración, moderación, configuración
 * ═══════════════════════════════════════════════════════════════
 */

const db = require('../database');
const { isAdmin, delay } = require('../utils/helpers');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

/**
 * Abrir grupo
 */
async function abrirCommand(ctx) {
  const { sock, chatId, message, sender } = ctx;
  
  try {
    await sock.groupSettingUpdate(chatId, 'not_announcement');
    await sock.sendMessage(chatId, {
      text: '🔓 *Grupo abierto*\n\nAhora todos los miembros pueden enviar mensajes.',
      quoted: message
    });
  } catch (error) {
    console.error('Error abriendo grupo:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo abrir el grupo*\n\nVerifica que el bot sea administrador.',
      quoted: message
    });
  }
}

/**
 * Cerrar grupo
 */
async function cerrarCommand(ctx) {
  const { sock, chatId, message, sender } = ctx;
  
  try {
    await sock.groupSettingUpdate(chatId, 'announcement');
    await sock.sendMessage(chatId, {
      text: '🔒 *Grupo cerrado*\n\nSolo los administradores pueden enviar mensajes.',
      quoted: message
    });
  } catch (error) {
    console.error('Error cerrando grupo:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo cerrar el grupo*\n\nVerifica que el bot sea administrador.',
      quoted: message
    });
  }
}

/**
 * Activar/desactivar apertura automática
 */
async function autoabrirCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const group = db.getGroup(chatId);
  group.autoOpen = !group.autoOpen;
  db.updateGroup(chatId, group);
  
  const status = group.autoOpen ? '✅ ACTIVADA' : '❌ DESACTIVADA';
  
  await sock.sendMessage(chatId, {
    text: `🕘 *Apertura automática: ${status}*\n\n⏰ El grupo se abrirá automáticamente a las 09:00 AM (Argentina).\n\n💡 Usa */autoabrir* para cambiar.`,
    quoted: message
  });
}

/**
 * Activar/desactivar cierre automático
 */
async function autocerrarCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const group = db.getGroup(chatId);
  group.autoClose = !group.autoClose;
  db.updateGroup(chatId, group);
  
  const status = group.autoClose ? '✅ ACTIVADA' : '❌ DESACTIVADA';
  
  await sock.sendMessage(chatId, {
    text: `🕑 *Cierre automático: ${status}*\n\n⏰ El grupo se cerrará automáticamente a las 02:00 AM (Argentina).\n\n💡 Usa */autocerrar* para cambiar.`,
    quoted: message
  });
}

/**
 * Activar/desactivar anti-link
 */
async function antilinkCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  const group = db.getGroup(chatId);
  
  if (args === 'on') {
    group.antilink = true;
    db.updateGroup(chatId, group);
    await sock.sendMessage(chatId, {
      text: '🔗 *Anti-link ACTIVADO*\n\nLos mensajes con enlaces serán eliminados automáticamente.\n\n⚠️ Los administradores están exentos.',
      quoted: message
    });
  } else if (args === 'off') {
    group.antilink = false;
    db.updateGroup(chatId, group);
    await sock.sendMessage(chatId, {
      text: '🔗 *Anti-link DESACTIVADO*\n\nLos enlaces ya no serán eliminados.',
      quoted: message
    });
  } else {
    const status = group.antilink ? '✅ ACTIVADO' : '❌ DESACTIVADO';
    await sock.sendMessage(chatId, {
      text: `🔗 *Anti-link: ${status}*\n\nUso: */antilink on* o */antilink off*`,
      quoted: message
    });
  }
}

/**
 * Activar/desactivar anti-toxic
 */
async function antitoxicCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  const group = db.getGroup(chatId);
  
  if (args === 'on') {
    group.antitoxic = true;
    db.updateGroup(chatId, group);
    await sock.sendMessage(chatId, {
      text: '🛡️ *Anti-toxic ACTIVADO*\n\nLos mensajes con insultos serán eliminados automáticamente.\n\n⚠️ 3 advertencias = expulsión automática.',
      quoted: message
    });
  } else if (args === 'off') {
    group.antitoxic = false;
    db.updateGroup(chatId, group);
    await sock.sendMessage(chatId, {
      text: '🛡️ *Anti-toxic DESACTIVADO*\n\nEl filtro de insultos ha sido desactivado.',
      quoted: message
    });
  } else {
    const status = group.antitoxic ? '✅ ACTIVADO' : '❌ DESACTIVADO';
    await sock.sendMessage(chatId, {
      text: `🛡️ *Anti-toxic: ${status}*\n\nUso: */antitoxic on* o */antitoxic off*`,
      quoted: message
    });
  }
}

/**
 * Activar/desactivar bienvenida
 */
async function bienvenidaCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  const group = db.getGroup(chatId);
  
  if (args === 'on') {
    group.welcome = true;
    db.updateGroup(chatId, group);
    await sock.sendMessage(chatId, {
      text: '👋 *Bienvenida ACTIVADA*\n\nSe enviará un mensaje de bienvenida a los nuevos miembros.',
      quoted: message
    });
  } else if (args === 'off') {
    group.welcome = false;
    db.updateGroup(chatId, group);
    await sock.sendMessage(chatId, {
      text: '👋 *Bienvenida DESACTIVADA*\n\nNo se enviarán mensajes de bienvenida.',
      quoted: message
    });
  } else {
    const status = group.welcome ? '✅ ACTIVADA' : '❌ DESACTIVADA';
    await sock.sendMessage(chatId, {
      text: `👋 *Bienvenida: ${status}*\n\nUso: */bienvenida on* o */bienvenida off*`,
      quoted: message
    });
  }
}

/**
 * Activar/desactivar despedida
 */
async function despedidaCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  const group = db.getGroup(chatId);
  
  if (args === 'on') {
    group.goodbye = true;
    db.updateGroup(chatId, group);
    await sock.sendMessage(chatId, {
      text: '👋 *Despedida ACTIVADA*\n\nSe enviará un mensaje cuando alguien salga del grupo.',
      quoted: message
    });
  } else if (args === 'off') {
    group.goodbye = false;
    db.updateGroup(chatId, group);
    await sock.sendMessage(chatId, {
      text: '👋 *Despedida DESACTIVADA*\n\nNo se enviarán mensajes de despedida.',
      quoted: message
    });
  } else {
    const status = group.goodbye ? '✅ ACTIVADA' : '❌ DESACTIVADA';
    await sock.sendMessage(chatId, {
      text: `👋 *Despedida: ${status}*\n\nUso: */despedida on* o */despedida off*`,
      quoted: message
    });
  }
}

/**
 * Expulsar usuario
 */
async function kickCommand(ctx) {
  const { sock, chatId, args, message, sender } = ctx;
  
  if (!args && !message.message.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nMenciona a alguien o responde a su mensaje.\nEjemplo: */kick @usuario*',
      quoted: message
    });
  }

  try {
    let targetJid;
    
    // Obtener usuario mencionado o respondido
    const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mentioned && mentioned.length > 0) {
      targetJid = mentioned[0];
    } else if (message.message.extendedTextMessage?.contextInfo?.participant) {
      targetJid = message.message.extendedTextMessage.contextInfo.participant;
    }

    if (!targetJid) {
      return await sock.sendMessage(chatId, {
        text: '❌ *No se pudo identificar al usuario*',
        quoted: message
      });
    }

    // Verificar que no sea admin
    const isTargetAdmin = await isAdmin(sock, chatId, targetJid);
    if (isTargetAdmin) {
      return await sock.sendMessage(chatId, {
        text: '❌ *No puedes expulsar a un administrador*',
        quoted: message
      });
    }

    await sock.groupParticipantsUpdate(chatId, [targetJid], 'remove');
    await sock.sendMessage(chatId, {
      text: `👢 @${targetJid.split('@')[0]} ha sido *expulsado* del grupo.`,
      mentions: [targetJid]
    });

  } catch (error) {
    console.error('Error en kick:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo expulsar al usuario*\n\nVerifica que el bot sea administrador.',
      quoted: message
    });
  }
}

/**
 * Agregar usuario
 */
async function addCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */add 5493704052049*',
      quoted: message
    });
  }

  try {
    // Formatear número
    let number = args.replace(/[^0-9]/g, '');
    if (!number.startsWith('54')) {
      number = '54' + number;
    }
    
    const jid = number + '@s.whatsapp.net';
    
    await sock.groupParticipantsUpdate(chatId, [jid], 'add');
    await sock.sendMessage(chatId, {
      text: `✅ @${number} ha sido *agregado* al grupo.`,
      mentions: [jid]
    });

  } catch (error) {
    console.error('Error en add:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo agregar al usuario*\n\nVerifica que:\n• El número sea correcto\n• El usuario tenga WhatsApp\n• El grupo no esté lleno',
      quoted: message
    });
  }
}

/**
 * Dar admin
 */
async function promoteCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid;
  const participant = message.message.extendedTextMessage?.contextInfo?.participant;
  
  const targetJid = mentioned?.[0] || participant;
  
  if (!targetJid) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Menciona a alguien o responde a su mensaje*',
      quoted: message
    });
  }

  try {
    await sock.groupParticipantsUpdate(chatId, [targetJid], 'promote');
    await sock.sendMessage(chatId, {
      text: `⬆️ @${targetJid.split('@')[0]} ahora es *administrador*.`,
      mentions: [targetJid]
    });
  } catch (error) {
    console.error('Error en promote:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo promover al usuario*',
      quoted: message
    });
  }
}

/**
 * Quitar admin
 */
async function demoteCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid;
  const participant = message.message.extendedTextMessage?.contextInfo?.participant;
  
  const targetJid = mentioned?.[0] || participant;
  
  if (!targetJid) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Menciona a alguien o responde a su mensaje*',
      quoted: message
    });
  }

  try {
    await sock.groupParticipantsUpdate(chatId, [targetJid], 'demote');
    await sock.sendMessage(chatId, {
      text: `⬇️ @${targetJid.split('@')[0]} ya no es *administrador*.`,
      mentions: [targetJid]
    });
  } catch (error) {
    console.error('Error en demote:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo degradar al usuario*',
      quoted: message
    });
  }
}

/**
 * Advertir usuario
 */
async function warnCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid;
  const participant = message.message.extendedTextMessage?.contextInfo?.participant;
  
  const targetJid = mentioned?.[0] || participant;
  
  if (!targetJid) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Menciona a alguien o responde a su mensaje*',
      quoted: message
    });
  }

  const user = db.getUser(targetJid);
  user.warns = (user.warns || 0) + 1;
  db.save();

  const reason = args || 'Sin razón especificada';

  await sock.sendMessage(chatId, {
    text: `⚠️ *ADVERTENCIA*\n\n@${targetJid.split('@')[0]} ha recibido una advertencia.\n\n📊 Total: ${user.warns}/3\n📝 Razón: ${reason}`,
    mentions: [targetJid]
  });

  // Si llega a 3 warns, expulsar
  if (user.warns >= 3) {
    await delay(2000);
    try {
      await sock.groupParticipantsUpdate(chatId, [targetJid], 'remove');
      await sock.sendMessage(chatId, {
        text: `🚫 @${targetJid.split('@')[0]} fue *expulsado* por acumular 3 advertencias.`,
        mentions: [targetJid]
      });
      user.warns = 0;
      db.save();
    } catch (error) {
      console.error('Error expulsando por warns:', error);
    }
  }
}

/**
 * Ver advertencias
 */
async function warnsCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid;
  const participant = message.message.extendedTextMessage?.contextInfo?.participant;
  
  const targetJid = mentioned?.[0] || participant || ctx.sender;
  
  const user = db.getUser(targetJid);
  const warns = user.warns || 0;

  await sock.sendMessage(chatId, {
    text: `📊 *ADVERTENCIAS*\n\n@${targetJid.split('@')[0]} tiene *${warns}/3* advertencias.`,
    mentions: [targetJid]
  });
}

/**
 * Resetear advertencias
 */
async function resetwarnsCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid;
  const participant = message.message.extendedTextMessage?.contextInfo?.participant;
  
  const targetJid = mentioned?.[0] || participant;
  
  if (!targetJid) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Menciona a alguien o responde a su mensaje*',
      quoted: message
    });
  }

  const user = db.getUser(targetJid);
  user.warns = 0;
  db.save();

  await sock.sendMessage(chatId, {
    text: `✅ Las advertencias de @${targetJid.split('@')[0]} han sido *reseteadas*.`,
    mentions: [targetJid]
  });
}

/**
 * Mencionar a todos
 */
async function tagallCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  try {
    const groupMetadata = await sock.groupMetadata(chatId);
    const participants = groupMetadata.participants.map(p => p.id);
    
    let text = args || '👋 *Atención a todos*';
    text += '\n\n';
    
    participants.forEach(jid => {
      text += `@${jid.split('@')[0]} `;
    });

    await sock.sendMessage(chatId, {
      text: text,
      mentions: participants
    });

  } catch (error) {
    console.error('Error en tagall:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo mencionar a todos*',
      quoted: message
    });
  }
}

/**
 * Mencionar oculto (hidetag)
 */
async function hidetagCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  try {
    const groupMetadata = await sock.groupMetadata(chatId);
    const participants = groupMetadata.participants.map(p => p.id);
    
    const text = args || '👋 Mensaje para todos';

    await sock.sendMessage(chatId, {
      text: text,
      mentions: participants
    });

  } catch (error) {
    console.error('Error en hidetag:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo enviar el mensaje*',
      quoted: message
    });
  }
}

/**
 * Cambiar nombre del grupo
 */
async function setnameCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Escribe el nuevo nombre del grupo*',
      quoted: message
    });
  }

  try {
    await sock.groupUpdateSubject(chatId, args);
    await sock.sendMessage(chatId, {
      text: `✅ *Nombre del grupo actualizado:*\n${args}`,
      quoted: message
    });
  } catch (error) {
    console.error('Error en setname:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo cambiar el nombre*',
      quoted: message
    });
  }
}

/**
 * Cambiar descripción del grupo
 */
async function setdescCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Escribe la nueva descripción del grupo*',
      quoted: message
    });
  }

  try {
    await sock.groupUpdateDescription(chatId, args);
    await sock.sendMessage(chatId, {
      text: `✅ *Descripción del grupo actualizada.*`,
      quoted: message
    });
  } catch (error) {
    console.error('Error en setdesc:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo cambiar la descripción*',
      quoted: message
    });
  }
}

/**
 * Cambiar foto del grupo
 */
async function setppCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const quoted = message.message.imageMessage || message.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  
  if (!quoted) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Responde a una imagen*',
      quoted: message
    });
  }

  try {
    const stream = await downloadContentFromMessage(quoted, 'image');
    let buffer = Buffer.from([]);
    
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    await sock.updateProfilePicture(chatId, buffer);
    await sock.sendMessage(chatId, {
      text: `✅ *Foto del grupo actualizada.*`,
      quoted: message
    });
  } catch (error) {
    console.error('Error en setpp:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo cambiar la foto*',
      quoted: message
    });
  }
}

/**
 * Obtener link del grupo
 */
async function linkCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  try {
    const link = await sock.groupInviteCode(chatId);
    await sock.sendMessage(chatId, {
      text: `🔗 *Link del grupo:*\n\nhttps://chat.whatsapp.com/${link}\n\n💡 Comparte este link para invitar a más personas.`,
      quoted: message
    });
  } catch (error) {
    console.error('Error en link:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo obtener el link*',
      quoted: message
    });
  }
}

/**
 * Revocar link del grupo
 */
async function revokeCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  try {
    await sock.groupRevokeInvite(chatId);
    const newLink = await sock.groupInviteCode(chatId);
    await sock.sendMessage(chatId, {
      text: `🔄 *Link revocado*\n\nEl link anterior ya no funciona.\n\n🔗 *Nuevo link:*\nhttps://chat.whatsapp.com/${newLink}`,
      quoted: message
    });
  } catch (error) {
    console.error('Error en revoke:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo revocar el link*',
      quoted: message
    });
  }
}

module.exports = {
  abrir: abrirCommand,
  cerrar: cerrarCommand,
  autoabrir: autoabrirCommand,
  autocerrar: autocerrarCommand,
  antilink: antilinkCommand,
  antitoxic: antitoxicCommand,
  bienvenida: bienvenidaCommand,
  despedida: despedidaCommand,
  kick: kickCommand,
  add: addCommand,
  promote: promoteCommand,
  demote: demoteCommand,
  warn: warnCommand,
  warns: warnsCommand,
  resetwarns: resetwarnsCommand,
  tagall: tagallCommand,
  hidetag: hidetagCommand,
  setname: setnameCommand,
  setdesc: setdescCommand,
  setpp: setppCommand,
  link: linkCommand,
  revoke: revokeCommand
};