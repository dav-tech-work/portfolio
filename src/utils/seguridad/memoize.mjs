/**
 * Sistema de memoización para optimizar el rendimiento
 * Cachea resultados de funciones costosas
 */

// Cache global para memoización
const cache = new Map();

/**
 * Función de memoización básica
 * @param {Function} fn - Función a memoizar
 * @param {number} ttl - Tiempo de vida en milisegundos
 * @returns {Function} Función memoizada
 */
export function memoize(fn, ttl = 300000) {
  // 5 minutos por defecto
  return function (...args) {
    const key = JSON.stringify(args);
    const now = Date.now();

    if (cache.has(key)) {
      const cached = cache.get(key);
      if (now - cached.timestamp < ttl) {
        return cached.value;
      } else {
        cache.delete(key);
      }
    }

    const result = fn.apply(this, args);
    cache.set(key, {
      value: result,
      timestamp: now,
    });

    return result;
  };
}

/**
 * Función de memoización con limpieza automática
 * @param {Function} fn - Función a memoizar
 * @param {number} ttl - Tiempo de vida en milisegundos
 * @param {number} maxSize - Tamaño máximo del cache
 * @returns {Function} Función memoizada
 */
export function memoizeWithCleanup(fn, ttl = 300000, maxSize = 1000) {
  const memoizedFn = memoize(fn, ttl);

  // Limpiar cache periódicamente
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > ttl) {
        cache.delete(key);
      }
    }
  }, ttl);

  // Limpiar cache si excede el tamaño máximo
  const originalFn = memoizedFn;
  return function (...args) {
    if (cache.size > maxSize) {
      // Eliminar entradas más antiguas
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toDelete = Math.floor(maxSize * 0.2); // Eliminar 20% más antiguos
      for (let i = 0; i < toDelete; i++) {
        cache.delete(entries[i][0]);
      }
    }

    return originalFn.apply(this, args);
  };
}

/**
 * Función de memoización para funciones asíncronas
 * @param {Function} fn - Función asíncrona a memoizar
 * @param {number} ttl - Tiempo de vida en milisegundos
 * @returns {Function} Función memoizada
 */
export function memoizeAsync(fn, ttl = 300000) {
  const pending = new Map();

  return async function (...args) {
    const key = JSON.stringify(args);
    const now = Date.now();

    // Si hay una promesa pendiente, esperar
    if (pending.has(key)) {
      return pending.get(key);
    }

    // Si hay resultado en cache y no ha expirado, usarlo
    if (cache.has(key)) {
      const cached = cache.get(key);
      if (now - cached.timestamp < ttl) {
        return cached.value;
      } else {
        cache.delete(key);
      }
    }

    // Ejecutar función y cachear resultado
    const promise = fn.apply(this, args);
    pending.set(key, promise);

    try {
      const result = await promise;
      cache.set(key, {
        value: result,
        timestamp: now,
      });
      pending.delete(key);
      return result;
    } catch (error) {
      pending.delete(key);
      throw error;
    }
  };
}

/**
 * Función de memoización con invalidación manual
 * @param {Function} fn - Función a memoizar
 * @param {number} ttl - Tiempo de vida en milisegundos
 * @returns {Object} Objeto con función memoizada y método de invalidación
 */
export function memoizeWithInvalidation(fn, ttl = 300000) {
  const memoizedFn = memoize(fn, ttl);

  return {
    fn: memoizedFn,
    invalidate: (...args) => {
      const key = JSON.stringify(args);
      cache.delete(key);
    },
    invalidateAll: () => {
      cache.clear();
    },
    invalidatePattern: (pattern) => {
      for (const key of cache.keys()) {
        if (key.includes(pattern)) {
          cache.delete(key);
        }
      }
    },
  };
}

/**
 * Función de memoización con dependencias
 * @param {Function} fn - Función a memoizar
 * @param {Function} getDependencies - Función que retorna dependencias
 * @param {number} ttl - Tiempo de vida en milisegundos
 * @returns {Function} Función memoizada
 */
export function memoizeWithDependencies(fn, getDependencies, ttl = 300000) {
  return function (...args) {
    const dependencies = getDependencies(...args);
    const key = JSON.stringify([args, dependencies]);
    const now = Date.now();

    if (cache.has(key)) {
      const cached = cache.get(key);
      if (now - cached.timestamp < ttl) {
        return cached.value;
      } else {
        cache.delete(key);
      }
    }

    const result = fn.apply(this, args);
    cache.set(key, {
      value: result,
      timestamp: now,
    });

    return result;
  };
}

/**
 * Limpia todo el cache
 */
export function clearCache() {
  cache.clear();
}

/**
 * Obtiene estadísticas del cache
 * @returns {Object} Estadísticas del cache
 */
export function getCacheStats() {
  const now = Date.now();
  let expired = 0;
  let valid = 0;

  for (const value of cache.values()) {
    if (now - value.timestamp > 300000) {
      // 5 minutos
      expired++;
    } else {
      valid++;
    }
  }

  return {
    total: cache.size,
    valid,
    expired,
    memoryUsage: process.memoryUsage(),
  };
}

/**
 * Función de memoización para funciones que dependen del tiempo
 * @param {Function} fn - Función a memoizar
 * @param {number} interval - Intervalo de tiempo en milisegundos
 * @returns {Function} Función memoizada
 */
export function memoizeWithTimeInterval(fn, interval = 60000) {
  // 1 minuto por defecto
  return function (...args) {
    const now = Date.now();
    const timeKey = Math.floor(now / interval);
    const key = JSON.stringify([args, timeKey]);

    if (cache.has(key)) {
      return cache.get(key).value;
    }

    const result = fn.apply(this, args);
    cache.set(key, {
      value: result,
      timestamp: now,
    });

    return result;
  };
}
