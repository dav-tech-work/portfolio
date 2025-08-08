/**
 * Middleware de Subresource Integrity (SRI)
 * Verifica la integridad de recursos externos para prevenir ataques de supply chain
 */

import crypto from 'crypto';
import logger from '../utils/logger-production.mjs';

/**
 * Genera hash SHA-384 para SRI
 * @param {string} content - Contenido del recurso
 * @returns {string} Hash en formato base64
 */
function generateSRIHash(content) {
  const hash = crypto.createHash('sha384');
  hash.update(content);
  return `sha384-${hash.digest('base64')}`;
}

/**
 * Middleware para agregar SRI a recursos externos
 */
export default function sriMiddleware(req, res, next) {
  // Hacer disponible la función de generación de SRI en las vistas
  res.locals.generateSRI = generateSRIHash;

  // Agregar helper para generar tags SRI
  res.locals.sriTag = (url, integrity) => {
    if (!integrity) {
      logger.warn(`SRI no disponible para: ${url}`);
      return '';
    }
    return `integrity="${integrity}" crossorigin="anonymous"`;
  };

  next();
}

/**
 * Middleware para verificar SRI en requests de recursos
 */
export function sriVerificationMiddleware(req, res, next) {
  const integrity = req.headers['integrity'];
  const url = req.url;

  if (integrity && !isValidSRI(integrity)) {
    logger.security('SRI inválido detectado', {
      url,
      integrity,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return res.status(403).json({
      error: 'Integrity check failed',
      message: 'El recurso solicitado no cumple con los requisitos de integridad',
    });
  }

  next();
}

/**
 * Valida formato de SRI
 * @param {string} integrity - String de integridad
 * @returns {boolean} True si es válido
 */
function isValidSRI(integrity) {
  // Validar formato: algoritmo-hash
  const sriPattern = /^(sha256|sha384|sha512)-[A-Za-z0-9+/=]+$/;
  return sriPattern.test(integrity);
}

/**
 * Genera SRI para Google Fonts CSS
 * @param {string} fontUrl - URL de Google Fonts
 * @returns {Promise<string>} Hash SRI
 */
export async function generateGoogleFontsSRI(fontUrl) {
  try {
    const response = await fetch(fontUrl);
    const content = await response.text();
    return generateSRIHash(content);
  } catch (error) {
    logger.error('Error generando SRI para Google Fonts', { error: error.message });
    return null;
  }
}

/**
 * Helper para generar tags de recursos con SRI
 */
export const sriHelpers = {
  /**
   * Genera tag de script con SRI
   */
  scriptTag: (src, integrity = null) => {
    const integrityAttr = integrity ? ` integrity="${integrity}" crossorigin="anonymous"` : '';
    return `<script src="${src}"${integrityAttr}></script>`;
  },

  /**
   * Genera tag de link CSS con SRI
   */
  linkTag: (href, integrity = null) => {
    const integrityAttr = integrity ? ` integrity="${integrity}" crossorigin="anonymous"` : '';
    return `<link rel="stylesheet" href="${href}"${integrityAttr}>`;
  },

  /**
   * Genera tag de Google Fonts (sin SRI: contenido dinámico)
   */
  googleFontsTag: (fontUrl) => {
    return `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="${fontUrl}" rel="stylesheet" crossorigin="anonymous">
    `;
  },

  /**
   * Nota: Google Fonts no es compatible con SRI debido a contenido dinámico
   * basado en User-Agent. Se recomienda usar fuentes locales como alternativa.
   */
  googleFontsNote:
    'Google Fonts genera contenido dinámico basado en User-Agent, por lo que SRI no es confiable.',
};

/**
 * Middleware para agregar headers de seguridad relacionados con SRI
 */
export function sriSecurityHeaders(req, res, next) {
  // Agregar header para indicar que se requiere SRI
  res.setHeader('X-Content-Security-Policy', 'require-sri-for script style');

  next();
}
