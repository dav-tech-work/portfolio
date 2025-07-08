/**
 * Cargador y Validador de Configuración de Entorno
 * @description Sistema optimizado para cargar, validar y gestionar variables de entorno
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache de configuración para evitar lecturas múltiples
let configCache = null;

/**
 * Carga y valida la configuración de entorno
 * @returns {Object} Configuración validada y normalizada
 */
export function configLoader() {
  // Devolver cache si ya está cargado
  if (configCache) {
    return configCache;
  }

  // Cargar variables de entorno
  loadEnvironmentFiles();

  // Crear configuración con validación y defaults
  const config = createConfiguration();

  // Validar configuración crítica
  validateCriticalConfig(config);

  // Cachear configuración
  configCache = Object.freeze(config);

  return configCache;
}

/**
 * Carga archivos de configuración en orden de prioridad
 */
function loadEnvironmentFiles() {
  const rootDir = path.join(__dirname, '..', '..');

  const configFiles = [
    // Archivo principal de configuración
    path.join(rootDir, 'config.env'),
    // Archivo específico del entorno
    path.join(rootDir, `.env.${process.env.NODE_ENV || 'development'}`),
    // Archivo local (para desarrollo)
    path.join(rootDir, '.env.local'),
    // Archivo por defecto
    path.join(rootDir, '.env'),
  ];

  // Cargar archivos que existan
  configFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      dotenv.config({ path: file });
      console.log(`📁 Configuración cargada: ${path.basename(file)}`);
    }
  });
}

/**
 * Crea la configuración normalizada con defaults
 * @returns {Object} Configuración completa
 */
function createConfiguration() {
  const env = process.env;

  return {
    // === CONFIGURACIÓN BÁSICA ===
    NODE_ENV: env.NODE_ENV || 'development',
    PORT: parseInt(env.PORT) || 3000,
    APP_VERSION: env.APP_VERSION || '2.0.0',
    APP_NAME: env.APP_NAME || 'Aplicación Web Segura',

    // === SEGURIDAD ===
    SESSION_SECRET: env.SESSION_SECRET,
    JWT_SECRET: env.JWT_SECRET,
    CSRF_SECRET: env.CSRF_SECRET,

    // === CONFIGURACIÓN DE SESIONES ===
    SESSION_MAX_AGE: parseInt(env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 horas
    COOKIE_SECURE: parseBooleanEnv(env.COOKIE_SECURE, env.NODE_ENV === 'production'),
    COOKIE_SAME_SITE: env.COOKIE_SAME_SITE || 'strict',

    // === RATE LIMITING ===
    RATE_LIMIT_WINDOW_MS: parseInt(env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
    RATE_LIMIT_MAX_REQUESTS: parseInt(env.RATE_LIMIT_MAX_REQUESTS) || 100,
    AUTH_RATE_LIMIT_WINDOW_MS: parseInt(env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    AUTH_RATE_LIMIT_MAX_REQUESTS: parseInt(env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5,

    // === CORS ===
    CORS_ORIGIN: env.CORS_ORIGIN || 'http://localhost:3000',
    ALLOWED_ORIGINS: env.ALLOWED_ORIGINS
      ? env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000'],

    // === CONFIGURACIÓN DE BCRYPT ===
    BCRYPT_ROUNDS: parseInt(env.BCRYPT_ROUNDS) || 12,

    // === CONFIGURACIÓN DE JWT ===
    TOKEN_EXPIRES_IN: env.TOKEN_EXPIRES_IN || '24h',

    // === LOGGING ===
    LOG_LEVEL: env.LOG_LEVEL || 'info',
    LOG_FILE_PATH: env.LOG_FILE_PATH || 'logs/security.log',
    ENABLE_SECURITY_LOGGING: parseBooleanEnv(env.ENABLE_SECURITY_LOGGING, true),
    ENABLE_REQUEST_LOGGING: parseBooleanEnv(
      env.ENABLE_REQUEST_LOGGING,
      env.NODE_ENV === 'development'
    ),

    // === LÍMITES DE CONTENIDO ===
    MAX_FILE_SIZE: parseInt(env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    MAX_REQUEST_SIZE: env.MAX_REQUEST_SIZE || '1mb',
    MAX_PARAMETER_LIMIT: parseInt(env.MAX_PARAMETER_LIMIT) || 100,

    // === CSP (Content Security Policy) ===
    CSP_REPORT_URI: env.CSP_REPORT_URI || '/csp-report',
    CSP_REPORT_ONLY: parseBooleanEnv(env.CSP_REPORT_ONLY, false),

    // === MONITOREO Y MÉTRICAS ===
    ENABLE_METRICS: parseBooleanEnv(env.ENABLE_METRICS, env.NODE_ENV === 'development'),
    METRICS_PORT: parseInt(env.METRICS_PORT) || 9090,
    HEALTH_CHECK_PATH: env.HEALTH_CHECK_PATH || '/health',

    // === CLUSTERING ===
    ENABLE_CLUSTERING: parseBooleanEnv(env.ENABLE_CLUSTERING, false),
    MAX_WORKERS: parseInt(env.MAX_WORKERS) || 4,

    // === COMPRESIÓN ===
    ENABLE_COMPRESSION: parseBooleanEnv(env.ENABLE_COMPRESSION, true),
    COMPRESSION_LEVEL: parseInt(env.COMPRESSION_LEVEL) || (env.NODE_ENV === 'production' ? 6 : 1),
    COMPRESSION_THRESHOLD: parseInt(env.COMPRESSION_THRESHOLD) || 1024,

    // === CACHE ===
    ENABLE_VIEW_CACHE: parseBooleanEnv(env.ENABLE_VIEW_CACHE, env.NODE_ENV === 'production'),
    STATIC_CACHE_MAX_AGE: env.STATIC_CACHE_MAX_AGE || (env.NODE_ENV === 'production' ? '1y' : '0'),

    // === TIMEOUTS ===
    SERVER_TIMEOUT: parseInt(env.SERVER_TIMEOUT) || 30000, // 30 segundos
    GRACEFUL_SHUTDOWN_TIMEOUT: parseInt(env.GRACEFUL_SHUTDOWN_TIMEOUT) || 10000, // 10 segundos

    // === DESARROLLO ===
    ENABLE_DEV_TOOLS: parseBooleanEnv(env.ENABLE_DEV_TOOLS, env.NODE_ENV === 'development'),
    HOT_RELOAD: parseBooleanEnv(env.HOT_RELOAD, env.NODE_ENV === 'development'),

    // === CONFIGURACIÓN PERSONALIZADA ===
    CUSTOM_HEADER_NAME: env.CUSTOM_HEADER_NAME || 'X-App-Name',
    TIMEZONE: env.TIMEZONE || 'UTC',
    DEFAULT_LANGUAGE: env.DEFAULT_LANGUAGE || 'es',

    // === CONFIGURACIÓN DE EMAIL (para futuras funcionalidades) ===
    SMTP_HOST: env.SMTP_HOST,
    SMTP_PORT: parseInt(env.SMTP_PORT) || 587,
    SMTP_USER: env.SMTP_USER,
    SMTP_PASS: env.SMTP_PASS,
    SMTP_FROM: env.SMTP_FROM || 'noreply@example.com',

    // === URLs EXTERNAS ===
    API_BASE_URL: env.API_BASE_URL || 'http://localhost:3000/api',
    FRONTEND_URL: env.FRONTEND_URL || 'http://localhost:3000',

    // === CONFIGURACIÓN DE SUBIDA DE ARCHIVOS ===
    UPLOAD_DIR: env.UPLOAD_DIR || 'uploads',
    ALLOWED_FILE_TYPES: env.ALLOWED_FILE_TYPES
      ? env.ALLOWED_FILE_TYPES.split(',')
      : [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],

    // === FEATURES FLAGS ===
    FEATURE_USER_REGISTRATION: parseBooleanEnv(env.FEATURE_USER_REGISTRATION, true),
    FEATURE_PASSWORD_RESET: parseBooleanEnv(env.FEATURE_PASSWORD_RESET, true),
    FEATURE_TWO_FACTOR_AUTH: parseBooleanEnv(env.FEATURE_TWO_FACTOR_AUTH, false),
    FEATURE_API_DOCUMENTATION: parseBooleanEnv(
      env.FEATURE_API_DOCUMENTATION,
      env.NODE_ENV === 'development'
    ),

    // === CONFIGURACIÓN DE TESTING ===
    SKIP_AUTH_IN_TESTS: parseBooleanEnv(env.SKIP_AUTH_IN_TESTS, false),
  };
}

/**
 * Valida configuración crítica
 * @param {Object} config - Configuración a validar
 * @throws {Error} Si la configuración es inválida
 */
function validateCriticalConfig(config) {
  const errors = [];

  // En entorno de testing, usar valores por defecto si no están configurados
  if (config.NODE_ENV === 'test') {
    if (!config.SESSION_SECRET) {
      config.SESSION_SECRET = 'test-session-secret-for-testing-environment-only-32-chars';
    }
    if (!config.JWT_SECRET) {
      config.JWT_SECRET = 'test-jwt-secret-for-testing-environment-only-32-chars';
    }
  }

  // Validar secretos críticos
  if (!config.SESSION_SECRET) {
    errors.push('SESSION_SECRET es requerido');
  } else if (config.SESSION_SECRET.length < 32) {
    errors.push('SESSION_SECRET debe tener al menos 32 caracteres');
  }

  if (!config.JWT_SECRET) {
    errors.push('JWT_SECRET es requerido');
  } else if (config.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET debe tener al menos 32 caracteres');
  }

  // Validar puerto
  if (config.PORT < 1 || config.PORT > 65535) {
    errors.push('PORT debe estar entre 1 y 65535');
  }

  // Validar configuración de producción
  if (config.NODE_ENV === 'production') {
    if (config.CORS_ORIGIN === '*') {
      errors.push('CORS_ORIGIN no debería ser "*" en producción');
    }

    if (!config.COOKIE_SECURE) {
      errors.push('COOKIE_SECURE debería ser true en producción');
    }

    if (config.LOG_LEVEL === 'debug') {
      console.warn('⚠️  LOG_LEVEL "debug" no recomendado en producción');
    }
  }

  // Validar bcrypt rounds
  if (config.BCRYPT_ROUNDS < 10) {
    errors.push('BCRYPT_ROUNDS debe ser al menos 10');
  }

  // Validar rate limiting
  if (config.RATE_LIMIT_MAX_REQUESTS < 1) {
    errors.push('RATE_LIMIT_MAX_REQUESTS debe ser mayor a 0');
  }

  if (config.AUTH_RATE_LIMIT_MAX_REQUESTS < 1) {
    errors.push('AUTH_RATE_LIMIT_MAX_REQUESTS debe ser mayor a 0');
  }

  // Lanzar errores si los hay
  if (errors.length > 0) {
    throw new Error(`Errores de configuración:\n- ${errors.join('\n- ')}`);
  }
}

/**
 * Convierte string a boolean con valor por defecto
 * @param {string} value - Valor a convertir
 * @param {boolean} defaultValue - Valor por defecto
 * @returns {boolean}
 */
function parseBooleanEnv(value, defaultValue = false) {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const stringValue = value.toString().toLowerCase();
  return stringValue === 'true' || stringValue === '1' || stringValue === 'yes';
}

/**
 * Obtiene configuración específica por categoría
 * @param {string} category - Categoría de configuración
 * @returns {Object} Configuración filtrada
 */
export function getConfigCategory(category) {
  const config = configLoader();
  const prefix = category.toUpperCase() + '_';

  return Object.keys(config)
    .filter((key) => key.startsWith(prefix))
    .reduce((result, key) => {
      const newKey = key.replace(prefix, '').toLowerCase();
      result[newKey] = config[key];
      return result;
    }, {});
}

/**
 * Valida si una característica está habilitada
 * @param {string} featureName - Nombre de la característica
 * @returns {boolean}
 */
export function isFeatureEnabled(featureName) {
  const config = configLoader();
  const key = `FEATURE_${featureName.toUpperCase()}`;
  return config[key] || false;
}

/**
 * Obtiene configuración de SMTP
 * @returns {Object} Configuración de SMTP
 */
export function getSmtpConfig() {
  return getConfigCategory('SMTP');
}

/**
 * Limpia el cache de configuración (útil para testing)
 */
export function clearConfigCache() {
  configCache = null;
}

/**
 * Valida configuración específica para testing
 * @returns {boolean} true si la configuración es válida para tests
 */
export function validateTestConfig() {
  const config = configLoader();

  if (config.NODE_ENV !== 'test') {
    console.warn('⚠️  NODE_ENV no está configurado como "test"');
    return false;
  }

  return true;
}

/**
 * Exporta configuración para inspección
 * @param {boolean} includeSensitive - Incluir datos sensibles
 * @returns {Object} Configuración (con secretos censurados por defecto)
 */
export function exportConfig(includeSensitive = false) {
  const config = configLoader();

  if (includeSensitive) {
    return { ...config };
  }

  // Censurar datos sensibles
  const sensitiveKeys = ['SESSION_SECRET', 'JWT_SECRET', 'CSRF_SECRET', 'SMTP_PASS'];

  const safeConfig = { ...config };

  sensitiveKeys.forEach((key) => {
    if (safeConfig[key]) {
      safeConfig[key] = `${safeConfig[key].substring(0, 4)}****`;
    }
  });

  return safeConfig;
}

// Exportar configuración como default
export default configLoader;
