import validator from 'validator';

export const sanitizeInput = (req, res, next) => {
  // Sanitizar todos los campos de entrada
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Escapar caracteres HTML y limpiar
        obj[key] = validator.escape(obj[key].trim());

        // Normalizar espacios en blanco
        obj[key] = obj[key].replace(/\s+/g, ' ');

        // eslint-disable-next-line no-control-regex
        obj[key] = obj[key].replace(/[\x00-\x1F\x7F]/g, '');

        // Limitar longitud máxima
        if (obj[key].length > 1000) {
          obj[key] = obj[key].substring(0, 1000);
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  // Aplicar sanitización a diferentes partes del request
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);

  // Para query, crear una copia sanitizada
  if (req.query) {
    const originalQuery = JSON.parse(JSON.stringify(req.query));
    sanitizeObject(originalQuery);
    req.sanitizedQuery = originalQuery;
  }

  next();
};

export const validateAndSanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email requerido' };
  }

  const sanitized = validator.normalizeEmail(email.trim());
  if (!sanitized || !validator.isEmail(sanitized)) {
    return { valid: false, error: 'Email inválido' };
  }

  return { valid: true, value: sanitized };
};

export const validateAndSanitizeName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Nombre requerido' };
  }

  let sanitized = validator.escape(name.trim());
  sanitized = sanitized.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');

  if (sanitized.length < 2 || sanitized.length > 50) {
    return { valid: false, error: 'Nombre debe tener entre 2 y 50 caracteres' };
  }

  return { valid: true, value: sanitized };
};

export const validateAndSanitizeMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Mensaje requerido' };
  }

  let sanitized = validator.escape(message.trim());
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  if (sanitized.length < 10 || sanitized.length > 1000) {
    return { valid: false, error: 'Mensaje debe tener entre 10 y 1000 caracteres' };
  }

  return { valid: true, value: sanitized };
};
