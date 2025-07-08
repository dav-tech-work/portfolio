import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Función para imprimir con colores
function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Clase para realizar verificaciones de seguridad
class SecurityChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.recommendations = [];
    this.score = 100;
  }

  // Añadir problema crítico
  addIssue(message, severity = 'high') {
    this.issues.push({ message, severity });
    this.score -= severity === 'critical' ? 25 : severity === 'high' ? 15 : 10;
  }

  // Añadir advertencia
  addWarning(message) {
    this.warnings.push(message);
    this.score -= 5;
  }

  // Añadir recomendación
  addRecommendation(message) {
    this.recommendations.push(message);
  }

  // Verificar configuración de entorno
  checkEnvironmentConfig() {
    colorLog('\n🔍 Verificando configuración de entorno...', 'cyan');

    const configPath = path.join(__dirname, '..', 'config.env');

    if (!fs.existsSync(configPath)) {
      this.addIssue('Archivo config.env no encontrado', 'critical');
      return;
    }

    const config = fs.readFileSync(configPath, 'utf8');
    const lines = config.split('\n');
    const envVars = {};

    // Parsear variables de entorno
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    // Verificar secretos críticos
    this.checkSecrets(envVars);

    // Verificar configuración de seguridad
    this.checkSecurityConfig(envVars);

    // Verificar configuración de producción
    this.checkProductionConfig(envVars);
  }

  // Verificar secretos
  checkSecrets(envVars) {
    const criticalSecrets = ['SESSION_SECRET', 'JWT_SECRET'];
    const optionalSecrets = ['CSRF_SECRET', 'API_SECRET'];

    criticalSecrets.forEach((secretName) => {
      const secret = envVars[secretName];

      if (!secret) {
        this.addIssue(`${secretName} no está configurado`, 'critical');
        return;
      }

      if (secret.length < 32) {
        this.addIssue(`${secretName} es demasiado corto (${secret.length} caracteres)`, 'high');
      }

      if (
        secret.includes('CHANGE_THIS') ||
        secret.includes('fallback') ||
        secret.includes('default')
      ) {
        this.addIssue(`${secretName} contiene valores por defecto inseguros`, 'critical');
      }

      if (secret === 'tu_super_secreto_muy_seguro_aqui_cambialo_en_produccion') {
        this.addIssue(`${secretName} está usando el valor de ejemplo`, 'critical');
      }

      // Verificar entropía
      const entropy = this.calculateEntropy(secret);
      if (entropy < 3.5) {
        this.addIssue(`${secretName} tiene baja entropía (${entropy.toFixed(2)})`, 'high');
      }
    });

    optionalSecrets.forEach((secretName) => {
      const secret = envVars[secretName];
      if (!secret) {
        this.addWarning(`${secretName} no está configurado`);
      }
    });
  }

  // Calcular entropía de una cadena
  calculateEntropy(str) {
    const freq = {};
    str.split('').forEach((char) => {
      freq[char] = (freq[char] || 0) + 1;
    });

    const len = str.length;
    return Object.values(freq).reduce((entropy, count) => {
      const p = count / len;
      return entropy - p * Math.log2(p);
    }, 0);
  }

  // Verificar configuración de seguridad
  checkSecurityConfig(envVars) {
    // Verificar bcrypt rounds
    const bcryptRounds = parseInt(envVars.BCRYPT_ROUNDS || '10');
    if (bcryptRounds < 12) {
      this.addWarning(`BCRYPT_ROUNDS es bajo (${bcryptRounds}), recomendado: 12+`);
    }

    // Verificar rate limiting
    const rateLimitMax = parseInt(envVars.RATE_LIMIT_MAX_REQUESTS || '100');
    if (rateLimitMax > 200) {
      this.addWarning(`RATE_LIMIT_MAX_REQUESTS es alto (${rateLimitMax})`);
    }

    const authRateLimit = parseInt(envVars.AUTH_RATE_LIMIT_MAX_REQUESTS || '5');
    if (authRateLimit > 10) {
      this.addWarning(`AUTH_RATE_LIMIT_MAX_REQUESTS es alto (${authRateLimit})`);
    }

    // Verificar configuración de cookies
    const cookieSecure = envVars.COOKIE_SECURE;
    const nodeEnv = envVars.NODE_ENV;

    if (nodeEnv === 'production' && cookieSecure !== 'true') {
      this.addIssue('COOKIE_SECURE debería ser true en producción', 'high');
    }

    // Verificar CORS
    const corsOrigin = envVars.CORS_ORIGIN;
    if (corsOrigin === '*') {
      this.addIssue('CORS_ORIGIN no debería ser "*" en producción', 'high');
    }
  }

  // Verificar configuración de producción
  checkProductionConfig(envVars) {
    const nodeEnv = envVars.NODE_ENV;

    if (nodeEnv === 'production') {
      // Verificaciones específicas para producción
      if (envVars.ENABLE_SECURITY_LOGGING !== 'true') {
        this.addWarning('ENABLE_SECURITY_LOGGING debería estar habilitado en producción');
      }

      if (!envVars.LOG_FILE_PATH) {
        this.addWarning('LOG_FILE_PATH no está configurado para producción');
      }

      if (envVars.CSP_REPORT_ONLY === 'true') {
        this.addWarning('CSP_REPORT_ONLY debería ser false en producción');
      }
    }
  }

  // Verificar dependencias
  async checkDependencies() {
    colorLog('\n🔍 Verificando dependencias...', 'cyan');

    const packagePath = path.join(__dirname, '..', 'package.json');

    if (!fs.existsSync(packagePath)) {
      this.addIssue('package.json no encontrado', 'critical');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Verificar dependencias de seguridad críticas
    const securityDeps = ['helmet', 'express-rate-limit', 'express-validator', 'bcryptjs', 'hpp'];

    securityDeps.forEach((dep) => {
      if (!dependencies[dep]) {
        this.addIssue(`Dependencia de seguridad faltante: ${dep}`, 'high');
      }
    });

    // Verificar versiones conocidas con vulnerabilidades
    const vulnerableDeps = {
      express: '< 4.17.1',
      helmet: '< 4.0.0',
      jsonwebtoken: '< 8.5.1',
    };

    Object.entries(vulnerableDeps).forEach(([dep, vulnerableVersion]) => {
      if (dependencies[dep]) {
        this.addRecommendation(
          `Verifica que ${dep} esté actualizado (versión vulnerable: ${vulnerableVersion})`
        );
      }
    });
  }

  // Verificar archivos de configuración
  checkConfigFiles() {
    colorLog('\n🔍 Verificando archivos de configuración...', 'cyan');

    // Verificar .gitignore
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

      const sensitiveFiles = ['config.env', '*.key', '*.pem', '.env'];

      sensitiveFiles.forEach((pattern) => {
        if (!gitignoreContent.includes(pattern)) {
          this.addWarning(`${pattern} no está en .gitignore`);
        }
      });
    } else {
      this.addWarning('.gitignore no encontrado');
    }

    // Verificar permisos de archivos sensibles
    const sensitiveFiles = ['config.env', 'certs/private.key'];

    sensitiveFiles.forEach((file) => {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        try {
          const stats = fs.statSync(filePath);
          const mode = stats.mode & parseInt('777', 8);

          if (mode & parseInt('044', 8)) {
            this.addWarning(`${file} es legible por otros usuarios`);
          }
        } catch {
          // Manejo de error eliminado por no usarse
        }
      }
    });
  }

  // Verificar configuración de middlewares
  checkMiddlewareConfig() {
    colorLog('\n🔍 Verificando configuración de middlewares...', 'cyan');

    const appPath = path.join(__dirname, '..', 'app.mjs');

    if (!fs.existsSync(appPath)) {
      this.addIssue('app.mjs no encontrado', 'critical');
      return;
    }

    const appContent = fs.readFileSync(appPath, 'utf8');

    // Verificar middleware de seguridad
    const securityMiddlewares = ['helmet', 'express-rate-limit', 'hpp', 'cors'];

    securityMiddlewares.forEach((middleware) => {
      if (!appContent.includes(middleware)) {
        this.addWarning(`Middleware de seguridad ${middleware} no detectado`);
      }
    });

    // Verificar configuración de sesiones
    if (appContent.includes('session(')) {
      if (!appContent.includes('httpOnly: true')) {
        this.addIssue('Las cookies de sesión deberían tener httpOnly: true', 'high');
      }

      if (!appContent.includes('secure:')) {
        this.addWarning('Configuración de cookie secure no detectada');
      }
    }
  }

  // Verificar logs de seguridad
  checkSecurityLogs() {
    colorLog('\n🔍 Verificando logs de seguridad...', 'cyan');

    const logsDir = path.join(__dirname, '..', 'logs');

    if (!fs.existsSync(logsDir)) {
      this.addWarning('Directorio de logs no encontrado');
      return;
    }

    const logFiles = fs.readdirSync(logsDir);

    if (logFiles.length === 0) {
      this.addWarning('No se encontraron archivos de log');
      return;
    }

    // Verificar tamaño de logs
    logFiles.forEach((file) => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      const sizeMB = stats.size / (1024 * 1024);

      if (sizeMB > 100) {
        this.addWarning(`Archivo de log ${file} es muy grande (${sizeMB.toFixed(2)} MB)`);
      }
    });
  }

  // Verificar configuración de red
  checkNetworkConfig() {
    colorLog('\n🔍 Verificando configuración de red...', 'cyan');

    const configPath = path.join(__dirname, '..', 'config.env');

    if (!fs.existsSync(configPath)) {
      return;
    }

    const config = fs.readFileSync(configPath, 'utf8');

    // Verificar puerto
    const portMatch = config.match(/PORT=(\d+)/);
    if (portMatch) {
      const port = parseInt(portMatch[1]);
      if (port < 1024 && process.platform !== 'win32') {
        this.addWarning(`Puerto ${port} requiere privilegios de root`);
      }
      if (port === 80 || port === 443) {
        this.addRecommendation('Considera usar un proxy reverso para puertos 80/443');
      }
    }

    // Verificar configuración de CORS
    if (config.includes('CORS_ORIGIN=*')) {
      this.addIssue('CORS_ORIGIN no debería ser "*" en producción', 'high');
    }
  }

  // Ejecutar todas las verificaciones
  async runAllChecks() {
    colorLog('🛡️  Verificación de Seguridad', 'bright');
    colorLog('============================', 'bright');

    this.checkEnvironmentConfig();
    await this.checkDependencies();
    this.checkConfigFiles();
    this.checkMiddlewareConfig();
    this.checkSecurityLogs();
    this.checkNetworkConfig();

    this.generateReport();
  }

  // Generar reporte final
  generateReport() {
    colorLog('\n📊 Reporte de Seguridad', 'bright');
    colorLog('======================', 'bright');

    // Mostrar puntuación
    const scoreColor = this.score >= 80 ? 'green' : this.score >= 60 ? 'yellow' : 'red';
    colorLog(`\n🎯 Puntuación de Seguridad: ${this.score}/100`, scoreColor);

    // Mostrar problemas críticos
    if (this.issues.length > 0) {
      colorLog('\n❌ Problemas Encontrados:', 'red');
      this.issues.forEach((issue) => {
        const severity =
          issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟠' : '🟡';
        colorLog(`   ${severity} ${issue.message}`, 'red');
      });
    }

    // Mostrar advertencias
    if (this.warnings.length > 0) {
      colorLog('\n⚠️  Advertencias:', 'yellow');
      this.warnings.forEach((warning) => {
        colorLog(`   🟡 ${warning}`, 'yellow');
      });
    }

    // Mostrar recomendaciones
    if (this.recommendations.length > 0) {
      colorLog('\n💡 Recomendaciones:', 'blue');
      this.recommendations.forEach((rec) => {
        colorLog(`   🔵 ${rec}`, 'blue');
      });
    }

    // Mostrar estado general
    if (this.issues.length === 0 && this.warnings.length === 0) {
      colorLog('\n✅ ¡Excelente! No se encontraron problemas de seguridad.', 'green');
    } else if (this.issues.length === 0) {
      colorLog('\n✅ Buena configuración de seguridad con algunas advertencias menores.', 'green');
    } else {
      colorLog('\n❌ Se encontraron problemas de seguridad que requieren atención.', 'red');
    }

    // Recomendaciones generales
    colorLog('\n🎯 Recomendaciones Generales:', 'cyan');
    colorLog('   • Mantén las dependencias actualizadas', 'cyan');
    colorLog('   • Revisa los logs de seguridad regularmente', 'cyan');
    colorLog('   • Implementa monitoreo de seguridad', 'cyan');
    colorLog('   • Realiza auditorías de seguridad periódicas', 'cyan');
    colorLog('   • Considera implementar un WAF', 'cyan');
    colorLog('   • Usa HTTPS en producción', 'cyan');
    colorLog('   • Implementa rotación de secretos', 'cyan');

    // Salir con código de error si hay problemas críticos
    const criticalIssues = this.issues.filter((issue) => issue.severity === 'critical');
    if (criticalIssues.length > 0) {
      colorLog(
        '\n💥 Encontrados problemas críticos. Revisa la configuración antes de continuar.',
        'red'
      );
      process.exit(1);
    }
  }
}

// Función principal
async function main() {
  const checker = new SecurityChecker();
  await checker.runAllChecks();
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Error ejecutando verificación de seguridad:', error);
    process.exit(1);
  });
}

export default SecurityChecker;
