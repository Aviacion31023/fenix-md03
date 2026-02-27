/**
 * ═══════════════════════════════════════════════════════════════
 * ⚡ MANEJADOR DE EVENTOS DE GRUPO
 * Bienvenidas, despedidas, actualizaciones
 * ═══════════════════════════════════════════════════════════════
 */

const db = require('../database');
const config = require('../config');

/**
 * Manejar actualizaciones de participantes
 */
async function handleParticipantsUpdate(sock, update) {
  const { id, participants, action } = update;
  
  const group = db.getGroup(id);
  
  for (const participant of participants) {
    const userJid = participant;
    const userNumber = userJid.split('@')[0];
    
    switch (action) {
      case 'add':
        if (group.welcome !== false) {
          await sendWelcome(sock, id, userJid, userNumber);
        }
        break;
        
      case 'remove':
        if (group.goodbye) {
          await sendGoodbye(sock, id, userJid, userNumber);
        }
        break;
        
      case 'promote':
        await sendPromotion(sock, id, userJid, userNumber);
        break;
        
      case 'demote':
        await sendDemotion(sock, id, userJid, userNumber);
        break;
    }
  }
}

/**
 * Enviar mensaje de bienvenida
 */
async function sendWelcome(sock, groupId, userJid, userNumber) {
  try {
    const groupMetadata = await sock.groupMetadata(groupId);
    const groupName = groupMetadata.subject;
    const memberCount = groupMetadata.participants.length;

    const welcomeMessages = [
      `👋 *¡Bienvenido/a @${userNumber}!*\n\n🎉 Gracias por unirte a *${groupName}*.\n\n📊 Eres el miembro número *${memberCount}*.\n\n✨ Esperamos que disfrutes tu estadía aquí.\n\n🤖 _${config.botName}_`,
      
      `🌟 *¡Hola @${userNumber}!*\n\nBienvenido/a al grupo *${groupName}*.\n\n👥 Miembros actuales: ${memberCount}\n\n💬 ¡Participa y diviértete!\n\n🤖 _${config.botName}_`,
      
      `🎊 *¡Bienvenido/a @${userNumber}!*\n\nTe has unido a *${groupName}*.\n\n📝 Lee las reglas del grupo y respeta a todos.\n\n🎉 ¡Que lo pases bien!\n\n🤖 _${config.botName}_`
    ];

    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

    await sock.sendMessage(groupId, {
      text: randomMessage,
      mentions: [userJid]
    });

  } catch (error) {
    console.error('Error enviando bienvenida:', error);
  }
}

/**
 * Enviar mensaje de despedida
 */
async function sendGoodbye(sock, groupId, userJid, userNumber) {
  try {
    const goodbyeMessages = [
      `👋 *¡Hasta luego @${userNumber}!*\n\nGracias por haber sido parte del grupo.\n\n🍀 ¡Te deseamos lo mejor!\n\n🤖 _${config.botName}_`,
      
      `😢 *@${userNumber}* ha abandonado el grupo.\n\n¡Esperamos verte de vuelta pronto!\n\n🤖 _${config.botName}_`,
      
      `🚪 *@${userNumber}* se ha ido.\n\nUn miembro menos, pero los recuerdos quedan.\n\n🤖 _${config.botName}_`
    ];

    const randomMessage = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];

    await sock.sendMessage(groupId, {
      text: randomMessage,
      mentions: [userJid]
    });

  } catch (error) {
    console.error('Error enviando despedida:', error);
  }
}

/**
 * Enviar mensaje de promoción
 */
async function sendPromotion(sock, groupId, userJid, userNumber) {
  try {
    await sock.sendMessage(groupId, {
      text: `⬆️ *¡Felicidades @${userNumber}!*\n\nAhora eres *administrador* del grupo.\n\n⚡ Usa tu poder con responsabilidad.\n\n🤖 _${config.botName}_`,
      mentions: [userJid]
    });
  } catch (error) {
    console.error('Error enviando promoción:', error);
  }
}

/**
 * Enviar mensaje de degradación
 */
async function sendDemotion(sock, groupId, userJid, userNumber) {
  try {
    await sock.sendMessage(groupId, {
      text: `⬇️ *@${userNumber}*\n\nYa no eres administrador del grupo.\n\n🤖 _${config.botName}_`,
      mentions: [userJid]
    });
  } catch (error) {
    console.error('Error enviando degradación:', error);
  }
}

module.exports = {
  handleParticipantsUpdate
};