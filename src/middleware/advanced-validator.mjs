/**
 * Sistema de Validación Avanzado con Sanitización Multicapa
 * Implementa múltiples capas de sanitización y validación para máxima seguridad
 */

import { body, query, param, validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';
import { decode } from 'html-entities';
import validator from 'validator';
import { registrar } from '../utils/servicios/logger.mjs';

class AdvancedValidator {
  constructor() {
    this.attackPatterns = [
      // XSS patterns
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,

      // SQL Injection patterns
      /('|(\\')|(;)|(\\;))|(\s+or\s+)|(\s+and\s+)|(\s+union\s+)|(\s+select\s+)|(\s+insert\s+)|(\s+update\s+)|(\s+delete\s+)|(\s+drop\s+)|(\s+create\s+)|(\s+alter\s+)/gi,

      // NoSQL Injection patterns
      /\$where/gi,
      /\$ne/gi,
      /\$gt/gi,
      /\$lt/gi,
      /\$regex/gi,

      // Command Injection patterns
      /[;&|`]/g,
      /\$\(/g,
      /\|\|/g,
      /&&/g,

      // Path Traversal patterns
      /\.\.\//g,
      /\.\.\\/g,
      /\.\.%2f/gi,
      /\.\.%5c/gi,

      // LDAP Injection patterns
      /\(\|/g,
      /\(&/g,
      /\(!/g,
    ];

    this.suspiciousKeywords = [
      'script',
      'javascript',
      'vbscript',
      'onload',
      'onerror',
      'onclick',
      'eval',
      'expression',
      'mocha',
      'livescript',
      'base64',
      'union',
      'select',
      'insert',
      'update',
      'delete',
      'drop',
      'exec',
      'execute',
      'system',
      'shell',
      'cmd',
      'passwd',
      'etc',
      'proc',
      'dev',
      'null',
    ];
  }

  /**
   * Sanitización profunda de objetos
   */
  deepSanitize(obj, level = 0) {
    // Prevenir recursión infinita
    if (level > 10) {
      registrar('Warning: Deep sanitization reached maximum depth');
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepSanitize(item, level + 1));
    }

    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        // Sanitizar también las claves
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.deepSanitize(value, level + 1);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Sanitización multicapa de strings
   */
  sanitizeString(str) {
    if (typeof str !== 'string') {
      return str;
    }

    let sanitized = str;

    // Capa 1: Decodificar entidades HTML
    sanitized = decode(sanitized);

    // Capa 2: Normalizar unicode
    sanitized = sanitized.normalize('NFKC');

    // Capa 3: DOMPurify para XSS
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });

    // Capa 4: Escapar caracteres peligrosos
    sanitized = validator.escape(sanitized);

    // Capa 5: Remover caracteres de control
    sanitized = sanitized
      .split('')
      .filter((char) => {
        const code = char.charCodeAt(0);
        return code >= 32 && code !== 127 && (code < 128 || code > 159);
      })
      .join('');

    // Capa 6: Limitar longitud
    if (sanitized.length > 10000) {
      sanitized = sanitized.substring(0, 10000);
      registrar('Warning: String truncated due to excessive length');
    }

    return sanitized.trim();
  }

  /**
   * Detectar patrones de ataque
   */
  detectAttackPatterns(input) {
    if (typeof input !== 'string') {
      return false;
    }

    const lowerInput = input.toLowerCase();

    // Verificar patrones de ataque
    for (const pattern of this.attackPatterns) {
      if (pattern.test(input)) {
        return true;
      }
    }

    // Verificar palabras clave sospechosas
    for (const keyword of this.suspiciousKeywords) {
      if (lowerInput.includes(keyword)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Middleware de sanitización previa
   */
  preSanitizationMiddleware() {
    return (req, res, next) => {
      try {
        // Sanitizar body
        if (req.body) {
          req.body = this.deepSanitize(req.body);
        }

        // Sanitizar query parameters
        if (req.query) {
          req.query = this.deepSanitize(req.query);
        }

        // Sanitizar params
        if (req.params) {
          req.params = this.deepSanitize(req.params);
        }

        // Detectar ataques en headers importantes
        const suspiciousHeaders = ['user-agent', 'referer', 'x-forwarded-for'];
        for (const header of suspiciousHeaders) {
          const value = req.get(header);
          if (value && this.detectAttackPatterns(value)) {
            registrar(`Suspicious pattern detected in header ${header}: ${value}`);
            return res.status(400).json({
              error: 'Malicious input detected',
              type: 'suspicious_header',
              header: header,
            });
          }
        }

        next();
      } catch (error) {
        console.warn(`Sanitization error: ${error.message}`);
        // No fallar completamente, solo continuar sin sanitización avanzada
        next();
      }
    };
  }

  /**
   * Middleware de validación de resultados
   */
  validationResultsMiddleware() {
    return (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const errorDetails = errors.array().map((err) => {
          // Detectar si el error contiene patrones de ataque
          const isAttack = this.detectAttackPatterns(String(err.value));

          if (isAttack) {
            registrar(`Attack pattern detected in validation: ${err.path} = ${err.value}`);
          }

          return {
            field: err.path,
            message: err.msg,
            value:
              typeof err.value === 'string'
                ? err.value.substring(0, 100) + (err.value.length > 100 ? '...' : '')
                : err.value,
            location: err.location,
            isAttack: isAttack,
          };
        });

        // Si hay ataques detectados, usar respuesta más genérica
        const hasAttacks = errorDetails.some((err) => err.isAttack);

        return res.status(400).json({
          error: hasAttacks ? 'Invalid input detected' : 'Validation failed',
          details: hasAttacks ? undefined : errorDetails,
          timestamp: new Date().toISOString(),
        });
      }

      next();
    };
  }

  /**
   * Factory para crear validadores con esquemas
   */
  createValidator(schema) {
    if (!Array.isArray(schema)) {
      throw new Error('Schema must be an array of validation rules');
    }

    return [this.preSanitizationMiddleware(), ...schema, this.validationResultsMiddleware()];
  }

  /**
   * Validadores predefinidos comunes
   */
  getCommonValidators() {
    return {
      email: body('email')
        .isEmail()
        .normalizeEmail()
        .isLength({ max: 254 })
        .withMessage('Email válido requerido'),

      password: body('password')
        .isLength({ min: 8, max: 128 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage(
          'Contraseña debe tener al menos 8 caracteres, incluyendo mayúscula, minúscula, número y símbolo'
        ),

      name: body('name')
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
        .withMessage('Nombre debe contener solo letras y espacios'),

      username: body('username')
        .isLength({ min: 3, max: 30 })
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username debe contener solo letras, números y guiones bajos'),

      phone: body('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Número de teléfono válido requerido'),

      url: body('url')
        .optional()
        .isURL({ protocols: ['http', 'https'], require_protocol: true })
        .withMessage('URL válida requerida'),

      id: param('id').isMongoId().withMessage('ID válido requerido'),

      // Validadores para query parameters comunes
      page: query('page')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .toInt()
        .withMessage('Página debe ser un número entre 1 y 1000'),

      limit: query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .toInt()
        .withMessage('Límite debe ser un número entre 1 y 100'),

      search: query('search')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Búsqueda debe tener entre 1 y 100 caracteres'),
    };
  }

  /**
   * Validador para archivos subidos
   */
  fileValidator(options = {}) {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'] } =
      options;

    return (req, res, next) => {
      if (!req.file && !req.files) {
        return next();
      }

      const files = req.files || [req.file];

      for (const file of files) {
        // Verificar tamaño
        if (file.size > maxSize) {
          return res.status(400).json({
            error: 'File too large',
            maxSize: maxSize,
            received: file.size,
          });
        }

        // Verificar tipo MIME
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            error: 'Invalid file type',
            allowed: allowedTypes,
            received: file.mimetype,
          });
        }

        // Sanitizar nombre de archivo
        if (file.originalname) {
          file.originalname = this.sanitizeString(file.originalname);

          // Verificar patrones peligrosos en nombres de archivo
          if (this.detectAttackPatterns(file.originalname)) {
            return res.status(400).json({
              error: 'Malicious filename detected',
            });
          }
        }
      }

      next();
    };
  }

  /**
   * Middleware para logging de validación
   */
  loggingMiddleware() {
    return (req, res, next) => {
      const originalSend = res.send;

      res.send = function (data) {
        // Log errores de validación para análisis
        if (res.statusCode === 400 && data) {
          try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            if (parsed.error && parsed.details) {
              registrar(`Validation failed for ${req.method} ${req.path}: ${parsed.error}`);
            }
          } catch {
            // Ignorar errores de parsing
          }
        }

        return originalSend.call(this, data);
      };

      next();
    };
  }
}

// Instancia singleton
const advancedValidator = new AdvancedValidator();

// Exportar validadores predefinidos comunes
export const userValidation = {
  register: advancedValidator.createValidator([
    advancedValidator.getCommonValidators().email,
    advancedValidator.getCommonValidators().password,
    advancedValidator.getCommonValidators().name,
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
    body('terms').isBoolean().equals('true').withMessage('Debe aceptar los términos y condiciones'),
  ]),

  login: advancedValidator.createValidator([
    advancedValidator.getCommonValidators().email,
    body('password').isLength({ min: 1 }).withMessage('Contraseña requerida'),
  ]),

  profile: advancedValidator.createValidator([
    advancedValidator.getCommonValidators().name,
    advancedValidator.getCommonValidators().phone,
  ]),
};

export const apiValidation = {
  pagination: advancedValidator.createValidator([
    advancedValidator.getCommonValidators().page,
    advancedValidator.getCommonValidators().limit,
  ]),

  search: advancedValidator.createValidator([
    advancedValidator.getCommonValidators().search,
    advancedValidator.getCommonValidators().page,
    advancedValidator.getCommonValidators().limit,
  ]),
};

export { advancedValidator as default, AdvancedValidator };
