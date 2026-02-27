/**
 * ═══════════════════════════════════════════════════════════════
 * ⚡ COMANDOS DE INTELIGENCIA ARTIFICIAL
 * Gemini, Traducción, Resumen, Corrección
 * ═══════════════════════════════════════════════════════════════
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const config = require('../config');

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(config.apis.geminiApiKey);

// Chistes predefinidos
const chistes = [
  "¿Por qué los programadores prefieren el frío? Porque tienen muchos problemas con el 'cache'. 😄",
  "¿Qué le dice un bit al otro? Nos vemos en el bus. 😂",
  "¿Por qué el libro de matemáticas se deprimió? Porque tenía demasiados problemas. 📚",
  "¿Cuál es el animal más antiguo? La cebra, porque está en blanco y negro. 🦓",
  "¿Qué hace una abeja en el gimnasio? ¡Zum-ba! 🐝",
  "¿Por qué la computadora fue al médico? Porque tenía un virus. 💻",
  "¿Qué le dice un jaguar a otro jaguar? Jaguar you. 🐆",
  "¿Por qué los pájaros no usan Facebook? Porque ya tienen Twitter. 🐦",
  "¿Cuál es el café más peligroso del mundo? El ex-preso. ☕",
  "¿Qué hace una persona con un sobre de ketchup en la oreja? ¡Está escuchando salsa! 🎵",
  "¿Por qué el tomate no puede correr rápido? Porque es una bola de tomate. 🍅",
  "¿Qué le dice un techo a otro techo? Techo de menos. 🏠",
  "¿Por qué los esqueletos no pelean entre ellos? Porque no tienen agallas. 💀",
  "¿Qué hace una abeja en una florería? ¡Florece! 🌸",
  "¿Cuál es el colmo de un electricista? No encontrar su corriente de trabajo. ⚡",
  "¿Por qué el mar es salado? Porque los peces hacen muchos chistes malos. 🐟",
  "¿Qué le dice un semáforo a otro? No me mires, me estoy cambiando. 🚦",
  "¿Por qué los fantasmas no mienten? Porque se les ve a través. 👻",
  "¿Qué hace un pez en una biblioteca? Nada, porque no puede leer. 📖",
  "¿Cuál es el animal más feliz? El delfín, porque siempre está delfín. 🐬"
];

// Datos curiosos
const curiosidades = [
  "🧠 *¿Sabías que...?* Las huellas dactilares de los koalas son tan similares a las humanas que han confundido a los investigadores en escenas del crimen.",
  "🍯 *¿Sabías que...?* La miel nunca se echa a perder. Se han encontrado recipientes de miel de 3,000 años de antigüedad en tumbas egipcias que aún eran comestibles.",
  "🐙 *¿Sabías que...?* Los pulpos tienen tres corazones, sangre azul y nueve cerebros.",
  "🍌 *¿Sabías que...?* Los plátanos son bayas, pero las fresas no lo son.",
  "🦒 *¿Sabías que...?* Las jirafas no tienen cuerdas vocales y no pueden hacer sonidos.",
  "🌌 *¿Sabías que...?* Si pudieras volar a la velocidad de la luz, tardarías 8 minutos en llegar al Sol, pero 4 años en llegar a la estrella más cercana.",
  "🦈 *¿Sabías que...?* Los tiburones existieron antes que los árboles.",
  "🦋 *¿Sabías que...?* Las mariposas saborean con sus patas.",
  "🐘 *¿Sabías que...?* Los elefantes son los únicos mamíferos que no pueden saltar.",
  "🦉 *¿Sabías que...?* Los búhos no pueden mover sus ojos, pero pueden girar la cabeza 270 grados.",
  "🌵 *¿Sabías que...?* Los cactus pueden vivir hasta 200 años.",
  "🐌 *¿Sabías que...?* Los caracoles pueden dormir hasta 3 años seguidos.",
  "🦘 *¿Sabías que...?* Los canguros no pueden caminar hacia atrás.",
  "🐧 *¿Sabías que...?* Los pingüinos tienen una glándula especial que filtra el agua salada.",
  "🦇 *¿Sabías que...?* Los murciélagos son los únicos mamíferos que pueden volar.",
  "🐝 *¿Sabías que...?* Las abejas reconocen rostros humanos.",
  "🦅 *¿Sabías que...?* Las águilas pueden ver conejos a 3 kilómetros de distancia.",
  "🐢 *¿Sabías que...?* Las tortugas pueden respirar por su trasero.",
  "🦎 *¿Sabías que...?* Algunos lagartos pueden correr sobre el agua.",
  "🦩 *¿Sabías que...?* Los flamencos son blancos, pero se vuelven rosados por la comida que comen."
];

/**
 * Chat con Gemini
 */
async function geminiCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */gemini explica la teoría de la relatividad*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '🤖 *Gemini está pensando...*',
    quoted: message
  });

  try {
    // Verificar si la API key está configurada
    if (config.apis.geminiApiKey === 'TU_API_KEY_DE_GEMINI_AQUI') {
      return await sock.sendMessage(chatId, {
        text: '⚠️ *API de Gemini no configurada*\n\nEl owner debe configurar la API key usando:\n*/setapi gemini TU_API_KEY*\n\nObtén tu API key gratis en:\nhttps://aistudio.google.com/app/apikey',
        quoted: message
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(args);
    const response = await result.response;
    const text = response.text();

    // Truncar si es muy largo
    const maxLength = 3800;
    let displayText = text;
    if (text.length > maxLength) {
      displayText = text.substring(0, maxLength) + '\n\n...[Respuesta truncada]';
    }

    await sock.sendMessage(chatId, {
      text: `🤖 *GEMINI AI*\n\n${displayText}\n\n═══════════════════\n💡 _Powered by Google Gemini_`,
      quoted: message
    });

  } catch (error) {
    console.error('Error en gemini:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *Error al consultar Gemini*\n\nVerifica que la API key esté configurada correctamente.',
      quoted: message
    });
  }
}

/**
 * IA general (alias de Gemini)
 */
async function iaCommand(ctx) {
  await geminiCommand(ctx);
}

/**
 * Resumir texto
 */
async function resumirCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args || args.length < 100) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEnvía un texto de al menos 100 caracteres para resumir.\n\nEjemplo: */resumir [pega tu texto largo aquí]*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '📝 *Resumiendo texto...*',
    quoted: message
  });

  try {
    if (config.apis.geminiApiKey === 'TU_API_KEY_DE_GEMINI_AQUI') {
      // Fallback: resumen básico
      const sentences = args.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const summary = sentences.slice(0, Math.min(3, sentences.length)).join('. ') + '.';
      
      return await sock.sendMessage(chatId, {
        text: `📝 *RESUMEN*\n\n${summary}\n\n⚠️ _Resumen básico (configura Gemini para mejores resultados)_`,
        quoted: message
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Resume el siguiente texto de manera clara y concisa en español:\n\n${args}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    await sock.sendMessage(chatId, {
      text: `📝 *RESUMEN*\n\n${text}\n\n═══════════════════\n📊 *Original:* ${args.length} caracteres\n📄 *Resumen:* ${text.length} caracteres`,
      quoted: message
    });

  } catch (error) {
    console.error('Error en resumir:', error);
    await sock.sendMessage(chatId, {
      text: config.messages.error,
      quoted: message
    });
  }
}

/**
 * Traducir texto
 */
async function traducirCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */traducir inglés hola cómo estás*\n/traducir francés buenos días*',
      quoted: message
    });
  }

  // Parsear idioma y texto
  const parts = args.split(' ');
  const targetLang = parts[0].toLowerCase();
  const textToTranslate = parts.slice(1).join(' ');

  if (!textToTranslate) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Debes especificar el texto a traducir*\n\nEjemplo: */traducir inglés hola mundo*',
      quoted: message
    });
  }

  // Mapeo de idiomas
  const langMap = {
    'español': 'es', 'spanish': 'es', 'es': 'es',
    'inglés': 'en', 'ingles': 'en', 'english': 'en', 'en': 'en',
    'francés': 'fr', 'frances': 'fr', 'french': 'fr', 'fr': 'fr',
    'alemán': 'de', 'aleman': 'de', 'german': 'de', 'de': 'de',
    'italiano': 'it', 'italian': 'it', 'it': 'it',
    'portugués': 'pt', 'portugues': 'pt', 'portuguese': 'pt', 'pt': 'pt',
    'chino': 'zh', 'chinese': 'zh', 'zh': 'zh',
    'japonés': 'ja', 'japones': 'ja', 'japanese': 'ja', 'ja': 'ja',
    'coreano': 'ko', 'korean': 'ko', 'ko': 'ko',
    'ruso': 'ru', 'russian': 'ru', 'ru': 'ru',
    'árabe': 'ar', 'arabe': 'ar', 'arabic': 'ar', 'ar': 'ar',
    'hindi': 'hi', 'hi': 'hi',
    'turco': 'tr', 'turkish': 'tr', 'tr': 'tr',
    'polaco': 'pl', 'polish': 'pl', 'pl': 'pl',
    'holandés': 'nl', 'holandes': 'nl', 'dutch': 'nl', 'nl': 'nl',
    'sueco': 'sv', 'swedish': 'sv', 'sv': 'sv',
    'noruego': 'no', 'norwegian': 'no', 'no': 'no',
    'danés': 'da', 'danes': 'da', 'danish': 'da', 'da': 'da',
    'finlandés': 'fi', 'finlandes': 'fi', 'finnish': 'fi', 'fi': 'fi',
    'griego': 'el', 'greek': 'el', 'el': 'el',
    'hebreo': 'he', 'hebreo': 'he', 'hebrew': 'he', 'he': 'he',
    'vietnamita': 'vi', 'vietnamese': 'vi', 'vi': 'vi',
    'tailandés': 'th', 'tailandes': 'th', 'thai': 'th', 'th': 'th',
    'indonesio': 'id', 'indonesian': 'id', 'id': 'id',
    'malayo': 'ms', 'malay': 'ms', 'ms': 'ms',
    'tagalo': 'tl', 'tagalog': 'tl', 'tl': 'tl',
    'swahili': 'sw', 'sw': 'sw',
    'ucraniano': 'uk', 'ukrainian': 'uk', 'uk': 'uk',
    'checo': 'cs', 'czech': 'cs', 'cs': 'cs',
    'húngaro': 'hu', 'hungaro': 'hu', 'hungarian': 'hu', 'hu': 'hu',
    'rumano': 'ro', 'romanian': 'ro', 'ro': 'ro',
    'búlgaro': 'bg', 'bulgaro': 'bg', 'bulgarian': 'bg', 'bg': 'bg',
    'croata': 'hr', 'croatian': 'hr', 'hr': 'hr',
    'serbio': 'sr', 'serbian': 'sr', 'sr': 'sr',
    'esloveno': 'sl', 'slovenian': 'sl', 'sl': 'sl',
    'eslovaco': 'sk', 'slovak': 'sk', 'sk': 'sk',
    'lituano': 'lt', 'lithuanian': 'lt', 'lt': 'lt',
    'leton': 'lv', 'latvian': 'lv', 'lv': 'lv',
    'estonio': 'et', 'estonian': 'et', 'et': 'et'
  };

  const targetCode = langMap[targetLang];
  
  if (!targetCode) {
    return await sock.sendMessage(chatId, {
      text: `❌ *Idioma no reconocido: ${targetLang}*\n\nIdiomas disponibles:\n• Español (es)\n• Inglés (en)\n• Francés (fr)\n• Alemán (de)\n• Italiano (it)\n• Portugués (pt)\n• Chino (zh)\n• Japonés (ja)\n• Coreano (ko)\n• Y muchos más...`,
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: `🌐 *Traduciendo a ${targetLang}...*`,
    quoted: message
  });

  try {
    // Usar API de MyMemory (gratuita)
    const response = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=es|${targetCode}`, {
      timeout: 15000
    });

    if (response.data && response.data.responseData) {
      const translatedText = response.data.responseData.translatedText;
      
      await sock.sendMessage(chatId, {
        text: `🌐 *TRADUCCIÓN*\n\n*Original:* ${textToTranslate}\n\n*Traducción (${targetLang}):*\n${translatedText}\n\n═══════════════════\n💡 _Powered by MyMemory_`,
        quoted: message
      });
    } else {
      throw new Error('Respuesta inválida');
    }

  } catch (error) {
    console.error('Error en traducir:', error);
    
    // Fallback con Gemini
    try {
      if (config.apis.geminiApiKey !== 'TU_API_KEY_DE_GEMINI_AQUI') {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Traduce el siguiente texto al ${targetLang}:\n\n"${textToTranslate}"`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return await sock.sendMessage(chatId, {
          text: `🌐 *TRADUCCIÓN*\n\n*Original:* ${textToTranslate}\n\n*Traducción (${targetLang}):*\n${text}`,
          quoted: message
        });
      }
    } catch (geminiError) {
      // Ignorar
    }
    
    await sock.sendMessage(chatId, {
      text: config.messages.error,
      quoted: message
    });
  }
}

/**
 * Corregir texto
 */
async function corregirCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */corregir hola komo estaz*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '✍️ *Corrigiendo texto...*',
    quoted: message
  });

  try {
    if (config.apis.geminiApiKey === 'TU_API_KEY_DE_GEMINI_AQUI') {
      // Fallback: corrección básica
      return await sock.sendMessage(chatId, {
        text: `✍️ *CORRECCIÓN*\n\n*Original:* ${args}\n\n⚠️ _Configura Gemini para correcciones avanzadas_`,
        quoted: message
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Corrige la ortografía y gramática del siguiente texto en español. Solo devuelve el texto corregido, sin explicaciones:\n\n"${args}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const correctedText = response.text();

    await sock.sendMessage(chatId, {
      text: `✍️ *CORRECCIÓN*\n\n*Original:* ${args}\n\n*Corregido:* ${correctedText}\n\n═══════════════════\n💡 _Powered by Google Gemini_`,
      quoted: message
    });

  } catch (error) {
    console.error('Error en corregir:', error);
    await sock.sendMessage(chatId, {
      text: config.messages.error,
      quoted: message
    });
  }
}

/**
 * Generar código
 */
async function codigoCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */codigo función fibonacci en python*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '💻 *Generando código...*',
    quoted: message
  });

  try {
    if (config.apis.geminiApiKey === 'TU_API_KEY_DE_GEMINI_AQUI') {
      return await sock.sendMessage(chatId, {
        text: '⚠️ *API de Gemini no configurada*\n\nEl owner debe configurar la API key para usar esta función.',
        quoted: message
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Genera código para: ${args}\n\nProporciona solo el código con comentarios explicativos en español.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const code = response.text();

    await sock.sendMessage(chatId, {
      text: `💻 *CÓDIGO GENERADO*\n\n${code}\n\n═══════════════════\n💡 _Powered by Google Gemini_`,
      quoted: message
    });

  } catch (error) {
    console.error('Error en codigo:', error);
    await sock.sendMessage(chatId, {
      text: config.messages.error,
      quoted: message
    });
  }
}

/**
 * Crear historia
 */
async function historiaCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */historia un astronauta perdido en marte*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '📖 *Creando historia...*',
    quoted: message
  });

  try {
    if (config.apis.geminiApiKey === 'TU_API_KEY_DE_GEMINI_AQUI') {
      // Fallback: historia aleatoria
      const historiasFallback = [
        `Había una vez ${args}. Era un día como cualquier otro, hasta que algo extraordinario sucedió...`,
        `En un mundo donde ${args} era posible, la gente vivía de manera muy diferente...`,
        `La historia de ${args} comenzó en una pequeña ciudad, donde nadie esperaba lo que vendría...`
      ];
      const randomHistoria = historiasFallback[Math.floor(Math.random() * historiasFallback.length)];
      
      return await sock.sendMessage(chatId, {
        text: `📖 *HISTORIA*\n\n${randomHistoria}\n\n...[Configura Gemini para historias más elaboradas]`,
        quoted: message
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Escribe una historia corta y creativa en español sobre: ${args}\n\nLa historia debe tener un inicio, desarrollo y final. Máximo 500 palabras.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const story = response.text();

    await sock.sendMessage(chatId, {
      text: `📖 *HISTORIA*\n\n${story}\n\n═══════════════════\n💡 _Powered by Google Gemini_`,
      quoted: message
    });

  } catch (error) {
    console.error('Error en historia:', error);
    await sock.sendMessage(chatId, {
      text: config.messages.error,
      quoted: message
    });
  }
}

/**
 * Chiste aleatorio
 */
async function chisteCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const randomChiste = chistes[Math.floor(Math.random() * chistes.length)];
  
  await sock.sendMessage(chatId, {
    text: `😄 *CHISTE*\n\n${randomChiste}\n\n═══════════════════\n💡 Pide otro con */chiste*`,
    quoted: message
  });
}

/**
 * Dato curioso
 */
async function curiosidadCommand(ctx) {
  const { sock, chatId, message } = ctx;
  
  const randomCuriosidad = curiosidades[Math.floor(Math.random() * curiosidades.length)];
  
  await sock.sendMessage(chatId, {
    text: `${randomCuriosidad}\n\n═══════════════════\n💡 Pide otro con */curiosidad*`,
    quoted: message
  });
}

module.exports = {
  gemini: geminiCommand,
  ia: iaCommand,
  resumir: resumirCommand,
  traducir: traducirCommand,
  corregir: corregirCommand,
  codigo: codigoCommand,
  historia: historiaCommand,
  chiste: chisteCommand,
  curiosidad: curiosidadCommand
};