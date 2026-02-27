/**
 * ═══════════════════════════════════════════════════════════════
 * ⚡ COMANDOS DE HERRAMIENTAS Y UTILIDADES
 * QR, Stickers, Cálculos, Conversiones
 * ═══════════════════════════════════════════════════════════════
 */

const axios = require('axios');
const QRCode = require('qrcode');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const { getBuffer, downloadFile, delay } = require('../utils/helpers');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const execPromise = util.promisify(exec);

// Carpeta temporal
const TEMP_DIR = path.join(__dirname, '../../media/temp');
fs.ensureDirSync(TEMP_DIR);

/**
 * Generar QR
 */
async function qrCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */qr Hola mundo*',
      quoted: message
    });
  }

  try {
    const qrBuffer = await QRCode.toBuffer(args, {
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    await sock.sendMessage(chatId, {
      image: qrBuffer,
      caption: `📱 *Código QR*\n\n*Contenido:* ${args.substring(0, 100)}${args.length > 100 ? '...' : ''}`,
      quoted: message
    });

  } catch (error) {
    console.error('Error en qr:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo generar el QR*',
      quoted: message
    });
  }
}

/**
 * Generar QR de link (versión simple)
 */
async function linkqrCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */linkqr https://google.com*',
      quoted: message
    });
  }

  if (!args.startsWith('http')) {
    return await sock.sendMessage(chatId, {
      text: '❌ *URL inválida*\n\nDebe comenzar con http:// o https://',
      quoted: message
    });
  }

  await qrCommand(ctx);
}

/**
 * Acortar URL
 */
async function shortCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */short https://google.com/very/long/url*',
      quoted: message
    });
  }

  try {
    // Usar is.gd (gratuito)
    const response = await axios.get(`https://is.gd/create.php?format=json&url=${encodeURIComponent(args)}`, {
      timeout: 10000
    });

    if (response.data.shorturl) {
      await sock.sendMessage(chatId, {
        text: `🔗 *URL ACORTADA*\n\n*Original:* ${args}\n\n*Corta:* ${response.data.shorturl}\n\n💡 Copia y comparte el link corto.`,
        quoted: message
      });
    } else {
      throw new Error('No se pudo acortar');
    }

  } catch (error) {
    console.error('Error en short:', error);
    
    // Fallback: tinyurl
    try {
      const fallback = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(args)}`, {
        timeout: 10000
      });
      
      await sock.sendMessage(chatId, {
        text: `🔗 *URL ACORTADA*\n\n*Original:* ${args}\n\n*Corta:* ${fallback.data}\n\n💡 Copia y comparte el link corto.`,
        quoted: message
      });
    } catch (fallbackError) {
      await sock.sendMessage(chatId, {
        text: '❌ *No se pudo acortar la URL*',
        quoted: message
      });
    }
  }
}

/**
 * Crear encuesta
 */
async function encuestaCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args || !args.includes('|')) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */encuesta ¿Te gusta el bot?|Sí|No*\n\n💡 Separa la pregunta y opciones con |',
      quoted: message
    });
  }

  const parts = args.split('|').map(p => p.trim());
  const question = parts[0];
  const options = parts.slice(1);

  if (options.length < 2) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Necesitas al menos 2 opciones*',
      quoted: message
    });
  }

  // Crear encuesta usando poll de WhatsApp
  try {
    const pollMessage = {
      poll: {
        name: question,
        values: options.slice(0, 12), // Máximo 12 opciones
        selectableCount: 1
      }
    };

    await sock.sendMessage(chatId, pollMessage);

  } catch (error) {
    console.error('Error en encuesta:', error);
    
    // Fallback: encuesta de texto
    let text = `📊 *ENCUESTA*\n\n*${question}*\n\n`;
    options.forEach((opt, index) => {
      text += `${index + 1}. ${opt}\n`;
    });
    text += '\n💡 Responde con el número de tu opción.';

    await sock.sendMessage(chatId, {
      text: text,
      quoted: message
    });
  }
}

/**
 * Estadísticas del bot
 */
async function estadisticasCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const stats = db.getStats();
  const users = Object.keys(db.data.users).length;
  const groups = Object.keys(db.data.groups).length;
  const premium = Object.values(db.data.users).filter(u => u.isPremium).length;

  const uptime = process.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  let uptimeText = '';
  if (days > 0) uptimeText += `${days}d `;
  if (hours > 0) uptimeText += `${hours}h `;
  if (minutes > 0) uptimeText += `${minutes}m `;
  uptimeText += `${seconds}s`;

  const memUsage = process.memoryUsage();
  const memUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(2);

  await sock.sendMessage(chatId, {
    text: `📊 *ESTADÍSTICAS DEL BOT*\n\n` +
          `👥 *Usuarios:* ${users}\n` +
          `👥 *Grupos:* ${groups}\n` +
          `💎 *Premium:* ${premium}\n` +
          `⚡ *Comandos ejecutados:* ${stats.totalCommands || 0}\n` +
          `📥 *Descargas:* ${stats.totalDownloads || 0}\n\n` +
          `═══════════════════\n\n` +
          `⏱️ *Tiempo activo:* ${uptimeText}\n` +
          `💾 *Memoria usada:* ${memUsed} MB\n` +
          `📅 *Iniciado:* ${new Date(Date.now() - uptime * 1000).toLocaleString('es-AR')}`,
    quoted: message
  });
}

/**
 * Ping del bot
 */
async function pingCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const start = Date.now();
  const msg = await sock.sendMessage(chatId, {
    text: '🏓 *Calculando...*'
  });
  const end = Date.now();
  
  const ping = end - start;
  let emoji = '🟢';
  if (ping > 200) emoji = '🟡';
  if (ping > 500) emoji = '🔴';

  await sock.sendMessage(chatId, {
    text: `🏓 *PONG!*\n\n${emoji} *Latencia:* ${ping}ms\n\n💚 El bot está respondiendo correctamente.`,
    quoted: message
  });
}

/**
 * Hora actual
 */
async function horaCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const now = new Date();
  const argentinaTime = now.toLocaleTimeString('es-AR', { 
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  await sock.sendMessage(chatId, {
    text: `🕐 *HORA ACTUAL*\n\n🇦🇷 *Argentina:* ${argentinaTime}\n\n🌍 *UTC:* ${now.toISOString().split('T')[1].split('.')[0]}`,
    quoted: message
  });
}

/**
 * Fecha actual
 */
async function fechaCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const now = new Date();
  const options = { 
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };

  await sock.sendMessage(chatId, {
    text: `📅 *FECHA ACTUAL*\n\n🇦🇷 *Argentina:*\n${now.toLocaleDateString('es-AR', options)}`,
    quoted: message
  });
}

/**
 * Calculadora
 */
async function calcularCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */calcular 50 * 2 + 10*',
      quoted: message
    });
  }

  try {
    // Sanitizar entrada
    const sanitized = args.replace(/[^0-9+\-*/().\s]/g, '');
    
    if (sanitized !== args.replace(/\s/g, '')) {
      return await sock.sendMessage(chatId, {
        text: '❌ *Caracteres no permitidos*\n\nSolo se permiten números y operadores: + - * / ( )',
        quoted: message
      });
    }

    // Evaluar de forma segura
    const result = Function('"use strict"; return (' + sanitized + ')')();

    await sock.sendMessage(chatId, {
      text: `🧮 *CALCULADORA*\n\n*Operación:* ${sanitized}\n\n*Resultado:* ${result}`,
      quoted: message
    });

  } catch (error) {
    await sock.sendMessage(chatId, {
      text: '❌ *Operación inválida*\n\nVerifica que la operación sea correcta.',
      quoted: message
    });
  }
}

/**
 * Conversor de monedas
 */
async function monedaCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */moneda 100 USD ARS*',
      quoted: message
    });
  }

  const parts = args.split(' ');
  if (parts.length < 3) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Formato incorrecto*\n\nEjemplo: */moneda 100 USD ARS*\n/moneda 50 EUR USD*',
      quoted: message
    });
  }

  const amount = parseFloat(parts[0]);
  const from = parts[1].toUpperCase();
  const to = parts[2].toUpperCase();

  if (isNaN(amount)) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Cantidad inválida*',
      quoted: message
    });
  }

  try {
    // Usar API de exchangerate-api (gratuita)
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`, {
      timeout: 10000
    });

    const rate = response.data.rates[to];
    if (!rate) {
      return await sock.sendMessage(chatId, {
        text: `❌ *Moneda no soportada: ${to}*`,
        quoted: message
      });
    }

    const result = (amount * rate).toFixed(2);

    await sock.sendMessage(chatId, {
      text: `💱 *CONVERSIÓN*\n\n${amount} ${from} = ${result} ${to}\n\n💡 Tasa: 1 ${from} = ${rate} ${to}`,
      quoted: message
    });

  } catch (error) {
    console.error('Error en moneda:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo obtener la tasa de cambio*',
      quoted: message
    });
  }
}

/**
 * Codificar a Base64
 */
async function base64Command(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */base64 Hola mundo*',
      quoted: message
    });
  }

  const encoded = Buffer.from(args).toString('base64');

  await sock.sendMessage(chatId, {
    text: `🔐 *BASE64 (Codificar)*\n\n*Original:* ${args}\n\n*Codificado:*\n${encoded}`,
    quoted: message
  });
}

/**
 * Decodificar Base64
 */
async function decode64Command(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */decode64 SGVsYSBtdW5kbw==*',
      quoted: message
    });
  }

  try {
    const decoded = Buffer.from(args, 'base64').toString('utf-8');

    await sock.sendMessage(chatId, {
      text: `🔓 *BASE64 (Decodificar)*\n\n*Codificado:* ${args}\n\n*Decodificado:* ${decoded}`,
      quoted: message
    });
  } catch (error) {
    await sock.sendMessage(chatId, {
      text: '❌ *Texto Base64 inválido*',
      quoted: message
    });
  }
}

/**
 * Convertir a binario
 */
async function binarioCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */binario Hola*',
      quoted: message
    });
  }

  const binary = args.split('').map(char => {
    return char.charCodeAt(0).toString(2).padStart(8, '0');
  }).join(' ');

  await sock.sendMessage(chatId, {
    text: `🔢 *BINARIO*\n\n*Original:* ${args}\n\n*Binario:*\n${binary}`,
    quoted: message
  });
}

/**
 * Convertir a código Morse
 */
async function morseCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */morse SOS*',
      quoted: message
    });
  }

  const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', '0': '-----', ' ': '/'
  };

  const morse = args.toUpperCase().split('').map(char => {
    return morseCode[char] || char;
  }).join(' ');

  await sock.sendMessage(chatId, {
    text: `📻 *CÓDIGO MORSE*\n\n*Original:* ${args}\n\n*Morse:*\n${morse}`,
    quoted: message
  });
}

/**
 * Invertir texto
 */
async function reverseCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */reverse Hola mundo*',
      quoted: message
    });
  }

  const reversed = args.split('').reverse().join('');

  await sock.sendMessage(chatId, {
    text: `🔄 *TEXTO INVERTIDO*\n\n*Original:* ${args}\n\n*Invertido:* ${reversed}`,
    quoted: message
  });
}

/**
 * Convertir a mayúsculas
 */
async function mayusCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */mayus hola mundo*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: `🔠 *MAYÚSCULAS*\n\n${args.toUpperCase()}`,
    quoted: message
  });
}

/**
 * Convertir a minúsculas
 */
async function minusCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */minus HOLA MUNDO*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: `🔡 *MINÚSCULAS*\n\n${args.toLowerCase()}`,
    quoted: message
  });
}

/**
 * Crear logo
 */
async function logoCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */logo FENIX*',
      quoted: message
    });
  }

  try {
    // Usar API de generación de logos (placeholder - usar servicio real)
    const apis = [
      `https://flamingtext.com/net-fu/proxy_form.cgi?script=fluffy-logo&text=${encodeURIComponent(args)}&_loc=generate`,
      `https://dynamic.brandcrowd.com/asset/logo/0552e7c0-3597-4424-9185-ff2a2c7a22f9/logo?v=4&text=${encodeURIComponent(args)}`,
    ];

    const logoUrl = apis[Math.floor(Math.random() * apis.length)];
    const logoBuffer = await getBuffer(logoUrl);

    if (logoBuffer) {
      await sock.sendMessage(chatId, {
        image: logoBuffer,
        caption: `🎨 *Logo generado para:* ${args}`,
        quoted: message
      });
    } else {
      throw new Error('No se pudo generar el logo');
    }

  } catch (error) {
    console.error('Error en logo:', error);
    await sock.sendMessage(chatId, {
      text: `🎨 *Logo para:* ${args}\n\n⚠️ No se pudo generar la imagen automáticamente.`,
      quoted: message
    });
  }
}

/**
 * Crear sticker
 */
async function stickerCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const quoted = message.message.imageMessage || 
                 message.message.videoMessage ||
                 message.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
                 message.message.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;

  if (!quoted) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Responde a una imagen o video*\n\nEl video debe durar menos de 10 segundos.',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '🎨 *Creando sticker...*',
    quoted: message
  });

  try {
    const type = quoted.mimetype.split('/')[0];
    const stream = await downloadContentFromMessage(quoted, type);
    let buffer = Buffer.from([]);
    
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // Verificar duración de video
    if (type === 'video' && quoted.seconds > 10) {
      return await sock.sendMessage(chatId, {
        text: '❌ *El video es muy largo*\n\nMáximo 10 segundos para stickers animados.',
        quoted: message
      });
    }

    await sock.sendMessage(chatId, {
      sticker: buffer,
      mimetype: type === 'image' ? 'image/webp' : 'video/webp'
    });

  } catch (error) {
    console.error('Error en sticker:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo crear el sticker*',
      quoted: message
    });
  }
}

/**
 * Crear sticker GIF
 */
async function stickergifCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const quoted = message.message.videoMessage ||
                 message.message.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
                 message.message.gifMessage ||
                 message.message.extendedTextMessage?.contextInfo?.quotedMessage?.gifMessage;

  if (!quoted) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Responde a un video o GIF*\n\nEl video debe durar menos de 10 segundos.',
      quoted: message
    });
  }

  await stickerCommand(ctx);
}

/**
 * Sticker a imagen
 */
async function toimgCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const quoted = message.message.stickerMessage ||
                 message.message.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;

  if (!quoted) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Responde a un sticker*',
      quoted: message
    });
  }

  try {
    const stream = await downloadContentFromMessage(quoted, 'image');
    let buffer = Buffer.from([]);
    
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    await sock.sendMessage(chatId, {
      image: buffer,
      caption: '🖼️ *Sticker convertido a imagen*',
      quoted: message
    });

  } catch (error) {
    console.error('Error en toimg:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo convertir el sticker*',
      quoted: message
    });
  }
}

/**
 * Sticker a video
 */
async function tovidCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const quoted = message.message.stickerMessage ||
                 message.message.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;

  if (!quoted) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Responde a un sticker animado*',
      quoted: message
    });
  }

  try {
    const stream = await downloadContentFromMessage(quoted, 'video');
    let buffer = Buffer.from([]);
    
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    await sock.sendMessage(chatId, {
      video: buffer,
      caption: '🎬 *Sticker convertido a video*',
      quoted: message,
      gifPlayback: true
    });

  } catch (error) {
    console.error('Error en tovid:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se pudo convertir el sticker*',
      quoted: message
    });
  }
}

module.exports = {
  qr: qrCommand,
  linkqr: linkqrCommand,
  short: shortCommand,
  encuesta: encuestaCommand,
  estadisticas: estadisticasCommand,
  ping: pingCommand,
  hora: horaCommand,
  fecha: fechaCommand,
  calcular: calcularCommand,
  moneda: monedaCommand,
  base64: base64Command,
  decode64: decode64Command,
  binario: binarioCommand,
  morse: morseCommand,
  reverse: reverseCommand,
  mayus: mayusCommand,
  minus: minusCommand,
  logo: logoCommand,
  sticker: stickerCommand,
  stickergif: stickergifCommand,
  toimg: toimgCommand,
  tovid: tovidCommand
};