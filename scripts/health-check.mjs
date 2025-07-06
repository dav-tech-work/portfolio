#!/usr/bin/env node

/**
 * Script de Health Check y Monitoreo
 * @description Sistema completo de verificación de salud y monitoreo de la aplicación
 */

import { performance } from 'perf_hooks';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración del health check
const config = {
  baseUrl: process.env.HEALTH_CHECK_URL || 'http://localhost:3000',
  timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000,
  interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 segundos
  retries: parseInt(process.env.HEALTH_CHECK_RETRIES) || 3,
  logFile: process.env.HEALTH_LOG_FILE || path.join(__dirname, '..', 'logs', 'health.log'),
  alertThresholds: {
    responseTime: parseInt(process.env.ALERT_RESPONSE_TIME) || 1000, // 1 segundo
    memoryUsage: parseFloat(process.env.ALERT_MEMORY_USAGE) || 0.8, // 80%
    cpuUsage: parseFloat(process.env.ALERT_CPU_USAGE) || 0.8, // 80%
    diskUsage: parseFloat(process.env.ALERT_DISK_USAGE) || 0.9, // 90%
    errorRate: parseFloat(process.env.ALERT_ERROR_RATE) || 0.05, // 5%
  },
  endpoints: ['/health', '/', '/auth/login', '/metrics'],
};

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
 * Clase principal para health checks
 */
class HealthChecker {
  constructor() {
    this.status = {
      overall: 'unknown',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {},
      metrics: {},
      alerts: [],
    };

    this.history = [];
    this.isRunning = false;
  }

  /**
   * Ejecuta un health check completo
   */
  async runHealthCheck() {
    const startTime = performance.now();

    try {
      colorLog('\n🔍 ======================================', 'cyan');
      colorLog('🏥 HEALTH CHECK - Sistema de Monitoreo', 'bright');
      colorLog('🔍 ======================================', 'cyan');

      // Resetear estado
      this.status = {
        overall: 'unknown',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {},
        metrics: {},
        alerts: [],
      };

      // Ejecutar verificaciones
      await this.checkApplicationHealth();
      await this.checkSystemMetrics();
      await this.checkDiskSpace();
      await this.checkMemoryUsage();
      await this.checkProcessHealth();
      await this.checkLogFiles();
      await this.checkEndpointsHealth();

      // Determinar estado general
      this.determineOverallHealth();

      // Generar alertas
      this.generateAlerts();

      // Calcular tiempo total
      const totalTime = performance.now() - startTime;
      this.status.checkDuration = `${totalTime.toFixed(2)}ms`;

      // Mostrar resultados
      this.displayHealthStatus();

      // Registrar en historial
      this.addToHistory();

      // Guardar log
      await this.saveHealthLog();

      return this.status;
    } catch (error) {
      colorLog(`❌ Error en health check: ${error.message}`, 'red');
      this.status.overall = 'error';
      this.status.error = error.message;
      return this.status;
    }
  }

  /**
   * Verifica la salud de la aplicación
   */
  async checkApplicationHealth() {
    colorLog('\n🚀 Verificando aplicación...', 'yellow');

    const startTime = performance.now();

    try {
      const response = await this.makeRequest(`${config.baseUrl}/health`);
      const responseTime = performance.now() - startTime;

      this.status.checks.application = {
        status: response.statusCode === 200 ? 'healthy' : 'unhealthy',
        responseTime: `${responseTime.toFixed(2)}ms`,
        statusCode: response.statusCode,
        timestamp: new Date().toISOString(),
      };

      if (response.statusCode === 200) {
        colorLog(`  ✅ Aplicación disponible (${responseTime.toFixed(2)}ms)`, 'green');
      } else {
        colorLog(`  ❌ Aplicación no disponible (Status: ${response.statusCode})`, 'red');
      }
    } catch (error) {
      this.status.checks.application = {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
      colorLog(`  ❌ Error conectando a la aplicación: ${error.message}`, 'red');
    }
  }

  /**
   * Verifica métricas del sistema
   */
  async checkSystemMetrics() {
    colorLog('\n💻 Verificando métricas del sistema...', 'yellow');

    const metrics = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      pid: process.pid,
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuCount: os.cpus().length,
    };

    // Calcular uso de memoria
    const memoryUsage = (metrics.totalMemory - metrics.freeMemory) / metrics.totalMemory;

    // Obtener uso de CPU (aproximado)
    const cpuUsage = await this.getCpuUsage();

    this.status.metrics = {
      ...metrics,
      memoryUsagePercent: (memoryUsage * 100).toFixed(2),
      cpuUsagePercent: (cpuUsage * 100).toFixed(2),
      freeMemoryMB: (metrics.freeMemory / 1024 / 1024).toFixed(2),
      totalMemoryMB: (metrics.totalMemory / 1024 / 1024).toFixed(2),
    };

    this.status.checks.system = {
      status: 'healthy',
      memoryUsage: memoryUsage,
      cpuUsage: cpuUsage,
      timestamp: new Date().toISOString(),
    };

    colorLog(
      `  📊 Memoria: ${(memoryUsage * 100).toFixed(1)}% usada`,
      memoryUsage > 0.8 ? 'red' : 'green'
    );
    colorLog(`  🔧 CPU: ${(cpuUsage * 100).toFixed(1)}% uso`, cpuUsage > 0.8 ? 'red' : 'green');
    colorLog(`  ⚡ Carga promedio: ${metrics.loadAverage[0].toFixed(2)}`, 'blue');
  }

  /**
   * Verifica espacio en disco
   */
  async checkDiskSpace() {
    colorLog('\n💾 Verificando espacio en disco...', 'yellow');

    try {
      const { stdout } = await execAsync("df -h / | tail -1 | awk '{print $5}' | sed 's/%//'");
      const diskUsage = parseInt(stdout.trim()) / 100;

      this.status.checks.disk = {
        status: diskUsage > 0.9 ? 'warning' : 'healthy',
        usage: diskUsage,
        usagePercent: `${(diskUsage * 100).toFixed(1)}%`,
        timestamp: new Date().toISOString(),
      };

      const color = diskUsage > 0.9 ? 'red' : diskUsage > 0.8 ? 'yellow' : 'green';
      colorLog(`  💾 Disco: ${(diskUsage * 100).toFixed(1)}% usado`, color);
    } catch (error) {
      this.status.checks.disk = {
        status: 'error',
        error: 'No se pudo obtener información del disco',
        timestamp: new Date().toISOString(),
      };
      colorLog(`  ❌ Error verificando disco: ${error.message}`, 'red');
    }
  }

  /**
   * Verifica uso de memoria de la aplicación
   */
  async checkMemoryUsage() {
    colorLog('\n🧠 Verificando memoria de la aplicación...', 'yellow');

    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const rssMB = memUsage.rss / 1024 / 1024;

    this.status.checks.appMemory = {
      status: heapUsedMB > 100 ? 'warning' : 'healthy',
      heapUsed: `${heapUsedMB.toFixed(2)} MB`,
      heapTotal: `${heapTotalMB.toFixed(2)} MB`,
      rss: `${rssMB.toFixed(2)} MB`,
      external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`,
      timestamp: new Date().toISOString(),
    };

    const color = heapUsedMB > 100 ? 'red' : heapUsedMB > 50 ? 'yellow' : 'green';
    colorLog(`  🧠 Heap: ${heapUsedMB.toFixed(2)} MB / ${heapTotalMB.toFixed(2)} MB`, color);
    colorLog(`  📊 RSS: ${rssMB.toFixed(2)} MB`, 'blue');
  }

  /**
   * Verifica salud del proceso
   */
  async checkProcessHealth() {
    colorLog('\n⚙️  Verificando proceso...', 'yellow');

    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();

    this.status.checks.process = {
      status: 'healthy',
      pid: process.pid,
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      uptimeSeconds: uptime,
      cpuUser: cpuUsage.user,
      cpuSystem: cpuUsage.system,
      timestamp: new Date().toISOString(),
    };

    colorLog(`  ⚙️  PID: ${process.pid}`, 'blue');
    colorLog(
      `  ⏱️  Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      'green'
    );
  }

  /**
   * Verifica archivos de log
   */
  async checkLogFiles() {
    colorLog('\n📝 Verificando archivos de log...', 'yellow');

    const logPaths = [
      path.join(__dirname, '..', 'logs', 'security.log'),
      path.join(__dirname, '..', 'logs', 'application.log'),
      config.logFile,
    ];

    let totalLogSize = 0;
    let logCount = 0;

    for (const logPath of logPaths) {
      if (fs.existsSync(logPath)) {
        const stats = fs.statSync(logPath);
        totalLogSize += stats.size;
        logCount++;
      }
    }

    const totalLogSizeMB = totalLogSize / 1024 / 1024;

    this.status.checks.logs = {
      status: totalLogSizeMB > 100 ? 'warning' : 'healthy',
      totalSize: `${totalLogSizeMB.toFixed(2)} MB`,
      fileCount: logCount,
      timestamp: new Date().toISOString(),
    };

    const color = totalLogSizeMB > 100 ? 'yellow' : 'green';
    colorLog(`  📝 Logs: ${logCount} archivos, ${totalLogSizeMB.toFixed(2)} MB total`, color);
  }

  /**
   * Verifica endpoints específicos
   */
  async checkEndpointsHealth() {
    colorLog('\n🌐 Verificando endpoints...', 'yellow');

    const results = {};

    for (const endpoint of config.endpoints) {
      try {
        const startTime = performance.now();
        const response = await this.makeRequest(`${config.baseUrl}${endpoint}`);
        const responseTime = performance.now() - startTime;

        results[endpoint] = {
          status: response.statusCode < 400 ? 'healthy' : 'unhealthy',
          statusCode: response.statusCode,
          responseTime: `${responseTime.toFixed(2)}ms`,
          timestamp: new Date().toISOString(),
        };

        const color = response.statusCode < 400 ? 'green' : 'red';
        colorLog(`  🌐 ${endpoint}: ${response.statusCode} (${responseTime.toFixed(2)}ms)`, color);
      } catch (error) {
        results[endpoint] = {
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString(),
        };
        colorLog(`  ❌ ${endpoint}: Error - ${error.message}`, 'red');
      }
    }

    this.status.checks.endpoints = results;
  }

  /**
   * Determina el estado general de salud
   */
  determineOverallHealth() {
    const checks = Object.values(this.status.checks);

    if (checks.some((check) => check.status === 'error')) {
      this.status.overall = 'error';
    } else if (checks.some((check) => check.status === 'unhealthy')) {
      this.status.overall = 'unhealthy';
    } else if (checks.some((check) => check.status === 'warning')) {
      this.status.overall = 'warning';
    } else {
      this.status.overall = 'healthy';
    }
  }

  /**
   * Genera alertas basadas en umbrales
   */
  generateAlerts() {
    const alerts = [];

    // Alerta de tiempo de respuesta
    if (this.status.checks.application?.responseTime) {
      const responseTime = parseFloat(this.status.checks.application.responseTime);
      if (responseTime > config.alertThresholds.responseTime) {
        alerts.push({
          type: 'performance',
          severity: 'warning',
          message: `Tiempo de respuesta alto: ${responseTime.toFixed(2)}ms`,
          threshold: config.alertThresholds.responseTime,
        });
      }
    }

    // Alerta de memoria
    if (this.status.checks.system?.memoryUsage > config.alertThresholds.memoryUsage) {
      alerts.push({
        type: 'memory',
        severity: 'critical',
        message: `Uso de memoria alto: ${(this.status.checks.system.memoryUsage * 100).toFixed(1)}%`,
        threshold: config.alertThresholds.memoryUsage * 100,
      });
    }

    // Alerta de CPU
    if (this.status.checks.system?.cpuUsage > config.alertThresholds.cpuUsage) {
      alerts.push({
        type: 'cpu',
        severity: 'warning',
        message: `Uso de CPU alto: ${(this.status.checks.system.cpuUsage * 100).toFixed(1)}%`,
        threshold: config.alertThresholds.cpuUsage * 100,
      });
    }

    // Alerta de disco
    if (this.status.checks.disk?.usage > config.alertThresholds.diskUsage) {
      alerts.push({
        type: 'disk',
        severity: 'critical',
        message: `Espacio en disco bajo: ${(this.status.checks.disk.usage * 100).toFixed(1)}%`,
        threshold: config.alertThresholds.diskUsage * 100,
      });
    }

    this.status.alerts = alerts;
  }

  /**
   * Muestra el estado de salud
   */
  displayHealthStatus() {
    colorLog('\n🏥 ======================================', 'cyan');
    colorLog('📊 ESTADO DE SALUD DEL SISTEMA', 'bright');
    colorLog('🏥 ======================================', 'cyan');

    // Estado general
    const statusColor = this.getStatusColor(this.status.overall);
    const statusIcon = this.getStatusIcon(this.status.overall);
    colorLog(`\n${statusIcon} Estado General: ${this.status.overall.toUpperCase()}`, statusColor);

    // Tiempo de verificación
    colorLog(`⏱️  Duración: ${this.status.checkDuration}`, 'blue');
    colorLog(`📅 Timestamp: ${this.status.timestamp}`, 'blue');

    // Resumen de checks
    colorLog('\n📋 Resumen de Verificaciones:', 'yellow');
    Object.entries(this.status.checks).forEach(([name, check]) => {
      const icon = this.getStatusIcon(check.status);
      const color = this.getStatusColor(check.status);
      colorLog(`  ${icon} ${name}: ${check.status}`, color);
    });

    // Alertas
    if (this.status.alerts.length > 0) {
      colorLog('\n🚨 ALERTAS:', 'red');
      this.status.alerts.forEach((alert) => {
        const severityColor = alert.severity === 'critical' ? 'red' : 'yellow';
        colorLog(`  🚨 [${alert.severity.toUpperCase()}] ${alert.message}`, severityColor);
      });
    } else {
      colorLog('\n✅ No hay alertas activas', 'green');
    }

    colorLog('\n🏥 ======================================\n', 'cyan');
  }

  /**
   * Obtiene color según estado
   */
  getStatusColor(status) {
    switch (status) {
      case 'healthy':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'unhealthy':
        return 'red';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  }

  /**
   * Obtiene icono según estado
   */
  getStatusIcon(status) {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'unhealthy':
        return '❌';
      case 'error':
        return '💥';
      default:
        return 'ℹ️';
    }
  }

  /**
   * Obtiene uso de CPU
   */
  async getCpuUsage() {
    const startUsage = process.cpuUsage();

    // Esperar 100ms para medir
    await new Promise((resolve) => setTimeout(resolve, 100));

    const endUsage = process.cpuUsage(startUsage);
    const totalUsage = endUsage.user + endUsage.system;

    // Convertir microsegundos a porcentaje aproximado
    return Math.min(totalUsage / 100000, 1); // Normalizar a 0-1
  }

  /**
   * Hace una request HTTP
   */
  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();

      exec(
        `curl -s -o /dev/null -w "%{http_code}" -m ${config.timeout / 1000} ${url}`,
        (error, stdout) => {
          if (error) {
            reject(new Error(`Request failed: ${error.message}`));
            return;
          }

          const responseTime = performance.now() - startTime;
          const statusCode = parseInt(stdout.trim()) || 0;

          resolve({
            statusCode,
            responseTime,
          });
        }
      );
    });
  }

  /**
   * Añade al historial
   */
  addToHistory() {
    this.history.push({
      timestamp: this.status.timestamp,
      overall: this.status.overall,
      checkDuration: this.status.checkDuration,
      alertCount: this.status.alerts.length,
    });

    // Mantener solo las últimas 100 entradas
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
    }
  }

  /**
   * Guarda log de salud
   */
  async saveHealthLog() {
    try {
      const logDir = path.dirname(config.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logEntry = {
        timestamp: this.status.timestamp,
        overall: this.status.overall,
        checks: this.status.checks,
        alerts: this.status.alerts,
        metrics: this.status.metrics,
      };

      fs.appendFileSync(config.logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      colorLog(`⚠️  No se pudo guardar log: ${error.message}`, 'yellow');
    }
  }

  /**
   * Inicia monitoreo continuo
   */
  async startMonitoring() {
    if (this.isRunning) {
      colorLog('⚠️  El monitoreo ya está ejecutándose', 'yellow');
      return;
    }

    this.isRunning = true;
    colorLog('🔄 Iniciando monitoreo continuo...', 'blue');

    while (this.isRunning) {
      await this.runHealthCheck();

      if (this.isRunning) {
        await new Promise((resolve) => setTimeout(resolve, config.interval));
      }
    }
  }

  /**
   * Detiene monitoreo continuo
   */
  stopMonitoring() {
    this.isRunning = false;
    colorLog('⏹️  Monitoreo detenido', 'blue');
  }
}

/**
 * Función principal
 */
async function main() {
  const args = process.argv.slice(2);
  const checker = new HealthChecker();

  if (args.includes('--monitor') || args.includes('-m')) {
    // Monitoreo continuo
    await checker.startMonitoring();
  } else {
    // Health check único
    const result = await checker.runHealthCheck();

    // Salir con código de error si no está saludable
    if (result.overall === 'error' || result.overall === 'unhealthy') {
      process.exit(1);
    }
  }
}

// Manejo de señales para monitoreo continuo
process.on('SIGINT', () => {
  colorLog('\n🔄 Deteniendo monitoreo...', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  colorLog('\n🔄 Deteniendo monitoreo...', 'yellow');
  process.exit(0);
});

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Error en health check:', error);
    process.exit(1);
  });
}

export default HealthChecker;
