#!/usr/bin/env node

/**
 * Script de Inicialización de Base de Datos
 * @description Crea la base de datos, índices y usuarios de ejemplo
 */

import { connectToDatabase, createIndexes, closeConnection } from '../src/database/connection.mjs';
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
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Usuarios de ejemplo para desarrollo y testing
 */
const sampleUsers = [
  {
    name: 'Administrador Principal',
    email: 'admin@example.com',
    password: 'Admin123!',
    username: 'admin',
    role: 'admin',
    status: 'active',
    emailVerified: true,
    preferences: {
      theme: 'dark',
      language: 'es',
      notifications: true,
    },
    metadata: {
      department: 'IT',
      location: 'Madrid',
      timezone: 'Europe/Madrid',
    },
  },
  {
    name: 'Usuario de Prueba',
    email: 'user@example.com',
    password: 'User123!',
    username: 'testuser',
    role: 'user',
    status: 'active',
    emailVerified: true,
    preferences: {
      theme: 'light',
      language: 'es',
      notifications: true,
    },
    metadata: {
      department: 'Marketing',
      location: 'Barcelona',
      timezone: 'Europe/Madrid',
    },
  },
  {
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    password: 'JuanP123!',
    username: 'juanperez',
    role: 'user',
    status: 'active',
    emailVerified: true,
    preferences: {
      theme: 'light',
      language: 'es',
      notifications: false,
    },
    metadata: {
      department: 'Ventas',
      location: 'Valencia',
      timezone: 'Europe/Madrid',
    },
  },
  {
    name: 'María García',
    email: 'maria.garcia@example.com',
    password: 'MariaG123!',
    username: 'mariagarcia',
    role: 'user',
    status: 'active',
    emailVerified: false,
    preferences: {
      theme: 'dark',
      language: 'es',
      notifications: true,
    },
    metadata: {
      department: 'Recursos Humanos',
      location: 'Sevilla',
      timezone: 'Europe/Madrid',
    },
  },
  {
    name: 'Carlos López',
    email: 'carlos.lopez@example.com',
    password: 'CarlosL123!',
    username: 'carloslopez',
    role: 'user',
    status: 'inactive',
    emailVerified: true,
    preferences: {
      theme: 'light',
      language: 'es',
      notifications: true,
    },
    metadata: {
      department: 'Desarrollo',
      location: 'Bilbao',
      timezone: 'Europe/Madrid',
    },
  },
  {
    name: 'Ana Martínez',
    email: 'ana.martinez@example.com',
    password: 'AnaM123!',
    username: 'anamartinez',
    role: 'moderator',
    status: 'active',
    emailVerified: true,
    preferences: {
      theme: 'dark',
      language: 'es',
      notifications: true,
    },
    metadata: {
      department: 'Soporte',
      location: 'Zaragoza',
      timezone: 'Europe/Madrid',
    },
  },
];

/**
 * Inicializa la base de datos completa
 */
async function initializeDatabase() {
  try {
    colorLog('\n🚀 =====================================', 'cyan');
    colorLog('🔧 Inicializando Base de Datos', 'bright');
    colorLog('🚀 =====================================', 'cyan');

    // Conectar a la base de datos
    await connectToDatabase();
    colorLog('✅ Conexión establecida', 'green');

    // Crear índices
    await createIndexes();
    colorLog('✅ Índices creados', 'green');

    // Verificar si ya existen usuarios
    const existingUsers = await User.list({ limit: 1 });

    if (existingUsers.users.length > 0) {
      colorLog('\n⚠️  La base de datos ya contiene usuarios', 'yellow');

      const args = process.argv.slice(2);
      if (!args.includes('--force')) {
        colorLog('Use --force para recrear los datos de ejemplo', 'yellow');
        await showExistingData();
        return;
      } else {
        colorLog('🔄 Forzando recreación de datos...', 'yellow');
        await clearExistingData();
      }
    }

    // Crear usuarios de ejemplo
    await createSampleUsers();

    // Mostrar resumen
    await showDatabaseSummary();

    colorLog('\n✅ ¡Base de datos inicializada exitosamente!', 'green');
    colorLog('🚀 =====================================\n', 'cyan');
  } catch (error) {
    colorLog(`\n❌ Error inicializando base de datos: ${error.message}`, 'red');
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

/**
 * Crea usuarios de ejemplo
 */
async function createSampleUsers() {
  colorLog('\n👥 Creando usuarios de ejemplo...', 'yellow');

  let created = 0;
  let skipped = 0;

  for (const userData of sampleUsers) {
    try {
      const user = await User.create(userData);
      colorLog(`  ✅ Usuario creado: ${user.email} (${user.role})`, 'green');
      created++;
    } catch (error) {
      if (
        error.message.includes('ya está registrado') ||
        error.message.includes('ya está en uso')
      ) {
        colorLog(`  ⚠️  Usuario ya existe: ${userData.email}`, 'yellow');
        skipped++;
      } else {
        colorLog(`  ❌ Error creando ${userData.email}: ${error.message}`, 'red');
      }
    }
  }

  colorLog(`\n📊 Usuarios: ${created} creados, ${skipped} omitidos`, 'blue');
}

/**
 * Muestra datos existentes en la base de datos
 */
async function showExistingData() {
  try {
    const stats = await User.getStats();
    const recentUsers = await User.list({ limit: 5, sort: { createdAt: -1 } });

    colorLog('\n📊 Estado actual de la base de datos:', 'blue');
    colorLog(`  👥 Total usuarios: ${stats.general.total}`, 'blue');
    colorLog(`  ✅ Activos: ${stats.general.active}`, 'green');
    colorLog(`  ❌ Inactivos: ${stats.general.inactive}`, 'red');
    colorLog(`  🔒 Administradores: ${stats.general.admins}`, 'cyan');
    colorLog(`  👤 Usuarios normales: ${stats.general.users}`, 'blue');

    if (recentUsers.users.length > 0) {
      colorLog('\n👥 Usuarios recientes:', 'blue');
      recentUsers.users.forEach((user) => {
        const status = user.status === 'active' ? '✅' : '❌';
        const role = user.role === 'admin' ? '🔒' : user.role === 'moderator' ? '🛡️' : '👤';
        colorLog(`  ${status} ${role} ${user.email} (${user.name})`, 'blue');
      });
    }
  } catch (error) {
    colorLog(`❌ Error mostrando datos: ${error.message}`, 'red');
  }
}

/**
 * Limpia datos existentes (con confirmación)
 */
async function clearExistingData() {
  colorLog('\n🗑️  Limpiando datos existentes...', 'yellow');

  try {
    const { db } = await connectToDatabase();

    // Eliminar usuarios de ejemplo (no todos)
    const result = await db.collection('users').deleteMany({
      email: { $in: sampleUsers.map((u) => u.email) },
    });

    colorLog(`  🗑️  ${result.deletedCount} usuarios de ejemplo eliminados`, 'yellow');
  } catch (error) {
    colorLog(`❌ Error limpiando datos: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Muestra resumen de la base de datos inicializada
 */
async function showDatabaseSummary() {
  try {
    const stats = await User.getStats();

    colorLog('\n📋 Resumen de Base de Datos Inicializada:', 'cyan');
    colorLog('=========================================', 'cyan');
    colorLog(`📊 Total usuarios: ${stats.general.total}`, 'blue');
    colorLog(`✅ Usuarios activos: ${stats.general.active}`, 'green');
    colorLog(`❌ Usuarios inactivos: ${stats.general.inactive}`, 'red');
    colorLog(`✉️  Emails verificados: ${stats.general.verified}`, 'green');
    colorLog(`🔒 Administradores: ${stats.general.admins}`, 'cyan');
    colorLog(`👤 Usuarios normales: ${stats.general.users}`, 'blue');

    colorLog('\n🔑 Credenciales de Acceso de Ejemplo:', 'yellow');
    colorLog('=====================================', 'yellow');

    const adminUser = sampleUsers.find((u) => u.role === 'admin');
    const normalUser = sampleUsers.find((u) => u.role === 'user');

    colorLog(`🔒 ADMIN:`, 'cyan');
    colorLog(`   Email: ${adminUser.email}`, 'cyan');
    colorLog(`   Password: ${adminUser.password}`, 'cyan');

    colorLog(`👤 USER:`, 'blue');
    colorLog(`   Email: ${normalUser.email}`, 'blue');
    colorLog(`   Password: ${normalUser.password}`, 'blue');

    colorLog('\n🔧 URLs de Acceso:', 'green');
    colorLog('==================', 'green');
    colorLog(`🌐 Aplicación: http://localhost:${config.PORT || 3000}`, 'green');
    colorLog(`🔐 Login: http://localhost:${config.PORT || 3000}/auth/login`, 'green');
    colorLog(`📝 Registro: http://localhost:${config.PORT || 3000}/auth/register`, 'green');
  } catch (error) {
    colorLog(`❌ Error generando resumen: ${error.message}`, 'red');
  }
}

/**
 * Validar configuración antes de inicializar
 */
async function validateConfiguration() {
  const errors = [];

  if (!config.DB_URI) {
    errors.push('DB_URI no está configurado');
  }

  if (!config.DB_NAME) {
    errors.push('DB_NAME no está configurado');
  }

  if (!config.SESSION_SECRET || config.SESSION_SECRET.length < 32) {
    errors.push('SESSION_SECRET debe tener al menos 32 caracteres');
  }

  if (!config.JWT_SECRET || config.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET debe tener al menos 32 caracteres');
  }

  if (errors.length > 0) {
    colorLog('\n❌ Errores de configuración:', 'red');
    errors.forEach((error) => colorLog(`  - ${error}`, 'red'));
    colorLog('\n💡 Ejecuta: npm run security:generate-secrets', 'yellow');
    throw new Error('Configuración inválida');
  }

  colorLog('✅ Configuración validada', 'green');
}

/**
 * Crea colecciones adicionales si es necesario
 */
async function createAdditionalCollections() {
  try {
    const { db } = await connectToDatabase();

    // Crear colección de logs de seguridad si no existe
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    if (!collectionNames.includes('security_logs')) {
      await db.createCollection('security_logs');
      colorLog('✅ Colección security_logs creada', 'green');
    }

    if (!collectionNames.includes('sessions')) {
      await db.createCollection('sessions');
      colorLog('✅ Colección sessions creada', 'green');
    }
  } catch (error) {
    colorLog(`⚠️  Error creando colecciones adicionales: ${error.message}`, 'yellow');
  }
}

/**
 * Función principal
 */
async function main() {
  const args = process.argv.slice(2);

  try {
    // Validar configuración
    await validateConfiguration();

    // Crear colecciones adicionales
    await createAdditionalCollections();

    // Inicializar base de datos
    await initializeDatabase();

    // Mostrar información adicional
    if (args.includes('--verbose')) {
      colorLog('\n🔍 Información de conexión:', 'blue');
      colorLog(`🗄️  Base de datos: ${config.DB_NAME}`, 'blue');
      colorLog(`🔗 URI: ${config.DB_URI.replace(/\/\/.*@/, '//***:***@')}`, 'blue');
      colorLog(`🏭 Pool size: ${config.DB_MAX_POOL_SIZE || 10}`, 'blue');
    }
  } catch (error) {
    colorLog(`\n💥 Fallo en inicialización: ${error.message}`, 'red');
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
  initializeDatabase,
  createSampleUsers,
  sampleUsers,
};
