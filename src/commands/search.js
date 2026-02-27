/**
 * ═══════════════════════════════════════════════════════════════
 * ⚡ COMANDOS DE BÚSQUEDA
 * Google, Wikipedia, Imágenes, Clima, Noticias
 * ═══════════════════════════════════════════════════════════════
 */

const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config');

/**
 * Buscar en Google
 */
async function googleCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */google clima buenos aires*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '🔍 *Buscando en Google...*',
    quoted: message
  });

  try {
    // Usar scraping de Google
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(args)}&hl=es`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Extraer resultados
    $('.g').each((i, elem) => {
      if (i >= 10) return false;
      
      const title = $(elem).find('h3').first().text();
      const link = $(elem).find('a').first().attr('href');
      const snippet = $(elem).find('.VwiC3b, .s3v94d, .st').first().text();

      if (title && link) {
        results.push({
          title,
          link: link.startsWith('http') ? link : `https://google.com${link}`,
          snippet: snippet || 'Sin descripción'
        });
      }
    });

    if (results.length === 0) {
      return await sock.sendMessage(chatId, {
        text: config.messages.noResults,
        quoted: message
      });
    }

    let resultText = `🔍 *RESULTADOS DE GOOGLE*\n\n`;
    resultText += `📌 *Búsqueda:* ${args}\n\n`;
    resultText += `═══════════════════\n\n`;

    results.forEach((result, index) => {
      resultText += `*${index + 1}.* ${result.title}\n`;
      resultText += `${result.snippet.substring(0, 150)}${result.snippet.length > 150 ? '...' : ''}\n`;
      resultText += `🔗 ${result.link}\n\n`;
    });

    resultText += `═══════════════════`;

    await sock.sendMessage(chatId, {
      text: resultText,
      quoted: message
    });

  } catch (error) {
    console.error('Error en google:', error);
    // Fallback: búsqueda simple
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(args)}`;
    await sock.sendMessage(chatId, {
      text: `🔍 *Resultados de Google para:* ${args}\n\n🔗 ${searchUrl}\n\n⚠️ No se pudieron obtener resultados directos. Usa el link de arriba.`,
      quoted: message
    });
  }
}

/**
 * Buscar en Wikipedia
 */
async function wikipediaCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */wiki argentina*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '📚 *Buscando en Wikipedia...*',
    quoted: message
  });

  try {
    // API de Wikipedia
    const searchUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(args)}`;
    const response = await axios.get(searchUrl, { timeout: 15000 });

    const data = response.data;

    if (data.type === 'disambiguation') {
      // Es una página de desambiguación
      let resultText = `📚 *WIKIPEDIA - ${data.title}*\n\n`;
      resultText += `⚠️ *Este término tiene múltiples significados.*\n\n`;
      resultText += `🔗 ${data.content_urls?.desktop?.page || data.api_urls?.summary}\n\n`;
      resultText += `💡 *Sé más específico en tu búsqueda.*`;

      return await sock.sendMessage(chatId, {
        text: resultText,
        quoted: message
      });
    }

    let resultText = `📚 *WIKIPEDIA*\n\n`;
    resultText += `*${data.title}*\n\n`;
    resultText += `${data.extract}\n\n`;
    resultText += `🔗 ${data.content_urls?.desktop?.page || `https://es.wikipedia.org/wiki/${encodeURIComponent(args)}`}`;

    // Si hay imagen, enviarla
    if (data.thumbnail && data.thumbnail.source) {
      const imageBuffer = await axios.get(data.thumbnail.source, { 
        responseType: 'arraybuffer',
        timeout: 10000
      });

      await sock.sendMessage(chatId, {
        image: Buffer.from(imageBuffer.data),
        caption: resultText,
        quoted: message
      });
    } else {
      await sock.sendMessage(chatId, {
        text: resultText,
        quoted: message
      });
    }

  } catch (error) {
    console.error('Error en wiki:', error);
    
    // Intentar búsqueda alternativa
    try {
      const searchApiUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(args)}&format=json&origin=*`;
      const searchResponse = await axios.get(searchApiUrl, { timeout: 15000 });
      
      const searchResults = searchResponse.data.query.search;
      
      if (searchResults.length === 0) {
        return await sock.sendMessage(chatId, {
          text: config.messages.noResults,
          quoted: message
        });
      }

      let resultText = `📚 *WIKIPEDIA - RESULTADOS*\n\n`;
      resultText += `🔍 *Búsqueda:* ${args}\n\n`;
      resultText += `═══════════════════\n\n`;

      searchResults.slice(0, 5).forEach((result, index) => {
        resultText += `*${index + 1}.* ${result.title}\n`;
        const snippet = result.snippet.replace(/<[^>]*>/g, '');
        resultText += `${snippet.substring(0, 150)}...\n`;
        resultText += `🔗 https://es.wikipedia.org/wiki/${encodeURIComponent(result.title)}\n\n`;
      });

      await sock.sendMessage(chatId, {
        text: resultText,
        quoted: message
      });

    } catch (fallbackError) {
      await sock.sendMessage(chatId, {
        text: config.messages.error,
        quoted: message
      });
    }
  }
}

/**
 * Buscar imágenes
 */
async function imagenCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */imagen paisajes naturaleza*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '🖼️ *Buscando imágenes...*',
    quoted: message
  });

  try {
    // Usar Unsplash API (gratuita con límite)
    const response = await axios.get(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(args)}&per_page=5&client_id=Demo`, {
      timeout: 15000
    });

    const images = response.data.results;

    if (images.length === 0) {
      return await sock.sendMessage(chatId, {
        text: config.messages.noResults,
        quoted: message
      });
    }

    // Enviar primera imagen con info
    const firstImage = images[0];
    const imageBuffer = await axios.get(firstImage.urls.regular, { 
      responseType: 'arraybuffer',
      timeout: 20000
    });

    let caption = `🖼️ *RESULTADOS DE IMÁGENES*\n\n`;
    caption += `🔍 *Búsqueda:* ${args}\n`;
    caption += `📊 *Encontradas:* ${response.data.total} imágenes\n\n`;
    caption += `*Imagen 1 de ${images.length}*\n`;
    caption += `📷 Por: ${firstImage.user.name}\n`;
    caption += `❤️ Likes: ${firstImage.likes}`;

    await sock.sendMessage(chatId, {
      image: Buffer.from(imageBuffer.data),
      caption: caption,
      quoted: message
    });

    // Enviar el resto de imágenes
    for (let i = 1; i < Math.min(images.length, 4); i++) {
      const img = images[i];
      try {
        const imgBuffer = await axios.get(img.urls.small, { 
          responseType: 'arraybuffer',
          timeout: 15000
        });
        
        await sock.sendMessage(chatId, {
          image: Buffer.from(imgBuffer.data),
          caption: `📷 Por: ${img.user.name} | ❤️ ${img.likes}`
        });
      } catch (e) {
        // Continuar con la siguiente
      }
    }

  } catch (error) {
    console.error('Error en imagen:', error);
    
    // Fallback: usar Bing Images
    try {
      const bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(args)}`;
      await sock.sendMessage(chatId, {
        text: `🖼️ *Imágenes de:* ${args}\n\n🔗 ${bingUrl}\n\n⚠️ No se pudieron cargar las imágenes directamente. Usa el link de arriba.`,
        quoted: message
      });
    } catch (fallbackError) {
      await sock.sendMessage(chatId, {
        text: config.messages.error,
        quoted: message
      });
    }
  }
}

/**
 * Buscar en Pinterest
 */
async function pinterestCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */pinterest fondos aesthetic*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '📌 *Buscando en Pinterest...*',
    quoted: message
  });

  try {
    // Pinterest no tiene API pública gratuita, usar alternativa
    const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(args)}`;
    
    await sock.sendMessage(chatId, {
      text: `📌 *Pinterest - ${args}*\n\n🔗 ${searchUrl}\n\n💡 Abre el link para ver los resultados en Pinterest.`,
      quoted: message
    });

  } catch (error) {
    console.error('Error en pinterest:', error);
    await sock.sendMessage(chatId, {
      text: config.messages.error,
      quoted: message
    });
  }
}

/**
 * Buscar videos en YouTube
 */
async function ytbuscarCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */ytbuscar tutoriales javascript*',
      quoted: message
    });
  }

  // Redirigir a yts
  const downloadCommands = require('./downloads');
  await downloadCommands.yts(ctx);
}

/**
 * Buscar noticias
 */
async function noticiasCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  const query = args || 'noticias';

  await sock.sendMessage(chatId, {
    text: '📰 *Buscando noticias...*',
    quoted: message
  });

  try {
    // Usar NewsAPI (requiere API key gratuita)
    // Como alternativa, hacemos scraping de Google News
    const searchUrl = `https://news.google.com/search?q=${encodeURIComponent(query)}&hl=es-419&gl=AR&ceid=AR%3Aes-419`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const articles = [];

    $('article').each((i, elem) => {
      if (i >= 10) return false;
      
      const title = $(elem).find('h3, h4').first().text();
      const link = 'https://news.google.com' + $(elem).find('a').first().attr('href')?.replace('.', '');
      const source = $(elem).find('[data-n-tid]').first().text();
      const time = $(elem).find('time').first().text();

      if (title) {
        articles.push({ title, link, source, time });
      }
    });

    if (articles.length === 0) {
      // Fallback: mostrar link directo
      return await sock.sendMessage(chatId, {
        text: `📰 *Noticias sobre:* ${query}\n\n🔗 ${searchUrl}\n\n💡 Abre el link para ver las noticias.`,
        quoted: message
      });
    }

    let resultText = `📰 *NOTICIAS*\n\n`;
    resultText += `🔍 *Tema:* ${query}\n\n`;
    resultText += `═══════════════════\n\n`;

    articles.forEach((article, index) => {
      resultText += `*${index + 1}.* ${article.title}\n`;
      if (article.source) resultText += `📰 ${article.source}`;
      if (article.time) resultText += ` | ⏰ ${article.time}`;
      resultText += `\n🔗 ${article.link}\n\n`;
    });

    resultText += `═══════════════════`;

    await sock.sendMessage(chatId, {
      text: resultText,
      quoted: message
    });

  } catch (error) {
    console.error('Error en noticias:', error);
    await sock.sendMessage(chatId, {
      text: `📰 *Noticias sobre:* ${query}\n\n🔗 https://news.google.com/search?q=${encodeURIComponent(query)}\n\n💡 Abre el link para ver las noticias.`,
      quoted: message
    });
  }
}

/**
 * Ver clima
 */
async function climaCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */clima cordoba argentina*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '🌤️ *Consultando el clima...*',
    quoted: message
  });

  try {
    // Usar wttr.in (API gratuita de clima)
    const response = await axios.get(`https://wttr.in/${encodeURIComponent(args)}?format=j1`, {
      timeout: 15000
    });

    const data = response.data;
    const current = data.current_condition[0];
    const location = data.nearest_area[0];

    let resultText = `🌤️ *CLIMA ACTUAL*\n\n`;
    resultText += `📍 *Ubicación:* ${location.areaName[0].value}, ${location.country[0].value}\n\n`;
    resultText += `═══════════════════\n\n`;
    resultText += `🌡️ *Temperatura:* ${current.temp_C}°C (sensación ${current.FeelsLikeC}°C)\n`;
    resultText += `☁️ *Condición:* ${current.lang_es?.[0]?.value || current.weatherDesc[0].value}\n`;
    resultText += `💧 *Humedad:* ${current.humidity}%\n`;
    resultText += `💨 *Viento:* ${current.windspeedKmph} km/h\n`;
    resultText += `👁️ *Visibilidad:* ${current.visibility} km\n`;
    resultText += `☀️ *Índice UV:* ${current.uvIndex}\n\n`;
    
    // Pronóstico para mañana
    const tomorrow = data.weather[1];
    resultText += `📅 *Mañana:*\n`;
    resultText += `🌡️ Máx: ${tomorrow.maxtempC}°C | Mín: ${tomorrow.mintempC}°C\n`;
    resultText += `☀️ Sol: ${tomorrow.astronomy[0].sunrise} - ${tomorrow.astronomy[0].sunset}`;

    await sock.sendMessage(chatId, {
      text: resultText,
      quoted: message
    });

  } catch (error) {
    console.error('Error en clima:', error);
    
    // Fallback
    await sock.sendMessage(chatId, {
      text: `🌤️ *Clima en:* ${args}\n\n🔗 https://www.google.com/search?q=clima+${encodeURIComponent(args)}\n\n💡 Abre el link para ver el clima actual.`,
      quoted: message
    });
  }
}

module.exports = {
  google: googleCommand,
  wikipedia: wikipediaCommand,
  imagen: imagenCommand,
  pinterest: pinterestCommand,
  ytbuscar: ytbuscarCommand,
  noticias: noticiasCommand,
  clima: climaCommand
};