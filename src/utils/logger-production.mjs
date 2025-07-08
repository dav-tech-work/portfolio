/**
 * Sistema de Logging Estructurado para Producción
 * Reemplaza console.log con logging apropiado según el entorno
 */

import fs from 'fs';
import path from 'path';
import config from '../config/index.mjs';

// Configuración de logging
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const LOG_COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m', // Yellow
  INFO: '\x1b[36m', // Cyan
  DEBUG: '\x1b[35m', // Magenta
  SUCCESS: '\x1b[32m', // Green
  RESET: '\x1b[0m', // Reset
};

class ProductionLogger {
  constructor() {
    this.logLevel = this.getLogLevel();
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  getLogLevel() {
    const level = config.LOG_LEVEL || 'INFO';
    return LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      pid: process.pid,
      ...(data && { data }),
    };

    return JSON.stringify(logEntry);
  }

  writeToFile(level, message, data = null) {
    if (config.NODE_ENV === 'production') {
      const logFile = path.join(this.logDir, `${level.toLowerCase()}.log`);
      const logEntry = this.formatMessage(level, message, data);

      fs.appendFileSync(logFile, logEntry + '\n');
    }
  }

  log(level, message, data = null) {
    const levelNum = LOG_LEVELS[level] || LOG_LEVELS.INFO;

    if (levelNum <= this.logLevel) {
      // En desarrollo, mostrar en consola con colores
      if (config.NODE_ENV === 'development') {
        const color = LOG_COLORS[level] || LOG_COLORS.INFO;
        const timestamp = new Date().toISOString();
        console.log(`${color}[${timestamp}] ${level}: ${message}${LOG_COLORS.RESET}`);
        if (data) {
          console.log(`${color}${JSON.stringify(data, null, 2)}${LOG_COLORS.RESET}`);
        }
      }

      // En producción, escribir a archivos
      this.writeToFile(level, message, data);
    }
  }

  error(message, data = null) {
    this.log('ERROR', message, data);
  }

  warn(message, data = null) {
    this.log('WARN', message, data);
  }

  info(message, data = null) {
    this.log('INFO', message, data);
  }

  debug(message, data = null) {
    this.log('DEBUG', message, data);
  }

  success(message, data = null) {
    // Success es tratado como INFO pero con color especial
    if (config.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.log(`${LOG_COLORS.SUCCESS}[${timestamp}] SUCCESS: ${message}${LOG_COLORS.RESET}`);
      if (data) {
        console.log(`${LOG_COLORS.SUCCESS}${JSON.stringify(data, null, 2)}${LOG_COLORS.RESET}`);
      }
    }
    this.log('INFO', `SUCCESS: ${message}`, data);
  }

  // Método para logging de aplicación (servidor iniciado, etc.)
  app(message, data = null) {
    this.info(`🚀 APP: ${message}`, data);
  }

  // Método para logging de seguridad
  security(message, data = null) {
    this.warn(`🔒 SECURITY: ${message}`, data);
  }

  // Método para logging de base de datos
  db(message, data = null) {
    this.info(`💾 DB: ${message}`, data);
  }

  // Método para logging de autenticación
  auth(message, data = null) {
    this.info(`🔐 AUTH: ${message}`, data);
  }
}

// Crear instancia singleton
const logger = new ProductionLogger();

export default logger;
export { logger };
