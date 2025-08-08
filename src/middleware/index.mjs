/**
 * Middleware Principal - Integración de Mejoras de Seguridad Avanzadas
 * Combina rate limiting inteligente, validación multicapa y JWT avanzado
 */

// Middlewares existentes - importaciones directas para evitar problemas de exportación
import { attachCSRFToken, verifyCSRFToken } from './csrf-modern.mjs';
import { isAuthenticated } from './auth.mjs';
import { errorHandler } from './errorHandler.mjs';

// Nuevos middlewares mejorados
import IntelligentRateLimiter, { rateLimiters } from './intelligent-rate-limiter.mjs';
import advancedValidator, { userValidation, apiValidation } from './advanced-validator.mjs';
import jwtManager from '../utils/auth/jwt-manager.mjs';

// Middlewares adicionales para compatibilidad con tests
import proteccionesMiddleware from './protecciones.mjs';
import sanitizerMiddleware from './sanitizer.mjs';
import botDetectionMiddleware from './botDetection.mjs';

// Exportar todo
export {
  attachCSRFToken,
  verifyCSRFToken,
  isAuthenticated,
  errorHandler,
  IntelligentRateLimiter,
  rateLimiters,
  advancedValidator,
  userValidation,
  apiValidation,
  jwtManager,
  // Exportaciones para compatibilidad con tests
  proteccionesMiddleware as protecciones,
  sanitizerMiddleware as sanitizer,
  botDetectionMiddleware as botDetection,
};

/**
 * Stack de middlewares de seguridad completo
 */
export function createSecurityStack(options = {}) {
  const stack = [];

  // 1. Rate Limiting Inteligente (primera línea de defensa)
  if (options.rateLimiting !== false) {
    const limiterType = options.limiterType || 'general';
    stack.push(rateLimiters[limiterType]);
  }

  // 2. Validación Avanzada (sanitización automática)
  if (options.validation !== false) {
    stack.push(advancedValidator.preSanitizationMiddleware());
    stack.push(advancedValidator.loggingMiddleware());
  }

  // 3. Autenticación JWT (si se requiere)
  if (options.requireAuth) {
    stack.push(jwtManager.authenticationMiddleware());
  }

  // 4. CSRF Protection (para forms)
  if (options.csrf) {
    stack.push(attachCSRFToken);
    stack.push(verifyCSRFToken);
  }

  return stack;
}

/**
 * Configuraciones predefinidas de seguridad
 */
export const securityPresets = {
  // Para endpoints públicos (como home, about, etc.)
  public: createSecurityStack({
    rateLimiting: true,
    limiterType: 'general',
    validation: true,
    requireAuth: false,
    csrf: false,
  }),

  // Para APIs públicas
  api: createSecurityStack({
    rateLimiting: true,
    limiterType: 'api',
    validation: true,
    requireAuth: false,
    csrf: false,
  }),

  // Para endpoints de autenticación
  auth: createSecurityStack({
    rateLimiting: true,
    limiterType: 'auth',
    validation: true,
    requireAuth: false,
    csrf: true,
  }),

  // Para endpoints protegidos
  protected: createSecurityStack({
    rateLimiting: true,
    limiterType: 'general',
    validation: true,
    requireAuth: true,
    csrf: false,
  }),

  // Para endpoints administrativos
  admin: createSecurityStack({
    rateLimiting: true,
    limiterType: 'strict',
    validation: true,
    requireAuth: true,
    csrf: true,
  }),
};

/**
 * Middleware para endpoints de refresh token
 */
export const refreshTokenMiddleware = [
  rateLimiters.auth,
  advancedValidator.preSanitizationMiddleware(),
  async (req, res, _next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Refresh token required',
          type: 'missing_refresh_token',
        });
      }

      const tokens = await jwtManager.refreshAccessToken(refreshToken, req);

      res.json({
        success: true,
        ...tokens,
      });
    } catch (error) {
      if (error.message.includes('theft') || error.message.includes('suspicious')) {
        return res.status(403).json({
          error: error.message,
          type: 'security_violation',
        });
      }

      return res.status(401).json({
        error: error.message,
        type: 'refresh_failed',
      });
    }
  },
];

/**
 * Middleware para logout
 */
export const logoutMiddleware = [
  rateLimiters.general,
  jwtManager.authenticationMiddleware(),
  async (req, res, _next) => {
    try {
      const { refreshToken } = req.body;
      const userId = req.userId;

      await jwtManager.logout(refreshToken, userId);

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch {
      return res.status(500).json({
        error: 'Logout failed',
        type: 'logout_error',
      });
    }
  },
];

/**
 * Middleware para obtener sesiones activas
 */
export const getSessionsMiddleware = [
  rateLimiters.general,
  jwtManager.authenticationMiddleware(),
  async (req, res, _next) => {
    try {
      const userId = req.userId;
      const sessions = await jwtManager.getUserActiveSessions(userId);

      res.json({
        success: true,
        sessions: sessions,
      });
    } catch {
      return res.status(500).json({
        error: 'Failed to get sessions',
        type: 'sessions_error',
      });
    }
  },
];

/**
 * Middleware para estadísticas de seguridad (solo admin)
 */
export const securityStatsMiddleware = [
  rateLimiters.strict,
  jwtManager.authenticationMiddleware(),
  async (req, res, _next) => {
    // Verificar permisos de admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required',
      });
    }

    try {
      const [tokenStats, rateLimiterStats] = await Promise.all([
        jwtManager.getTokenStats(),
        // Obtener stats del rate limiter si está disponible
        rateLimiters.general.getStats ? rateLimiters.general.getStats() : {},
      ]);

      res.json({
        success: true,
        stats: {
          tokens: tokenStats,
          rateLimiting: rateLimiterStats,
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      return res.status(500).json({
        error: 'Failed to get security stats',
        type: 'stats_error',
      });
    }
  },
];

export default {
  securityPresets,
  createSecurityStack,
  refreshTokenMiddleware,
  logoutMiddleware,
  getSessionsMiddleware,
  securityStatsMiddleware,
};
