import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar variables de entorno
dotenv.config({ path: './config.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de rutas
const PATHS = {
  ROOT: path.resolve(__dirname, '../../'),
  LOGS: path.resolve(__dirname, '../../logs'),
  UPLOADS: path.resolve(__dirname, '../../uploads'),
  TEMP: path.resolve(__dirname, '../../temp'),
  DATA: path.resolve(__dirname, '../../data'),
  IDIOMAS: path.resolve(__dirname, '../../data/idiomas'),
};

// Configuración de rate limiting
const RATE_LIMIT = {
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutos
  MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
};

// Configuración de logging
const LOG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  MAX_SIZE: parseInt(process.env.LOG_MAX_SIZE) || 10485760, // 10MB
  MAX_FILES: parseInt(process.env.LOG_MAX_FILES) || 5,
};

// Configuración de seguridad
const SECURITY = {
  SESSION_SECRET: process.env.SESSION_SECRET || 'fallback_secret_change_in_production',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_jwt_secret_change_in_production',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  TOKEN_EXPIRES_IN: process.env.TOKEN_EXPIRES_IN || '24h',
};

// Configuración de CORS
const CORS = {
  ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  CREDENTIALS: true,
};

// Configuración de CSP (Content Security Policy)
const CSP = (_nonce = '') => {
  const baseCSP = [
    "default-src 'none'",
    `script-src 'self' 'nonce-${_nonce}' 'wasm-unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://*.dav-tech.work https://*.cloudflare.com`,
    `style-src 'self' 'nonce-${_nonce}' https://fonts.googleapis.com https://cdnjs.cloudflare.com`,
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://formspree.io https://api.emailjs.com",
    "frame-ancestors 'none'",
    "worker-src 'self'",
    "manifest-src 'self'",
  ];

  return baseCSP.join('; ');
};

// Configuración del servidor
const SERVER = {
  PORT: parseInt(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.HOST || 'localhost',
};

// Configuración de idiomas
const IDIOMAS = {
  DEFAULT: 'es',
  SUPPORTED: ['es', 'en', 'cat', 'pt-br', 'zh-cn'],
  ALIAS: {
    ca: 'cat',
    pt: 'pt-br',
    zh: 'zh-cn',
  },
};

// Configuración de límites para sanitización y validaciones
const LIMITS = {
  JSON_FIELD_LENGTH: 1000,
  JSON_ARRAY_SIZE: 100,
  JSON_MAX_PROPERTIES: 50,
};

// Configuración de dominios bloqueados
const BLACKLISTED_DOMAINS = ['evil.com', 'malware.org', 'phishing.com', 'scam.net'];

// Configuración de Email
const EMAIL = {
  USER: process.env.EMAIL_USER || 'dav.tech.work@gmail.com',
  PASS: process.env.EMAIL_PASS || '',
  FROM: process.env.EMAIL_FROM || 'dav.tech.work@gmail.com',
  ADMIN: process.env.EMAIL_ADMIN || 'dav.tech.work@gmail.com',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  ENABLED: process.env.EMAIL_ENABLED === 'true' || process.env.NODE_ENV === 'production',
};

export default {
  PATHS,
  RATE_LIMIT,
  LOG,
  SECURITY,
  CORS,
  CSP,
  SERVER,
  IDIOMAS,
  LIMITS,
  BLACKLISTED_DOMAINS,
  EMAIL,
};
