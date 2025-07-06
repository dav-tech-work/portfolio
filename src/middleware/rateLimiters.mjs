import rateLimit from 'express-rate-limit';
import config from '../config/index.mjs';
import { registrar } from '../utils/servicios/logger.mjs';
import { logger } from '../utils/logger-enhanced.mjs';

const staticExtensions = [
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
];

/**
 * Handler común para rate limiting
 */
const rateLimitHandler =
  (type = 'general') =>
  (req, _res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ruta = req.originalUrl || req.url;

    logger.warn(`Rate limit ${type} excedido para IP: ${ip} en ruta: ${ruta}`);
    registrar(`Rate limit ${type} excedido para IP: ${ip} en ruta: ${ruta}`, 'warn');

    const retryAfter = Math.ceil(config.RATE_LIMIT.WINDOW_MS / 1000);
    _res.set('Retry-After', retryAfter.toString());
    _res.status(429).json({
      error: 'Demasiadas solicitudes. Por favor, intenta más tarde.',
      retryAfter,
      type,
    });
  };

/**
 * Rate limiter general (para rutas públicas)
 */
export const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS, // 5 minutos
  max: config.RATE_LIMIT.MAX_REQUESTS, // 500 requests
  skip: (req, _res) => staticExtensions.some((ext) => req.path.endsWith(ext)),
  handler: rateLimitHandler('general'),
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter estricto (para endpoints sensibles como contacto)
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  handler: rateLimitHandler('strict'),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiados intentos. Espera 15 minutos antes de intentar nuevamente.',
    type: 'strict_limit',
  },
});

/**
 * Rate limiter para APIs (más restrictivo que general, menos que strict)
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests
  handler: rateLimitHandler('api'),
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para login/auth (muy restrictivo)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // máximo 3 intentos
  handler: rateLimitHandler('auth'),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar requests exitosos
  message: {
    error: 'Demasiados intentos de autenticación. Cuenta bloqueada temporalmente.',
    type: 'auth_limit',
  },
});

/**
 * Rate limiter para archivos estáticos (muy permisivo)
 */
export const staticLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 1000, // 1000 requests
  handler: rateLimitHandler('static'),
  standardHeaders: false,
  legacyHeaders: false,
});

// Exportar el limiter general como default para compatibilidad
export default generalLimiter;
