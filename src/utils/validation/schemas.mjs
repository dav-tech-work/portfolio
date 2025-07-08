import { body, param, query, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';

// Validaciones comunes reutilizables
const suspiciousDomains = [
  'tempmail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email',
];

const commandInjectionPattern = /(&&|;|\||\$\(|`)/;

// Cargar claves peligrosas desde JSON
let dangerousKeys = [
  '__proto__',
  'constructor',
  'prototype',
  'eval',
  'function',
  'require',
  'module',
  'process',
  'global',
  'window',
];
try {
  const jsonPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    '../../../data/config/security-keys.json'
  );
  if (fs.existsSync(jsonPath)) {
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    if (Array.isArray(jsonData.dangerousKeys)) {
      dangerousKeys = jsonData.dangerousKeys.map((k) => k.toLowerCase());
    }
  }
} catch {
  // Si falla, usar la lista por defecto
}

const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .isLength({ min: 5, max: 254 })
    .withMessage('Email debe ser válido y tener entre 5 y 254 caracteres')
    .custom(async (value) => {
      // Verificar dominios sospechosos
      const domain = value.split('@')[1];
      if (suspiciousDomains.includes(domain)) {
        throw new Error('No se permiten emails temporales');
      }
      return true;
    }),

  password: body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,128}$/)
    .withMessage(
      'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'
    )
    .custom(async (value) => {
      // Lista de contraseñas comunes a evitar
      const commonPasswords = [
        'password123',
        '123456789',
        'qwerty123',
        'admin123',
        'password1',
        'welcome123',
        'Password123',
        'abc123456',
        'password!',
        'Password1!',
      ];
      if (commonPasswords.includes(value)) {
        throw new Error('La contraseña es demasiado común');
      }
      return true;
    }),

  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios')
    .custom(async (value) => {
      // Verificar que no contenga palabras ofensivas
      const offensiveWords = ['admin', 'root', 'null', 'undefined', 'system', 'administrator'];
      const lowercaseName = value.toLowerCase();
      for (const word of offensiveWords) {
        if (lowercaseName.includes(word)) {
          throw new Error('El nombre contiene palabras no permitidas');
        }
      }
      // Bloquear intentos de inyección de comandos
      if (commandInjectionPattern.test(value)) {
        throw new Error('El nombre contiene caracteres peligrosos');
      }
      return true;
    }),

  id: param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo').toInt(),

  page: query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('La página debe ser un número entre 1 y 1000')
    .toInt(),

  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100')
    .toInt(),

  search: query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('La búsqueda debe tener entre 1 y 100 caracteres')
    .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$/)
    .withMessage('La búsqueda contiene caracteres no permitidos'),
};

// Validaciones para autenticación
export const validateRegister = [
  commonValidations.email,
  commonValidations.password,
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Las contraseñas no coinciden');
    }
    return true;
  }),
  commonValidations.name,
  body('terms')
    .isBoolean()
    .withMessage('Debes aceptar los términos y condiciones')
    .custom((value) => {
      if (!value) {
        throw new Error('Debes aceptar los términos y condiciones');
      }
      return true;
    }),
  handleValidationErrors,
];

export const validateLogin = [
  commonValidations.email,
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 1, max: 128 })
    .withMessage('La contraseña no puede estar vacía'),
  body('rememberMe').optional().isBoolean().withMessage('RememberMe debe ser un booleano'),
  handleValidationErrors,
];

export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida')
    .isLength({ min: 1, max: 128 })
    .withMessage('La contraseña actual no puede estar vacía'),
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('La nueva contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'La nueva contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'
    )
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('La nueva contraseña debe ser diferente a la actual');
      }
      return true;
    }),
  body('confirmNewPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Las contraseñas no coinciden');
    }
    return true;
  }),
  handleValidationErrors,
];

// Validaciones para perfiles
export const validateProfileUpdate = [
  commonValidations.name,
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La biografía no puede tener más de 500 caracteres')
    .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,!?;:()\-_"']+$/)
    .withMessage('La biografía contiene caracteres no permitidos'),
  body('phone')
    .optional()
    .isMobilePhone('es-ES')
    .withMessage('El teléfono debe ser un número válido'),
  body('website')
    .optional()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('La página web debe ser una URL válida'),
  handleValidationErrors,
];

// Validaciones para búsqueda y paginación
export const validateSearch = [
  commonValidations.search,
  commonValidations.page,
  commonValidations.limit,
  query('sortBy')
    .optional()
    .isIn(['name', 'email', 'createdAt', 'updatedAt'])
    .withMessage('El campo de ordenación no es válido'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('El orden debe ser asc o desc'),
  query('filter')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('El filtro debe tener entre 1 y 50 caracteres')
    .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$/)
    .withMessage('El filtro contiene caracteres no permitidos'),
  handleValidationErrors,
];

// Validaciones para archivos
export const validateFileUpload = [
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede tener más de 200 caracteres'),
  body('category')
    .optional()
    .isIn(['image', 'document', 'video', 'audio'])
    .withMessage('La categoría debe ser válida'),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        error: 'Archivo requerido',
        message: 'Debes seleccionar un archivo',
      });
    }

    // Verificar tipo de archivo
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: 'Tipo de archivo no permitido',
        message: 'Solo se permiten imágenes, documentos PDF y archivos de texto',
      });
    }

    // Verificar tamaño del archivo
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        error: 'Archivo demasiado grande',
        message: 'El archivo no puede superar los 5MB',
      });
    }

    next();
  },
  handleValidationErrors,
];

// Validaciones para APIs
export const validateApiRequest = [
  body('data')
    .isObject()
    .withMessage('Los datos deben ser un objeto JSON válido')
    .custom((value) => {
      // Verificar que no contenga propiedades peligrosas
      const checkKeys = (obj, depth = 0) => {
        if (depth > 10) return; // Prevenir recursión infinita

        for (const key in obj) {
          if (dangerousKeys.includes(key.toLowerCase())) {
            throw new Error(`Propiedad no permitida: ${key}`);
          }

          if (typeof obj[key] === 'object' && obj[key] !== null) {
            checkKeys(obj[key], depth + 1);
          }
        }
      };

      checkKeys(value);
      return true;
    }),
  handleValidationErrors,
];

// Validaciones para parámetros de URL
export const validateUrlParams = [commonValidations.id, handleValidationErrors];

// Middleware para manejar errores de validación
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    // Log del error de validación
    console.warn(`Errores de validación en ${req.originalUrl}:`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      errors: errorMessages,
    });

    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      message: 'Los datos proporcionados no son válidos',
      details: errorMessages,
    });
  }

  next();
}

// Función para validar datos de entrada manualmente
export function validateData(data, schema) {
  const errors = [];

  for (const field in schema) {
    const rules = schema[field];
    const value = data[field];

    // Verificar si es requerido
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: rules.message || `${field} es requerido`,
      });
      continue;
    }

    // Si no es requerido y está vacío, saltar validación
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Validar tipo
    if (rules.type && typeof value !== rules.type) {
      errors.push({
        field,
        message: `${field} debe ser de tipo ${rules.type}`,
      });
      continue;
    }

    // Validar longitud
    if (rules.minLength && value.length < rules.minLength) {
      errors.push({
        field,
        message: `${field} debe tener al menos ${rules.minLength} caracteres`,
      });
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push({
        field,
        message: `${field} no puede tener más de ${rules.maxLength} caracteres`,
      });
    }

    // Validar patrón
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push({
        field,
        message: rules.message || `${field} no tiene un formato válido`,
      });
    }

    // Validación personalizada
    if (rules.custom) {
      try {
        const result = rules.custom(value, data);
        if (result !== true) {
          errors.push({
            field,
            message: result || `${field} no es válido`,
          });
        }
      } catch (error) {
        errors.push({
          field,
          message: error.message || `${field} no es válido`,
        });
      }
    }
  }

  return errors;
}

// Esquemas de validación para uso manual
export const schemas = {
  user: {
    email: {
      required: true,
      type: 'string',
      minLength: 5,
      maxLength: 254,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Email debe ser válido',
      custom: (value) => {
        // Verificar dominios sospechosos
        const domain = value.split('@')[1];
        if (suspiciousDomains.includes(domain)) {
          return 'No se permiten emails temporales';
        }
        return true;
      },
    },
    password: {
      required: true,
      type: 'string',
      minLength: 8,
      maxLength: 128,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
      message:
        'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial',
    },
    name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      message: 'El nombre solo puede contener letras y espacios',
    },
  },

  search: {
    query: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$/,
      message: 'La búsqueda contiene caracteres no permitidos',
    },
    page: {
      required: false,
      type: 'number',
      custom: (value) => {
        if (value < 1 || value > 1000) {
          return 'La página debe estar entre 1 y 1000';
        }
        return true;
      },
    },
    limit: {
      required: false,
      type: 'number',
      custom: (value) => {
        if (value < 1 || value > 100) {
          return 'El límite debe estar entre 1 y 100';
        }
        return true;
      },
    },
  },
};

// Función para validar datos de usuario específicamente
export function validateUserData(userData) {
  const errors = [];

  // Validar email si está presente
  if (userData.email !== undefined) {
    if (!userData.email || typeof userData.email !== 'string') {
      errors.push('Email es requerido y debe ser una cadena de texto');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Email debe tener un formato válido');
    } else if (userData.email.length < 5 || userData.email.length > 254) {
      errors.push('Email debe tener entre 5 y 254 caracteres');
    } else {
      // Verificar dominios sospechosos
      const domain = userData.email.split('@')[1];
      if (suspiciousDomains.includes(domain)) {
        errors.push('No se permiten emails temporales');
      }
    }
  }

  // Validar password si está presente
  if (userData.password !== undefined) {
    if (!userData.password || typeof userData.password !== 'string') {
      errors.push('Contraseña es requerida y debe ser una cadena de texto');
    } else if (userData.password.length < 8 || userData.password.length > 128) {
      errors.push('La contraseña debe tener entre 8 y 128 caracteres');
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/.test(
        userData.password
      )
    ) {
      errors.push(
        'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'
      );
    } else {
      // Lista de contraseñas comunes a evitar
      const commonPasswords = [
        'password123',
        '123456789',
        'qwerty123',
        'admin123',
        'password1',
        'welcome123',
        'Password123',
        'abc123456',
        'password!',
        'Password1!',
      ];
      if (commonPasswords.includes(userData.password)) {
        errors.push('La contraseña es demasiado común');
      }
    }
  }

  // Validar name si está presente
  if (userData.name !== undefined) {
    if (!userData.name || typeof userData.name !== 'string') {
      errors.push('Nombre es requerido y debe ser una cadena de texto');
    } else if (userData.name.length < 2 || userData.name.length > 50) {
      errors.push('El nombre debe tener entre 2 y 50 caracteres');
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(userData.name)) {
      errors.push('El nombre solo puede contener letras y espacios');
    } else {
      // Palabras prohibidas
      const offensiveWords = ['admin', 'root', 'null', 'undefined', 'system', 'administrator'];
      const lowercaseName = userData.name.toLowerCase();
      for (const word of offensiveWords) {
        if (lowercaseName.includes(word)) {
          errors.push('El nombre contiene palabras no permitidas');
          break;
        }
      }
      // Bloquear intentos de inyección de comandos
      if (commandInjectionPattern.test(userData.name)) {
        errors.push('El nombre contiene caracteres peligrosos');
      }
    }
  }

  // Validar username si está presente
  if (userData.username !== undefined && userData.username) {
    if (typeof userData.username !== 'string') {
      errors.push('Username debe ser una cadena de texto');
    } else if (userData.username.length < 3 || userData.username.length > 30) {
      errors.push('Username debe tener entre 3 y 30 caracteres');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(userData.username)) {
      errors.push('Username solo puede contener letras, números, guiones y guiones bajos');
    }
  }

  // Validar role si está presente
  if (userData.role !== undefined) {
    const validRoles = ['user', 'admin', 'moderator'];
    if (!validRoles.includes(userData.role)) {
      errors.push('Rol debe ser uno de: user, admin, moderator');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

export default {
  validateRegister,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validateSearch,
  validateFileUpload,
  validateApiRequest,
  validateUrlParams,
  handleValidationErrors,
  validateData,
  validateUserData,
  schemas,
};
