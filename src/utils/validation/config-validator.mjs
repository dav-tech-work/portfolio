/**
 * Validador de Configuración Centralizado
 * Elimina duplicación de funciones de validación
 */

import logger from '../logger-production.mjs';
import config from '../../config/index.mjs';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Validar configuración crítica de la aplicación
 * @param {Object} customConfig - Configuración personalizada (opcional)
 * @returns {Promise<boolean>} - True si la configuración es válida
 * @throws {Error} - Si hay errores críticos de configuración
 */
export async function validateConfiguration(customConfig = null) {
  const configToValidate = customConfig || config;

  try {
    // Variables de entorno requeridas
    const requiredVars = ['SESSION_SECRET', 'JWT_SECRET'];

    // Validar variables requeridas
    const missing = requiredVars.filter((varName) => !configToValidate[varName]);

    if (missing.length > 0) {
      throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
    }

    // Validar fortaleza de secretos
    if (configToValidate.SESSION_SECRET.length < 32) {
      throw new Error('SESSION_SECRET debe tener al menos 32 caracteres');
    }

    if (configToValidate.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
    }

    // Validar puerto
    const port = parseInt(configToValidate.PORT);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error('PORT debe ser un número válido entre 1 y 65535');
    }

    // Validar URL de la aplicación
    if (configToValidate.NODE_ENV === 'production' && !configToValidate.APP_URL) {
      logger.warn('APP_URL no está configurada - se usará localhost por defecto');
    }

    // Validar configuración de email en producción
    if (configToValidate.NODE_ENV === 'production') {
      const emailVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
      const missingEmailVars = emailVars.filter((varName) => !configToValidate[varName]);

      if (missingEmailVars.length > 0) {
        logger.warn(`Variables de email faltantes en producción: ${missingEmailVars.join(', ')}`);
      }
    }

    // Validar configuración de clustering
    if (configToValidate.ENABLE_CLUSTERING && configToValidate.NODE_ENV !== 'production') {
      logger.warn('ENABLE_CLUSTERING está activado pero NODE_ENV no es production');
    }

    // Validar configuración de logging
    const validLogLevels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
    if (
      configToValidate.LOG_LEVEL &&
      !validLogLevels.includes(configToValidate.LOG_LEVEL.toUpperCase())
    ) {
      logger.warn(`LOG_LEVEL inválido: ${configToValidate.LOG_LEVEL}. Usando INFO por defecto.`);
    }

    // Validar configuración de rate limiting
    if (configToValidate.RATE_LIMIT_WINDOW_MS && configToValidate.RATE_LIMIT_WINDOW_MS < 1000) {
      logger.warn('RATE_LIMIT_WINDOW_MS es muy bajo - puede causar problemas de rendimiento');
    }

    // Validar configuración de sesiones
    if (configToValidate.SESSION_MAX_AGE && configToValidate.SESSION_MAX_AGE < 60000) {
      logger.warn('SESSION_MAX_AGE es muy bajo - puede causar problemas de usabilidad');
    }

    logger.success('Configuración validada correctamente');
    return true;
  } catch (error) {
    logger.error('Error en validación de configuración', { error: error.message });
    throw error;
  }
}

/**
 * Validar configuración específica para base de datos
 * @param {Object} dbConfig - Configuración de base de datos
 * @returns {Promise<boolean>} - True si la configuración es válida
 */
export async function validateDatabaseConfiguration(dbConfig = null) {
  const configToValidate = dbConfig || config;

  try {
    // Validar URI de base de datos
    if (!configToValidate.DB_URI) {
      throw new Error('DB_URI es requerida');
    }

    // Validar que la URI sea válida
    try {
      new URL(configToValidate.DB_URI);
    } catch {
      throw new Error('DB_URI no es una URL válida');
    }

    // Validar nombre de base de datos
    if (!configToValidate.DB_NAME) {
      throw new Error('DB_NAME es requerido');
    }

    // Validar que el nombre de la base de datos no contenga caracteres especiales
    const dbNameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!dbNameRegex.test(configToValidate.DB_NAME)) {
      throw new Error('DB_NAME contiene caracteres inválidos');
    }

    // Validar configuración de conexión
    if (configToValidate.DB_MAX_POOL_SIZE && configToValidate.DB_MAX_POOL_SIZE < 1) {
      throw new Error('DB_MAX_POOL_SIZE debe ser mayor a 0');
    }

    if (
      configToValidate.DB_SERVER_SELECTION_TIMEOUT_MS &&
      configToValidate.DB_SERVER_SELECTION_TIMEOUT_MS < 1000
    ) {
      logger.warn('DB_SERVER_SELECTION_TIMEOUT_MS es muy bajo');
    }

    logger.success('Configuración de base de datos validada correctamente');
    return true;
  } catch (error) {
    logger.error('Error en validación de configuración de base de datos', { error: error.message });
    throw error;
  }
}

/**
 * Validar configuración específica para seguridad
 * @param {Object} securityConfig - Configuración de seguridad
 * @returns {Promise<boolean>} - True si la configuración es válida
 */
export async function validateSecurityConfiguration(securityConfig = null) {
  const configToValidate = securityConfig || config;

  try {
    // Validar secretos de seguridad
    const securitySecrets = ['SESSION_SECRET', 'JWT_SECRET', 'CSRF_SECRET'];

    for (const secret of securitySecrets) {
      if (!configToValidate[secret]) {
        throw new Error(`${secret} es requerido`);
      }

      if (configToValidate[secret].length < 32) {
        throw new Error(`${secret} debe tener al menos 32 caracteres`);
      }

      // Validar que no sean secretos por defecto o débiles
      const weakSecrets = ['secret', 'password', 'default', '123456'];
      if (weakSecrets.some((weak) => configToValidate[secret].toLowerCase().includes(weak))) {
        throw new Error(`${secret} es demasiado débil`);
      }
    }

    // Validar configuración de HTTPS en producción
    if (configToValidate.NODE_ENV === 'production') {
      if (!configToValidate.HTTPS_ENABLED && !configToValidate.TRUST_PROXY) {
        logger.warn('HTTPS no está habilitado en producción - esto es un riesgo de seguridad');
      }
    }

    // Validar configuración de CORS
    if (configToValidate.CORS_ORIGIN && configToValidate.CORS_ORIGIN === '*') {
      if (configToValidate.NODE_ENV === 'production') {
        logger.warn(
          'CORS_ORIGIN configurado como * en producción - esto es un riesgo de seguridad'
        );
      }
    }

    // Validar configuración de rate limiting
    if (configToValidate.RATE_LIMIT_MAX && configToValidate.RATE_LIMIT_MAX > 1000) {
      logger.warn('RATE_LIMIT_MAX es muy alto - puede no proteger efectivamente contra ataques');
    }

    logger.success('Configuración de seguridad validada correctamente');
    return true;
  } catch (error) {
    logger.error('Error en validación de configuración de seguridad', { error: error.message });
    throw error;
  }
}

/**
 * Validar toda la configuración de la aplicación
 * @param {Object} fullConfig - Configuración completa (opcional)
 * @returns {Promise<boolean>} - True si toda la configuración es válida
 */
export async function validateAllConfiguration(fullConfig = null) {
  try {
    await validateConfiguration(fullConfig);
    await validateSecurityConfiguration(fullConfig);

    logger.success('Toda la configuración ha sido validada correctamente');
    return true;
  } catch (error) {
    logger.error('Error en validación completa de configuración', { error: error.message });
    throw error;
  }
}

/**
 * Validar configuración para entorno específico
 * @param {string} environment - Entorno (development, production, test)
 * @param {Object} envConfig - Configuración específica del entorno
 * @returns {Promise<boolean>} - True si la configuración es válida para el entorno
 */
export async function validateEnvironmentConfiguration(environment, envConfig = null) {
  const configToValidate = envConfig || config;

  try {
    switch (environment) {
      case 'production':
        await validateProductionConfiguration(configToValidate);
        break;
      case 'development':
        await validateDevelopmentConfiguration(configToValidate);
        break;
      case 'test':
        await validateTestConfiguration(configToValidate);
        break;
      default:
        throw new Error(`Entorno desconocido: ${environment}`);
    }

    logger.success(`Configuración para entorno ${environment} validada correctamente`);
    return true;
  } catch (error) {
    logger.error(`Error en validación de configuración para entorno ${environment}`, {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Validar configuración específica para producción
 */
async function validateProductionConfiguration(config) {
  const requiredProdVars = ['SESSION_SECRET', 'JWT_SECRET', 'APP_URL'];

  const missing = requiredProdVars.filter((varName) => !config[varName]);
  if (missing.length > 0) {
    throw new Error(`Variables requeridas en producción: ${missing.join(', ')}`);
  }

  if (config.LOG_LEVEL === 'DEBUG') {
    logger.warn('LOG_LEVEL "DEBUG" no recomendado en producción');
  }
}

/**
 * Validar configuración específica para desarrollo
 */
async function validateDevelopmentConfiguration(config) {
  if (!config.SESSION_SECRET || config.SESSION_SECRET.length < 16) {
    logger.warn('SESSION_SECRET débil en desarrollo - usa algo más fuerte');
  }
}

/**
 * Validar configuración específica para testing
 */
async function validateTestConfiguration(config) {
  if (config.NODE_ENV !== 'test') {
    logger.warn('NODE_ENV no está configurado como "test"');
  }
}
