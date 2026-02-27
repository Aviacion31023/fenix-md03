/**
 * ═══════════════════════════════════════════════════════════════
 * ⚡ FENIXBOT-WA - CONFIGURACIÓN
 * Creado por: FENIXTUTORIALES
 * ═══════════════════════════════════════════════════════════════
 */

const config = {
  // Información del bot
  botName: 'FENIXBOT-WA',
  creator: 'FENIXTUTORIALES',
  ownerNumber: '5493704052049@s.whatsapp.net',
  ownerNumberRaw: '5493704052049',
  
  // Configuración de sesión
  sessionName: 'fenixbot-session',
  
  // Zona horaria (Argentina)
  timezone: 'America/Argentina/Buenos_Aires',
  
  // Horarios automáticos de grupo
  autoOpenTime: '09:00',
  autoCloseTime: '02:00',
  
  // Límites para usuarios FREE
  freeLimits: {
    videoDownloads: 15,
    audioDownloads: 15,
    commandsPerDay: 50
  },
  
  // Configuración de APIs
  apis: {
    // Obtén tu API key gratis en: https://aistudio.google.com/app/apikey
    geminiApiKey: 'TU_API_KEY_DE_GEMINI_AQUI',
  },
  
  // Prefijos de comandos
  prefix: '/',
  
  // Palabras prohibidas (insultos)
  bannedWords: [
    'puto', 'puta', 'mierda', 'verga', 'pito', 'concha', 'culo', 'trola',
    'putos', 'putas', 'mierdas', 'vergas', 'pitos', 'conchas', 'culos',
    'trolas', 'pendejo', 'pendeja', 'pendejos', 'pendejas', 'idiota',
    'idiotas', 'estupido', 'estupida', 'estupidos', 'estupidas', 'boludo',
    'boluda', 'boludos', 'boludas', 'pelotudo', 'pelotuda', 'pelotudos',
    'pelotudas', 'forro', 'forra', 'forros', 'forras', 'hdmp', 'hdp',
    'chupapig', 'chupapinga', 'mrd', 'vrga', 'ptm', 'ctm', 'conchatumadre',
    'hijodeputa', 'hijadeputa', 'hijueputa', 'malparido', 'malparida',
    'gonorrea', 'guevon', 'huevon', 'maricon', 'maricón', 'gaymarica'
  ],
  
  // Mensajes predeterminados
  messages: {
    noCredits: '❌ *¡Sin créditos!*\n\nHas agotado tus créditos diarios.\n\n📊 *Límites FREE:*\n• 15 descargas de video/día\n• 15 descargas de audio/día\n• 50 comandos/día\n\n💎 Contacta al owner para obtener premium.',
    notAdmin: '❌ *Solo administradores pueden usar este comando*',
    notOwner: '❌ *Solo el owner puede usar este comando*',
    notGroup: '❌ *Este comando solo funciona en grupos*',
    error: '❌ *Ocurrió un error*\n\nIntenta nuevamente más tarde.',
    processing: '⏳ *Procesando...*',
    wait: '⌛ *Espere un momento...*',
    success: '✅ *¡Completado!*',
    invalidUrl: '❌ *URL inválida*\n\nPor favor envía un enlace válido.',
    noResults: '❌ *No se encontraron resultados*'
  }
};

module.exports = config;