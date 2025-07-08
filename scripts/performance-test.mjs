#!/usr/bin/env node

/**
 * Script de Testing de Rendimiento
 * @description Herramienta para medir y analizar el rendimiento de la aplicación
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

// Detección del sistema operativo
const OS_INFO = {
  platform: os.platform(),
  type: os.type(),
  arch: os.arch(),
  release: os.release(),
  isWindows: os.platform() === 'win32',
  isMac: os.platform() === 'darwin',
  isLinux: os.platform() === 'linux',
  shell: process.env.SHELL || (os.platform() === 'win32' ? 'cmd' : '/bin/bash'),
};

// Función para obtener el comando HTTP apropiado para cada OS
function getHttpCommand(url, options = {}) {
  const { timeout = 5000, outputStatusCode = true } = options;

  if (OS_INFO.isWindows) {
    const timeoutSeconds = Math.ceil(timeout / 1000);
    return `powershell -Command "try { $response = Invoke-WebRequest -Uri '${url}' -UseBasicParsing -TimeoutSec ${timeoutSeconds}; ${outputStatusCode ? '$response.StatusCode' : '$response.Content'} } catch { if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { 'ERROR' } }"`;
  } else if (OS_INFO.isMac || OS_INFO.isLinux) {
    const curlTimeout = Math.ceil(timeout / 1000);
    if (outputStatusCode) {
      return `curl -s -o /dev/null -w "%{http_code}" --max-time ${curlTimeout} ${url}`;
    } else {
      return `curl -s --max-time ${curlTimeout} ${url}`;
    }
  } else {
    throw new Error(`Sistema operativo no soportado: ${OS_INFO.platform}`);
  }
}

// Función para obtener información del sistema
function getSystemInfo() {
  return {
    platform: OS_INFO.platform,
    type: OS_INFO.type,
    arch: OS_INFO.arch,
    release: OS_INFO.release,
    nodeVersion: process.version,
    memory: os.totalmem(),
    freeMemory: os.freemem(),
    cpus: os.cpus().length,
  };
}

// Configuración de pruebas
const config = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  duration: parseInt(process.env.TEST_DURATION) || 30, // segundos
  connections: parseInt(process.env.TEST_CONNECTIONS) || 10,
  warmupTime: parseInt(process.env.WARMUP_TIME) || 5, // segundos
  endpoints: ['/', '/health', '/auth/login', '/auth/register', '/metrics'],
  outputDir: path.join(__dirname, '..', 'test-results'),
  reportFile: 'performance-report.json',
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
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Clase principal para testing de rendimiento
 */
class PerformanceTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      config: { ...config },
      tests: [],
      summary: {},
      recommendations: [],
    };
    this.serverProcess = null;
  }

  /**
   * Ejecuta todas las pruebas de rendimiento
   */
  async runAllTests() {
    try {
      colorLog('\n🚀 ======================================', 'cyan');
      colorLog('🔧 Iniciando Tests de Rendimiento', 'bright');
      colorLog('🚀 ======================================', 'cyan');

      // Mostrar información del sistema
      const systemInfo = getSystemInfo();
      colorLog(`\n📋 INFORMACIÓN DEL SISTEMA:`, 'yellow');
      colorLog(`  🖥️  SO: ${systemInfo.type} ${systemInfo.arch} (${systemInfo.platform})`, 'blue');
      colorLog(`  🟢 Node.js: ${systemInfo.nodeVersion}`, 'blue');
      colorLog(
        `  💾 Memoria: ${Math.round(systemInfo.memory / 1024 / 1024 / 1024)} GB total, ${Math.round(systemInfo.freeMemory / 1024 / 1024 / 1024)} GB libre`,
        'blue'
      );
      colorLog(`  🔧 CPUs: ${systemInfo.cpus}`, 'blue');
      colorLog(`  🐚 Shell: ${OS_INFO.shell}`, 'blue');

      // Crear directorio de resultados
      await this.ensureOutputDir();

      // Preparar entorno para testing
      await this.prepareTestEnvironment();

      // Iniciar servidor si no está corriendo
      await this.ensureServerRunning();

      // Verificar que el servidor esté ejecutándose
      await this.checkServerHealth();

      // Ejecutar warmup
      await this.warmupServer();

      // Ejecutar pruebas de carga
      await this.runLoadTests();

      // Ejecutar pruebas de estrés
      await this.runStressTests();

      // Ejecutar pruebas de memoria
      await this.runMemoryTests();

      // Analizar resultados
      this.analyzeResults();

      // Generar recomendaciones
      this.generateRecommendations();

      // Guardar reporte
      await this.saveReport();

      // Mostrar resumen
      this.displaySummary();
    } catch (error) {
      colorLog(`❌ Error en tests de rendimiento: ${error.message}`, 'red');
      process.exit(1);
    } finally {
      // Detener servidor si lo iniciamos nosotros
      await this.stopServer();
    }
  }

  /**
   * Asegura que el directorio de salida exista
   */
  async ensureOutputDir() {
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
  }

  /**
   * Prepara el entorno para testing
   */
  async prepareTestEnvironment() {
    colorLog('\n🔧 Preparando entorno de testing...', 'yellow');

    const projectRoot = path.join(__dirname, '..');
    const configEnvPath = path.join(projectRoot, 'config.env');

    // Verificar si existe config.env
    if (!fs.existsSync(configEnvPath)) {
      colorLog('⚠️  config.env no encontrado, creando configuración mínima...', 'yellow');

      // Crear config.env con valores mínimos para testing
      const minimalConfig = `# Configuración mínima para testing
NODE_ENV=test
PORT=3000
JWT_SECRET=test-jwt-secret-with-at-least-32-characters-for-testing-purposes-only
SESSION_SECRET=test-session-secret-with-sufficient-length-for-testing-purposes-only
MONGODB_URI=mongodb://localhost:27017/test_performance_db

# Configuraciones de seguridad para testing
BCRYPT_ROUNDS=4
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
`;

      fs.writeFileSync(configEnvPath, minimalConfig);
      colorLog('✅ config.env creado con configuración mínima', 'green');
    } else {
      colorLog('✅ config.env encontrado', 'green');
    }

    // Verificar que los secrets tengan la longitud adecuada
    try {
      const configContent = fs.readFileSync(configEnvPath, 'utf8');
      const lines = configContent.split('\n');
      let needsUpdate = false;
      const updatedLines = [];

      for (const line of lines) {
        if (line.startsWith('JWT_SECRET=')) {
          const secret = line.split('=')[1];
          if (!secret || secret.length < 32) {
            updatedLines.push(
              'JWT_SECRET=test-jwt-secret-with-at-least-32-characters-for-testing-purposes-only'
            );
            needsUpdate = true;
            colorLog('🔑 JWT_SECRET actualizado', 'blue');
          } else {
            updatedLines.push(line);
          }
        } else if (line.startsWith('SESSION_SECRET=')) {
          const secret = line.split('=')[1];
          if (!secret || secret.length < 32) {
            updatedLines.push(
              'SESSION_SECRET=test-session-secret-with-sufficient-length-for-testing-purposes-only'
            );
            needsUpdate = true;
            colorLog('🍪 SESSION_SECRET actualizado', 'blue');
          } else {
            updatedLines.push(line);
          }
        } else {
          updatedLines.push(line);
        }
      }

      if (needsUpdate) {
        fs.writeFileSync(configEnvPath, updatedLines.join('\n'));
        colorLog('✅ Configuración actualizada', 'green');
      }
    } catch {
      colorLog(`⚠️  Error verificando configuración`, 'yellow');
    }

    colorLog('✅ Entorno de testing preparado', 'green');
  }

  /**
   * Asegura que el servidor esté corriendo
   */
  async ensureServerRunning() {
    try {
      // Intentar hacer una petición simple para ver si el servidor ya está corriendo
      const checkCmd = getHttpCommand(`${config.baseUrl}/health`, { timeout: 3000 });

      colorLog(`🔍 Verificando servidor (${OS_INFO.platform})...`, 'blue');
      const { stdout } = await execAsync(checkCmd, { timeout: 5000 });
      const statusCode = parseInt(stdout.trim());

      if (statusCode === 200) {
        colorLog('✅ Servidor ya está corriendo', 'green');
        return;
      }
    } catch {
      // El servidor no está corriendo, lo iniciamos
      colorLog(`⚠️  Servidor no detectado`, 'yellow');
    }

    colorLog('🚀 Iniciando servidor para pruebas...', 'yellow');
    colorLog(`📋 Sistema: ${OS_INFO.type} ${OS_INFO.arch} (${OS_INFO.platform})`, 'blue');

    // Cambiar al directorio raíz del proyecto
    const projectRoot = path.join(__dirname, '..');

    // Verificar que el archivo app.mjs existe
    const appPath = path.join(projectRoot, 'app.mjs');
    if (!fs.existsSync(appPath)) {
      throw new Error(`No se encuentra el archivo app.mjs en: ${appPath}`);
    }

    // Iniciar el servidor en background
    const { spawn } = await import('child_process');

    // Configurar el entorno para el servidor
    const serverEnv = {
      ...process.env,
      NODE_ENV: 'test',
      PORT: '3000',
      // Forzar que no use clustering en tests
      ENABLE_CLUSTERING: 'false',
    };

    colorLog(`📂 Directorio de trabajo: ${projectRoot}`, 'blue');
    colorLog(`📝 Comando: node app.mjs`, 'blue');

    this.serverProcess = spawn('node', ['app.mjs'], {
      cwd: projectRoot,
      env: serverEnv,
      detached: false,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Capturar output del servidor para debugging
    let serverOutput = '';
    let serverError = '';

    this.serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      if (output.includes('listening') || output.includes('started') || output.includes('3000')) {
        colorLog(`📝 Servidor: ${output.trim()}`, 'blue');
      }
    });

    this.serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      serverError += error;
      colorLog(`⚠️  Error servidor: ${error.trim()}`, 'yellow');
    });

    this.serverProcess.on('error', (error) => {
      colorLog(`❌ Error iniciando servidor: ${error.message}`, 'red');
    });

    // Esperar a que el servidor esté listo
    await new Promise((resolve, reject) => {
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          const errorMsg = `Timeout esperando que el servidor esté listo.\nOutput: ${serverOutput}\nError: ${serverError}`;
          resolved = true;
          reject(new Error(errorMsg));
        }
      }, 30000); // Aumentar timeout a 30 segundos

      const checkServer = async () => {
        try {
          const checkCmd = getHttpCommand(`${config.baseUrl}/health`, { timeout: 3000 });
          const { stdout } = await execAsync(checkCmd);
          const statusCode = parseInt(stdout.trim());

          if (statusCode === 200) {
            if (!resolved) {
              clearTimeout(timeout);
              colorLog('✅ Servidor iniciado correctamente', 'green');
              resolved = true;
              resolve();
            }
          } else {
            colorLog(`⏳ Esperando servidor...`, 'blue');
            setTimeout(checkServer, 2000);
          }
        } catch {
          colorLog(`⏳ Esperando servidor...`, 'blue');
          setTimeout(checkServer, 2000);
        }
      };

      // Verificar si el proceso del servidor sigue corriendo
      this.serverProcess.on('exit', (code, signal) => {
        if (!resolved) {
          const errorMsg = `El servidor se cerró inesperadamente (código: ${code}, señal: ${signal}).\nOutput: ${serverOutput}\nError: ${serverError}`;
          clearTimeout(timeout);
          resolved = true;
          reject(new Error(errorMsg));
        }
      });

      setTimeout(checkServer, 3000); // Esperar 3 segundos antes del primer check
    });
  }

  /**
   * Detiene el servidor si fue iniciado por este script
   */
  async stopServer() {
    if (this.serverProcess) {
      colorLog('🛑 Deteniendo servidor...', 'yellow');

      // Enviar señal de terminación apropiada según el SO
      const signal = OS_INFO.isWindows ? 'SIGTERM' : 'SIGINT';
      this.serverProcess.kill(signal);

      // Esperar a que termine
      await new Promise((resolve) => {
        let resolved = false;

        this.serverProcess.on('exit', (code) => {
          if (!resolved) {
            colorLog(`✅ Servidor detenido (código: ${code})`, 'green');
            resolved = true;
            resolve();
          }
        });

        this.serverProcess.on('error', (error) => {
          if (!resolved) {
            colorLog(`⚠️  Error al detener servidor: ${error.message}`, 'yellow');
            resolved = true;
            resolve();
          }
        });

        // Force kill after 5 seconds
        setTimeout(() => {
          if (!resolved && this.serverProcess && !this.serverProcess.killed) {
            colorLog('🔥 Forzando terminación del servidor...', 'yellow');
            this.serverProcess.kill('SIGKILL');
            resolved = true;
            resolve();
          }
        }, 5000);
      });
    }
  }

  /**
   * Verifica que el servidor esté disponible
   */
  async checkServerHealth() {
    colorLog('\n🔍 Verificando estado del servidor...', 'yellow');
    colorLog(`📋 Plataforma: ${OS_INFO.platform} (${OS_INFO.type})`, 'blue');

    const startTime = performance.now();

    try {
      // Intentar usar fetch nativo o importarlo dinámicamente
      let fetchFn;
      try {
        fetchFn = globalThis.fetch;
        if (!fetchFn) {
          const nodeFetch = await import('node-fetch');
          fetchFn = nodeFetch.default;
        }
      } catch {
        fetchFn = null;
      }

      if (fetchFn) {
        const response = await fetchFn(`${config.baseUrl}/health`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`Servidor no disponible. Status: ${response.status}`);
        }

        const responseTime = performance.now() - startTime;
        colorLog(`✅ Servidor disponible (${responseTime.toFixed(2)}ms) - usando fetch`, 'green');
        return;
      }
    } catch {
      // Fallback a métodos específicos del sistema operativo
    }

    // Fallback: usar comandos del sistema según la plataforma
    try {
      const healthCmd = getHttpCommand(`${config.baseUrl}/health`, { timeout: 5000 });
      colorLog(
        `🔧 Usando comando: ${OS_INFO.platform === 'win32' ? 'PowerShell' : 'curl'}`,
        'blue'
      );

      const { stdout } = await execAsync(healthCmd);
      const statusCode = parseInt(stdout.trim());

      if (statusCode !== 200) {
        throw new Error(`Servidor no disponible. Status: ${statusCode}`);
      }

      const responseTime = performance.now() - startTime;
      colorLog(
        `✅ Servidor disponible (${responseTime.toFixed(2)}ms) - usando ${OS_INFO.platform === 'win32' ? 'PowerShell' : 'curl'}`,
        'green'
      );
    } catch {
      // Fallback a comandos del sistema
    }
  }

  /**
   * Precalienta el servidor
   */
  async warmupServer() {
    colorLog('\n🔥 Precalentando servidor...', 'yellow');

    const warmupPromises = config.endpoints.map((endpoint) =>
      this.makeRequest(`${config.baseUrl}${endpoint}`)
    );

    await Promise.all(warmupPromises);

    // Esperar tiempo adicional
    await new Promise((resolve) => setTimeout(resolve, config.warmupTime * 1000));

    colorLog(`✅ Servidor precalentado (${config.warmupTime}s)`, 'green');
  }

  /**
   * Ejecuta pruebas de carga usando autocannon
   */
  async runLoadTests() {
    colorLog('\n⚡ Ejecutando pruebas de carga...', 'yellow');

    for (const endpoint of config.endpoints) {
      const testName = `load_test_${endpoint.replace(/\//g, '_')}`;
      const url = `${config.baseUrl}${endpoint}`;

      colorLog(`  📊 Testing: ${endpoint}`, 'blue');

      try {
        const command = `npx autocannon -c ${config.connections} -d ${config.duration} --json ${url}`;
        const { stdout } = await execAsync(command);
        const result = JSON.parse(stdout);

        this.results.tests.push({
          name: testName,
          type: 'load',
          endpoint: endpoint,
          url: url,
          ...result,
        });

        colorLog(
          `    ✅ RPS: ${result.requests.average.toFixed(2)}, Latencia: ${result.latency.average.toFixed(2)}ms`,
          'green'
        );
      } catch {
        colorLog(`    ❌ Error en ${endpoint}`, 'red');
      }
    }
  }

  /**
   * Ejecuta pruebas de estrés
   */
  async runStressTests() {
    colorLog('\n💪 Ejecutando pruebas de estrés...', 'yellow');

    const stressEndpoint = '/';
    const stressConnections = config.connections * 5; // 5x más conexiones
    const stressDuration = 10; // Prueba más corta pero intensa

    colorLog(`  🔥 Stress test con ${stressConnections} conexiones`, 'blue');

    try {
      const command = `npx autocannon -c ${stressConnections} -d ${stressDuration} --json ${config.baseUrl}${stressEndpoint}`;
      const { stdout } = await execAsync(command);
      const result = JSON.parse(stdout);

      this.results.tests.push({
        name: 'stress_test',
        type: 'stress',
        endpoint: stressEndpoint,
        connections: stressConnections,
        duration: stressDuration,
        ...result,
      });

      colorLog(
        `    ✅ Stress RPS: ${result.requests.average.toFixed(2)}, Errors: ${result.errors}`,
        'green'
      );
    } catch {
      colorLog(`    ❌ Error en stress test`, 'red');
    }
  }

  /**
   * Ejecuta pruebas de memoria y CPU
   */
  async runMemoryTests() {
    colorLog('\n🧠 Ejecutando pruebas de memoria...', 'yellow');

    const samples = [];
    const sampleInterval = 1000; // 1 segundo
    const totalSamples = 10;

    for (let i = 0; i < totalSamples; i++) {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      samples.push({
        timestamp: Date.now(),
        memory: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external,
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
      });

      if (i < totalSamples - 1) {
        await new Promise((resolve) => setTimeout(resolve, sampleInterval));
      }
    }

    this.results.tests.push({
      name: 'memory_test',
      type: 'memory',
      samples: samples,
      averages: this.calculateMemoryAverages(samples),
    });

    colorLog(
      `    ✅ Memoria promedio: ${(this.calculateMemoryAverages(samples).heapUsed / 1024 / 1024).toFixed(2)} MB`,
      'green'
    );
  }

  /**
   * Calcula promedios de memoria
   */
  calculateMemoryAverages(samples) {
    const totals = samples.reduce(
      (acc, sample) => {
        acc.rss += sample.memory.rss;
        acc.heapTotal += sample.memory.heapTotal;
        acc.heapUsed += sample.memory.heapUsed;
        acc.external += sample.memory.external;
        return acc;
      },
      { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 }
    );

    const count = samples.length;
    return {
      rss: totals.rss / count,
      heapTotal: totals.heapTotal / count,
      heapUsed: totals.heapUsed / count,
      external: totals.external / count,
    };
  }

  /**
   * Analiza los resultados de las pruebas
   */
  analyzeResults() {
    colorLog('\n📊 Analizando resultados...', 'yellow');

    const loadTests = this.results.tests.filter((t) => t.type === 'load');
    const stressTest = this.results.tests.find((t) => t.type === 'stress');
    const memoryTest = this.results.tests.find((t) => t.type === 'memory');

    // Calcular métricas de carga
    if (loadTests.length > 0) {
      const avgRPS =
        loadTests.reduce((sum, test) => sum + test.requests.average, 0) / loadTests.length;
      const avgLatency =
        loadTests.reduce((sum, test) => sum + test.latency.average, 0) / loadTests.length;
      const totalErrors = loadTests.reduce((sum, test) => sum + (test.errors || 0), 0);

      this.results.summary.load = {
        averageRPS: avgRPS,
        averageLatency: avgLatency,
        totalErrors: totalErrors,
        testCount: loadTests.length,
      };
    }

    // Métricas de estrés
    if (stressTest) {
      this.results.summary.stress = {
        rps: stressTest.requests.average,
        latency: stressTest.latency.average,
        errors: stressTest.errors || 0,
        connections: stressTest.connections,
      };
    }

    // Métricas de memoria
    if (memoryTest) {
      this.results.summary.memory = {
        averageHeapUsed: memoryTest.averages.heapUsed,
        averageRSS: memoryTest.averages.rss,
        peakHeapUsed: Math.max(...memoryTest.samples.map((s) => s.memory.heapUsed)),
      };
    }
  }

  /**
   * Genera recomendaciones basadas en los resultados
   */
  generateRecommendations() {
    const recommendations = [];
    const { load, stress, memory } = this.results.summary;

    // Recomendaciones de RPS
    if (load && load.averageRPS < 100) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'RPS bajo detectado. Considera optimizar el código o agregar caching.',
      });
    }

    // Recomendaciones de latencia
    if (load && load.averageLatency > 200) {
      recommendations.push({
        type: 'latency',
        priority: 'medium',
        message:
          'Latencia alta detectada. Revisa queries de base de datos y operaciones síncronas.',
      });
    }

    // Recomendaciones de errores
    if (load && load.totalErrors > 0) {
      recommendations.push({
        type: 'reliability',
        priority: 'critical',
        message: `${load.totalErrors} errores detectados durante las pruebas. Revisa logs del servidor.`,
      });
    }

    // Recomendaciones de memoria
    if (memory && memory.averageHeapUsed > 100 * 1024 * 1024) {
      // 100MB
      recommendations.push({
        type: 'memory',
        priority: 'medium',
        message: 'Uso de memoria alto. Considera implementar garbage collection más agresivo.',
      });
    }

    // Recomendaciones de estrés
    if (stress && stress.errors > 0) {
      recommendations.push({
        type: 'scaling',
        priority: 'high',
        message:
          'Errores bajo estrés. La aplicación puede necesitar optimización para cargas altas.',
      });
    }

    this.results.recommendations = recommendations;
  }

  /**
   * Guarda el reporte en archivo JSON
   */
  async saveReport() {
    // Agregar información del sistema al reporte
    this.results.system = getSystemInfo();

    const reportPath = path.join(config.outputDir, config.reportFile);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    colorLog(`\n💾 Reporte guardado en: ${reportPath}`, 'blue');
    colorLog(`  📋 Incluye información del sistema: ${OS_INFO.platform}`, 'blue');
  }

  /**
   * Muestra resumen de resultados
   */
  displaySummary() {
    colorLog('\n📈 ======================================', 'cyan');
    colorLog('📊 RESUMEN DE RENDIMIENTO', 'bright');
    colorLog('📈 ======================================', 'cyan');

    const { load, stress, memory } = this.results.summary;

    if (load) {
      colorLog('\n⚡ PRUEBAS DE CARGA:', 'yellow');
      colorLog(`  📊 RPS Promedio: ${load.averageRPS.toFixed(2)}`, 'green');
      colorLog(`  ⏱️  Latencia Promedio: ${load.averageLatency.toFixed(2)}ms`, 'green');
      colorLog(`  ❌ Errores Totales: ${load.totalErrors}`, load.totalErrors > 0 ? 'red' : 'green');
    }

    if (stress) {
      colorLog('\n💪 PRUEBAS DE ESTRÉS:', 'yellow');
      colorLog(`  📊 RPS Bajo Estrés: ${stress.rps.toFixed(2)}`, 'green');
      colorLog(`  ⏱️  Latencia Bajo Estrés: ${stress.latency.toFixed(2)}ms`, 'green');
      colorLog(`  ❌ Errores: ${stress.errors}`, stress.errors > 0 ? 'red' : 'green');
    }

    if (memory) {
      colorLog('\n🧠 USO DE MEMORIA:', 'yellow');
      colorLog(
        `  📊 Heap Promedio: ${(memory.averageHeapUsed / 1024 / 1024).toFixed(2)} MB`,
        'green'
      );
      colorLog(`  📊 RSS Promedio: ${(memory.averageRSS / 1024 / 1024).toFixed(2)} MB`, 'green');
      colorLog(`  📊 Pico de Heap: ${(memory.peakHeapUsed / 1024 / 1024).toFixed(2)} MB`, 'green');
    }

    // Mostrar recomendaciones
    if (this.results.recommendations.length > 0) {
      colorLog('\n💡 RECOMENDACIONES:', 'yellow');
      this.results.recommendations.forEach((rec) => {
        const color =
          rec.priority === 'critical' ? 'red' : rec.priority === 'high' ? 'yellow' : 'blue';
        colorLog(`  ${this.getPriorityIcon(rec.priority)} ${rec.message}`, color);
      });
    } else {
      colorLog('\n✅ ¡Excelente! No se encontraron problemas de rendimiento.', 'green');
    }

    colorLog('\n📈 ======================================\n', 'cyan');
  }

  /**
   * Obtiene icono según prioridad
   */
  getPriorityIcon(priority) {
    switch (priority) {
      case 'critical':
        return '🚨';
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔵';
      default:
        return 'ℹ️';
    }
  }

  /**
   * Hace una request HTTP simple
   */
  async makeRequest(url) {
    const startTime = performance.now();

    try {
      // Intentar usar fetch nativo o importarlo dinámicamente
      let fetchFn;
      try {
        fetchFn = globalThis.fetch;
        if (!fetchFn) {
          const nodeFetch = await import('node-fetch');
          fetchFn = nodeFetch.default;
        }
      } catch {
        fetchFn = null;
      }

      if (fetchFn) {
        const response = await fetchFn(url, {
          method: 'GET',
        });

        const responseTime = performance.now() - startTime;
        return {
          statusCode: response.status,
          responseTime,
          method: 'fetch',
        };
      }
    } catch {
      // Fallback a comandos del sistema
    }

    // Fallback: usar comandos del sistema según la plataforma
    return new Promise((resolve, reject) => {
      const cmd = getHttpCommand(url, { timeout: 5000 });

      exec(cmd, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }

        const responseTime = performance.now() - startTime;
        const statusCode = parseInt(stdout.trim());

        resolve({
          statusCode,
          responseTime,
          method: OS_INFO.platform === 'win32' ? 'PowerShell' : 'curl',
          platform: OS_INFO.platform,
        });
      });
    });
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando Performance Test...');
  console.log(`📋 Sistema detectado: ${OS_INFO.type} ${OS_INFO.arch} (${OS_INFO.platform})`);
  console.log(`📋 Node.js: ${process.version}`);
  console.log(`📋 Memoria total: ${Math.round(getSystemInfo().memory / 1024 / 1024 / 1024)} GB`);
  console.log(`📋 CPUs: ${getSystemInfo().cpus}`);

  const tester = new PerformanceTester();
  await tester.runAllTests();
}

// Ejecutar siempre
main().catch((error) => {
  console.error('❌ Error en script de rendimiento:', error);
  process.exit(1);
});

export default PerformanceTester;
