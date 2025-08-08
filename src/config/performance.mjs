// Configuración de caché para archivos estáticos
export const cacheConfig = {
  maxAge: 86400000, // 24 horas
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.css') || path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 año
    } else if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.gif') || path.endsWith('.svg')) {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 días
    }
  }
};

// Configuración de compresión
export const compressionConfig = {
  level: 9,
  threshold: 1024,
  filter: (req, res) => {
    // No comprimir si el cliente no lo soporta
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Comprimir solo tipos de contenido específicos
    const contentType = res.getHeader('Content-Type');
    if (contentType) {
      return /text|javascript|json|xml/.test(contentType);
    }

    return true;
  }
};

// Configuración de preload
export const preloadConfig = {
  enabled: true,
  resources: [
    '/assets/css/global/base.min.css',
    '/assets/js/navegacion/navegacion.min.js',
    '/assets/js/tema/index.min.js'
  ]
};
