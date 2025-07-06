import compression from 'compression';
import { registrar } from '../servicios/logger.mjs';

/**
 * Configuración de compresión personalizada
 * @param {Object} opciones - Opciones de configuración
 * @returns {Function} Middleware de compresión
 */
export function configurarCompresion(opciones = {}) {
  const config = {
    // Nivel de compresión (0-9, donde 9 es máxima compresión)
    level: opciones.level || 6,

    // Tamaño mínimo para comprimir (en bytes)
    threshold: opciones.threshold || 1024,

    // Filtrar qué tipos de contenido comprimir
    filter: (req, _res) => {
      // No comprimir si el cliente no lo soporta
      if (req.headers['x-no-compression']) {
        return false;
      }

      // Comprimir solo tipos de contenido específicos
      const tiposComprimibles = [
        'text/html',
        'text/css',
        'text/javascript',
        'application/javascript',
        'application/json',
        'application/xml',
        'text/xml',
        'text/plain',
      ];

      const contentType = _res.getHeader('Content-Type');
      if (contentType) {
        return tiposComprimibles.some((tipo) => contentType.includes(tipo));
      }

      return compression.filter(req, _res);
    },

    // Configuración específica para diferentes tipos de contenido
    contentType: {
      'text/html': { level: 6 },
      'text/css': { level: 8 },
      'text/javascript': { level: 7 },
      'application/javascript': { level: 7 },
      'application/json': { level: 6 },
      'application/xml': { level: 6 },
      'text/xml': { level: 6 },
      'text/plain': { level: 5 },
    },

    // Callback para logging
    onResponse: (req, _res, next) => {
      const originalSend = _res.send;
      _res.send = function (data) {
        const contentLength = Buffer.byteLength(data);
        const compressedLength = _res.getHeader('content-length');

        if (compressedLength && contentLength > 0) {
          const ratio = (((contentLength - compressedLength) / contentLength) * 100).toFixed(2);
          registrar(
            `Compresión aplicada: ${contentLength} -> ${compressedLength} bytes (${ratio}% reducción)`,
            'info'
          );
        }

        return originalSend.call(this, data);
      };
      next();
    },
  };

  return compression(config);
}

/**
 * Middleware de compresión para archivos estáticos
 * @returns {Function} Middleware de compresión para estáticos
 */
export function compresionEstaticos() {
  return compression({
    level: 8,
    threshold: 512,
    filter: (req, _res) => {
      // Solo comprimir archivos estáticos
      const extensiones = ['.css', '.js', '.html', '.xml', '.txt', '.json'];
      const extension = req.path.split('.').pop();

      return extensiones.includes('.' + extension);
    },
  });
}

/**
 * Middleware de compresión para API
 * @returns {Function} Middleware de compresión para API
 */
export function compresionAPI() {
  return compression({
    level: 6,
    threshold: 1024,
    filter: (req, _res) => {
      // Solo comprimir respuestas de API
      return req.path.startsWith('/api/') || req.path.startsWith('/auth/');
    },
  });
}

/**
 * Middleware de compresión inteligente
 * @returns {Function} Middleware de compresión inteligente
 */
export function compresionInteligente() {
  return compression({
    level: 6,
    threshold: 1024,
    filter: (req, _res) => {
      // No comprimir en desarrollo
      if (process.env.NODE_ENV === 'development') {
        return false;
      }

      // No comprimir si el cliente no lo soporta
      if (req.headers['x-no-compression']) {
        return false;
      }

      // Comprimir basado en el tipo de contenido
      const contentType = _res.getHeader('Content-Type');
      if (contentType) {
        if (contentType.includes('text/html')) return true;
        if (contentType.includes('text/css')) return true;
        if (contentType.includes('javascript')) return true;
        if (contentType.includes('json')) return true;
        if (contentType.includes('xml')) return true;
        if (contentType.includes('text/plain')) return true;
      }

      return false;
    },
  });
}

/**
 * Configuración de compresión para diferentes entornos
 * @param {string} entorno - Entorno de ejecución
 * @returns {Function} Middleware de compresión configurado
 */
export function compresionPorEntorno(entorno = 'development') {
  switch (entorno) {
    case 'production':
      return compression({
        level: 8,
        threshold: 512,
        filter: (req, _res) => {
          // Comprimir todo en producción
          return !req.headers['x-no-compression'];
        },
      });

    case 'staging':
      return compression({
        level: 6,
        threshold: 1024,
        filter: (req, _res) => {
          // Comprimir selectivamente en staging
          const contentType = _res.getHeader('Content-Type');
          return (
            contentType &&
            (contentType.includes('text/html') ||
              contentType.includes('text/css') ||
              contentType.includes('javascript') ||
              contentType.includes('json'))
          );
        },
      });

    default: // development
      return compression({
        level: 4,
        threshold: 2048,
        filter: (req, _res) => {
          // Comprimir solo archivos grandes en desarrollo
          const contentLength = parseInt(_res.getHeader('content-length') || '0');
          return contentLength > 2048;
        },
      });
  }
}

/**
 * Middleware para detectar y reportar compresión
 * @returns {Function} Middleware de detección
 */
export function detectarCompresion() {
  return (req, _res, next) => {
    const originalSend = _res.send;

    _res.send = function (data) {
      const contentLength = Buffer.byteLength(data);
      const compressedLength = _res.getHeader('content-length');
      const encoding = _res.getHeader('content-encoding');

      if (encoding && compressedLength) {
        const ratio = (((contentLength - compressedLength) / contentLength) * 100).toFixed(2);
        registrar(
          `Compresión ${encoding}: ${contentLength} -> ${compressedLength} bytes (${ratio}% reducción) en ${req.path}`,
          'info'
        );
      }

      return originalSend.call(this, data);
    };

    next();
  };
}
