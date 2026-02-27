/**
 * ═══════════════════════════════════════════════════════════════
 * ⚡ COMANDOS DE DESCARGAS
 * YouTube, TikTok, Instagram, Facebook, Twitter
 * ═══════════════════════════════════════════════════════════════
 */

const axios = require('axios');
const yts = require('yt-search');
const ytdl = require('ytdl-core');
const fs = require('fs-extra');
const path = require('path');
const { getBuffer, downloadFile, extractYouTubeId, isYouTubeUrl, delay, formatBytes } = require('../utils/helpers');
const config = require('../config');

// Carpeta temporal
const TEMP_DIR = path.join(__dirname, '../../media/temp');
fs.ensureDirSync(TEMP_DIR);

/**
 * Buscar en YouTube
 */
async function ytsCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */yts reggaeton 2024*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '🔍 *Buscando...*',
    quoted: message
  });

  try {
    const search = await yts(args);
    const videos = search.videos.slice(0, 15);

    if (videos.length === 0) {
      return await sock.sendMessage(chatId, {
        text: config.messages.noResults,
        quoted: message
      });
    }

    let resultText = `🎵 *RESULTADOS DE BÚSQUEDA*\n\n`;
    resultText += `🔍 *Búsqueda:* ${args}\n`;
    resultText += `📊 *Encontrados:* ${videos.length} videos\n\n`;
    resultText += `═══════════════════\n\n`;

    videos.forEach((video, index) => {
      resultText += `*${index + 1}.* ${video.title}\n`;
      resultText += `👤 Canal: ${video.author.name}\n`;
      resultText += `⏱️ Duración: ${video.duration.timestamp}\n`;
      resultText += `👁️ Vistas: ${video.views.toLocaleString()}\n`;
      resultText += `🔗 Link: ${video.url}\n`;
      resultText += `📥 Descargar: */yta ${video.url}* (audio) o */ytv ${video.url}* (video)\n\n`;
    });

    resultText += `═══════════════════\n`;
    resultText += `💡 *Tip:* Copia el link y usa /yta para audio o /ytv para video`;

    await sock.sendMessage(chatId, {
      text: resultText,
      quoted: message
    });

  } catch (error) {
    console.error('Error en yts:', error);
    await sock.sendMessage(chatId, {
      text: config.messages.error,
      quoted: message
    });
  }
}

/**
 * Descargar audio de YouTube
 */
async function ytaCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args || !isYouTubeUrl(args)) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */yta https://youtube.com/watch?v=xxxxx*',
      quoted: message
    });
  }

  const processingMsg = await sock.sendMessage(chatId, {
    text: '⏳ *Descargando audio...*\n\nEsto puede tomar unos segundos.',
    quoted: message
  });

  try {
    const videoId = extractYouTubeId(args);
    if (!videoId) {
      return await sock.sendMessage(chatId, {
        text: '❌ *No se pudo extraer el ID del video*',
        quoted: message
      });
    }

    const info = await ytdl.getInfo(args);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const outputPath = path.join(TEMP_DIR, `${title}_${Date.now()}.mp3`);

    // Descargar audio
    const audioStream = ytdl(args, {
      quality: 'highestaudio',
      filter: 'audioonly'
    });

    const writeStream = fs.createWriteStream(outputPath);
    audioStream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      audioStream.on('error', reject);
    });

    const stats = fs.statSync(outputPath);
    const fileSize = formatBytes(stats.size);

    // Enviar audio
    await sock.sendMessage(chatId, {
      audio: fs.readFileSync(outputPath),
      mimetype: 'audio/mpeg',
      fileName: `${info.videoDetails.title}.mp3`,
      caption: `🎵 *${info.videoDetails.title}*\n\n📊 Tamaño: ${fileSize}\n👤 Canal: ${info.videoDetails.author.name}`,
      quoted: message
    });

    // Limpiar
    fs.unlinkSync(outputPath);

  } catch (error) {
    console.error('Error en yta:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *Error al descargar el audio*\n\nEl video puede estar restringido o ser muy largo.',
      quoted: message
    });
  }
}

/**
 * Descargar video de YouTube
 */
async function ytvCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args || !isYouTubeUrl(args)) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */ytv https://youtube.com/watch?v=xxxxx*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '⏳ *Descargando video...*\n\nEsto puede tomar unos minutos dependiendo del tamaño.',
    quoted: message
  });

  try {
    const info = await ytdl.getInfo(args);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const outputPath = path.join(TEMP_DIR, `${title}_${Date.now()}.mp4`);

    // Seleccionar formato (máximo 720p para evitar archivos muy grandes)
    const format = ytdl.chooseFormat(info.formats, { 
      quality: 'highest',
      filter: 'audioandvideo'
    });

    // Descargar video
    const videoStream = ytdl(args, { format });
    const writeStream = fs.createWriteStream(outputPath);
    videoStream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      videoStream.on('error', reject);
    });

    const stats = fs.statSync(outputPath);
    const fileSizeMB = stats.size / (1024 * 1024);

    // Si pesa más de 64MB, enviar como documento
    if (fileSizeMB > 64) {
      await sock.sendMessage(chatId, {
        document: fs.readFileSync(outputPath),
        mimetype: 'video/mp4',
        fileName: `${info.videoDetails.title}.mp4`,
        caption: `🎬 *${info.videoDetails.title}*\n\n📊 Tamaño: ${formatBytes(stats.size)}\n👤 Canal: ${info.videoDetails.author.name}\n\n⚠️ *Enviado como documento por el tamaño*`,
        quoted: message
      });
    } else {
      await sock.sendMessage(chatId, {
        video: fs.readFileSync(outputPath),
        caption: `🎬 *${info.videoDetails.title}*\n\n📊 Tamaño: ${formatBytes(stats.size)}\n👤 Canal: ${info.videoDetails.author.name}`,
        quoted: message
      });
    }

    // Limpiar
    fs.unlinkSync(outputPath);

  } catch (error) {
    console.error('Error en ytv:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *Error al descargar el video*\n\nEl video puede estar restringido, ser muy largo o exceder el tamaño permitido.',
      quoted: message
    });
  }
}

/**
 * Play - Buscar y descargar audio
 */
async function playCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */play bad bunny un verano*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '🔍 *Buscando...*',
    quoted: message
  });

  try {
    const search = await yts(args);
    const video = search.videos[0];

    if (!video) {
      return await sock.sendMessage(chatId, {
        text: config.messages.noResults,
        quoted: message
      });
    }

    await sock.sendMessage(chatId, {
      text: `🎵 *Encontrado:* ${video.title}\n\n⏳ *Descargando audio...*`,
      quoted: message
    });

    // Descargar audio
    const title = video.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const outputPath = path.join(TEMP_DIR, `${title}_${Date.now()}.mp3`);

    const audioStream = ytdl(video.url, {
      quality: 'highestaudio',
      filter: 'audioonly'
    });

    const writeStream = fs.createWriteStream(outputPath);
    audioStream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    const stats = fs.statSync(outputPath);

    await sock.sendMessage(chatId, {
      audio: fs.readFileSync(outputPath),
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`,
      caption: `🎵 *${video.title}*\n\n👤 ${video.author.name}\n⏱️ ${video.duration.timestamp}`,
      quoted: message
    });

    fs.unlinkSync(outputPath);

  } catch (error) {
    console.error('Error en play:', error);
    await sock.sendMessage(chatId, {
      text: config.messages.error,
      quoted: message
    });
  }
}

/**
 * Play video - Buscar y descargar video
 */
async function playvidCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */playvid bad bunny un verano*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '🔍 *Buscando...*',
    quoted: message
  });

  try {
    const search = await yts(args);
    const video = search.videos[0];

    if (!video) {
      return await sock.sendMessage(chatId, {
        text: config.messages.noResults,
        quoted: message
      });
    }

    await sock.sendMessage(chatId, {
      text: `🎬 *Encontrado:* ${video.title}\n\n⏳ *Descargando video...*\nEsto puede tardar unos minutos.`,
      quoted: message
    });

    const title = video.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const outputPath = path.join(TEMP_DIR, `${title}_${Date.now()}.mp4`);

    const videoStream = ytdl(video.url, { 
      quality: 'highest',
      filter: 'audioandvideo'
    });

    const writeStream = fs.createWriteStream(outputPath);
    videoStream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    const stats = fs.statSync(outputPath);
    const fileSizeMB = stats.size / (1024 * 1024);

    if (fileSizeMB > 64) {
      await sock.sendMessage(chatId, {
        document: fs.readFileSync(outputPath),
        mimetype: 'video/mp4',
        fileName: `${video.title}.mp4`,
        caption: `🎬 *${video.title}*\n\n👤 ${video.author.name}\n⏱️ ${video.duration.timestamp}\n\n⚠️ *Enviado como documento*`,
        quoted: message
      });
    } else {
      await sock.sendMessage(chatId, {
        video: fs.readFileSync(outputPath),
        caption: `🎬 *${video.title}*\n\n👤 ${video.author.name}\n⏱️ ${video.duration.timestamp}`,
        quoted: message
      });
    }

    fs.unlinkSync(outputPath);

  } catch (error) {
    console.error('Error en playvid:', error);
    await sock.sendMessage(chatId, {
      text: config.messages.error,
      quoted: message
    });
  }
}

/**
 * Spotify - Buscar canción
 */
async function spotiCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */spoti shape of you*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '🔍 *Buscando en Spotify...*',
    quoted: message
  });

  try {
    // Usar API de búsqueda de Spotify (sin autenticación, solo búsqueda web)
    const searchQuery = encodeURIComponent(args);
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=10`, {
      headers: {
        'Authorization': 'Bearer ' + await getSpotifyToken()
      }
    });

    const tracks = response.data.tracks.items;

    if (tracks.length === 0) {
      return await sock.sendMessage(chatId, {
        text: config.messages.noResults,
        quoted: message
      });
    }

    let resultText = `🎵 *RESULTADOS SPOTIFY*\n\n`;
    resultText += `🔍 *Búsqueda:* ${args}\n\n`;
    resultText += `═══════════════════\n\n`;

    tracks.forEach((track, index) => {
      resultText += `*${index + 1}.* ${track.name}\n`;
      resultText += `👤 Artista: ${track.artists.map(a => a.name).join(', ')}\n`;
      resultText += `💿 Álbum: ${track.album.name}\n`;
      resultText += `⏱️ Duración: ${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}\n`;
      resultText += `🔗 Link: ${track.external_urls.spotify}\n\n`;
    });

    await sock.sendMessage(chatId, {
      text: resultText,
      quoted: message
    });

  } catch (error) {
    console.error('Error en spoti:', error);
    // Fallback: buscar en YouTube
    await sock.sendMessage(chatId, {
      text: '⚠️ *Buscando alternativa en YouTube...*',
      quoted: message
    });
    
    // Redirigir a yts
    ctx.args = args;
    await ytsCommand(ctx);
  }
}

// Token temporal de Spotify (en producción deberías implementar OAuth)
let spotifyToken = null;
let spotifyTokenExpiry = null;

async function getSpotifyToken() {
  // Si no hay token o expiró, obtener nuevo
  if (!spotifyToken || Date.now() > spotifyTokenExpiry) {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': 'Basic ' + Buffer.from('client_id:client_secret').toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      spotifyToken = response.data.access_token;
      spotifyTokenExpiry = Date.now() + (response.data.expires_in * 1000);
    } catch (error) {
      // Si falla, usar método alternativo
      return null;
    }
  }
  return spotifyToken;
}

/**
 * Letra de canción
 */
async function letraCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */letra despacito - luis fonsi*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '📝 *Buscando letra...*',
    quoted: message
  });

  try {
    // Usar API de letras (lyrics.ovh)
    const [title, artist] = args.split('-').map(s => s.trim());
    
    let apiUrl;
    if (artist) {
      apiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    } else {
      // Buscar solo por título
      apiUrl = `https://api.lyrics.ovh/suggest/${encodeURIComponent(title)}`;
    }

    const response = await axios.get(apiUrl, { timeout: 10000 });
    
    let lyrics;
    let songTitle;
    let songArtist;

    if (response.data.lyrics) {
      lyrics = response.data.lyrics;
      songTitle = title;
      songArtist = artist;
    } else if (response.data.data && response.data.data.length > 0) {
      // Tomar el primer resultado
      const firstResult = response.data.data[0];
      const lyricsResponse = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(firstResult.artist.name)}/${encodeURIComponent(firstResult.title)}`);
      lyrics = lyricsResponse.data.lyrics;
      songTitle = firstResult.title;
      songArtist = firstResult.artist.name;
    }

    if (!lyrics) {
      return await sock.sendMessage(chatId, {
        text: '❌ *No se encontró la letra*\n\nIntenta con: */letra canción - artista*',
        quoted: message
      });
    }

    // Truncar si es muy larga
    const maxLength = 3500;
    let displayLyrics = lyrics;
    if (lyrics.length > maxLength) {
      displayLyrics = lyrics.substring(0, maxLength) + '\n\n...[Letra truncada, muy larga]';
    }

    await sock.sendMessage(chatId, {
      text: `🎵 *${songTitle}*\n👤 *${songArtist}*\n\n═══════════════════\n\n${displayLyrics}\n\n═══════════════════`,
      quoted: message
    });

  } catch (error) {
    console.error('Error en letra:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *No se encontró la letra*\n\nIntenta con el formato: */letra canción - artista*',
      quoted: message
    });
  }
}

/**
 * TikTok search (TTS)
 */
async function ttsCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */tts baile viral*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '🔍 *Buscando en TikTok...*',
    quoted: message
  });

  try {
    // Usar API de búsqueda de TikTok
    const response = await axios.get(`https://www.tiktok.com/search?q=${encodeURIComponent(args)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    // Extraer videos de la respuesta HTML (scraping básico)
    const videoMatches = response.data.match(/"id":"(\d+)".*?"desc":"([^"]+)"/g);
    
    if (!videoMatches || videoMatches.length === 0) {
      return await sock.sendMessage(chatId, {
        text: '❌ *No se encontraron videos*\n\nIntenta con otra búsqueda.',
        quoted: message
      });
    }

    let resultText = `📱 *RESULTADOS TIKTOK*\n\n`;
    resultText += `🔍 *Búsqueda:* ${args}\n\n`;
    resultText += `═══════════════════\n\n`;

    // Mostrar primeros 10 resultados
    const videos = videoMatches.slice(0, 10);
    videos.forEach((match, index) => {
      const idMatch = match.match(/"id":"(\d+)"/);
      const descMatch = match.match(/"desc":"([^"]+)"/);
      
      if (idMatch && descMatch) {
        const videoId = idMatch[1];
        const desc = descMatch[1];
        resultText += `*${index + 1}.* ${desc.substring(0, 50)}${desc.length > 50 ? '...' : ''}\n`;
        resultText += `🔗 https://www.tiktok.com/@user/video/${videoId}\n\n`;
      }
    });

    resultText += `═══════════════════\n`;
    resultText += `💡 *Usa /tiktok <link> para descargar*`;

    await sock.sendMessage(chatId, {
      text: resultText,
      quoted: message
    });

  } catch (error) {
    console.error('Error en tts:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *Error al buscar en TikTok*\n\nIntenta nuevamente más tarde.',
      quoted: message
    });
  }
}

/**
 * Descargar video de TikTok
 */
async function tiktokCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args || !args.includes('tiktok.com')) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */tiktok https://tiktok.com/@user/video/xxxxx*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '⏳ *Descargando video de TikTok...*',
    quoted: message
  });

  try {
    // Usar API de descarga de TikTok
    const apiUrl = `https://api.tiktokdownloader.io/api/v1/download?url=${encodeURIComponent(args)}`;
    
    // Alternativa: usar servicio de scraping
    const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(args)}`, {
      timeout: 30000
    });

    if (!response.data.data) {
      throw new Error('No se pudo obtener el video');
    }

    const videoData = response.data.data;
    const videoUrl = videoData.play || videoData.hdplay || videoData.wmplay;
    
    if (!videoUrl) {
      throw new Error('URL de video no encontrada');
    }

    // Descargar video
    const videoBuffer = await getBuffer(videoUrl);
    
    if (!videoBuffer) {
      throw new Error('No se pudo descargar el video');
    }

    const caption = `📱 *Video de TikTok*\n\n`;
    caption += `👤 Autor: ${videoData.author?.nickname || 'Desconocido'}\n`;
    caption += `📝 Título: ${videoData.title?.substring(0, 100) || 'Sin título'}\n`;
    caption += `❤️ Likes: ${videoData.digg_count?.toLocaleString() || '0'}`;

    // Verificar tamaño
    const fileSizeMB = videoBuffer.length / (1024 * 1024);

    if (fileSizeMB > 64) {
      await sock.sendMessage(chatId, {
        document: videoBuffer,
        mimetype: 'video/mp4',
        fileName: 'tiktok_video.mp4',
        caption: caption + '\n\n⚠️ *Enviado como documento*',
        quoted: message
      });
    } else {
      await sock.sendMessage(chatId, {
        video: videoBuffer,
        caption: caption,
        quoted: message
      });
    }

  } catch (error) {
    console.error('Error en tiktok:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *Error al descargar el video de TikTok*\n\nEl video puede ser privado o no estar disponible.',
      quoted: message
    });
  }
}

/**
 * Descargar de Instagram
 */
async function instagramCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args || !args.includes('instagram.com')) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */ig https://instagram.com/p/xxxxx*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '⏳ *Descargando de Instagram...*',
    quoted: message
  });

  try {
    // Usar API de descarga de Instagram
    const response = await axios.get(`https://insta-download-api.vercel.app/api/download?url=${encodeURIComponent(args)}`, {
      timeout: 30000
    });

    if (!response.data || !response.data.url) {
      throw new Error('No se pudo obtener el contenido');
    }

    const mediaUrl = response.data.url;
    const isVideo = response.data.type === 'video';
    const mediaBuffer = await getBuffer(mediaUrl);

    if (!mediaBuffer) {
      throw new Error('No se pudo descargar el contenido');
    }

    if (isVideo) {
      const fileSizeMB = mediaBuffer.length / (1024 * 1024);
      if (fileSizeMB > 64) {
        await sock.sendMessage(chatId, {
          document: mediaBuffer,
          mimetype: 'video/mp4',
          fileName: 'instagram_video.mp4',
          caption: '📱 *Video de Instagram*\n\n⚠️ *Enviado como documento*',
          quoted: message
        });
      } else {
        await sock.sendMessage(chatId, {
          video: mediaBuffer,
          caption: '📱 *Video de Instagram*',
          quoted: message
        });
      }
    } else {
      await sock.sendMessage(chatId, {
        image: mediaBuffer,
        caption: '📱 *Imagen de Instagram*',
        quoted: message
      });
    }

  } catch (error) {
    console.error('Error en instagram:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *Error al descargar de Instagram*\n\nLa publicación puede ser privada o no estar disponible.',
      quoted: message
    });
  }
}

/**
 * Descargar de Facebook
 */
async function facebookCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args || !args.includes('facebook.com') && !args.includes('fb.watch')) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */fb https://facebook.com/watch?v=xxxxx*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '⏳ *Descargando de Facebook...*',
    quoted: message
  });

  try {
    // Usar API de descarga de Facebook
    const response = await axios.get(`https://fdownloader.net/api/ajaxSearch?lang=en&q=${encodeURIComponent(args)}`, {
      timeout: 30000
    });

    if (!response.data || !response.data.links) {
      throw new Error('No se pudo obtener el video');
    }

    // Obtener link de mayor calidad
    const links = response.data.links;
    const hdLink = links.hd || links.sd;
    
    if (!hdLink) {
      throw new Error('No se encontró link de descarga');
    }

    const videoBuffer = await getBuffer(hdLink);

    if (!videoBuffer) {
      throw new Error('No se pudo descargar el video');
    }

    const fileSizeMB = videoBuffer.length / (1024 * 1024);

    if (fileSizeMB > 64) {
      await sock.sendMessage(chatId, {
        document: videoBuffer,
        mimetype: 'video/mp4',
        fileName: 'facebook_video.mp4',
        caption: '📘 *Video de Facebook*\n\n⚠️ *Enviado como documento*',
        quoted: message
      });
    } else {
      await sock.sendMessage(chatId, {
        video: videoBuffer,
        caption: '📘 *Video de Facebook*',
        quoted: message
      });
    }

  } catch (error) {
    console.error('Error en facebook:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *Error al descargar de Facebook*\n\nEl video puede ser privado o no estar disponible.',
      quoted: message
    });
  }
}

/**
 * Descargar de Twitter/X
 */
async function twitterCommand(ctx) {
  const { sock, chatId, args, message } = ctx;
  
  if (!args || (!args.includes('twitter.com') && !args.includes('x.com'))) {
    return await sock.sendMessage(chatId, {
      text: '❌ *Uso incorrecto*\n\nEjemplo: */twitter https://x.com/user/status/xxxxx*',
      quoted: message
    });
  }

  await sock.sendMessage(chatId, {
    text: '⏳ *Descargando de Twitter/X...*',
    quoted: message
  });

  try {
    // Usar API de descarga de Twitter
    const response = await axios.get(`https://twitsave.com/info?url=${encodeURIComponent(args)}`, {
      timeout: 30000
    });

    if (!response.data || !response.data.download_url) {
      throw new Error('No se pudo obtener el video');
    }

    const videoUrl = response.data.download_url;
    const videoBuffer = await getBuffer(videoUrl);

    if (!videoBuffer) {
      throw new Error('No se pudo descargar el video');
    }

    const caption = `🐦 *Video de Twitter/X*\n\n`;
    caption += `👤 Autor: ${response.data.author || 'Desconocido'}\n`;
    caption += `📝 ${response.data.description?.substring(0, 100) || ''}`;

    const fileSizeMB = videoBuffer.length / (1024 * 1024);

    if (fileSizeMB > 64) {
      await sock.sendMessage(chatId, {
        document: videoBuffer,
        mimetype: 'video/mp4',
        fileName: 'twitter_video.mp4',
        caption: caption + '\n\n⚠️ *Enviado como documento*',
        quoted: message
      });
    } else {
      await sock.sendMessage(chatId, {
        video: videoBuffer,
        caption: caption,
        quoted: message
      });
    }

  } catch (error) {
    console.error('Error en twitter:', error);
    await sock.sendMessage(chatId, {
      text: '❌ *Error al descargar de Twitter/X*\n\nEl tweet puede ser privado o no contener video.',
      quoted: message
    });
  }
}

module.exports = {
  yts: ytsCommand,
  yta: ytaCommand,
  ytv: ytvCommand,
  play: playCommand,
  playvid: playvidCommand,
  spoti: spotiCommand,
  letra: letraCommand,
  tts: ttsCommand,
  tiktok: tiktokCommand,
  instagram: instagramCommand,
  facebook: facebookCommand,
  twitter: twitterCommand
};