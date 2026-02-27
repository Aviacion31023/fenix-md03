/**
 * ═══════════════════════════════════════════════════════════════
 * ⚡ MANEJADOR DE COMANDOS
 * ═══════════════════════════════════════════════════════════════
 */

const config = require('../config');
const db = require('../database');
const menus = require('../utils/menus');
const { isOwner, isAdmin, isGroup } = require('../utils/helpers');

// Importar categorías de comandos
const downloadCommands = require('../commands/downloads');
const searchCommands = require('../commands/search');
const iaCommands = require('../commands/ia');
const groupCommands = require('../commands/group');
const toolsCommands = require('../commands/tools');
const subbotCommands = require('../commands/subbot');
const ownerCommands = require('../commands/owner');
const funCommands = require('../commands/fun');

// Mapa de comandos
const commandsMap = new Map();

/**
 * Registrar un comando
 */
function registerCommand(name, handler, options = {}) {
  commandsMap.set(name.toLowerCase(), {
    handler,
    ...options
  });
}

/**
 * Inicializar todos los comandos
 */
function initCommands() {
  // === MENÚS ===
  registerCommand('menu', handleMenu, { category: 'menu', description: 'Menú principal' });
  registerCommand('start', handleMenu, { category: 'menu', description: 'Menú principal' });
  registerCommand('help', handleMenu, { category: 'menu', description: 'Menú principal' });
  
  // Submenús
  registerCommand('musica', handleSubMenu, { category: 'menu' });
  registerCommand('videos', handleSubMenu, { category: 'menu' });
  registerCommand('busquedas', handleSubMenu, { category: 'menu' });
  registerCommand('ia', handleSubMenu, { category: 'menu' });
  registerCommand('grupos', handleSubMenu, { category: 'menu' });
  registerCommand('herramientas', handleSubMenu, { category: 'menu' });
  registerCommand('subbots', handleSubMenu, { category: 'menu' });
  registerCommand('owner', handleSubMenu, { category: 'menu' });
  registerCommand('premiuminfo', handleSubMenu, { category: 'menu' });

  // === DESCARGAS ===
  registerCommand('yts', downloadCommands.yts, { category: 'downloads', credit: 'commands' });
  registerCommand('yta', downloadCommands.yta, { category: 'downloads', credit: 'audioDownloads' });
  registerCommand('ytv', downloadCommands.ytv, { category: 'downloads', credit: 'videoDownloads' });
  registerCommand('play', downloadCommands.play, { category: 'downloads', credit: 'audioDownloads' });
  registerCommand('playvid', downloadCommands.playvid, { category: 'downloads', credit: 'videoDownloads' });
  registerCommand('spoti', downloadCommands.spoti, { category: 'downloads', credit: 'commands' });
  registerCommand('letra', downloadCommands.letra, { category: 'downloads', credit: 'commands' });
  registerCommand('tts', downloadCommands.tts, { category: 'downloads', credit: 'videoDownloads' });
  registerCommand('tiktok', downloadCommands.tiktok, { category: 'downloads', credit: 'videoDownloads' });
  registerCommand('ig', downloadCommands.instagram, { category: 'downloads', credit: 'videoDownloads' });
  registerCommand('instagram', downloadCommands.instagram, { category: 'downloads', credit: 'videoDownloads' });
  registerCommand('fb', downloadCommands.facebook, { category: 'downloads', credit: 'videoDownloads' });
  registerCommand('facebook', downloadCommands.facebook, { category: 'downloads', credit: 'videoDownloads' });
  registerCommand('twitter', downloadCommands.twitter, { category: 'downloads', credit: 'videoDownloads' });
  registerCommand('x', downloadCommands.twitter, { category: 'downloads', credit: 'videoDownloads' });

  // === BÚSQUEDAS ===
  registerCommand('google', searchCommands.google, { category: 'search', credit: 'commands' });
  registerCommand('wiki', searchCommands.wikipedia, { category: 'search', credit: 'commands' });
  registerCommand('wikipedia', searchCommands.wikipedia, { category: 'search', credit: 'commands' });
  registerCommand('imagen', searchCommands.imagen, { category: 'search', credit: 'commands' });
  registerCommand('image', searchCommands.imagen, { category: 'search', credit: 'commands' });
  registerCommand('pinterest', searchCommands.pinterest, { category: 'search', credit: 'commands' });
  registerCommand('ytbuscar', searchCommands.ytbuscar, { category: 'search', credit: 'commands' });
  registerCommand('noticias', searchCommands.noticias, { category: 'search', credit: 'commands' });
  registerCommand('clima', searchCommands.clima, { category: 'search', credit: 'commands' });
  registerCommand('weather', searchCommands.clima, { category: 'search', credit: 'commands' });

  // === IA ===
  registerCommand('gemini', iaCommands.gemini, { category: 'ia', credit: 'commands' });
  registerCommand('ia', iaCommands.ia, { category: 'ia', credit: 'commands' });
  registerCommand('resumir', iaCommands.resumir, { category: 'ia', credit: 'commands' });
  registerCommand('traducir', iaCommands.traducir, { category: 'ia', credit: 'commands' });
  registerCommand('translate', iaCommands.traducir, { category: 'ia', credit: 'commands' });
  registerCommand('corregir', iaCommands.corregir, { category: 'ia', credit: 'commands' });
  registerCommand('codigo', iaCommands.codigo, { category: 'ia', credit: 'commands' });
  registerCommand('code', iaCommands.codigo, { category: 'ia', credit: 'commands' });
  registerCommand('historia', iaCommands.historia, { category: 'ia', credit: 'commands' });
  registerCommand('story', iaCommands.historia, { category: 'ia', credit: 'commands' });

  // === GRUPOS ===
  registerCommand('abrir', groupCommands.abrir, { category: 'group' });
  registerCommand('cerrar', groupCommands.cerrar, { category: 'group' });
  registerCommand('autoabrir', groupCommands.autoabrir, { category: 'group' });
  registerCommand('autocerrar', groupCommands.autocerrar, { category: 'group' });
  registerCommand('antilink', groupCommands.antilink, { category: 'group' });
  registerCommand('antitoxic', groupCommands.antitoxic, { category: 'group' });
  registerCommand('bienvenida', groupCommands.bienvenida, { category: 'group' });
  registerCommand('despedida', groupCommands.despedida, { category: 'group' });
  registerCommand('kick', groupCommands.kick, { category: 'group' });
  registerCommand('add', groupCommands.add, { category: 'group' });
  registerCommand('promote', groupCommands.promote, { category: 'group' });
  registerCommand('demote', groupCommands.demote, { category: 'group' });
  registerCommand('warn', groupCommands.warn, { category: 'group' });
  registerCommand('warns', groupCommands.warns, { category: 'group' });
  registerCommand('resetwarns', groupCommands.resetwarns, { category: 'group' });
  registerCommand('tagall', groupCommands.tagall, { category: 'group' });
  registerCommand('hidetag', groupCommands.hidetag, { category: 'group' });
  registerCommand('setname', groupCommands.setname, { category: 'group' });
  registerCommand('setdesc', groupCommands.setdesc, { category: 'group' });
  registerCommand('setpp', groupCommands.setpp, { category: 'group' });
  registerCommand('link', groupCommands.link, { category: 'group' });
  registerCommand('revoke', groupCommands.revoke, { category: 'group' });

  // === HERRAMIENTAS ===
  registerCommand('qr', toolsCommands.qr, { category: 'tools', credit: 'commands' });
  registerCommand('linkqr', toolsCommands.linkqr, { category: 'tools', credit: 'commands' });
  registerCommand('short', toolsCommands.short, { category: 'tools', credit: 'commands' });
  registerCommand('encuesta', toolsCommands.encuesta, { category: 'tools', credit: 'commands' });
  registerCommand('poll', toolsCommands.encuesta, { category: 'tools', credit: 'commands' });
  registerCommand('estadisticas', toolsCommands.estadisticas, { category: 'tools', credit: 'commands' });
  registerCommand('stats', toolsCommands.estadisticas, { category: 'tools', credit: 'commands' });
  registerCommand('ping', toolsCommands.ping, { category: 'tools', credit: 'commands' });
  registerCommand('speed', toolsCommands.ping, { category: 'tools', credit: 'commands' });
  registerCommand('hora', toolsCommands.hora, { category: 'tools', credit: 'commands' });
  registerCommand('time', toolsCommands.hora, { category: 'tools', credit: 'commands' });
  registerCommand('fecha', toolsCommands.fecha, { category: 'tools', credit: 'commands' });
  registerCommand('date', toolsCommands.fecha, { category: 'tools', credit: 'commands' });
  registerCommand('calcular', toolsCommands.calcular, { category: 'tools', credit: 'commands' });
  registerCommand('calc', toolsCommands.calcular, { category: 'tools', credit: 'commands' });
  registerCommand('moneda', toolsCommands.moneda, { category: 'tools', credit: 'commands' });
  registerCommand('convert', toolsCommands.moneda, { category: 'tools', credit: 'commands' });
  registerCommand('base64', toolsCommands.base64, { category: 'tools', credit: 'commands' });
  registerCommand('decode64', toolsCommands.decode64, { category: 'tools', credit: 'commands' });
  registerCommand('binario', toolsCommands.binario, { category: 'tools', credit: 'commands' });
  registerCommand('binary', toolsCommands.binario, { category: 'tools', credit: 'commands' });
  registerCommand('morse', toolsCommands.morse, { category: 'tools', credit: 'commands' });
  registerCommand('reverse', toolsCommands.reverse, { category: 'tools', credit: 'commands' });
  registerCommand('mayus', toolsCommands.mayus, { category: 'tools', credit: 'commands' });
  registerCommand('uppercase', toolsCommands.mayus, { category: 'tools', credit: 'commands' });
  registerCommand('minus', toolsCommands.minus, { category: 'tools', credit: 'commands' });
  registerCommand('lowercase', toolsCommands.minus, { category: 'tools', credit: 'commands' });
  registerCommand('logo', toolsCommands.logo, { category: 'tools', credit: 'commands' });
  registerCommand('sticker', toolsCommands.sticker, { category: 'tools', credit: 'commands' });
  registerCommand('s', toolsCommands.sticker, { category: 'tools', credit: 'commands' });
  registerCommand('stickergif', toolsCommands.stickergif, { category: 'tools', credit: 'commands' });
  registerCommand('sgif', toolsCommands.stickergif, { category: 'tools', credit: 'commands' });
  registerCommand('toimg', toolsCommands.toimg, { category: 'tools', credit: 'commands' });
  registerCommand('tovid', toolsCommands.tovid, { category: 'tools', credit: 'commands' });

  // === SUBBOTS ===
  registerCommand('serbotqr', subbotCommands.serbotqr, { category: 'subbot', credit: 'commands' });
  registerCommand('serbotcode', subbotCommands.serbotcode, { category: 'subbot', credit: 'commands' });
  registerCommand('reconectar', subbotCommands.reconectar, { category: 'subbot', credit: 'commands' });
  registerCommand('stop', subbotCommands.stop, { category: 'subbot', credit: 'commands' });
  registerCommand('misbots', subbotCommands.misbots, { category: 'subbot', credit: 'commands' });

  // === OWNER ===
  registerCommand('premium', ownerCommands.premium, { category: 'owner' });
  registerCommand('quitarpremium', ownerCommands.quitarpremium, { category: 'owner' });
  registerCommand('addcomando', ownerCommands.addcomando, { category: 'owner' });
  registerCommand('delcomando', ownerCommands.delcomando, { category: 'owner' });
  registerCommand('listcomandos', ownerCommands.listcomandos, { category: 'owner' });
  registerCommand('broadcast', ownerCommands.broadcast, { category: 'owner' });
  registerCommand('bangrupos', ownerCommands.bangrupos, { category: 'owner' });
  registerCommand('resetuser', ownerCommands.resetuser, { category: 'owner' });
  registerCommand('ban', ownerCommands.ban, { category: 'owner' });
  registerCommand('unban', ownerCommands.unban, { category: 'owner' });
  registerCommand('listbans', ownerCommands.listbans, { category: 'owner' });
  registerCommand('reiniciar', ownerCommands.reiniciar, { category: 'owner' });
  registerCommand('restart', ownerCommands.reiniciar, { category: 'owner' });
  registerCommand('apagar', ownerCommands.apagar, { category: 'owner' });
  registerCommand('shutdown', ownerCommands.apagar, { category: 'owner' });
  registerCommand('actualizar', ownerCommands.actualizar, { category: 'owner' });
  registerCommand('update', ownerCommands.actualizar, { category: 'owner' });
  registerCommand('setapi', ownerCommands.setapi, { category: 'owner' });
  registerCommand('exec', ownerCommands.exec, { category: 'owner' });
  registerCommand('shell', ownerCommands.shell, { category: 'owner' });

  // === DIVERSIÓN ===
  registerCommand('chiste', funCommands.chiste, { category: 'fun', credit: 'commands' });
  registerCommand('joke', funCommands.chiste, { category: 'fun', credit: 'commands' });
  registerCommand('curiosidad', funCommands.curiosidad, { category: 'fun', credit: 'commands' });
  registerCommand('fact', funCommands.curiosidad, { category: 'fun', credit: 'commands' });
  registerCommand('dado', funCommands.dado, { category: 'fun', credit: 'commands' });
  registerCommand('dice', funCommands.dado, { category: 'fun', credit: 'commands' });
  registerCommand('moneda', funCommands.moneda, { category: 'fun', credit: 'commands' });
  registerCommand('coin', funCommands.moneda, { category: 'fun', credit: 'commands' });
  registerCommand('ppt', funCommands.ppt, { category: 'fun', credit: 'commands' });
  registerCommand('rps', funCommands.ppt, { category: 'fun', credit: 'commands' });
  registerCommand('love', funCommands.love, { category: 'fun', credit: 'commands' });
  registerCommand('ship', funCommands.love, { category: 'fun', credit: 'commands' });
  registerCommand('gay', funCommands.gay, { category: 'fun', credit: 'commands' });
  registerCommand('top', funCommands.top, { category: 'fun', credit: 'commands' });
  registerCommand('random', funCommands.random, { category: 'fun', credit: 'commands' });

  console.log(`✅ ${commandsMap.size} comandos registrados`);
}

/**
 * Manejar menú principal
 */
async function handleMenu(ctx) {
  const { sock, chatId, sender, pushName, message } = ctx;
  const user = db.getUser(sender);
  
  const menuText = menus.mainMenu(
    pushName, 
    user.isPremium && new Date(user.premiumExpiry) > new Date(),
    user.credits
  );
  
  await sock.sendMessage(chatId, {
    text: menuText,
    quoted: message
  });
}

/**
 * Manejar submenús
 */
async function handleSubMenu(ctx) {
  const { sock, chatId, command, message } = ctx;
  
  let menuText = '';
  switch (command) {
    case 'musica':
      menuText = menus.musicMenu();
      break;
    case 'videos':
      menuText = menus.videoMenu();
      break;
    case 'busquedas':
      menuText = menus.searchMenu();
      break;
    case 'ia':
      menuText = menus.iaMenu();
      break;
    case 'grupos':
      menuText = menus.groupMenu();
      break;
    case 'herramientas':
      menuText = menus.toolsMenu();
      break;
    case 'subbots':
      menuText = menus.subbotMenu();
      break;
    case 'owner':
      menuText = menus.ownerMenu();
      break;
    case 'premiuminfo':
      menuText = menus.premiumInfoMenu();
      break;
    default:
      menuText = menus.mainMenu(ctx.pushName, false, { videoDownloads: 15, audioDownloads: 15, commands: 50 });
  }
  
  await sock.sendMessage(chatId, {
    text: menuText,
    quoted: message
  });
}

/**
 * Ejecutar comando
 */
async function execute(ctx) {
  const { command, sender, sock, chatId, message, isOwner: ownerStatus } = ctx;
  
  const cmdData = commandsMap.get(command.toLowerCase());
  
  if (!cmdData) {
    // Comando no encontrado - solo responder en privado o si menciona al bot
    if (!isGroup(chatId)) {
      await sock.sendMessage(chatId, {
        text: `❌ *Comando no encontrado*\n\nEscribe */menu* para ver los comandos disponibles.`,
        quoted: message
      });
    }
    return;
  }

  // Verificar créditos si aplica
  if (cmdData.credit && !ownerStatus) {
    if (!db.hasCredits(sender, cmdData.credit)) {
      await sock.sendMessage(chatId, {
        text: config.messages.noCredits,
        quoted: message
      });
      return;
    }
    // Usar crédito
    db.useCredit(sender, cmdData.credit);
  }

  // Verificar permisos de owner
  if (cmdData.category === 'owner' && !ownerStatus) {
    await sock.sendMessage(chatId, {
      text: config.messages.notOwner,
      quoted: message
    });
    return;
  }

  // Verificar permisos de admin para comandos de grupo
  if (cmdData.category === 'group' && isGroup(chatId)) {
    const adminCmds = ['abrir', 'cerrar', 'kick', 'add', 'promote', 'demote', 'autoabrir', 'autocerrar'];
    if (adminCmds.includes(command.toLowerCase())) {
      const isUserAdmin = await isAdmin(sock, chatId, sender);
      if (!isUserAdmin && !ownerStatus) {
        await sock.sendMessage(chatId, {
          text: config.messages.notAdmin,
          quoted: message
        });
        return;
      }
    }
  }

  // Ejecutar handler
  try {
    await cmdData.handler(ctx);
    db.incrementStat('totalCommands');
  } catch (error) {
    console.error(`Error ejecutando comando ${command}:`, error);
    await sock.sendMessage(chatId, {
      text: config.messages.error,
      quoted: message
    });
  }
}

// Inicializar comandos al cargar
initCommands();

module.exports = {
  execute,
  registerCommand,
  commandsMap
};