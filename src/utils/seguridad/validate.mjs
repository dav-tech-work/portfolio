import { memoize } from './memoize.mjs';

const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,20}$/,
  PHONE: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.0-9]{7,15}$/,
  DANGEROUS: /[<>'"&`]/,
  SCRIPTING: /\b(?:javascript|expression|eval)\b/i,
};

export const validarText = memoize((input, maxLength = 1000) => {
  if (typeof input !== 'string') return false;
  if (input.length > maxLength) return false;
  return !REGEX.DANGEROUS.test(input) && !REGEX.SCRIPTING.test(input);
});

export const validarEmail = memoize((email) => {
  if (typeof email !== 'string') return false;
  return REGEX.EMAIL.test(email) && email.length <= 254;
});

export const validarTelefono = memoize((phone) => {
  if (typeof phone !== 'string') return false;
  return REGEX.PHONE.test(phone);
});

export const validarUrl = memoize((url) => {
  if (typeof url !== 'string') return false;
  try {
    const obj = new URL(url);
    return ['http:', 'https:'].includes(obj.protocol);
  } catch {
    return (url.startsWith('/') || url.startsWith('#')) && !REGEX.DANGEROUS.test(url);
  }
});

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {Object} Resultado de la validación
 */
export function validarPassword(password) {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      errors: ['La contraseña es requerida'],
    };
  }

  const errors = [];

  // Longitud mínima
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  // Longitud máxima
  if (password.length > 128) {
    errors.push('La contraseña no puede tener más de 128 caracteres');
  }

  // Al menos una letra mayúscula
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  // Al menos una letra minúscula
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }

  // Al menos un número
  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  // Al menos un carácter especial (solo caracteres seguros)
  if (!/[@$!%*?&#]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial (@$!%*?&#)');
  }

  // Verificar que no contenga espacios
  if (/\s/.test(password)) {
    errors.push('La contraseña no puede contener espacios');
  }

  // Verificar que no contenga caracteres peligrosos (excluir los caracteres especiales permitidos)
  const caracteresPeligrosos = /[<>"'`\\(){}[\];+,:?^~]/;
  if (caracteresPeligrosos.test(password)) {
    errors.push('La contraseña contiene caracteres no permitidos');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valida un nombre de usuario
 * @param {string} username - Nombre de usuario a validar
 * @returns {Object} Resultado de la validación
 */
export function validarUsername(username) {
  if (!username || typeof username !== 'string') {
    return {
      isValid: false,
      errors: ['El nombre de usuario es requerido'],
    };
  }

  const errors = [];

  // Longitud
  if (username.length < 3) {
    errors.push('El nombre de usuario debe tener al menos 3 caracteres');
  }

  if (username.length > 30) {
    errors.push('El nombre de usuario no puede tener más de 30 caracteres');
  }

  // Solo letras, números, guiones y guiones bajos
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push(
      'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'
    );
  }

  // No puede empezar con número
  if (/^\d/.test(username)) {
    errors.push('El nombre de usuario no puede empezar con un número');
  }

  // No puede terminar con guión o guión bajo
  if (/[_-]$/.test(username)) {
    errors.push('El nombre de usuario no puede terminar con guión o guión bajo');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valida un código postal
 * @param {string} codigoPostal - Código postal a validar
 * @returns {boolean} True si es válido
 */
export function validarCodigoPostal(codigoPostal) {
  if (!codigoPostal || typeof codigoPostal !== 'string') return false;

  // Eliminar espacios
  const limpio = codigoPostal.replace(/\s/g, '');

  // Validar formato español (5 dígitos)
  const codigoPostalRegex = /^\d{5}$/;
  return codigoPostalRegex.test(limpio);
}

/**
 * Valida una fecha
 * @param {string} fecha - Fecha a validar (formato YYYY-MM-DD)
 * @returns {boolean} True si es válido
 */
export function validarFecha(fecha) {
  if (!fecha || typeof fecha !== 'string') return false;

  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!fechaRegex.test(fecha)) return false;

  const fechaObj = new Date(fecha);
  if (isNaN(fechaObj.getTime())) return false;

  // Verificar que la fecha no sea futura (opcional)
  const ahora = new Date();
  if (fechaObj > ahora) return false;

  return true;
}

/**
 * Valida un número de tarjeta de crédito (formato básico)
 * @param {string} numero - Número de tarjeta a validar
 * @returns {boolean} True si es válido
 */
export function validarTarjetaCredito(numero) {
  if (!numero || typeof numero !== 'string') return false;

  // Eliminar espacios y guiones
  const limpio = numero.replace(/[\s-]/g, '');

  // Validar que solo contenga números y tenga entre 13 y 19 dígitos
  const tarjetaRegex = /^\d{13,19}$/;
  if (!tarjetaRegex.test(limpio)) return false;

  // Algoritmo de Luhn
  let suma = 0;
  let esPar = false;

  for (let i = limpio.length - 1; i >= 0; i--) {
    let digito = parseInt(limpio[i]);

    if (esPar) {
      digito *= 2;
      if (digito > 9) {
        digito -= 9;
      }
    }

    suma += digito;
    esPar = !esPar;
  }

  return suma % 10 === 0;
}

// ===== FUNCIONES DE VALIDACIÓN PARA EXPRESS =====

/**
 * Middleware para validar registro de usuario
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export function validateRegister(req, res, next) {
  const { email, password, name } = req.body;
  const errors = [];

  // Validar email
  if (!validarEmail(email)) {
    errors.push('Email inválido');
  }

  // Validar contraseña
  const passwordValidation = validarPassword(password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }

  // Validar nombre
  if (!validarText(name)) {
    errors.push('El nombre debe tener entre 2 y 50 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: errors,
    });
  }

  next();
}

/**
 * Middleware para validar login
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  // Validar email
  if (!validarEmail(email)) {
    errors.push('Email inválido');
  }

  // Validar que la contraseña no esté vacía
  if (!password || password.trim().length === 0) {
    errors.push('La contraseña es requerida');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: errors,
    });
  }

  next();
}

/**
 * Middleware para validar cambio de contraseña
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export function validatePasswordChange(req, res, next) {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  // Validar contraseña actual
  if (!currentPassword || currentPassword.trim().length === 0) {
    errors.push('La contraseña actual es requerida');
  }

  // Validar nueva contraseña
  const passwordValidation = validarPassword(newPassword);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: errors,
    });
  }

  next();
}
