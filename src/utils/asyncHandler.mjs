import { logger } from './logger-enhanced.mjs';

/**
 * Wrapper para manejar errores en funciones asíncronas de Express
 * Evita tener que usar try/catch en cada ruta async
 *
 * @param {Function} fn - Función async a envolver
 * @returns {Function} - Función wrapper que captura errores
 *
 * @example
 * router.get('/ruta', asyncHandler(async (req, res) => {
 *   const data = await operacionAsincrona();
 *   res.json(data);
 * }));
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    logger.error(`Error en ruta ${req.method} ${req.path}: ${error.message}`);
    next(error);
  });
};

/**
 * Wrapper específico para middlewares que necesitan manejo de errores async
 *
 * @param {Function} fn - Middleware async a envolver
 * @returns {Function} - Middleware wrapper que captura errores
 */
export const asyncMiddleware = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
