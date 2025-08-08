/**
 * Factory para configuración de Express
 * Centraliza la configuración para evitar duplicación de código
 */

import express from 'express';
import compression from 'compression';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import flash from 'connect-flash';
import path from 'path';

import {
  attachCSRFToken,
  verifyCSRFToken,
  isAuthenticated,
  errorHandler,
  rateLimiters,
  protecciones,
  sanitizer,
} from '../middleware/index.mjs';
import { authLimiter } from '../middleware/rateLimiters.mjs';
import { notFoundHandler } from '../middleware/errorHandler.mjs';

import cspMiddleware from '../middleware/csp.mjs';
import idioma from '../middleware/idioma.mjs';
import logger from '../middleware/logger.mjs';
import { formatDate, capitalize, truncate, isValidEmail } from '../utils/helpers.mjs';
import config from './index.mjs';

/**
 * Configuración base de Express
 */
export function createExpressApp(options = {}) {
  const {
    enableCSRF = true,
    enableAuth = true,
    enableSessions = true,
    enableCSP = true,
    enableCompression = true,
    enableRateLimit = true,
    isTestMode = false,
    customMiddleware = [],
    viewsPath = null,
    staticPath = null,
  } = options;

  const app = express();

  // Trust proxy si está configurado
  if (config.NODE_ENV === 'production' || options.trustProxy) {
    app.set('trust proxy', 1);
  }

  // ========================================
  // COMPRESIÓN
  // ========================================
  if (enableCompression) {
    app.use(
      compression({
        level: config.NODE_ENV === 'production' ? 6 : 1,
        threshold: 1024,
        filter: (req, res) => {
          if (req.headers['x-no-compression']) {
            return false;
          }
          return compression.filter(req, res);
        },
      })
    );
  }

  // ========================================
  // SESIONES
  // ========================================
  if (enableSessions) {
    const sessionConfig = {
      secret: config.SESSION_SECRET || 'default-secret-for-tests',
      name: 'sessionId',
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        secure: config.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: parseInt(config.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000,
        sameSite: config.COOKIE_SAME_SITE || 'strict',
      },
    };

    app.use(session(sessionConfig));
  }

  // ========================================
  // MIDDLEWARE DE IDIOMA
  // ========================================
  app.use(idioma);

  // ========================================
  // MIDDLEWARES DE SEGURIDAD
  // ========================================
  app.use(protecciones);

  if (enableCSP) {
    app.use(cspMiddleware);
  }

  if (enableSessions) {
    app.use(flash());
  }

  // Logging (deshabilitado en tests por defecto)
  if (!isTestMode) {
    app.use(logger);
  }

  if (enableRateLimit) {
    app.use(rateLimiters.general);
  }

  app.use(sanitizer);

  if (enableCSRF) {
    app.use(attachCSRFToken);
  }

  // ========================================
  // PARSEO DE DATOS
  // ========================================
  app.use(
    express.json({
      limit: config.MAX_REQUEST_SIZE || '1mb',
      type: ['application/json', 'application/*+json'],
    })
  );

  app.use(
    express.urlencoded({
      extended: true,
      limit: config.MAX_REQUEST_SIZE || '1mb',
      parameterLimit: 100,
    })
  );

  // ========================================
  // MOTOR DE PLANTILLAS
  // ========================================
  app.set('view engine', 'ejs');
  app.set('views', viewsPath || path.join(process.cwd(), 'views'));
  app.set('layout', 'layout');

  // Optimizaciones para EJS
  app.set('view cache', config.NODE_ENV === 'production');
  app.set('view options', {
    rmWhitespace: config.NODE_ENV === 'production',
  });

  app.use(expressLayouts);

  // ========================================
  // HELPERS GLOBALES
  // ========================================
  const helpers = {
    formatDate,
    capitalize,
    truncate,
    isValidEmail,
    isProduction: config.NODE_ENV === 'production',
    isDevelopment: config.NODE_ENV === 'development',
    currentYear: new Date().getFullYear(),
    appVersion: config.APP_VERSION || '1.0.0',
  };

  Object.assign(app.locals, helpers);

  // ========================================
  // ARCHIVOS ESTÁTICOS
  // ========================================
  const staticOptions = {
    maxAge: config.NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      }

      if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  };

  app.use(express.static(staticPath || path.join(process.cwd(), 'public'), staticOptions));

  // ========================================
  // MIDDLEWARE DE AUTENTICACIÓN
  // ========================================
  if (enableAuth) {
    app.use(isAuthenticated);
  }

  // ========================================
  // MIDDLEWARE PERSONALIZADO
  // ========================================
  customMiddleware.forEach((middleware) => {
    app.use(middleware);
  });

  return app;
}

/**
 * Configuración específica para tests
 */
export function createTestApp(options = {}) {
  return createExpressApp({
    enableCSRF: false,
    enableAuth: false,
    enableCSP: false,
    enableRateLimit: false,
    isTestMode: true,
    ...options,
  });
}

/**
 * Configuración específica para debugging
 */
export function createDebugApp(options = {}) {
  return createExpressApp({
    enableRateLimit: false,
    isTestMode: true,
    ...options,
  });
}

/**
 * Agregar rutas comunes a la aplicación
 */
export function addCommonRoutes(app, routes = {}) {
  const {
    indexRouter,
    authRouter,
    formacionRouter,
    apiEmailRouter,
    apiContactoRouter,
    testRouter,
  } = routes;

  if (indexRouter) {
    app.use('/', indexRouter);
  }

  if (authRouter) {
    app.use('/auth', authLimiter, authRouter);
  }

  if (formacionRouter) {
    app.use('/formacion', formacionRouter);
  }

  if (apiEmailRouter) {
    app.use('/api', apiEmailRouter);
  }

  if (apiContactoRouter) {
    app.use('/api', apiContactoRouter);
  }

  if (testRouter) {
    app.use('/test', testRouter);
  }

  // Aplicar verificación CSRF específicamente a rutas que lo necesitan
  app.use(['/auth/login', '/auth/register'], verifyCSRFToken);

  // Ruta de salud del sistema
  app.get('/health', (req, res) => {
    const healthCheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now(),
      env: config.NODE_ENV,
      memory: process.memoryUsage(),
      pid: process.pid,
    };

    res.status(200).json(healthCheck);
  });

  // Ruta de métricas (disponible en desarrollo y testing)
  if (config.NODE_ENV === 'development' || config.NODE_ENV === 'test') {
    app.get('/metrics', (req, res) => {
      const metrics = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        env: process.env.NODE_ENV,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      };

      res.json(metrics);
    });
  }

  // Manejo de errores
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
