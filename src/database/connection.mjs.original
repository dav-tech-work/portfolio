/**
 * Gestor de Conexión a Base de Datos MongoDB
 * @description Sistema optimizado de conexión con pooling, reconnect automático y métricas
 */

import { MongoClient, ServerApiVersion } from 'mongodb';
import { configLoader } from '../config/environment.mjs';

const config = configLoader();

// Cache de conexión para evitar múltiples conexiones
let cachedClient = null;
let cachedDb = null;

// Configuración optimizada de MongoDB
const mongoOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: config.DB_MAX_POOL_SIZE || 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: config.DB_TIMEOUT || 5000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true,
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 5000,
  },
  readPreference: 'primary',
};

/**
 * Establece conexión a MongoDB con cache y optimizaciones
 * @returns {Promise<Object>} Cliente y base de datos
 */
export async function connectToDatabase() {
  // Usar cache si existe y está conectado
  if (cachedClient && cachedDb) {
    try {
      // Verificar que la conexión sigue activa
      await cachedClient.db('admin').admin().ping();
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      console.warn('🔄 Conexión cached no válida, reconectando...');
      cachedClient = null;
      cachedDb = null;
    }
  }

  try {
    console.log('🔗 Conectando a MongoDB...');

    // Crear nueva conexión
    const client = new MongoClient(config.DB_URI, mongoOptions);

    // Conectar
    await client.connect();

    // Verificar conexión
    await client.db('admin').admin().ping();

    // Obtener base de datos
    const db = client.db(config.DB_NAME);

    // Cachear conexión
    cachedClient = client;
    cachedDb = db;

    console.log(`✅ Conectado a MongoDB: ${config.DB_NAME}`);

    // Configurar event listeners para la conexión
    setupConnectionListeners(client);

    return { client, db };
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    throw new Error(`Error de conexión a base de datos: ${error.message}`);
  }
}

/**
 * Obtiene solo la base de datos (método de conveniencia)
 * @returns {Promise<Object>} Base de datos
 */
export async function getDatabase() {
  const { db } = await connectToDatabase();
  return db;
}

/**
 * Obtiene solo el cliente (método de conveniencia)
 * @returns {Promise<Object>} Cliente MongoDB
 */
export async function getClient() {
  const { client } = await connectToDatabase();
  return client;
}

/**
 * Configura listeners para eventos de conexión
 * @param {MongoClient} client - Cliente de MongoDB
 */
function setupConnectionListeners(client) {
  client.on('serverOpening', () => {
    console.log('🔗 Servidor MongoDB abriendo conexión...');
  });

  client.on('serverClosed', () => {
    console.log('🔒 Servidor MongoDB cerró conexión');
  });

  client.on('serverHeartbeatFailed', (event) => {
    console.warn('💔 Heartbeat falló:', event.failure?.message);
  });

  client.on('topologyOpening', () => {
    console.log('🌐 Topología MongoDB iniciando...');
  });

  client.on('topologyClosed', () => {
    console.log('🌐 Topología MongoDB cerrada');
    // Limpiar cache
    cachedClient = null;
    cachedDb = null;
  });
}

/**
 * Cierra la conexión a la base de datos
 * @returns {Promise<void>}
 */
export async function closeConnection() {
  if (cachedClient) {
    try {
      console.log('🔒 Cerrando conexión a MongoDB...');
      await cachedClient.close();
      cachedClient = null;
      cachedDb = null;
      console.log('✅ Conexión a MongoDB cerrada');
    } catch (error) {
      console.error('❌ Error cerrando conexión:', error.message);
    }
  }
}

/**
 * Verifica el estado de la conexión
 * @returns {Promise<Object>} Estado de la conexión
 */
export async function checkConnectionHealth() {
  try {
    const { client } = await connectToDatabase();

    // Ping al servidor
    const pingResult = await client.db('admin').admin().ping();

    // Stats de la base de datos
    const stats = await client.db('admin').admin().serverStatus();

    // Info de conexiones
    const connections = stats.connections;

    return {
      status: 'healthy',
      connected: true,
      ping: pingResult,
      database: config.DB_NAME,
      connections: {
        current: connections.current,
        available: connections.available,
        totalCreated: connections.totalCreated,
      },
      uptime: stats.uptime,
      version: stats.version,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Crea índices optimizados para la aplicación
 * @returns {Promise<void>}
 */
export async function createIndexes() {
  try {
    const db = await getDatabase();

    console.log('📊 Creando índices optimizados...');

    // Índices para usuarios
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true, background: true },
      { key: { username: 1 }, unique: true, sparse: true, background: true },
      { key: { createdAt: 1 }, background: true },
      { key: { lastLogin: 1 }, background: true },
      { key: { status: 1 }, background: true },
    ]);

    // Índices para sesiones (si se usan)
    await db.collection('sessions').createIndexes([
      { key: { _id: 1 }, background: true },
      { key: { expires: 1 }, expireAfterSeconds: 0, background: true },
      { key: { 'session.userId': 1 }, background: true },
    ]);

    // Índices para logs de seguridad
    await db.collection('security_logs').createIndexes([
      { key: { timestamp: 1 }, background: true },
      { key: { level: 1 }, background: true },
      { key: { ip: 1 }, background: true },
      { key: { userId: 1 }, sparse: true, background: true },
      { key: { type: 1 }, background: true },
    ]);

    console.log('✅ Índices creados exitosamente');
  } catch (error) {
    console.error('❌ Error creando índices:', error.message);
    throw error;
  }
}

/**
 * Ejecuta operaciones de mantenimiento de base de datos
 * @returns {Promise<Object>} Resultado del mantenimiento
 */
export async function performMaintenance() {
  try {
    const db = await getDatabase();

    console.log('🔧 Ejecutando mantenimiento de base de datos...');

    // Limpiar logs antiguos (más de 30 días)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const cleanupResult = await db.collection('security_logs').deleteMany({
      timestamp: { $lt: thirtyDaysAgo },
    });

    // Limpiar sesiones expiradas
    const expiredSessions = await db.collection('sessions').deleteMany({
      expires: { $lt: new Date() },
    });

    // Stats de colecciones
    const userStats = await db.collection('users').estimatedDocumentCount();
    const logStats = await db.collection('security_logs').estimatedDocumentCount();

    const result = {
      timestamp: new Date().toISOString(),
      logsDeleted: cleanupResult.deletedCount,
      sessionsDeleted: expiredSessions.deletedCount,
      collections: {
        users: userStats,
        logs: logStats,
      },
    };

    console.log('✅ Mantenimiento completado:', result);
    return result;
  } catch (error) {
    console.error('❌ Error en mantenimiento:', error.message);
    throw error;
  }
}

/**
 * Obtiene métricas de la base de datos
 * @returns {Promise<Object>} Métricas detalladas
 */
export async function getDatabaseMetrics() {
  try {
    const { db } = await connectToDatabase();

    // Stats del servidor
    const serverStatus = await db.admin().serverStatus();

    // Stats de la base de datos
    const dbStats = await db.stats();

    // Stats de colecciones
    const collections = await db.listCollections().toArray();
    const collectionStats = {};

    for (const collection of collections) {
      try {
        const stats = await db.collection(collection.name).stats();
        collectionStats[collection.name] = {
          documents: stats.count,
          size: stats.size,
          storageSize: stats.storageSize,
          indexes: stats.nindexes,
          indexSize: stats.totalIndexSize,
        };
      } catch (error) {
        collectionStats[collection.name] = { error: error.message };
      }
    }

    return {
      server: {
        version: serverStatus.version,
        uptime: serverStatus.uptime,
        connections: serverStatus.connections,
        network: serverStatus.network,
        memory: serverStatus.mem,
      },
      database: {
        name: dbStats.db,
        collections: dbStats.collections,
        documents: dbStats.objects,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        indexes: dbStats.indexes,
        indexSize: dbStats.indexSize,
      },
      collections: collectionStats,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Error obteniendo métricas:', error.message);
    throw error;
  }
}

// Manejo graceful de cierre
process.on('SIGINT', async () => {
  await closeConnection();
});

process.on('SIGTERM', async () => {
  await closeConnection();
});

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
