#!/usr/bin/env node

/**
 * Script de Monitoreo y Salud Completo
 * @description Sistema completo de verificación de salud, monitoreo y diagnóstico de la aplicación
 * @author Daniel Arribas Velázquez
 * @version 1.0.0
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

// Configuración de colores para consola
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

// Configuración
const config = {
  baseUrl: process.env.HEALTH_CHECK_URL || 'http://localhost:3000',
  timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000,
  interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
  retries: parseInt(process.env.HEALTH_CHECK_RETRIES) || 3,
  logFile: process.env.HEALTH_LOG_FILE || path.join(__dirname, '../../logs/health.log'),
  reportsDir: path.join(__dirname, '../../results/monitoring-results'),
  alertThresholds: {
    responseTime: parseInt(process.env.ALERT_RESPONSE_TIME) || 1000,
    memoryUsage: parseFloat(process.env.ALERT_MEMORY_USAGE) || 0.8,
    cpuUsage: parseFloat(process.env.ALERT_CPU_USAGE) || 0.8,
    diskUsage: parseFloat(process.env.ALERT_DISK_USAGE) || 0.9,
    errorRate: parseFloat(process.env.ALERT_ERROR_RATE) || 0.05,
  },
  endpoints: ['/health', '/', '/auth/login', '/metrics', '/api/contacto'],
  criticalFiles: [
    'app.mjs',
    'package.json',
    'config.env',
    'src/config/index.mjs',
    'views/layout.ejs',
  ],
};

/**
 * VERIFICACIÓN DE SALUD DE LA APLICACIÓN
 */
async function checkApplicationHealth() {
  colorLog('\n🚀 VERIFICACIÓN DE SALUD DE LA APLICACIÓN', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    status: 'unknown',
    responseTime: 0,
    statusCode: 0,
    endpoints: {},
    errors: [],
    warnings: [],
    score: 100,
  };

  try {
    // Verificar endpoint principal
    colorLog('\n🌐 Verificando endpoint principal:', 'blue');
    const startTime = performance.now();

    try {
      const response = await fetch(`${config.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(config.timeout),
      });

      const responseTime = performance.now() - startTime;
      results.responseTime = responseTime;
      results.statusCode = response.status;

      if (response.ok) {
        colorLog(`✅ Aplicación disponible (${responseTime.toFixed(2)}ms)`, 'green');
        results.status = 'healthy';

        if (responseTime > config.alertThresholds.responseTime) {
          colorLog(`⚠️ Tiempo de respuesta alto: ${responseTime.toFixed(2)}ms`, 'yellow');
          results.warnings.push(`Tiempo de respuesta alto: ${responseTime.toFixed(2)}ms`);
          results.score -= 10;
        }
      } else {
        colorLog(`❌ Aplicación no disponible (Status: ${response.status})`, 'red');
        results.status = 'unhealthy';
        results.errors.push(`Status code: ${response.status}`);
        results.score -= 30;
      }
    } catch (error) {
      colorLog(`❌ Error conectando a la aplicación: ${error.message}`, 'red');
      results.status = 'error';
      results.errors.push(`Error de conexión: ${error.message}`);
      results.score -= 50;
    }

    // Verificar endpoints específicos
    colorLog('\n🌐 Verificando endpoints específicos:', 'blue');
    for (const endpoint of config.endpoints) {
      try {
        const startTime = performance.now();
        const response = await fetch(`${config.baseUrl}${endpoint}`, {
          method: 'GET',
          signal: AbortSignal.timeout(config.timeout),
        });
        const responseTime = performance.now() - startTime;

        results.endpoints[endpoint] = {
          status: response.ok ? 'healthy' : 'unhealthy',
          statusCode: response.status,
          responseTime: responseTime,
        };

        const color = response.ok ? 'green' : 'red';
        colorLog(`  ${response.ok ? '✅' : '❌'} ${endpoint}: ${response.status} (${responseTime.toFixed(2)}ms)`, color);

        if (!response.ok) {
          results.warnings.push(`Endpoint ${endpoint} no disponible`);
          results.score -= 5;
        }
      } catch (error) {
        results.endpoints[endpoint] = {
          status: 'error',
          error: error.message,
        };
        colorLog(`  ❌ ${endpoint}: Error - ${error.message}`, 'red');
        results.warnings.push(`Endpoint ${endpoint} error: ${error.message}`);
        results.score -= 5;
      }
    }

  } catch (error) {
    colorLog(`❌ Error general en verificación de aplicación: ${error.message}`, 'red');
    results.errors.push(`Error general: ${error.message}`);
    results.score -= 50;
  }

  return results;
}

/**
 * VERIFICACIÓN DE MÉTRICAS DEL SISTEMA
 */
async function checkSystemMetrics() {
  colorLog('\n💻 VERIFICACIÓN DE MÉTRICAS DEL SISTEMA', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    pid: process.pid,
    uptime: os.uptime(),
    loadAverage: os.loadavg(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    cpuCount: os.cpus().length,
    memoryUsage: 0,
    cpuUsage: 0,
    issues: [],
    warnings: [],
    score: 100,
  };

  try {
    // Calcular uso de memoria
    const memoryUsage = (results.totalMemory - results.freeMemory) / results.totalMemory;
    results.memoryUsage = memoryUsage;

    colorLog(`📊 Memoria: ${(memoryUsage * 100).toFixed(1)}% usada`, memoryUsage > 0.8 ? 'red' : 'green');
    colorLog(`🔧 CPU: ${results.cpuCount} núcleos`, 'blue');
    colorLog(`⏱️ Uptime del sistema: ${Math.floor(results.uptime / 3600)} horas`, 'blue');
    colorLog(`⚡ Carga promedio: ${results.loadAverage[0].toFixed(2)}`, 'blue');

    // Verificar umbrales
    if (memoryUsage > config.alertThresholds.memoryUsage) {
      colorLog(`⚠️ Uso de memoria alto: ${(memoryUsage * 100).toFixed(1)}%`, 'yellow');
      results.warnings.push(`Uso de memoria alto: ${(memoryUsage * 100).toFixed(1)}%`);
      results.score -= 20;
    }

    // Obtener uso de CPU aproximado
    const cpuUsage = await getCpuUsage();
    results.cpuUsage = cpuUsage;

    colorLog(`🔧 CPU: ${(cpuUsage * 100).toFixed(1)}% uso`, cpuUsage > 0.8 ? 'red' : 'green');

    if (cpuUsage > config.alertThresholds.cpuUsage) {
      colorLog(`⚠️ Uso de CPU alto: ${(cpuUsage * 100).toFixed(1)}%`, 'yellow');
      results.warnings.push(`Uso de CPU alto: ${(cpuUsage * 100).toFixed(1)}%`);
      results.score -= 15;
    }

  } catch (error) {
    colorLog(`❌ Error verificando métricas del sistema: ${error.message}`, 'red');
    results.issues.push(`Error métricas: ${error.message}`);
    results.score -= 30;
  }

  return results;
}

/**
 * VERIFICACIÓN DE ESPACIO EN DISCO
 */
async function checkDiskSpace() {
  colorLog('\n💾 VERIFICACIÓN DE ESPACIO EN DISCO', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    usage: 0,
    usagePercent: '0%',
    status: 'unknown',
    issues: [],
    warnings: [],
    score: 100,
  };

  try {
    // Verificar espacio en disco (Windows y Unix)
    let diskUsage = 0;

    if (process.platform === 'win32') {
      // Windows - usar PowerShell en lugar de wmic
      try {
        const { stdout } = await execAsync('powershell -Command "Get-WmiObject -Class Win32_LogicalDisk | Select-Object Size,FreeSpace | ForEach-Object { $_.Size, $_.FreeSpace }"');
        const lines = stdout.trim().split('\n');

        for (let i = 0; i < lines.length; i += 2) {
          const totalSize = parseInt(lines[i]);
          const freeSpace = parseInt(lines[i + 1]);
          if (totalSize > 0 && !isNaN(totalSize) && !isNaN(freeSpace)) {
            diskUsage = 1 - (freeSpace / totalSize);
            break;
          }
        }
      } catch (error) {
        // Fallback: usar fs.statfs si está disponible
        try {
          const { execSync } = await import('child_process');
          const { stdout } = await execAsync('powershell -Command "Get-PSDrive C | Select-Object Used,Free | ForEach-Object { $_.Used, $_.Free }"');
          const parts = stdout.trim().split('\n');
          if (parts.length >= 2) {
            const used = parseInt(parts[0]);
            const free = parseInt(parts[1]);
            const total = used + free;
            if (total > 0) {
              diskUsage = used / total;
            }
          }
        } catch (fallbackError) {
          // Si todo falla, usar un valor por defecto
          diskUsage = 0.5; // 50% por defecto
          colorLog('⚠️ No se pudo obtener información del disco, usando valor por defecto', 'yellow');
        }
      }
    } else {
      // Unix/Linux
      const { stdout } = await execAsync("df -h / | tail -1 | awk '{print $5}' | sed 's/%//'");
      diskUsage = parseInt(stdout.trim()) / 100;
    }

    results.usage = diskUsage;
    results.usagePercent = `${(diskUsage * 100).toFixed(1)}%`;

    const color = diskUsage > 0.9 ? 'red' : diskUsage > 0.8 ? 'yellow' : 'green';
    colorLog(`💾 Disco: ${(diskUsage * 100).toFixed(1)}% usado`, color);

    if (diskUsage > config.alertThresholds.diskUsage) {
      colorLog(`❌ Espacio en disco crítico: ${(diskUsage * 100).toFixed(1)}%`, 'red');
      results.status = 'critical';
      results.issues.push(`Espacio en disco crítico: ${(diskUsage * 100).toFixed(1)}%`);
      results.score -= 40;
    } else if (diskUsage > 0.8) {
      colorLog(`⚠️ Espacio en disco bajo: ${(diskUsage * 100).toFixed(1)}%`, 'yellow');
      results.status = 'warning';
      results.warnings.push(`Espacio en disco bajo: ${(diskUsage * 100).toFixed(1)}%`);
      results.score -= 20;
    } else {
      results.status = 'healthy';
    }

  } catch (error) {
    colorLog(`❌ Error verificando espacio en disco: ${error.message}`, 'red');
    results.issues.push(`Error disco: ${error.message}`);
    results.score -= 30;
  }

  return results;
}

/**
 * VERIFICACIÓN DE MEMORIA DE LA APLICACIÓN
 */
async function checkApplicationMemory() {
  colorLog('\n🧠 VERIFICACIÓN DE MEMORIA DE LA APLICACIÓN', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    heapUsed: '0 MB',
    heapTotal: '0 MB',
    rss: '0 MB',
    external: '0 MB',
    status: 'unknown',
    issues: [],
    warnings: [],
    score: 100,
  };

  try {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const rssMB = memUsage.rss / 1024 / 1024;
    const externalMB = memUsage.external / 1024 / 1024;

    results.heapUsed = `${heapUsedMB.toFixed(2)} MB`;
    results.heapTotal = `${heapTotalMB.toFixed(2)} MB`;
    results.rss = `${rssMB.toFixed(2)} MB`;
    results.external = `${externalMB.toFixed(2)} MB`;

    colorLog(`🧠 Heap: ${heapUsedMB.toFixed(2)} MB / ${heapTotalMB.toFixed(2)} MB`, heapUsedMB > 100 ? 'red' : 'green');
    colorLog(`📊 RSS: ${rssMB.toFixed(2)} MB`, 'blue');
    colorLog(`🔗 External: ${externalMB.toFixed(2)} MB`, 'blue');

    // Verificar umbrales
    if (heapUsedMB > 200) {
      colorLog(`❌ Uso de heap muy alto: ${heapUsedMB.toFixed(2)} MB`, 'red');
      results.status = 'critical';
      results.issues.push(`Uso de heap muy alto: ${heapUsedMB.toFixed(2)} MB`);
      results.score -= 30;
    } else if (heapUsedMB > 100) {
      colorLog(`⚠️ Uso de heap alto: ${heapUsedMB.toFixed(2)} MB`, 'yellow');
      results.status = 'warning';
      results.warnings.push(`Uso de heap alto: ${heapUsedMB.toFixed(2)} MB`);
      results.score -= 15;
    } else {
      results.status = 'healthy';
    }

  } catch (error) {
    colorLog(`❌ Error verificando memoria de aplicación: ${error.message}`, 'red');
    results.issues.push(`Error memoria: ${error.message}`);
    results.score -= 30;
  }

  return results;
}

/**
 * VERIFICACIÓN DE ARCHIVOS CRÍTICOS
 */
async function checkCriticalFiles() {
  colorLog('\n📁 VERIFICACIÓN DE ARCHIVOS CRÍTICOS', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    files: {},
    missing: [],
    issues: [],
    warnings: [],
    score: 100,
  };

  try {
    for (const file of config.criticalFiles) {
      const filePath = path.join(__dirname, '../../', file);
      const exists = fs.existsSync(filePath);

      results.files[file] = {
        exists,
        path: filePath,
        size: exists ? fs.statSync(filePath).size : 0,
      };

      if (exists) {
        colorLog(`✅ ${file} encontrado`, 'green');

        // Verificar tamaño mínimo
        if (results.files[file].size === 0) {
          colorLog(`⚠️ ${file} está vacío`, 'yellow');
          results.warnings.push(`${file} está vacío`);
          results.score -= 5;
        }
      } else {
        colorLog(`❌ ${file} no encontrado`, 'red');
        results.missing.push(file);
        results.issues.push(`${file} no encontrado`);
        results.score -= 20;
      }
    }

    // Verificar archivos de log
    colorLog('\n📝 Verificando archivos de log:', 'blue');
    const logPaths = [
      path.join(__dirname, '../../logs/security.log'),
      path.join(__dirname, '../../logs/application.log'),
      config.logFile,
    ];

    let totalLogSize = 0;
    let logCount = 0;

    for (const logPath of logPaths) {
      if (fs.existsSync(logPath)) {
        const stats = fs.statSync(logPath);
        totalLogSize += stats.size;
        logCount++;
        colorLog(`✅ ${path.basename(logPath)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`, 'green');
      } else {
        colorLog(`⚠️ ${path.basename(logPath)} no encontrado`, 'yellow');
      }
    }

    const totalLogSizeMB = totalLogSize / 1024 / 1024;
    if (totalLogSizeMB > 100) {
      colorLog(`⚠️ Tamaño total de logs alto: ${totalLogSizeMB.toFixed(2)} MB`, 'yellow');
      results.warnings.push(`Tamaño total de logs alto: ${totalLogSizeMB.toFixed(2)} MB`);
      results.score -= 10;
    }

  } catch (error) {
    colorLog(`❌ Error verificando archivos críticos: ${error.message}`, 'red');
    results.issues.push(`Error archivos: ${error.message}`);
    results.score -= 30;
  }

  return results;
}

/**
 * VERIFICACIÓN DE PROCESOS Y SERVICIOS
 */
async function checkProcessesAndServices() {
  colorLog('\n⚙️ VERIFICACIÓN DE PROCESOS Y SERVICIOS', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    process: {},
    services: {},
    issues: [],
    warnings: [],
    score: 100,
  };

  try {
    // Información del proceso actual
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();

    results.process = {
      pid: process.pid,
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      uptimeSeconds: uptime,
      cpuUser: cpuUsage.user,
      cpuSystem: cpuUsage.system,
    };

    colorLog(`⚙️ PID: ${process.pid}`, 'blue');
    colorLog(`⏱️ Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`, 'green');

    // Verificar servicios externos (si están disponibles)
    colorLog('\n🔍 Verificando servicios externos:', 'blue');

    const services = [
      { name: 'Node.js', command: 'node --version' },
      { name: 'npm', command: 'npm --version' },
    ];

    for (const service of services) {
      try {
        const { stdout } = await execAsync(service.command);
        colorLog(`✅ ${service.name}: ${stdout.trim()}`, 'green');
        results.services[service.name] = { available: true, version: stdout.trim() };
      } catch (error) {
        colorLog(`❌ ${service.name}: No disponible`, 'red');
        results.services[service.name] = { available: false, error: error.message };
        results.warnings.push(`${service.name} no disponible`);
        results.score -= 10;
      }
    }

  } catch (error) {
    colorLog(`❌ Error verificando procesos: ${error.message}`, 'red');
    results.issues.push(`Error procesos: ${error.message}`);
    results.score -= 30;
  }

  return results;
}

/**
 * GENERAR REPORTE DE MONITOREO
 */
function generateMonitoringReport(appHealth, systemMetrics, diskSpace, appMemory, criticalFiles, processes) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      application: {
        status: appHealth.status,
        responseTime: appHealth.responseTime,
        statusCode: appHealth.statusCode,
        score: appHealth.score,
        issues: appHealth.errors.length,
        warnings: appHealth.warnings.length,
      },
      system: {
        platform: systemMetrics.platform,
        memoryUsage: systemMetrics.memoryUsage,
        cpuUsage: systemMetrics.cpuUsage,
        score: systemMetrics.score,
        issues: systemMetrics.issues.length,
        warnings: systemMetrics.warnings.length,
      },
      disk: {
        usage: diskSpace.usage,
        status: diskSpace.status,
        score: diskSpace.score,
        issues: diskSpace.issues.length,
        warnings: diskSpace.warnings.length,
      },
      memory: {
        heapUsed: appMemory.heapUsed,
        rss: appMemory.rss,
        status: appMemory.status,
        score: appMemory.score,
        issues: appMemory.issues.length,
        warnings: appMemory.warnings.length,
      },
      files: {
        missing: criticalFiles.missing.length,
        score: criticalFiles.score,
        issues: criticalFiles.issues.length,
        warnings: criticalFiles.warnings.length,
      },
      processes: {
        pid: processes.process.pid,
        uptime: processes.process.uptime,
        score: processes.score,
        issues: processes.issues.length,
        warnings: processes.warnings.length,
      },
    },
    details: {
      application: appHealth,
      system: systemMetrics,
      disk: diskSpace,
      memory: appMemory,
      files: criticalFiles,
      processes: processes,
    },
  };

  // Crear directorio si no existe
  if (!fs.existsSync(config.reportsDir)) {
    fs.mkdirSync(config.reportsDir, { recursive: true });
  }

  const reportPath = path.join(config.reportsDir, 'monitoring-complete-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  colorLog(`\n📄 Reporte guardado en: ${reportPath}`, 'cyan');
  return report;
}

/**
 * OBTENER USO DE CPU
 */
async function getCpuUsage() {
  const startUsage = process.cpuUsage();
  await new Promise((resolve) => setTimeout(resolve, 100));
  const endUsage = process.cpuUsage(startUsage);
  const totalUsage = endUsage.user + endUsage.system;
  return Math.min(totalUsage / 100000, 1);
}

/**
 * EJECUCIÓN COMPLETA DEL MONITOREO
 */
async function runCompleteMonitoring() {
  const startTime = Date.now();

  colorLog('\n🏥 MONITOREO Y SALUD COMPLETO INICIADO', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Verificación de salud de la aplicación
  const appHealth = await checkApplicationHealth();

  // 2. Verificación de métricas del sistema
  const systemMetrics = await checkSystemMetrics();

  // 3. Verificación de espacio en disco
  const diskSpace = await checkDiskSpace();

  // 4. Verificación de memoria de la aplicación
  const appMemory = await checkApplicationMemory();

  // 5. Verificación de archivos críticos
  const criticalFiles = await checkCriticalFiles();

  // 6. Verificación de procesos y servicios
  const processes = await checkProcessesAndServices();

  // 7. Generar reporte
  const completeReport = generateMonitoringReport(appHealth, systemMetrics, diskSpace, appMemory, criticalFiles, processes);

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('\n📊 RESUMEN FINAL', 'bright');
  colorLog('='.repeat(60), 'bright');

  const appScore = appHealth.score;
  const systemScore = systemMetrics.score;
  const diskScore = diskSpace.score;
  const memoryScore = appMemory.score;
  const filesScore = criticalFiles.score;
  const processScore = processes.score;

  colorLog(`🚀 Aplicación: ${appScore}/100`, appScore >= 80 ? 'green' : appScore >= 50 ? 'yellow' : 'red');
  colorLog(`💻 Sistema: ${systemScore}/100`, systemScore >= 80 ? 'green' : systemScore >= 50 ? 'yellow' : 'red');
  colorLog(`💾 Disco: ${diskScore}/100`, diskScore >= 80 ? 'green' : diskScore >= 50 ? 'yellow' : 'red');
  colorLog(`🧠 Memoria: ${memoryScore}/100`, memoryScore >= 80 ? 'green' : memoryScore >= 50 ? 'yellow' : 'red');
  colorLog(`📁 Archivos: ${filesScore}/100`, filesScore >= 80 ? 'green' : filesScore >= 50 ? 'yellow' : 'red');
  colorLog(`⚙️ Procesos: ${processScore}/100`, processScore >= 80 ? 'green' : processScore >= 50 ? 'yellow' : 'red');
  colorLog(`⏱️ Tiempo total: ${totalTime} segundos`, 'cyan');

  const overallScore = Math.round((appScore + systemScore + diskScore + memoryScore + filesScore + processScore) / 6);
  colorLog(`\n🎯 Puntuación general: ${overallScore}/100`, overallScore >= 80 ? 'green' : overallScore >= 50 ? 'yellow' : 'red');

  const allOK = overallScore >= 70;
  colorLog(`🎯 Estado general: ${allOK ? '✅ SISTEMA SALUDABLE' : '❌ PROBLEMAS DE SALUD DETECTADOS'}`, allOK ? 'green' : 'red');

  colorLog('\n✅ MONITOREO Y SALUD COMPLETO FINALIZADO', 'bright');
  colorLog('💡 Para verificación rápida, ejecuta: node scripts/Monitoreo&Salud/monitoring-quick.mjs', 'blue');
}

// Ejecutar si se llama directamente
runCompleteMonitoring().catch(console.error);
