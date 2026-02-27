/**
 * ═══════════════════════════════════════════════════════════════
 * ⚡ SISTEMA DE BASE DE DATOS (JSON)
 * ═══════════════════════════════════════════════════════════════
 */

const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database.json');

// Estructura inicial de la base de datos
const defaultDB = {
  users: {},
  groups: {},
  subbots: {},
  premium: {},
  customCommands: {},
  stats: {
    totalCommands: 0,
    totalDownloads: 0,
    startDate: new Date().toISOString()
  }
};

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeJsonSync(DB_PATH, defaultDB, { spaces: 2 });
    }
    this.data = fs.readJsonSync(DB_PATH);
    // Asegurar que existan todas las propiedades
    this.data = { ...defaultDB, ...this.data };
    this.save();
  }

  save() {
    fs.writeJsonSync(DB_PATH, this.data, { spaces: 2 });
  }

  // Gestión de usuarios
  getUser(jid) {
    if (!this.data.users[jid]) {
      this.data.users[jid] = {
        jid,
        registeredAt: new Date().toISOString(),
        credits: {
          videoDownloads: 15,
          audioDownloads: 15,
          commands: 50
        },
        lastReset: new Date().toDateString(),
        totalCommands: 0,
        isPremium: false,
        premiumExpiry: null
      };
      this.save();
    }
    this.checkDailyReset(jid);
    return this.data.users[jid];
  }

  checkDailyReset(jid) {
    const user = this.data.users[jid];
    const today = new Date().toDateString();
    if (user.lastReset !== today && !user.isPremium) {
      user.credits = {
        videoDownloads: 15,
        audioDownloads: 15,
        commands: 50
      };
      user.lastReset = today;
      this.save();
    }
  }

  useCredit(jid, type) {
    const user = this.getUser(jid);
    if (user.isPremium && new Date(user.premiumExpiry) > new Date()) {
      user.totalCommands++;
      this.save();
      return true;
    }
    if (user.credits[type] > 0) {
      user.credits[type]--;
      user.totalCommands++;
      this.save();
      return true;
    }
    return false;
  }

  hasCredits(jid, type) {
    const user = this.getUser(jid);
    if (user.isPremium && new Date(user.premiumExpiry) > new Date()) {
      return true;
    }
    return user.credits[type] > 0;
  }

  // Gestión de premium
  addPremium(jid, days) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + parseInt(days));
    this.data.users[jid].isPremium = true;
    this.data.users[jid].premiumExpiry = expiry.toISOString();
    this.save();
    return expiry;
  }

  removePremium(jid) {
    if (this.data.users[jid]) {
      this.data.users[jid].isPremium = false;
      this.data.users[jid].premiumExpiry = null;
      this.save();
    }
  }

  // Gestión de grupos
  getGroup(jid) {
    if (!this.data.groups[jid]) {
      this.data.groups[jid] = {
        jid,
        welcome: true,
        antilink: false,
        antitoxic: true,
        autoOpen: false,
        autoClose: false,
        settings: {}
      };
      this.save();
    }
    return this.data.groups[jid];
  }

  updateGroup(jid, data) {
    this.data.groups[jid] = { ...this.getGroup(jid), ...data };
    this.save();
  }

  // Gestión de subbots
  addSubbot(code, data) {
    this.data.subbots[code] = {
      ...data,
      createdAt: new Date().toISOString(),
      active: true
    };
    this.save();
  }

  getSubbot(code) {
    return this.data.subbots[code];
  }

  removeSubbot(code) {
    delete this.data.subbots[code];
    this.save();
  }

  // Comandos personalizados
  addCustomCommand(name, data) {
    this.data.customCommands[name] = {
      ...data,
      createdAt: new Date().toISOString()
    };
    this.save();
  }

  getCustomCommand(name) {
    return this.data.customCommands[name];
  }

  removeCustomCommand(name) {
    delete this.data.customCommands[name];
    this.save();
  }

  // Estadísticas
  incrementStat(key) {
    this.data.stats[key] = (this.data.stats[key] || 0) + 1;
    this.save();
  }

  getStats() {
    return this.data.stats;
  }
}

module.exports = new Database();