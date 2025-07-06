import config from '../config/index.mjs';

const isProduction = config.ENV === 'production';
const isDevelopment = config.ENV === 'development';

// Colores para desarrollo
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const formatMessage = (level, message, color = '') => {
  const timestamp = new Date().toISOString();
  const levelStr = level.toUpperCase().padEnd(5);

  if (isDevelopment && color) {
    return `${color}[${timestamp}] ${levelStr}: ${message}${colors.reset}`;
  }
  return `[${timestamp}] ${levelStr}: ${message}`;
};

export const logger = {
  // Info logs - solo en desarrollo para logs generales, siempre para logs importantes
  info: (message, force = false) => {
    if (!isProduction || force) {
      console.log(formatMessage('info', message, colors.cyan));
    }
  },

  // Warnings - siempre mostrar
  warn: (message) => {
    console.warn(formatMessage('warn', message, colors.yellow));
  },

  // Errores - siempre mostrar
  error: (message) => {
    console.error(formatMessage('error', message, colors.red));
  },

  // Debug - solo en desarrollo
  debug: (message) => {
    if (isDevelopment) {
      console.log(formatMessage('debug', message, colors.magenta));
    }
  },

  // Success - solo en desarrollo o forzado
  success: (message, force = false) => {
    if (!isProduction || force) {
      console.log(formatMessage('success', message, colors.green));
    }
  },

  // Startup logs - siempre mostrar con emoji
  startup: (message) => {
    const emoji = isProduction ? '🚀' : '🔧';
    console.log(formatMessage('start', `${emoji} ${message}`, colors.bright));
  },

  // Security logs - siempre mostrar
  security: (message) => {
    console.warn(formatMessage('security', `🔐 ${message}`, colors.red));
  },
};

// Backward compatibility
export const log = logger;

export default logger;
