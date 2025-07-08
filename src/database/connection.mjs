/**
 * ARCHIVO DESHABILITADO - Database Connection
 * @description Este archivo reemplaza la conexión a MongoDB que fue removida
 * 
 * Si necesitas usar una base de datos en el futuro, puedes:
 * 1. Ver el archivo connection.mjs.original para referencia
 * 2. Instalar el driver correspondiente (mongodb, mysql2, pg, etc.)
 * 3. Adaptar la configuración según tu base de datos elegida
 */

// Funciones stub para mantener compatibilidad con código existente
export async function connectToDatabase() {
  console.warn('⚠️  Database connection is disabled. Enable database support if needed.');
  return { client: null, db: null };
}

export async function getDatabase() {
  console.warn('⚠️  Database connection is disabled. Enable database support if needed.');
  return null;
}

export async function getClient() {
  console.warn('⚠️  Database connection is disabled. Enable database support if needed.');
  return null;
}

export async function closeConnection() {
  // No-op since no real connection exists
  console.log('ℹ️  Database connection is disabled - no connection to close');
}

export async function checkConnectionHealth() {
  return {
    status: 'disabled',
    connected: false,
    message: 'Database connection is disabled',
    timestamp: new Date().toISOString(),
  };
}

export async function createIndexes() {
  console.warn('⚠️  Database connection is disabled. Enable database support if needed.');
  return false;
}

export async function performMaintenance() {
  console.warn('⚠️  Database connection is disabled. Enable database support if needed.');
  return { status: 'disabled' };
}

export async function getDatabaseMetrics() {
  return {
    status: 'disabled',
    message: 'Database connection is disabled',
    timestamp: new Date().toISOString(),
  };
}

export default {
  connectToDatabase,
  getDatabase,
  getClient,
  closeConnection,
  checkConnectionHealth,
  createIndexes,
  performMaintenance,
  getDatabaseMetrics,
};
