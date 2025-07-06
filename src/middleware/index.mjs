import { attachCSRFToken, verifyCSRFToken } from './csrf-modern.mjs';
import idioma from './idioma.mjs';
import logger from './logger.mjs';
import limiter from './limiter.mjs';
import protecciones from './protecciones.mjs';
import sanitizer from './sanitizer.mjs';
import botDetection from './botDetection.mjs';
import {
  isAuthenticated,
  verifyToken,
  requireRole,
  generateToken,
  hashPassword,
  verifyPassword,
  requireAuth,
  redirectIfAuthenticated,
} from './auth.mjs';
import { errorHandler, notFoundHandler } from './errorHandler.mjs';
import {
  sanitizeInput,
  validateAndSanitizeEmail,
  validateAndSanitizeName,
  validateAndSanitizeMessage,
} from './sanitizer-advanced.mjs';
import {
  generalLimiter,
  strictLimiter,
  apiLimiter,
  authLimiter,
  staticLimiter,
} from './rateLimiters.mjs';

export {
  attachCSRFToken,
  verifyCSRFToken,
  idioma,
  logger,
  limiter,
  protecciones,
  sanitizer,
  botDetection,
  isAuthenticated,
  verifyToken,
  requireRole,
  generateToken,
  hashPassword,
  verifyPassword,
  requireAuth,
  redirectIfAuthenticated,
  errorHandler,
  notFoundHandler,
  sanitizeInput,
  validateAndSanitizeEmail,
  validateAndSanitizeName,
  validateAndSanitizeMessage,
  generalLimiter,
  strictLimiter,
  apiLimiter,
  authLimiter,
  staticLimiter,
};
