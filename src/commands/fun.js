/**
 * ═══════════════════════════════════════════════════════════════
 * ⚡ COMANDOS DE DIVERSIÓN
 * Juegos, entretenimiento, interacción social
 * ═══════════════════════════════════════════════════════════════
 */

const db = require('../database');

/**
 * Dado
 */
async function dadoCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const resultado = Math.floor(Math.random() * 6) + 1;
  
  const dados = {
    1: '⚀',
    2: '⚁',
    3: '⚂',
    4: '⚃',
    5: '⚄',
    6: '⚅'
  };

  await sock.sendMessage(chatId, {
    text: `🎲 *DADO*\n\n${dados[resultado]} *${resultado}*`,
    quoted: message
  });
}

/**
 * Moneda (cara o cruz)
 */
async function monedaCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const resultado = Math.random() < 0.5 ? 'cara' : 'cruz';
  
  const emojis = {
    cara: '👑',
    cruz: '❌'
  };

  await sock.sendMessage(chatId, {
    text: `🪙 *MONEDA*\n\n${emojis[resultado]} *${resultado.toUpperCase()}*`,
    quoted: message
  });
}

/**
 * Piedra, Papel o Tijera
 */
async function pptCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args || !['piedra', 'papel', 'tijera'].includes(args.toLowerCase())) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */ppt piedra*\n*/ppt papel*\n*/ppt tijera*',
      quoted: message
    });
  }

  const opciones = ['piedra', 'papel', 'tijera'];
  const botChoice = opciones[Math.floor(Math.random() * 3)];
  const userChoice = args.toLowerCase();

  const emojis = {
    piedra: '🪨',
    papel: '📄',
    tijera: '✂️'
  };

  let resultado;
  if (userChoice === botChoice) {
    resultado = '🤝 *EMPATE*';
  } else if (
    (userChoice === 'piedra' && botChoice === 'tijera') ||
    (userChoice === 'papel' && botChoice === 'piedra') ||
    (userChoice === 'tijera' && botChoice === 'papel')
  ) {
    resultado = '🎉 *¡GANASTE!*';
  } else {
    resultado = '😔 *PERDISTE*';
  }

  await sock.sendMessage(chatId, {
    text: `✊ *PIEDRA, PAPEL O TIJERA*\n\nTú: ${emojis[userChoice]} ${userChoice}\nBot: ${emojis[botChoice]} ${botChoice}\n\n${resultado}`,
    quoted: message
  });
}

/**
 * Love / Ship (compatibilidad)
 */
async function loveCommand(ctx) {
  const { sock, chatId, args, message, sender } = ctx;
  
  const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid;
  const participant = message.message.extendedTextMessage?.contextInfo?.participant;
  
  let targetJid;
  
  if (mentioned && mentioned.length > 0) {
    targetJid = mentioned[0];
  } else if (participant) {
    targetJid = participant;
  } else if (args) {
    // Intentar parsear número
    let number = args.replace(/[^0-9]/g, '');
    if (number) {
      if (!number.startsWith('54')) number = '54' + number;
      targetJid = number + '@s.whatsapp.net';
    }
  }

  if (!targetJid || targetJid === sender) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Menciona a alguien o responde a su mensaje*\n\nEjemplo: */love @usuario*',
      quoted: message
    });
  }

  // Calcular porcentaje "aleatorio" pero consistente para la misma pareja
  const combined = sender.split('@')[0] + targetJid.split('@')[0];
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash = hash & hash;
  }
  const porcentaje = Math.abs(hash % 101);

  let mensaje;
  if (porcentaje < 20) mensaje = '💔 *Mejor sigan como amigos...*';
  else if (porcentaje < 40) mensaje = '😐 *Hay algo, pero no mucho*';
  else if (porcentaje < 60) mensaje = '💛 *Podría funcionar*';
  else if (porcentaje < 80) mensaje = '❤️ *¡Buena pareja!*';
  else mensaje = '💕 *¡ALMA GEMELA!*';

  const barra = '█'.repeat(Math.floor(porcentaje / 10)) + '░'.repeat(10 - Math.floor(porcentaje / 10));

  await sock.sendMessage(chatId, {
    text: `💘 *COMPATIBILIDAD*\n\n@${sender.split('@')[0]} + @${targetJid.split('@')[0]}\n\n[${barra}] ${porcentaje}%\n\n${mensaje}`,
    mentions: [sender, targetJid],
    quoted: message
  });
}

/**
 * Porcentaje gay
 */
async function gayCommand(ctx) {
  const { sock, chatId, message, sender } = ctx;
  
  const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid;
  const participant = message.message.extendedTextMessage?.contextInfo?.participant;
  
  const targetJid = mentioned?.[0] || participant || sender;

  // Porcentaje "aleatorio" pero consistente
  const seed = targetJid.split('@')[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const porcentaje = Math.abs(hash % 101);

  const barra = '🏳️‍🌈'.repeat(Math.floor(porcentaje / 10)) + '⚪'.repeat(10 - Math.floor(porcentaje / 10));

  await sock.sendMessage(chatId, {
    text: `🏳️‍🌈 *MEDIDOR GAY*\n\n@${targetJid.split('@')[0]}\n\n[${barra}] ${porcentaje}%`,
    mentions: [targetJid],
    quoted: message
  });
}

/**
 * Top X
 */
async function topCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */top más graciosos*',
      quoted: message
    });
  }

  try {
    const groupMetadata = await sock.groupMetadata(chatId);
    const participants = groupMetadata.participants.map(p => p.id);
    
    // Seleccionar 5 participantes aleatorios
    const shuffled = participants.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(5, shuffled.length));

    let text = `🏆 *TOP 5: ${args.toUpperCase()}*\n\n`;
    
    selected.forEach((jid, index) => {
      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
      text += `${medals[index]} @${jid.split('@')[0]}\n`;
    });

    await sock.sendMessage(chatId, {
      text: text,
      mentions: selected,
      quoted: message
    });

  } catch (error) {
    console.error('Error en top:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *Este comando solo funciona en grupos*',
      quoted: message
    });
  }
}

/**
 * Número aleatorio
 */
async function randomCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  let min = 1;
  let max = 100;

  if (args) {
    const parts = args.split(' ');
    if (parts.length === 2) {
      min = parseInt(parts[0]) || 1;
      max = parseInt(parts[1]) || 100;
    } else if (parts.length === 1) {
      max = parseInt(parts[0]) || 100;
    }
  }

  if (min > max) {
    [min, max] = [max, min];
  }

  const resultado = Math.floor(Math.random() * (max - min + 1)) + min;

  await sock.sendMessage(chatId, {
    text: `🎰 *NÚMERO ALEATORIO*\n\nRango: ${min} - ${max}\n\n🎯 *${resultado}*`,
    quoted: message
  });
}

module.exports = {
  dado: dadoCommand,
  moneda: monedaCommand,
  ppt: pptCommand,
  love: loveCommand,
  gay: gayCommand,
  top: topCommand,
  random: randomCommand
};