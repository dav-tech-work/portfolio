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
import { configLoader } from '../src/config/environment.mjs';
const config = configLoader();

// ========================================
// 2. DEPENDENCIAS PRINCIPALES
// ========================================

import express from 'express';
import compression from 'compression';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import flash from 'connect-flash';
import MongoStore from 'connect-mongo';

// ========================================
// 3. MIDDLEWARES DE SEGURIDAD
// ========================================

import {
  attachCSRFToken,
  verifyCSRFToken,
  isAuthenticated,
  errorHandler,
  notFoundHandler,
  idioma,
  logger as requestLogger,
  limiter,
  protecciones,
  sanitizer,
  authLimiter,
} from '../src/middleware/index.mjs';
import cspMiddleware from '../src/middleware/csp.mjs';

// ========================================
// 4. RUTAS Y UTILIDADES
// ========================================

import indexRouter from '../src/routes/index.mjs';
import authRouter from '../src/routes/auth.mjs';
import formacionRouter from '../src/routes/formacion.mjs';
import apiEmailRouter from '../src/routes/api/email.mjs';
import apiContactoRouter from '../src/routes/api/contacto.mjs';
import testRouter from '../src/routes/test.mjs';
import { formatDate, capitalize, truncate, isValidEmail } from '../src/utils/helpers.mjs';
import logger from '../src/utils/logger-production.mjs';
import { validateConfiguration } from '../src/utils/validation/config-validator.mjs';

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

  // En producción, usar store de sesiones distribuido
  if (config.NODE_ENV === 'production') {
    // Configurar MongoDB session store
    sessionConfig.store = MongoStore.create({
      mongoUrl: config.DB_URI || 'mongodb://localhost:27017/estructura_base',
      touchAfter: 24 * 3600, // lazy session update
      crypto: {
        secret: config.SESSION_SECRET,
      },
    });
    logger.security('Session store configurado con MongoDB');
  }

  app.use(session(sessionConfig));

  // ========================================
  // 11. MIDDLEWARE DE IDIOMA
  // ========================================

  app.use(idioma);

  // ========================================
  // 11. MIDDLEWARES DE SEGURIDAD
  // ========================================

  // Protecciones de seguridad
  app.use(protecciones);

  // Content Security Policy
  app.use(cspMiddleware);

  // Flash messages
  app.use(flash());

  // Logging de requests
  app.use(requestLogger);

  // Rate limiting general
  app.use(limiter);

  // Sanitización de datos
  app.use(sanitizer);

  // Tokens CSRF
  app.use(attachCSRFToken);

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
  app.set('views', path.join(__dirname, '../views'));
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
      }

      // Headers de cache agresivo para assets con hash
      if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  };

  app.use(express.static(path.join(__dirname, '../public'), staticOptions));

  // ========================================
  // 16. MIDDLEWARE DE AUTENTICACIÓN
  // ========================================

  app.use(isAuthenticated);

  // ========================================
  // 17. CONFIGURACIÓN DE RUTAS
  // ========================================

  // Rutas principales
  app.use('/', indexRouter);

  // Rutas de autenticación con rate limiting específico
  app.use('/auth', authLimiter, authRouter);

  // Rutas de formación
  app.use('/formacion', formacionRouter);

  // Rutas de API
  app.use('/api', apiEmailRouter);
  app.use('/api', apiContactoRouter);
  app.use('/test', testRouter);

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
    console.log('🔍 [DEBUG] Iniciando startServer()...');

    // Validar configuración crítica antes de iniciar
    console.log('🔍 [DEBUG] Llamando a validateConfiguration()...');
    await validateConfiguration(config);
    console.log('✅ [DEBUG] validateConfiguration() completado');

    // Iniciar servidor
    console.log('🔍 [DEBUG] Llamando a app.listen() en puerto:', config.PORT);
    server = app.listen(config.PORT, () => {
      console.log('🚀 [DEBUG] Callback de app.listen() ejecutado');
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
      console.log('✅ [DEBUG] Servidor iniciado exitosamente en puerto:', config.PORT);
    });

    console.log('🔍 [DEBUG] app.listen() llamado, configurando timeout...');
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

    console.log('✅ [DEBUG] startServer() completado exitosamente');
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
console.log('Depuración de arranque:');
console.log('isPrimaryProcess:', isPrimaryProcess);
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);

if (!isPrimaryProcess && import.meta.url && process.argv[1]) {
  const currentFile = import.meta.url.replace('file:///', '').replace(/%20/g, ' ');
  const executedFile = process.argv[1].replace(/\\/g, '/');
  console.log('currentFile:', currentFile);
  console.log('executedFile:', executedFile);
  console.log('Comparando currentFile.includes(executedFile):', currentFile.includes(executedFile));
  console.log(
    'Comparando executedFile.includes(currentFile.split("/").pop()):',
    executedFile.includes(currentFile.split('/').pop())
  );

  if (currentFile.includes(executedFile) || executedFile.includes(currentFile.split('/').pop())) {
    logger.info('Entrando en startServer() por condición principal');
    console.log('Entrando en startServer() por condición principal');
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
  console.log('Entrando en startServer() por modo fallback');
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
