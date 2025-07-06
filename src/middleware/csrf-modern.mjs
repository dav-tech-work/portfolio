import crypto from 'crypto';
import { registrar } from '../utils/servicios/logger.mjs';

/**
 * Middleware personalizado para protección CSRF
 * Reemplaza csurf que está desactualizado
 */

/**
 * Genera un token CSRF criptográficamente seguro
 * @returns {string} Token CSRF en formato hexadecimal
 */
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verifica si dos tokens CSRF coinciden usando comparación timing-safe
 * @param {string} sessionToken - Token almacenado en la sesión
 * @param {string} requestToken - Token enviado en el request
 * @returns {boolean} True si los tokens coinciden
 */
function validateCSRFToken(sessionToken, requestToken) {
  if (!sessionToken || !requestToken) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(sessionToken, 'hex'), Buffer.from(requestToken, 'hex'));
}

/**
 * Middleware para generar y adjuntar token CSRF a la sesión y vistas
 * @param {Object} req - Request object de Express
 * @param {Object} res - Response object de Express
 * @param {Function} next - Next middleware function
 */
export function attachCSRFToken(req, res, next) {
  // Generar token si no existe en la sesión
  if (!req.session?.csrfToken) {
    if (!req.session) {
      req.session = {};
    }
    req.session.csrfToken = generateCSRFToken();
  }

  // Hacer el token disponible en las vistas
  res.locals.csrfToken = req.session.csrfToken;

  // Asegurar que req.csrfToken siempre exista como función
  req.csrfToken = function () {
    // En entorno de test, devolver un token dummy si no hay sesión
    if (process.env.NODE_ENV === 'test') {
      return req.session?.csrfToken || 'test-csrf-token';
    }
    return req.session?.csrfToken;
  };

  next();
}

/**
 * Middleware para verificar token CSRF en requests de modificación
 * @param {Object} req - Request object de Express
 * @param {Object} res - Response object de Express
 * @param {Function} next - Next middleware function
 */
export function verifyCSRFToken(req, res, next) {
  // Métodos que requieren verificación CSRF
  const methodsToCheck = ['POST', 'PUT', 'DELETE', 'PATCH'];

  if (!methodsToCheck.includes(req.method)) {
    return next();
  }

  const sessionToken = req.session?.csrfToken;
  const requestToken = req.body._csrf || req.headers['x-csrf-token'];

  if (!validateCSRFToken(sessionToken, requestToken)) {
    registrar(`Intento de CSRF detectado desde IP: ${req.ip} en ruta: ${req.originalUrl}`, 'warn');
    return res.status(403).json({
      error: 'Token CSRF inválido',
      code: 'CSRF_INVALID',
    });
  }

  next();
}

// Middleware combinado para rutas que necesitan ambos
export default function csrfProtection(req, res, next) {
  attachCSRFToken(req, res, (err) => {
    if (err) return next(err);
    verifyCSRFToken(req, res, next);
  });
}
