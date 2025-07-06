/**
 * Manejo de Errores Optimizado
 * @description Sistema avanzado de manejo de errores con logging seguro y rendimiento optimizado
 */

import { configLoader } from '../config/environment.mjs';

const config = configLoader();

// Cache de respuestas de error para mejor rendimiento
const errorResponseCache = new Map();

/**
 * Middleware para manejo de rutas no encontradas (404)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const notFoundHandler = (req, res, next) => {
  const startTime = process.hrtime();

  // Log de intento de acceso a ruta no encontrada
  console.warn(`🔍 Ruta no encontrada: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);

  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.status = 404;
  error.code = 'ROUTE_NOT_FOUND';
  error.path = req.originalUrl;
  error.method = req.method;
  error.ip = req.ip;
  error.userAgent = req.get('User-Agent');
  error.timestamp = new Date().toISOString();

  // Medir tiempo de procesamiento
  const endTime = process.hrtime(startTime);
  error.processingTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

  next(error);
};

/**
 * Middleware principal de manejo de errores
 * @param {Error} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const errorHandler = (err, req, res, next) => {
  const startTime = process.hrtime();

  // Evitar procesar errores ya enviados
  if (res.headersSent) {
    return next(err);
  }

  // Normalizar error
  const normalizedError = normalizeError(err, req);

  // Log del error
  logError(normalizedError, req);

  // Crear respuesta segura
  const errorResponse = createErrorResponse(normalizedError, req);

  // Medir tiempo de procesamiento
  const endTime = process.hrtime(startTime);
  errorResponse.meta = {
    ...errorResponse.meta,
    processingTime: `${(endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2)}ms`,
    requestId: req.id || generateRequestId(),
  };

  // Configurar headers de respuesta
  setErrorHeaders(res, normalizedError);

  // Enviar respuesta
  res.status(normalizedError.status).json(errorResponse);
};

/**
 * Normaliza errores para procesamiento consistente
 * @param {Error} err - Error original
 * @param {Object} req - Request object
 * @returns {Object} Error normalizado
 */
function normalizeError(err, req) {
  const normalized = {
    name: err.name || 'Error',
    message: err.message || 'Error interno del servidor',
    status: err.status || err.statusCode || 500,
    code: err.code || 'INTERNAL_ERROR',
    timestamp: err.timestamp || new Date().toISOString(),
    path: err.path || req.originalUrl,
    method: err.method || req.method,
    ip: err.ip || req.ip,
    userAgent: err.userAgent || req.get('User-Agent'),
    stack: err.stack,
    details: err.details || null,
    processingTime: err.processingTime || null,
  };

  // Categorizar error
  normalized.category = categorizeError(normalized);

  // Determinar severidad
  normalized.severity = determineSeverity(normalized);

  return normalized;
}

/**
 * Categoriza errores para mejor manejo
 * @param {Object} error - Error normalizado
 * @returns {string} Categoría del error
 */
function categorizeError(error) {
  if (error.status >= 400 && error.status < 500) {
    // Errores del cliente
    switch (error.status) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 405:
        return 'METHOD_NOT_ALLOWED';
      case 408:
        return 'TIMEOUT';
      case 409:
        return 'CONFLICT';
      case 413:
        return 'PAYLOAD_TOO_LARGE';
      case 415:
        return 'UNSUPPORTED_MEDIA_TYPE';
      case 422:
        return 'VALIDATION_ERROR';
      case 429:
        return 'RATE_LIMITED';
      default:
        return 'CLIENT_ERROR';
    }
  } else if (error.status >= 500) {
    // Errores del servidor
    switch (error.status) {
      case 500:
        return 'INTERNAL_ERROR';
      case 501:
        return 'NOT_IMPLEMENTED';
      case 502:
        return 'BAD_GATEWAY';
      case 503:
        return 'SERVICE_UNAVAILABLE';
      case 504:
        return 'GATEWAY_TIMEOUT';
      default:
        return 'SERVER_ERROR';
    }
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Determina la severidad del error
 * @param {Object} error - Error normalizado
 * @returns {string} Nivel de severidad
 */
function determineSeverity(error) {
  if (error.status >= 500) {
    return 'critical';
  } else if (error.status === 401 || error.status === 403) {
    return 'high';
  } else if (error.status === 404 || error.status === 400) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Log de errores con diferentes niveles
 * @param {Object} error - Error normalizado
 * @param {Object} req - Request object
 */
function logError(error, req) {
  const logData = {
    timestamp: error.timestamp,
    requestId: req.id || generateRequestId(),
    category: error.category,
    severity: error.severity,
    status: error.status,
    message: error.message,
    path: error.path,
    method: error.method,
    ip: error.ip,
    userAgent: error.userAgent,
    processingTime: error.processingTime,
  };

  // Log según severidad
  switch (error.severity) {
    case 'critical':
      console.error('🚨 ERROR CRÍTICO:', JSON.stringify(logData, null, 2));
      if (config.NODE_ENV === 'production') {
        // En producción, podrías enviar alertas a servicios externos
        // sendCriticalAlert(error, req);
      }
      break;

    case 'high':
      console.error('🔴 ERROR ALTO:', JSON.stringify(logData, null, 2));
      break;

    case 'medium':
      console.warn('🟡 ERROR MEDIO:', JSON.stringify(logData, null, 2));
      break;

    case 'low':
      console.info('🔵 ERROR BAJO:', JSON.stringify(logData, null, 2));
      break;

    default:
      console.log('ℹ️  ERROR:', JSON.stringify(logData, null, 2));
  }

  // Log completo solo en desarrollo
  if (config.NODE_ENV === 'development' && error.stack) {
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Crea respuesta de error segura para el cliente
 * @param {Object} error - Error normalizado
 * @param {Object} req - Request object
 * @returns {Object} Respuesta de error
 */
function createErrorResponse(error, _req) {
  // Usar cache si está disponible
  const cacheKey = `${error.status}_${error.category}_${config.NODE_ENV}`;
  if (errorResponseCache.has(cacheKey)) {
    const cachedResponse = errorResponseCache.get(cacheKey);
    return {
      ...cachedResponse,
      meta: {
        timestamp: error.timestamp,
        path: error.path,
        method: error.method,
      },
    };
  }

  // Crear respuesta base
  const response = {
    error: true,
    status: error.status,
    code: error.code,
    category: error.category,
    message: getSafeErrorMessage(error),
    meta: {
      timestamp: error.timestamp,
      path: error.path,
      method: error.method,
    },
  };

  // Añadir información adicional según el entorno
  if (config.NODE_ENV === 'development') {
    response.debug = {
      originalMessage: error.message,
      stack: error.stack,
      details: error.details,
    };
  }

  // Añadir información específica por tipo de error
  switch (error.category) {
    case 'VALIDATION_ERROR':
      if (error.details) {
        response.validation = error.details;
      }
      break;

    case 'RATE_LIMITED':
      response.retryAfter = error.retryAfter || 60;
      break;

    case 'UNAUTHORIZED':
      response.loginRequired = true;
      break;

    case 'FORBIDDEN':
      response.insufficientPermissions = true;
      break;
  }

  // Cachear respuesta para mejor rendimiento
  if (error.status >= 400 && error.status < 500) {
    errorResponseCache.set(cacheKey, {
      error: response.error,
      status: response.status,
      code: response.code,
      category: response.category,
      message: response.message,
    });

    // Limpiar cache después de 5 minutos
    setTimeout(
      () => {
        errorResponseCache.delete(cacheKey);
      },
      5 * 60 * 1000
    );
  }

  return response;
}

/**
 * Obtiene mensaje de error seguro para mostrar al cliente
 * @param {Object} error - Error normalizado
 * @returns {string} Mensaje seguro
 */
function getSafeErrorMessage(error) {
  // Mensajes seguros por categoría
  const safeMessages = {
    BAD_REQUEST: 'La solicitud contiene datos inválidos',
    UNAUTHORIZED: 'Credenciales no válidas o token expirado',
    FORBIDDEN: 'No tienes permisos para acceder a este recurso',
    NOT_FOUND: 'El recurso solicitado no fue encontrado',
    METHOD_NOT_ALLOWED: 'Método HTTP no permitido para esta ruta',
    TIMEOUT: 'La solicitud tardó demasiado tiempo en procesarse',
    CONFLICT: 'Conflicto con el estado actual del recurso',
    PAYLOAD_TOO_LARGE: 'El archivo o datos enviados son demasiado grandes',
    UNSUPPORTED_MEDIA_TYPE: 'Tipo de contenido no soportado',
    VALIDATION_ERROR: 'Los datos proporcionados no son válidos',
    RATE_LIMITED: 'Demasiadas solicitudes, intenta de nuevo más tarde',
    INTERNAL_ERROR: 'Error interno del servidor',
    NOT_IMPLEMENTED: 'Funcionalidad no implementada',
    BAD_GATEWAY: 'Error en el servidor upstream',
    SERVICE_UNAVAILABLE: 'Servicio temporalmente no disponible',
    GATEWAY_TIMEOUT: 'Timeout en el servidor upstream',
  };

  // En producción, usar mensajes seguros
  if (config.NODE_ENV === 'production') {
    return safeMessages[error.category] || 'Ha ocurrido un error inesperado';
  }

  // En desarrollo, mostrar mensaje original
  return error.message || safeMessages[error.category] || 'Error desconocido';
}

/**
 * Configura headers de respuesta de error
 * @param {Object} res - Response object
 * @param {Object} error - Error normalizado
 */
function setErrorHeaders(res, error) {
  // Headers de seguridad
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  // Headers específicos por tipo de error
  switch (error.category) {
    case 'RATE_LIMITED':
      if (error.retryAfter) {
        res.setHeader('Retry-After', error.retryAfter);
      }
      break;

    case 'UNAUTHORIZED':
      res.setHeader('WWW-Authenticate', 'Bearer');
      break;

    case 'NOT_FOUND':
      // Prevenir cache de páginas 404
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      break;
  }

  // Header personalizado de la aplicación
  res.setHeader(config.CUSTOM_HEADER_NAME || 'X-App-Name', config.APP_NAME);
}

/**
 * Genera un ID único para la solicitud
 * @returns {string} Request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Maneja errores asíncronos en rutas
 * @param {Function} fn - Función asíncrona
 * @returns {Function} Wrapper function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Crea un error personalizado con propiedades adicionales
 * @param {string} message - Mensaje del error
 * @param {number} status - Código de estado HTTP
 * @param {string} code - Código interno del error
 * @param {Object} details - Detalles adicionales
 * @returns {Error} Error personalizado
 */
export const createError = (message, status = 500, code = 'INTERNAL_ERROR', details = null) => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.details = details;
  error.timestamp = new Date().toISOString();
  return error;
};

/**
 * Maneja errores de validación de express-validator
 * @param {Array} errors - Array de errores de validación
 * @returns {Error} Error de validación
 */
export const handleValidationErrors = (errors) => {
  const formattedErrors = errors.map((error) => ({
    field: error.path || error.param,
    message: error.msg,
    value: error.value,
    location: error.location,
  }));

  return createError(
    'Errores de validación en los datos proporcionados',
    400,
    'VALIDATION_ERROR',
    formattedErrors
  );
};

/**
 * Middleware para agregar ID de request
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
export const addRequestId = (req, res, next) => {
  req.id = generateRequestId();
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Limpia el cache de respuestas de error
 */
export const clearErrorCache = () => {
  errorResponseCache.clear();
};

/**
 * Obtiene estadísticas del cache de errores
 * @returns {Object} Estadísticas
 */
export const getErrorCacheStats = () => {
  return {
    size: errorResponseCache.size,
    keys: Array.from(errorResponseCache.keys()),
  };
};
