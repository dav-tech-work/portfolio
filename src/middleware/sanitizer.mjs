import { sanitize } from '../utils/seguridad/index.mjs';
import { registrar } from '../utils/servicios/logger.mjs';

export default function sanitizerMiddleware(req, res, next) {
  // Sanitizar body y params (que se pueden modificar)
  ['body', 'params'].forEach((field) => {
    const original = req[field];
    const sanitized = sanitize.json(original);
    if (JSON.stringify(original) !== JSON.stringify(sanitized)) {
      registrar(`Sanitización aplicada en '${field}'`, 'info');
    }
    req[field] = sanitized;
  });

  // Para query, crear una copia sanitizada en req.sanitizedQuery
  if (req.query) {
    const originalQuery = req.query;
    const sanitizedQuery = sanitize.json(originalQuery);
    if (JSON.stringify(originalQuery) !== JSON.stringify(sanitizedQuery)) {
      registrar(`Sanitización aplicada en 'query'`, 'info');
      req.sanitizedQuery = sanitizedQuery;
    }
  }

  next();
}
