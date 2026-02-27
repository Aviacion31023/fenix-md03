/**
 * ═══════════════════════════════════════════════════════════════
 * ⚡ UTILIDADES Y FUNCIONES AUXILIARES
 * ═══════════════════════════════════════════════════════════════
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { writeFile } = require('fs/promises');
const config = require('../config');

// Generar código aleatorio
function generateCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Formatear número de teléfono
function formatPhoneNumber(number) {
  return number.replace(/[^0-9]/g, '');
}

// Verificar si es admin
async function isAdmin(sock, groupId, userId) {
  try {
    const groupMetadata = await sock.groupMetadata(groupId);
    const participants = groupMetadata.participants;
    const participant = participants.find(p => p.id === userId);
    return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
  } catch (error) {
    return false;
  }
}

// Verificar si es owner
function isOwner(userId) {
  return userId === config.ownerNumber || userId === config.ownerNumberRaw + '@s.whatsapp.net';
}

// Verificar si es grupo
function isGroup(chatId) {
  return chatId.endsWith('@g.us');
}

// Formatear tiempo
function formatTime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  
  return parts.join(' ') || '0s';
}

// Formatear bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Descargar archivo
async function downloadFile(url, outputPath) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    await writeFile(outputPath, response.data);
    return true;
  } catch (error) {
    console.error('Error descargando archivo:', error.message);
    return false;
  }
}

// Obtener buffer de URL
async function getBuffer(url) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error obteniendo buffer:', error.message);
    return null;
  }
}

// Verificar URL de YouTube
function isYouTubeUrl(url) {
  const patterns = [
    /youtube\.com\/watch\?v=/,
    /youtu\.be\//,
    /youtube\.com\/shorts\//,
    /youtube\.com\/embed\//
  ];
  return patterns.some(pattern => pattern.test(url));
}

// Extraer ID de video de YouTube
function extractYouTubeId(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Verificar URL de TikTok
function isTikTokUrl(url) {
  return /tiktok\.com\//.test(url) || /vm\.tiktok\.com\//.test(url);
}

// Verificar palabras prohibidas
function containsBannedWords(text) {
  const lowerText = text.toLowerCase();
  return config.bannedWords.some(word => lowerText.includes(word.toLowerCase()));
}

// Crear delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Formatear número con separadores
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Obtener hora Argentina
function getArgentinaTime() {
  const now = new Date();
  return now.toLocaleTimeString('es-AR', { 
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// Verificar si es hora de abrir/cerrar grupo
function isAutoOpenTime() {
  const time = getArgentinaTime();
  return time === config.autoOpenTime;
}

function isAutoCloseTime() {
  const time = getArgentinaTime();
  return time === config.autoCloseTime;
}

// Limpiar texto para evitar inyección
function sanitizeText(text) {
  return text.replace(/[<>\"']/g, '');
}

// Crear progreso visual
function createProgressBar(current, total, size = 20) {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((size * current) / total);
  const empty = size - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${percentage}%`;
}

module.exports = {
  generateCode,
  formatPhoneNumber,
  isAdmin,
  isOwner,
  isGroup,
  formatTime,
  formatBytes,
  downloadFile,
  getBuffer,
  isYouTubeUrl,
  extractYouTubeId,
  isTikTokUrl,
  containsBannedWords,
  delay,
  formatNumber,
  getArgentinaTime,
  isAutoOpenTime,
  isAutoCloseTime,
  sanitizeText,
  createProgressBar
};