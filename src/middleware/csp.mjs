/**
 * Middleware de Content Security Policy (CSP)
 * Previene ataques XSS y otras vulnerabilidades de seguridad
 */

import crypto from 'crypto';
import logger from '../utils/logger-production.mjs';

/**
 * Genera un nonce único para cada request
 */
function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Middleware CSP
 */
export default function cspMiddleware(req, res, next) {
  // Generar nonce para scripts y estilos inline
  const nonce = generateNonce();

  // Hacer disponible el nonce en las vistas
  res.locals.nonce = nonce;
  req.nonce = nonce;

  // Configurar CSP según el entorno
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Política CSP con denegación por defecto y excepciones necesarias
  const cspConfig = {
    'default-src': ["'none'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      // CDNs confiables con SRI recomendado
      'https://cdnjs.cloudflare.com',
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
      'https://*.dav-tech.work', // Permitir scripts de Cloudflare en tu dominio
      'https://*.cloudflare.com', // Permitir scripts de Cloudflare
      // Permitir APIs modernas de almacenamiento
      "'wasm-unsafe-eval'",
      // En desarrollo, permitir más flexibilidad
      ...(isDevelopment ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
    ],
    'style-src': [
      "'self'",
      `'nonce-${nonce}'`,
      // En desarrollo, permitir inline styles
      ...(isDevelopment ? ["'unsafe-inline'"] : []),
      'https://fonts.googleapis.com',
      'https://cdnjs.cloudflare.com',
    ],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
    'connect-src': [
      "'self'",
      ...(isDevelopment ? ['ws:', 'wss:'] : []), // WebSocket para desarrollo
    ],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'", 'https://formspree.io', 'https://api.emailjs.com'],
    'frame-ancestors': ["'none'"],
    'block-all-mixed-content': [],
    'upgrade-insecure-requests': isProduction ? [] : null,
    // Agregar strict-dynamic para scripts dinámicos
    'script-src-elem': [
      "'self'",
      `'nonce-${nonce}'`,
      ...(isDevelopment ? ["'unsafe-inline'"] : ["'strict-dynamic'"]),
      'https://cdnjs.cloudflare.com',
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
      'https://*.dav-tech.work',
      'https://*.cloudflare.com',
    ],
    // Excepción: permitir atributos inline para compatibilidad actual (onclick en vistas)
    // Nota: migrar a addEventListener + nonces para poder retirar esta excepción en el futuro
    'script-src-attr': ["'unsafe-inline'"],
    // Agregar worker-src para Service Workers
    'worker-src': ["'self'"],
    // Agregar manifest-src para PWA
    'manifest-src': ["'self'"],
  };

  // Remover directivas null
  Object.keys(cspConfig).forEach((key) => {
    if (cspConfig[key] === null) {
      delete cspConfig[key];
    }
  });

  // Construir string CSP
  const cspString = Object.entries(cspConfig)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');

  // Configurar headers CSP
  res.setHeader('Content-Security-Policy', cspString);

  // Headers adicionales de seguridad mejorados
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  // Deshabilitar X-XSS-Protection (deprecado) y usar solo CSP
  res.setHeader('X-XSS-Protection', '0');
  // Mejorar Referrer Policy para mayor privacidad
  res.setHeader('Referrer-Policy', 'no-referrer');
  // Agregar Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), autoplay=(), camera=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), screen-wake-lock=(), usb=(), web-share=(), xr-spatial-tracking=()'
  );

  // Solo en desarrollo, reportar violaciones localmente (no a terceros)
  if (isDevelopment) {
    res.setHeader('Content-Security-Policy-Report-Only', cspString);
  }

  logger.security(`CSP configurado para ${req.path}`, { nonce });

  next();
}

/**
 * Middleware para rutas específicas que requieren CSP más permisivo
 */
export function relaxedCSP(req, res, next) {
  const nonce = generateNonce();
  res.locals.nonce = nonce;
  req.nonce = nonce;

  const cspString = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data: https:`,
    `font-src 'self' https:`,
    `connect-src 'self'`,
    `media-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspString);

  next();
}

/**
 * Middleware CSP específico para la página de contacto
 * Permite onclick="enviarFormulario()" específicamente
 */
export function contactoCSP(req, res, next) {
  const nonce = generateNonce();
  res.locals.nonce = nonce;
  req.nonce = nonce;

  const cspString = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com`,
    `script-src-attr 'unsafe-inline'`, // Permitir onclick específicamente para contacto
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com`,
    `img-src 'self' data: https:`,
    `font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com`,
    `connect-src 'self'`,
    `media-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspString);

  next();
}

/**
 * Middleware para reportar violaciones CSP localmente
 */
export function cspReportHandler(req, res, _next) {
  if (req.body && req.body['csp-report']) {
    const report = req.body['csp-report'];

    logger.security('Violación CSP detectada', {
      blockedUri: report['blocked-uri'],
      documentUri: report['document-uri'],
      violatedDirective: report['violated-directive'],
      originalPolicy: report['original-policy'],
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });
  }

  res.status(204).send();
}
