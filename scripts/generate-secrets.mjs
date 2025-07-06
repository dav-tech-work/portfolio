import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para generar secretos seguros
function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

// Función para generar secretos con caracteres especiales
function generateStrongSecret(length = 32) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let secret = '';

  for (let i = 0; i < length; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return secret;
}

// Función para crear archivo .env seguro
function createSecureEnvFile() {
  const envPath = path.join(__dirname, '..', 'config.env');
  const envExamplePath = path.join(__dirname, '..', 'config.env.example');

  // Verificar si ya existe config.env
  if (fs.existsSync(envPath)) {
    console.log('⚠️  El archivo config.env ya existe. Creando backup...');

    // Crear backup
    const backupPath = `${envPath}.backup.${Date.now()}`;
    fs.copyFileSync(envPath, backupPath);
    console.log(`✅ Backup creado en: ${backupPath}`);
  }

  // Leer el archivo de ejemplo
  let envTemplate = '';
  if (fs.existsSync(envExamplePath)) {
    envTemplate = fs.readFileSync(envExamplePath, 'utf8');
  } else {
    // Crear template básico si no existe
    envTemplate = `# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de seguridad - GENERAR SECRETOS ÚNICOS EN PRODUCCIÓN
SESSION_SECRET=CHANGE_THIS_TO_STRONG_SECRET_IN_PRODUCTION_AT_LEAST_32_CHARS
JWT_SECRET=CHANGE_THIS_TO_STRONG_JWT_SECRET_IN_PRODUCTION_AT_LEAST_32_CHARS

# Configuración de base de datos
DB_URI=mongodb://localhost:27017/estructura_base
DB_NAME=estructura_base

# Configuración de rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# Configuración de CORS
CORS_ORIGIN=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Configuración de seguridad adicional
BCRYPT_ROUNDS=12
TOKEN_EXPIRES_IN=24h
SESSION_MAX_AGE=86400000
COOKIE_SECURE=false
COOKIE_SAME_SITE=strict

# Configuración de logging
LOG_LEVEL=info
LOG_FILE_PATH=logs/security.log
ENABLE_SECURITY_LOGGING=true

# Configuración de contenido
MAX_FILE_SIZE=10485760
MAX_REQUEST_SIZE=10485760

# Configuración de límites de contenido
CSP_REPORT_URI=/csp-report
CSP_REPORT_ONLY=false

# Configuración de monitoreo
ENABLE_METRICS=true
METRICS_PORT=9090
`;
  }

  // Generar secretos seguros
  const sessionSecret = generateStrongSecret(64);
  const jwtSecret = generateStrongSecret(64);
  const csrfSecret = generateStrongSecret(32);

  // Reemplazar placeholders con secretos reales
  let envContent = envTemplate
    .replace(/SESSION_SECRET=.*/, `SESSION_SECRET=${sessionSecret}`)
    .replace(/JWT_SECRET=.*/, `JWT_SECRET=${jwtSecret}`)
    .replace(/CHANGE_THIS_TO_STRONG_SECRET_IN_PRODUCTION_AT_LEAST_32_CHARS/g, sessionSecret)
    .replace(/CHANGE_THIS_TO_STRONG_JWT_SECRET_IN_PRODUCTION_AT_LEAST_32_CHARS/g, jwtSecret);

  // Añadir secreto CSRF si no existe
  if (!envContent.includes('CSRF_SECRET')) {
    envContent += `\n# Configuración CSRF\nCSRF_SECRET=${csrfSecret}\n`;
  }

  // Escribir archivo config.env
  fs.writeFileSync(envPath, envContent);

  console.log('✅ Archivo config.env generado con secretos seguros');
  console.log('🔐 Secretos generados:');
  console.log(`   - SESSION_SECRET: ${sessionSecret.substring(0, 10)}...`);
  console.log(`   - JWT_SECRET: ${jwtSecret.substring(0, 10)}...`);
  console.log(`   - CSRF_SECRET: ${csrfSecret.substring(0, 10)}...`);

  return {
    sessionSecret,
    jwtSecret,
    csrfSecret,
  };
}

// Función para verificar entropía de secretos
function checkSecretEntropy(secret) {
  const entropy = new Set(secret).size;
  const strength = entropy / secret.length;

  if (strength < 0.6) {
    return 'débil';
  } else if (strength < 0.8) {
    return 'medio';
  } else {
    return 'fuerte';
  }
}

// Función para validar secretos existentes
function validateExistingSecrets() {
  const envPath = path.join(__dirname, '..', 'config.env');

  if (!fs.existsSync(envPath)) {
    console.log('⚠️  No se encontró config.env. Generando nuevos secretos...');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const _secrets = {};

  // Extraer secretos del archivo
  const lines = envContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('SESSION_SECRET=')) {
      _secrets.sessionSecret = trimmed.split('=')[1];
    } else if (trimmed.startsWith('JWT_SECRET=')) {
      _secrets.jwtSecret = trimmed.split('=')[1];
    } else if (trimmed.startsWith('CSRF_SECRET=')) {
      _secrets.csrfSecret = trimmed.split('=')[1];
    }
  }

  let needsRegeneration = false;

  // Verificar cada secreto
  for (const [key, value] of Object.entries(_secrets)) {
    if (!value || value.length < 32) {
      console.log(`⚠️  ${key} es demasiado corto (${value?.length || 0} caracteres)`);
      needsRegeneration = true;
    } else if (value.includes('CHANGE_THIS') || value.includes('fallback')) {
      console.log(`⚠️  ${key} contiene valores por defecto inseguros`);
      needsRegeneration = true;
    } else {
      const strength = checkSecretEntropy(value);
      if (strength === 'débil') {
        console.log(`⚠️  ${key} tiene baja entropía (${strength})`);
        needsRegeneration = true;
      } else {
        console.log(`✅ ${key} es seguro (entropía: ${strength})`);
      }
    }
  }

  return !needsRegeneration;
}

// Función para generar claves de API
function generateAPIKeys() {
  const apiKey = generateSecureSecret(32);
  const apiSecret = generateSecureSecret(64);

  console.log('🔑 Claves de API generadas:');
  console.log(`   - API_KEY: ${apiKey}`);
  console.log(`   - API_SECRET: ${apiSecret.substring(0, 10)}...`);

  return { apiKey, apiSecret };
}

// Función para generar certificados de desarrollo
function generateDevCertificates() {
  try {
    // Generar par de claves para desarrollo
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    // Crear directorio de certificados
    const certDir = path.join(__dirname, '..', 'certs');
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    // Guardar claves
    fs.writeFileSync(path.join(certDir, 'private.key'), privateKey);
    fs.writeFileSync(path.join(certDir, 'public.key'), publicKey);

    console.log('🔐 Certificados de desarrollo generados en ./certs/');

    return { privateKey, publicKey };
  } catch (error) {
    console.error('❌ Error generando certificados:', error.message);
    return null;
  }
}

// Función principal
function main() {
  console.log('🛡️  Generador de Secretos Seguros');
  console.log('================================');

  // Verificar secretos existentes
  const secretsValid = validateExistingSecrets();

  if (!secretsValid) {
    console.log('\n🔄 Generando nuevos secretos...');
    createSecureEnvFile();

    // Generar claves API adicionales
    const apiKeys = generateAPIKeys();

    // Generar certificados de desarrollo
    const certs = generateDevCertificates();

    // Usar las variables para evitar warnings de ESLint
    console.log(`API Keys generadas: ${apiKeys ? 'Sí' : 'No'}`);
    console.log(`Certificados generados: ${certs ? 'Sí' : 'No'}`);

    console.log('\n✅ Todos los secretos han sido generados correctamente');
    console.log('⚠️  IMPORTANTE: Mantén estos secretos seguros y no los compartas');
    console.log('⚠️  En producción, usa variables de entorno en lugar de archivos');

    // Crear archivo .gitignore si no existe
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    let gitignoreContent = '';

    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    // Añadir entradas de seguridad al .gitignore
    const securityEntries = [
      '# Archivos de configuración con secretos',
      'config.env',
      'config.env.backup.*',
      '*.pem',
      '*.key',
      'certs/',
      'logs/',
      'coverage/',
      '.nyc_output/',
      '# Archivos de entorno',
      '.env',
      '.env.*',
    ];

    for (const entry of securityEntries) {
      if (!gitignoreContent.includes(entry)) {
        gitignoreContent += '\n' + entry;
      }
    }

    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('✅ .gitignore actualizado con entradas de seguridad');
  } else {
    console.log('\n✅ Todos los secretos existentes son seguros');
  }

  console.log('\n🎯 Recomendaciones de seguridad:');
  console.log('   1. Cambia los secretos regularmente');
  console.log('   2. Usa variables de entorno en producción');
  console.log('   3. Nunca commits secretos en el control de versiones');
  console.log('   4. Usa gestores de secretos para producción');
  console.log('   5. Implementa rotación automática de secretos');
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  generateSecureSecret,
  generateStrongSecret,
  createSecureEnvFile,
  validateExistingSecrets,
  generateAPIKeys,
  generateDevCertificates,
  checkSecretEntropy,
};
