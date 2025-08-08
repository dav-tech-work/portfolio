#!/usr/bin/env node

/**
 * Aplicación Web Segura - Servidor Principal Optimizado
 * @author Daniel Arribas Velazquez
 * @version 2.0.0
 * @description Servidor Express con seguridad avanzada y optimizaciones de rendimiento
 */

// ========================================
// 1. CONFIGURACIÓN INICIAL Y VALIDACIÓN
// ========================================

import { fileURLToPath } from 'url';
import path from 'path';
import cluster from 'cluster';
import os from 'os';
import dotenv from 'dotenv';
dotenv.config();

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar y validar configuración de entorno
import { configLoader } from './src/config/environment.mjs';
const config = configLoader();

// ========================================
// 2. DEPENDENCIAS PRINCIPALES
// ========================================

import express from 'express';
import compression from 'compression';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import flash from 'connect-flash';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';

// ========================================
// 3. MIDDLEWARES DE SEGURIDAD
// ========================================

// Importar los nuevos middlewares de seguridad mejorados
import {
  attachCSRFToken,
  verifyCSRFToken,
  isAuthenticated,
  errorHandler,
} from './src/middleware/index.mjs';

// Importar middlewares específicos que no están en el nuevo index
import idioma from './src/middleware/idioma.mjs';
import { default as requestLogger } from './src/middleware/logger.mjs';
import {
  generalLimiter as limiter,
  authLimiter,
  apiLimiter,
} from './src/middleware/rateLimiters.mjs';
import protecciones from './src/middleware/protecciones.mjs';
import { sanitizeRequest } from './src/middleware/sanitizer-advanced.mjs';
import sriMiddleware, { sriSecurityHeaders } from './src/middleware/sri.mjs';
import privacyMiddleware, { trackingDetectionMiddleware } from './src/middleware/privacy.mjs';
import { notFoundHandler } from './src/middleware/errorHandler.mjs';
import cspMiddleware, { contactoCSP } from './src/middleware/csp.mjs';

// ========================================
// 4. RUTAS Y UTILIDADES
// ========================================

import indexRouter from './src/routes/index.mjs';
import authRouter from './src/routes/auth.mjs';
import formacionRouter from './src/routes/formacion.mjs';
import apiEmailRouter from './src/routes/api/email.mjs';
import apiContactoRouter from './src/routes/api/contacto.mjs';
import metricsRouter from './src/routes/metrics.mjs';
import testRouter from './src/routes/test.mjs';
import { formatDate, capitalize, truncate, isValidEmail } from './src/utils/helpers.mjs';
import logger from './src/utils/logger-production.mjs';
import { validateConfiguration } from './src/utils/validation/config-validator.mjs';

// ========================================
// 5. FUNCIONES AUXILIARES (GLOBALES)
// ========================================

function gracefulShutdown(signal) {
  logger.warn(`Recibida señal ${signal}. Cerrando servidor gracefully...`);

  if (server) {
    server.close((err) => {
      if (err) {
        logger.error('Error al cerrar servidor', { error: err.message, stack: err.stack });
        process.exit(1);
      }

      logger.success('Servidor cerrado correctamente');
      process.exit(0);
    });

    // Forzar cierre después de 10 segundos
    setTimeout(() => {
      logger.error('Forzando cierre del servidor - timeout alcanzado');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

// ========================================
// 6. CONFIGURACIÓN DE CLUSTERING (PRODUCCIÓN)
// ========================================

// Función para manejar el clustering
function setupClustering() {
  if (config.NODE_ENV === 'production' && config.ENABLE_CLUSTERING && cluster.isPrimary) {
    const numCPUs = Math.min(os.cpus().length, 4); // Máximo 4 workers

    logger.info(`Iniciando ${numCPUs} workers...`);

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, _code, _signal) => {
      logger.warn(`Worker ${worker.process.pid} murió. Reiniciando...`);
      cluster.fork();
    });

    // El proceso principal NO debe iniciar el servidor
    return true; // Indicar que es el proceso principal
  }
  return false; // Indicar que es un worker o proceso único
}

// ========================================
// 7. MANEJO GLOBAL DE ERRORES
// ========================================

// Configurar manejo de errores no capturados
process.on('uncaughtException', (err) => {
  logger.error('Excepción no controlada', { error: err.message, stack: err.stack });

  // En producción, cerrar gracefully
  if (config.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no gestionada', {
    reason: reason.toString(),
    promise: promise.toString(),
  });

  // En producción, cerrar gracefully
  if (config.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Manejo graceful de señales del sistema
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ========================================
// 8. INICIALIZACIÓN DE APLICACIÓN
// ========================================

const app = express();

// Ejecutar clustering
const isPrimaryProcess = setupClustering();

// Solo continuar con la inicialización si NO es el proceso principal
if (!isPrimaryProcess) {
  // Configurar confianza en proxies (para balanceadores de carga)
  if (config.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // ========================================
  // 9. MIDDLEWARES DE RENDIMIENTO
  // ========================================

  // Compresión gzip/deflate
  app.use(
    compression({
      level: config.NODE_ENV === 'production' ? 6 : 1,
      threshold: 1024, // Solo comprimir archivos > 1KB
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
    })
  );

  // ========================================
  // 10. CONFIGURACIÓN DE SESIONES OPTIMIZADA
  // ========================================

  const sessionConfig = {
    secret: config.SESSION_SECRET,
    name: 'sessionId', // Cambiar nombre por defecto por seguridad
    resave: false,
    saveUninitialized: false,
    rolling: true, // Renovar sesión en cada request
    cookie: {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: parseInt(config.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 horas
      sameSite: config.COOKIE_SAME_SITE || 'strict',
    },
  };

  // En producción, usar configuración de sesión mejorada
  if (config.NODE_ENV === 'production') {
    // Configuración adicional para producción
    sessionConfig.cookie.secure = true; // Forzar HTTPS en producción
    logger.security('Configuración de sesión optimizada para producción');
  }

  app.use(session(sessionConfig));

  // ========================================
  // 11. MIDDLEWARE DE IDIOMA
  // ========================================

  app.use(idioma);

  // ========================================
  // 11. MIDDLEWARES DE SEGURIDAD
  // ========================================

  // Helmet - Headers de seguridad mejorados
  app.use(
    helmet({
      contentSecurityPolicy: false, // Deshabilitamos CSP de Helmet para usar nuestro middleware personalizado
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      // Agregar headers adicionales de seguridad
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
      originAgentCluster: true,
      referrerPolicy: { policy: 'no-referrer-when-downgrade' },
      // Deshabilitar X-XSS-Protection (deprecado)
      xssFilter: false,
    })
  );

  // CORS - Cross-Origin Resource Sharing
  app.use(
    cors({
      origin: config.ALLOWED_ORIGINS || config.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // HPP - HTTP Parameter Pollution Protection
  app.use(hpp());

  // Protecciones de seguridad
  app.use(protecciones);

  // Content Security Policy mejorado (excluyendo contacto y API)
  app.use((req, res, next) => {
    if (
      req.path === '/contacto' ||
      req.path.startsWith('/api/') ||
      req.path.startsWith('/metrics') ||
      req.path.startsWith('/health')
    ) {
      return next(); // Saltar CSP general para contacto, API y health
    }
    return cspMiddleware(req, res, next);
  });

  // Subresource Integrity (SRI)
  app.use(sriMiddleware);
  app.use(sriSecurityHeaders);

  // Middleware de privacidad
  app.use(privacyMiddleware);
  app.use(trackingDetectionMiddleware);

  // Flash messages
  app.use(flash());

  // Logging de requests
  app.use(requestLogger);

  // Rate limiting general (excluyendo rutas de API)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next(); // Saltar rate limiting general para rutas de API
    }
    return limiter(req, res, next);
  });

  // Sanitización de datos (excluyendo rutas de API)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/') || req.skipGlobalMiddleware) {
      return next(); // Saltar sanitización para rutas de API
    }
    return sanitizeRequest(req, res, next);
  });

  // Tokens CSRF (excluyendo rutas de API)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next(); // Saltar CSRF para rutas de API
    }
    return attachCSRFToken(req, res, next);
  });

  // ========================================
  // 12. PARSEO DE DATOS
  // ========================================

  // Configurar límites más conservadores y realistas
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
      parameterLimit: 100, // Limitar número de parámetros
    })
  );

  // ========================================
  // 13. MOTOR DE PLANTILLAS OPTIMIZADO
  // ========================================

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.set('layout', 'layout');

  // Optimizaciones para EJS
  app.set('view cache', config.NODE_ENV === 'production');
  app.set('view options', {
    rmWhitespace: config.NODE_ENV === 'production',
  });

  app.use(expressLayouts);

  // ========================================
  // 14. HELPERS GLOBALES OPTIMIZADOS
  // ========================================

  // Cachear helpers para mejor rendimiento
  const helpers = {
    formatDate,
    capitalize,
    truncate,
    isValidEmail,
    // Helpers adicionales
    isProduction: config.NODE_ENV === 'production',
    isDevelopment: config.NODE_ENV === 'development',
    currentYear: new Date().getFullYear(),
    appVersion: config.APP_VERSION || '1.0.0',
  };

  Object.assign(app.locals, helpers);

  // ========================================
  // 15. ARCHIVOS ESTÁTICOS OPTIMIZADOS
  // ========================================

  const staticOptions = {
    maxAge: config.NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Headers específicos por tipo de archivo
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (path.endsWith('.py')) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      } else if (path.endsWith('.sql')) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      } else if (path.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      } else if (path.endsWith('.txt')) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      }

      // Headers de cache agresivo para assets con hash
      if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  };

  // Servir /public/assets como /assets
  app.use('/assets', express.static(path.join(__dirname, 'public', 'assets'), staticOptions));

  // Servir el resto de /public normalmente
  app.use(express.static(path.join(__dirname, 'public'), staticOptions));

  // ========================================
  // 16. MIDDLEWARE DE AUTENTICACIÓN
  // ========================================

  app.use(isAuthenticated);

  // ========================================
  // 17. CONFIGURACIÓN DE RUTAS
  // ========================================

  // CSP específico para la página de contacto (permite onclick)
  app.use('/contacto', contactoCSP);

  // Rutas de API (deben ir antes que las rutas principales)
  app.use('/api', apiLimiter, apiEmailRouter);
  app.use('/metrics', metricsRouter);
  app.use('/test', testRouter);

  // Registrar router de contacto
  app.use('/api/contacto', apiLimiter, apiContactoRouter);

  // Endpoint de prueba que registra el router de manera simple
  app.get('/api/contacto-simple', async (req, res) => {
    try {
      const contactoRouter = await import('./src/routes/api/contacto.mjs');
      // Registrar el router de manera simple
      app.use('/api/contacto-simple', contactoRouter.default);
      res.json({
        success: true,
        message: 'Router registrado de manera simple',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.json({
        success: false,
        message: 'Error registrando router',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Rutas de autenticación con rate limiting específico
  app.use('/auth', authLimiter, authRouter);

  // Rutas de formación
  app.use('/formacion', formacionRouter);

  // Rutas principales (deben ir al final)
  app.use('/', indexRouter);

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

  // ========================================
  // 18. MANEJO DE ERRORES
  // ========================================

  // Middleware para rutas no encontradas
  app.use(notFoundHandler);

  // Middleware global de manejo de errores
  app.use(errorHandler);
} // Cierre del bloque if (!isPrimaryProcess)

// ========================================
// 19. INICIALIZACIÓN DEL SERVIDOR
// ========================================

let server;

async function startServer() {
  try {
    // console.log('🔍 [DEBUG] Iniciando startServer()...');

    // Validar configuración crítica antes de iniciar
    // console.log('🔍 [DEBUG] Llamando a validateConfiguration()...');
    await validateConfiguration(config);
    // console.log('✅ [DEBUG] validateConfiguration() completado');

    // Iniciar servidor
    // console.log('🔍 [DEBUG] Llamando a app.listen() en puerto:', config.PORT);
    server = app.listen(config.PORT, () => {
      // console.log('🚀 [DEBUG] Callback de app.listen() ejecutado');
      logger.app('=====================================');
      logger.success('Servidor iniciado exitosamente');
      logger.info(`URL: http://localhost:${config.PORT}`);
      logger.info(`Entorno: ${config.NODE_ENV}`);
      logger.security('Seguridad: Activada');
      logger.info(`Compresión: ${config.NODE_ENV === 'production' ? 'Activada' : 'Básica'}`);
      logger.info(`PID: ${process.pid}`);

      if (config.NODE_ENV === 'production') {
        logger.info(`Clustering: ${config.ENABLE_CLUSTERING ? 'Activado' : 'Desactivado'}`);
      }

      logger.app('=====================================');
      // console.log('✅ [DEBUG] Servidor iniciado exitosamente en puerto:', config.PORT);
    });

    // console.log('🔍 [DEBUG] app.listen() llamado, configurando timeout...');
    // Configurar timeout del servidor
    server.timeout = 30000; // 30 segundos

    // Manejo de errores del servidor
    server.on('error', (error) => {
      console.error('❌ [DEBUG] Error en servidor:', error);
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind =
        typeof config.PORT === 'string' ? 'Pipe ' + config.PORT : 'Puerto ' + config.PORT;

      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requiere privilegios elevados`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} ya está en uso`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // console.log('✅ [DEBUG] startServer() completado exitosamente');
  } catch (error) {
    console.error('❌ [DEBUG] Error en startServer():', error);
    logger.error('Error al iniciar el servidor', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// ========================================
// 20. INICIAR APLICACIÓN
// ========================================

// ========================================
// 20.1 DEPURACIÓN DE ARRANQUE
// ========================================
logger.info('Depuración de arranque:');
logger.info('isPrimaryProcess: ' + isPrimaryProcess);
logger.info('import.meta.url: ' + import.meta.url);
logger.info('process.argv[1]: ' + process.argv[1]);

// console.log('Depuración de arranque:');
// console.log('isPrimaryProcess:', isPrimaryProcess);
// console.log('import.meta.url:', import.meta.url);
// console.log('process.argv[1]:', process.argv[1]);

if (!isPrimaryProcess && import.meta.url && process.argv[1]) {
  const currentFile = import.meta.url.replace('file:///', '').replace(/%20/g, ' ');
  const executedFile = process.argv[1].replace(/\\/g, '/');
  logger.info('currentFile: ' + currentFile);
  logger.info('executedFile: ' + executedFile);
  logger.info(
    'Comparando currentFile.includes(executedFile): ' + currentFile.includes(executedFile)
  );
  logger.info(
    'Comparando executedFile.includes(currentFile.split("/").pop()): ' +
      executedFile.includes(currentFile.split('/').pop())
  );

  // console.log('currentFile:', currentFile);
  // console.log('executedFile:', executedFile);
  // console.log('Comparando currentFile.includes(executedFile):', currentFile.includes(executedFile));
  // console.log(
  //   'Comparando executedFile.includes(currentFile.split("/").pop()):',
  //   executedFile.includes(currentFile.split('/').pop())
  // );

  if (currentFile.includes(executedFile) || executedFile.includes(currentFile.split('/').pop())) {
    logger.info('Entrando en startServer() por condición principal');
    // console.log('Entrando en startServer() por condición principal');
    startServer().catch((error) => {
      logger.error('Error fatal al iniciar', { error: error.message, stack: error.stack });
      console.error('Error fatal al iniciar', error);
      process.exit(1);
    });
  } else {
    logger.warn('No se cumple la condición principal para iniciar el servidor');
    console.warn('No se cumple la condición principal para iniciar el servidor');
  }
} else if (!isPrimaryProcess) {
  logger.info('Entrando en startServer() por modo fallback');
  // console.log('Entrando en startServer() por modo fallback');
  startServer().catch((error) => {
    logger.error('Error fatal al iniciar', { error: error.message, stack: error.stack });
    console.error('Error fatal al iniciar', error);
    process.exit(1);
  });
} else {
  logger.warn('No se inicia el servidor porque es el proceso principal de clustering');
  console.warn('No se inicia el servidor porque es el proceso principal de clustering');
}

// Exportar app para testing
export default app;
export { config, startServer, gracefulShutdown };
