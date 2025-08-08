/**
 * Middleware de Caché Optimizado
 * Mejora el rendimiento con headers de caché inteligentes
 * @author Daniel Arribas Velazquez
 * @version 1.0.0
 */

import path from 'path';
import { registrar } from '../utils/servicios/logger.mjs';

// Configuración de caché por tipo de archivo
const CACHE_CONFIG = {
  // Archivos CSS y JS (inmutables)
  '*.css': {
    maxAge: '1y',
    immutable: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      Vary: 'Accept-Encoding',
    },
  },
  '*.js': {
    maxAge: '1y',
    immutable: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      Vary: 'Accept-Encoding',
    },
  },

  // Imágenes (inmutables)
  '*.png': {
    maxAge: '1y',
    immutable: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  '*.jpg': {
    maxAge: '1y',
    immutable: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  '*.jpeg': {
    maxAge: '1y',
    immutable: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  '*.webp': {
    maxAge: '1y',
    immutable: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  '*.avif': {
    maxAge: '1y',
    immutable: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  '*.svg': {
    maxAge: '1y',
    immutable: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },

  // Fuentes (inmutables)
  '*.woff': {
    maxAge: '1y',
    immutable: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  '*.woff2': {
    maxAge: '1y',
    immutable: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  '*.ttf': {
    maxAge: '1y',
    immutable: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },

  // HTML (caché corto)
  '*.html': {
    maxAge: '1h',
    immutable: false,
    headers: {
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  },

  // JSON y XML (caché medio)
  '*.json': {
    maxAge: '1d',
    immutable: false,
    headers: {
      'Cache-Control': 'public, max-age=86400, must-revalidate',
    },
  },
  '*.xml': {
    maxAge: '1d',
    immutable: false,
    headers: {
      'Cache-Control': 'public, max-age=86400, must-revalidate',
    },
  },
};

/**
 * Verificar si un archivo coincide con un patrón
 * @param {string} filename - Nombre del archivo
 * @param {string} pattern - Patrón a verificar
 * @returns {boolean} - True si coincide
 */
function matchesPattern(filename, pattern) {
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));
  return regex.test(filename);
}

/**
 * Obtener configuración de caché para un archivo
 * @param {string} filename - Nombre del archivo
 * @returns {Object|null} - Configuración de caché o null
 */
function getCacheConfig(filename) {
  for (const [pattern, config] of Object.entries(CACHE_CONFIG)) {
    if (matchesPattern(filename, pattern)) {
      return config;
    }
  }
  return null;
}

/**
 * Middleware de caché optimizado
 * @param {Object} options - Opciones de configuración
 * @returns {Function} - Middleware de Express
 */
export function cacheOptimizer(options = {}) {
  const { enableLogging = process.env.NODE_ENV === 'development', excludePaths = [] } = options;

  // Combinar configuración personalizada
  // const finalConfig = { ...CACHE_CONFIG, ...customConfig };

  return (req, res, next) => {
    // Verificar si la ruta debe ser excluida
    if (excludePaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    // Solo aplicar a archivos estáticos
    if (!req.path.includes('.')) {
      return next();
    }

    const filename = path.basename(req.path);
    const cacheConfig = getCacheConfig(filename);

    if (cacheConfig) {
      // Aplicar headers de caché
      Object.entries(cacheConfig.headers).forEach(([header, value]) => {
        res.setHeader(header, value);
      });

      // Logging en desarrollo
      if (enableLogging) {
        registrar(`Caché aplicado: ${filename} -> ${cacheConfig.headers['Cache-Control']}`, 'info');
      }
    }

    next();
  };
}

/**
 * Middleware de caché para archivos específicos
 * @param {string[]} fileTypes - Tipos de archivo a cachear
 * @param {Object} options - Opciones adicionales
 * @returns {Function} - Middleware de Express
 */
export function specificCache(fileTypes = [], options = {}) {
  const { maxAge = '1h', immutable = false, enableLogging = false } = options;

  return (req, res, next) => {
    const ext = path.extname(req.path).toLowerCase();

    if (fileTypes.includes(ext)) {
      const cacheControl = immutable
        ? `public, max-age=${maxAge}, immutable`
        : `public, max-age=${maxAge}, must-revalidate`;

      res.setHeader('Cache-Control', cacheControl);

      if (enableLogging) {
        registrar(`Caché específico aplicado: ${req.path} -> ${cacheControl}`, 'info');
      }
    }

    next();
  };
}

/**
 * Middleware de caché para API
 * @param {Object} options - Opciones de configuración
 * @returns {Function} - Middleware de Express
 */
export function apiCache(options = {}) {
  const { maxAge = '5m', enableLogging = false } = options;

  return (req, res, next) => {
    // Solo aplicar a rutas de API
    if (req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', `public, max-age=${maxAge}, must-revalidate`);
      res.setHeader('Vary', 'Accept-Encoding');

      if (enableLogging) {
        registrar(`Caché API aplicado: ${req.path} -> max-age=${maxAge}`, 'info');
      }
    }

    next();
  };
}

/**
 * Middleware de caché para páginas dinámicas
 * @param {Object} options - Opciones de configuración
 * @returns {Function} - Middleware de Express
 */
export function pageCache(options = {}) {
  const { maxAge = '10m', enableLogging = false } = options;

  return (req, res, next) => {
    // Solo aplicar a páginas HTML (no API ni archivos estáticos)
    if (!req.path.startsWith('/api/') && !req.path.includes('.')) {
      res.setHeader('Cache-Control', `public, max-age=${maxAge}, must-revalidate`);
      res.setHeader('Vary', 'Accept-Encoding, Accept-Language');

      if (enableLogging) {
        registrar(`Caché de página aplicado: ${req.path} -> max-age=${maxAge}`, 'info');
      }
    }

    next();
  };
}

/**
 * Middleware de caché inteligente
 * @param {Object} options - Opciones de configuración
 * @returns {Function} - Middleware de Express
 */
export function intelligentCache(options = {}) {
  const { enableLogging = process.env.NODE_ENV === 'development', customRules = [] } = options;

  return (req, res, next) => {
    const path = req.path;
    const method = req.method;

    // No cachear métodos que modifican datos
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return next();
    }

    // Aplicar reglas personalizadas
    for (const rule of customRules) {
      if (rule.test(path)) {
        res.setHeader('Cache-Control', rule.cacheControl);
        if (rule.vary) {
          res.setHeader('Vary', rule.vary);
        }

        if (enableLogging) {
          registrar(`Regla personalizada aplicada: ${path} -> ${rule.cacheControl}`, 'info');
        }
        return next();
      }
    }

    // Aplicar configuración por defecto
    const cacheConfig = getCacheConfig(path);
    if (cacheConfig) {
      Object.entries(cacheConfig.headers).forEach(([header, value]) => {
        res.setHeader(header, value);
      });
    }

    next();
  };
}

export default {
  cacheOptimizer,
  specificCache,
  apiCache,
  pageCache,
  intelligentCache,
};
