/**
 * Middleware de Privacidad
 * Mejora la privacidad eliminando reportes a terceros y optimizando headers
 */

import logger from '../utils/logger-production.mjs';

/**
 * Middleware principal de privacidad
 */
export default function privacyMiddleware(req, res, next) {
  // Eliminar headers que pueden enviar reportes a terceros
  removeThirdPartyReporting(req, res);

  // Agregar headers de privacidad mejorados
  addPrivacyHeaders(req, res);

  // Log de privacidad en desarrollo
  if (process.env.NODE_ENV === 'development') {
    logger.security('Headers de privacidad aplicados', {
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });
  }

  next();
}

/**
 * Elimina headers que envían reportes a terceros
 */
function removeThirdPartyReporting(req, res) {
  // Eliminar headers de reporte que pueden ir a Cloudflare u otros terceros
  const headersToRemove = ['nel', 'report-to', 'reporting-endpoints'];

  headersToRemove.forEach((header) => {
    if (res.getHeader(header)) {
      res.removeHeader(header);
    }
  });

  // Eliminar headers de reporte de Cloudflare específicamente
  const cloudflareHeaders = ['cf-ray', 'server-timing', 'cf-cache-status'];
  cloudflareHeaders.forEach((header) => {
    if (res.getHeader(header)) {
      res.removeHeader(header);
    }
  });

  // Si hay CSP con report-uri o report-to, removerlo
  const cspHeader = res.getHeader('Content-Security-Policy');
  if (cspHeader) {
    const cspString = Array.isArray(cspHeader) ? cspHeader[0] : cspHeader;
    const cleanCsp = removeCSPReporting(cspString);
    res.setHeader('Content-Security-Policy', cleanCsp);
  }

  // Agregar header para indicar que no se envían reportes
  res.setHeader('X-No-Third-Party-Reporting', 'true');
}

/**
 * Remueve directivas de reporte del CSP
 */
function removeCSPReporting(cspString) {
  if (!cspString) return cspString;

  // Remover report-uri y report-to del CSP
  return cspString
    .split(';')
    .map((directive) => directive.trim())
    .filter((directive) => {
      const lowerDirective = directive.toLowerCase();
      return !lowerDirective.startsWith('report-uri') && !lowerDirective.startsWith('report-to');
    })
    .join('; ');
}

/**
 * Agrega headers de privacidad mejorados
 */
function addPrivacyHeaders(req, res) {
  // Referrer Policy más restrictivo para mayor privacidad
  // Usar 'no-referrer' para máxima privacidad
  res.setHeader('Referrer-Policy', 'no-referrer');

  // Permissions Policy para controlar APIs del navegador
  const permissionsPolicy = [
    'accelerometer=()',
    'autoplay=()',
    'camera=()',
    'encrypted-media=()',
    'fullscreen=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'payment=()',

    'screen-wake-lock=()',
    'usb=()',
    'web-share=()',
    'xr-spatial-tracking=()',
  ].join(', ');

  res.setHeader('Permissions-Policy', permissionsPolicy);

  // Cross-Origin headers para mayor seguridad
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // Origin Agent Cluster para aislar el contexto
  res.setHeader('Origin-Agent-Cluster', '?1');

  // Agregar header personalizado para indicar que no se envían reportes
  res.setHeader('X-No-Third-Party-Reporting', 'true');
}

/**
 * Middleware para rutas específicas que requieren máxima privacidad
 */
export function strictPrivacyMiddleware(req, res, next) {
  // Aplicar privacidad estricta
  privacyMiddleware(req, res, () => {
    // Referrer Policy más restrictivo
    res.setHeader('Referrer-Policy', 'no-referrer');

    // CSP sin reportes y más restrictivo
    const strictCSP = [
      "default-src 'none'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'block-all-mixed-content',
      'upgrade-insecure-requests',
    ].join('; ');

    res.setHeader('Content-Security-Policy', strictCSP);

    next();
  });
}

/**
 * Middleware para verificar y loggear intentos de tracking
 */
export function trackingDetectionMiddleware(req, res, next) {
  const trackingHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded',
  ];

  const trackingInfo = {};
  trackingHeaders.forEach((header) => {
    const value = req.get(header);
    if (value) {
      trackingInfo[header] = value;
    }
  });

  if (Object.keys(trackingInfo).length > 0) {
    logger.security('Posible tracking detectado', {
      path: req.path,
      trackingHeaders: trackingInfo,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });
  }

  next();
}

/**
 * Helper para generar meta tags de privacidad
 */
export const privacyHelpers = {
  /**
   * Genera meta tags para mejorar la privacidad
   */
  generatePrivacyMetaTags: () => {
    return [
      '<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">',
      '<meta name="referrer" content="no-referrer-when-downgrade">',
      '<meta http-equiv="X-Content-Type-Options" content="nosniff">',
      '<meta http-equiv="X-Frame-Options" content="DENY">',
      '<meta http-equiv="X-XSS-Protection" content="0">',
    ].join('\n    ');
  },

  /**
   * Genera script para deshabilitar tracking del navegador
   */
  generateAntiTrackingScript: () => {
    return `
    <script>
      // Deshabilitar tracking del navegador
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }

      // Bloquear algunos métodos de tracking
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Proteger contra fingerprinting
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        const context = originalGetContext.call(this, type, ...args);
        if (context && type === '2d') {
          const originalFillText = context.fillText;
          context.fillText = function(...args) {
            // Modificar ligeramente el texto para evitar fingerprinting
            args[0] = args[0] + ' ';
            return originalFillText.apply(this, args);
          };
        }
        return context;
      };
    </script>`;
  },
};
