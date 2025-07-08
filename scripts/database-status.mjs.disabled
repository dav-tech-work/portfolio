#!/usr/bin/env node

/**
 * Script de Estado de Base de Datos
 * @description Muestra información completa del estado de MongoDB
 */

import {
  connectToDatabase,
  checkConnectionHealth,
  getDatabaseMetrics,
  closeConnection,
} from '../src/database/connection.mjs';
import User from '../src/models/User.mjs';
import { configLoader } from '../src/config/environment.mjs';

const config = configLoader();

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Función principal para mostrar estado de la base de datos
 */
async function showDatabaseStatus() {
  try {
    colorLog('\n🗄️  =====================================', 'cyan');
    colorLog('📊 ESTADO DE BASE DE DATOS', 'bright');
    colorLog('🗄️  =====================================', 'cyan');

    // Verificar conexión
    const healthStatus = await checkConnectionHealth();

    if (!healthStatus.connected) {
      colorLog('\n❌ BASE DE DATOS NO DISPONIBLE', 'red');
      colorLog(`Error: ${healthStatus.error}`, 'red');
      return;
    }

    // Mostrar información de conexión
    await showConnectionInfo(healthStatus);

    // Mostrar métricas del servidor
    await showServerMetrics();

    // Mostrar estadísticas de usuarios
    await showUserStats();

    // Mostrar información de colecciones
    await showCollectionsInfo();

    // Mostrar información de índices
    await showIndexesInfo();

    colorLog('\n🗄️  =====================================\n', 'cyan');
  } catch (error) {
    colorLog(`\n❌ Error obteniendo estado: ${error.message}`, 'red');
    console.error('Stack trace:', error.stack);
  } finally {
    await closeConnection();
  }
}

/**
 * Muestra información de conexión
 */
async function showConnectionInfo(healthStatus) {
  colorLog('\n🔗 INFORMACIÓN DE CONEXIÓN:', 'yellow');
  colorLog('===============================', 'yellow');

  const statusIcon = healthStatus.connected ? '✅' : '❌';
  const statusColor = healthStatus.connected ? 'green' : 'red';

  colorLog(`${statusIcon} Estado: ${healthStatus.status.toUpperCase()}`, statusColor);
  colorLog(`🗄️  Base de datos: ${healthStatus.database}`, 'blue');
  colorLog(`🔢 Versión MongoDB: ${healthStatus.version}`, 'blue');
  colorLog(`⏱️  Uptime: ${formatUptime(healthStatus.uptime)}`, 'blue');

  if (healthStatus.connections) {
    colorLog(`🔌 Conexiones actuales: ${healthStatus.connections.current}`, 'blue');
    colorLog(`🔌 Conexiones disponibles: ${healthStatus.connections.available}`, 'blue');
    colorLog(`🔌 Total creadas: ${healthStatus.connections.totalCreated}`, 'blue');
  }
}

/**
 * Muestra métricas del servidor
 */
async function showServerMetrics() {
  try {
    const metrics = await getDatabaseMetrics();

    colorLog('\n💻 MÉTRICAS DEL SERVIDOR:', 'yellow');
    colorLog('=========================', 'yellow');

    if (metrics.server) {
      colorLog(`📊 Memoria residente: ${formatBytes(metrics.server.memory.resident)}`, 'blue');
      colorLog(`📊 Memoria virtual: ${formatBytes(metrics.server.memory.virtual)}`, 'blue');
      colorLog(`🌐 Conexiones de red: ${metrics.server.network.numRequests}`, 'blue');
      colorLog(`📈 Bytes de red in: ${formatBytes(metrics.server.network.bytesIn)}`, 'blue');
      colorLog(`📉 Bytes de red out: ${formatBytes(metrics.server.network.bytesOut)}`, 'blue');
    }

    if (metrics.database) {
      colorLog(`\n🗃️  INFORMACIÓN DE BASE DE DATOS:`, 'yellow');
      colorLog(`📂 Colecciones: ${metrics.database.collections}`, 'blue');
      colorLog(`📄 Documentos: ${metrics.database.documents.toLocaleString()}`, 'blue');
      colorLog(`💾 Tamaño de datos: ${formatBytes(metrics.database.dataSize)}`, 'blue');
      colorLog(
        `🗄️  Tamaño de almacenamiento: ${formatBytes(metrics.database.storageSize)}`,
        'blue'
      );
      colorLog(`📇 Índices: ${metrics.database.indexes}`, 'blue');
      colorLog(`🔍 Tamaño de índices: ${formatBytes(metrics.database.indexSize)}`, 'blue');
    }
  } catch (error) {
    colorLog(`❌ Error obteniendo métricas: ${error.message}`, 'red');
  }
}

/**
 * Muestra estadísticas de usuarios
 */
async function showUserStats() {
  try {
    const stats = await User.getStats();

    colorLog('\n👥 ESTADÍSTICAS DE USUARIOS:', 'yellow');
    colorLog('=============================', 'yellow');

    const general = stats.general;
    colorLog(`📊 Total usuarios: ${general.total}`, 'blue');
    colorLog(`✅ Usuarios activos: ${general.active}`, 'green');
    colorLog(`❌ Usuarios inactivos: ${general.inactive}`, 'red');
    colorLog(`✉️  Emails verificados: ${general.verified}`, 'green');
    colorLog(`🔒 Administradores: ${general.admins}`, 'cyan');
    colorLog(`👤 Usuarios normales: ${general.users}`, 'blue');

    // Mostrar actividad reciente
    if (stats.registrations && stats.registrations.length > 0) {
      colorLog('\n📈 REGISTROS RECIENTES (últimos 7 días):', 'yellow');
      const recentRegistrations = stats.registrations.slice(0, 7);

      recentRegistrations.forEach((reg) => {
        const date = `${reg._id.year}-${reg._id.month.toString().padStart(2, '0')}-${reg._id.day.toString().padStart(2, '0')}`;
        colorLog(`  📅 ${date}: ${reg.count} registros`, 'blue');
      });
    }
  } catch (error) {
    colorLog(`❌ Error obteniendo estadísticas de usuarios: ${error.message}`, 'red');
  }
}

/**
 * Muestra información de colecciones
 */
async function showCollectionsInfo() {
  try {
    const { db } = await connectToDatabase();
    const collections = await db.listCollections().toArray();

    colorLog('\n📚 COLECCIONES:', 'yellow');
    colorLog('===============', 'yellow');

    for (const collection of collections) {
      try {
        const stats = await db.collection(collection.name).stats();
        const count = await db.collection(collection.name).estimatedDocumentCount();

        colorLog(`📁 ${collection.name}:`, 'cyan');
        colorLog(`  📄 Documentos: ${count.toLocaleString()}`, 'blue');
        colorLog(`  💾 Tamaño: ${formatBytes(stats.size || 0)}`, 'blue');
        colorLog(`  🗄️  Almacenamiento: ${formatBytes(stats.storageSize || 0)}`, 'blue');
        colorLog(`  📇 Índices: ${stats.nindexes || 0}`, 'blue');
      } catch (error) {
        colorLog(`📁 ${collection.name}: Error obteniendo estadísticas`, 'yellow');
      }
    }
  } catch (error) {
    colorLog(`❌ Error obteniendo información de colecciones: ${error.message}`, 'red');
  }
}

/**
 * Muestra información de índices
 */
async function showIndexesInfo() {
  try {
    const { db } = await connectToDatabase();

    colorLog('\n🔍 ÍNDICES:', 'yellow');
    colorLog('===========', 'yellow');

    // Índices de usuarios
    const userIndexes = await db.collection('users').indexes();
    if (userIndexes.length > 0) {
      colorLog('📁 Colección users:', 'cyan');
      userIndexes.forEach((index) => {
        const keyStr = Object.keys(index.key)
          .map((k) => `${k}: ${index.key[k]}`)
          .join(', ');
        const unique = index.unique ? ' (único)' : '';
        const sparse = index.sparse ? ' (sparse)' : '';
        colorLog(`  🔍 ${index.name}: {${keyStr}}${unique}${sparse}`, 'blue');
      });
    }

    // Índices de logs de seguridad
    try {
      const logIndexes = await db.collection('security_logs').indexes();
      if (logIndexes.length > 0) {
        colorLog('📁 Colección security_logs:', 'cyan');
        logIndexes.forEach((index) => {
          const keyStr = Object.keys(index.key)
            .map((k) => `${k}: ${index.key[k]}`)
            .join(', ');
          colorLog(`  🔍 ${index.name}: {${keyStr}}`, 'blue');
        });
      }
    } catch (error) {
      // Colección puede no existir aún
    }
  } catch (error) {
    colorLog(`❌ Error obteniendo información de índices: ${error.message}`, 'red');
  }
}

/**
 * Formatea bytes a unidades legibles
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formatea uptime en formato legible
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m`;

  return result || '< 1m';
}

/**
 * Muestra configuración de la base de datos
 */
async function showDatabaseConfig() {
  colorLog('\n⚙️  CONFIGURACIÓN:', 'yellow');
  colorLog('==================', 'yellow');

  // Ocultar credenciales en la URI
  const safeUri = config.DB_URI.replace(/\/\/.*@/, '//***:***@');

  colorLog(`🔗 URI: ${safeUri}`, 'blue');
  colorLog(`🗄️  Base de datos: ${config.DB_NAME}`, 'blue');
  colorLog(`🏭 Pool máximo: ${config.DB_MAX_POOL_SIZE || 10}`, 'blue');
  colorLog(`⏰ Timeout: ${config.DB_TIMEOUT || 5000}ms`, 'blue');
}

/**
 * Función principal
 */
async function main() {
  const args = process.argv.slice(2);

  try {
    await showDatabaseStatus();

    if (args.includes('--config')) {
      await showDatabaseConfig();
    }

    if (args.includes('--json')) {
      // Exportar estado en formato JSON
      const healthStatus = await checkConnectionHealth();
      const metrics = await getDatabaseMetrics();
      const userStats = await User.getStats();

      const jsonOutput = {
        timestamp: new Date().toISOString(),
        health: healthStatus,
        metrics: metrics,
        users: userStats,
        config: {
          database: config.DB_NAME,
          poolSize: config.DB_MAX_POOL_SIZE || 10,
          timeout: config.DB_TIMEOUT || 5000,
        },
      };

      console.log('\n📄 JSON Output:');
      console.log(JSON.stringify(jsonOutput, null, 2));
    }
  } catch (error) {
    colorLog(`\n💥 Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

export default {
  showDatabaseStatus,
  showConnectionInfo,
  showServerMetrics,
  showUserStats,
};
