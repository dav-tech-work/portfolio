#!/usr/bin/env node

/**
 * Script de Monitoreo y Salud Rápido
 * @description Versión ligera para verificaciones rápidas de salud del sistema
 * @author Daniel Arribas Velázquez
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
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
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuración
const config = {
  baseUrl: process.env.HEALTH_CHECK_URL || 'http://localhost:3000',
  criticalFiles: [
    'app.mjs',
    'package.json',
    'config.env',
    'src/config/index.mjs',
    'views/layout.ejs',
  ],
};

/**
 * VERIFICACIÓN RÁPIDA DE SALUD DE LA APLICACIÓN
 */
async function checkApplicationHealthQuick() {
  colorLog('\n🚀 VERIFICACIÓN RÁPIDA DE SALUD DE LA APLICACIÓN', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar conectividad básica
  colorLog('\n🌐 Verificando conectividad básica:', 'blue');
  try {
    const response = await fetch(`${config.baseUrl}/health`);
    if (response.ok) {
      colorLog('✅ Aplicación disponible', 'green');
    } else {
      colorLog(`❌ Aplicación no disponible (Status: ${response.status})`, 'red');
      allChecksPassed = false;
    }
  } catch (error) {
    colorLog(`❌ Error conectando a la aplicación: ${error.message}`, 'red');
    allChecksPassed = false;
  }

  // Verificar endpoint principal
  colorLog('\n🏠 Verificando endpoint principal:', 'blue');
  try {
    const response = await fetch(`${config.baseUrl}/`);
    if (response.ok) {
      colorLog('✅ Página principal disponible', 'green');
    } else {
      colorLog(`❌ Página principal no disponible (Status: ${response.status})`, 'red');
      allChecksPassed = false;
    }
  } catch (error) {
    colorLog(`❌ Error en página principal: ${error.message}`, 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE MÉTRICAS DEL SISTEMA
 */
async function checkSystemMetricsQuick() {
  colorLog('\n💻 VERIFICACIÓN RÁPIDA DE MÉTRICAS DEL SISTEMA', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar memoria del sistema
  colorLog('\n📊 Verificando memoria del sistema:', 'blue');
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const memoryUsage = (totalMemory - freeMemory) / totalMemory;

  colorLog(`📊 Memoria: ${(memoryUsage * 100).toFixed(1)}% usada`, memoryUsage > 0.8 ? 'red' : 'green');
  colorLog(`🔧 CPU: ${os.cpus().length} núcleos`, 'blue');
  colorLog(`⏱️ Uptime del sistema: ${Math.floor(os.uptime() / 3600)} horas`, 'blue');

  if (memoryUsage > 0.8) {
    colorLog('⚠️ Uso de memoria alto', 'yellow');
    allChecksPassed = false;
  }

  // Verificar memoria de la aplicación
  colorLog('\n🧠 Verificando memoria de la aplicación:', 'blue');
  const memUsage = process.memoryUsage();
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
  const heapTotalMB = memUsage.heapTotal / 1024 / 1024;

  colorLog(`🧠 Heap: ${heapUsedMB.toFixed(2)} MB / ${heapTotalMB.toFixed(2)} MB`, heapUsedMB > 100 ? 'red' : 'green');
  colorLog(`📊 RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`, 'blue');

  if (heapUsedMB > 100) {
    colorLog('⚠️ Uso de heap alto', 'yellow');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE ARCHIVOS CRÍTICOS
 */
async function checkCriticalFilesQuick() {
  colorLog('\n📁 VERIFICACIÓN RÁPIDA DE ARCHIVOS CRÍTICOS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  colorLog('\n📁 Verificando archivos críticos:', 'blue');
  for (const file of config.criticalFiles) {
    const filePath = path.join(__dirname, '../../', file);
    const exists = fs.existsSync(filePath);

    if (exists) {
      const size = fs.statSync(filePath).size;
      colorLog(`✅ ${file} encontrado (${(size / 1024).toFixed(2)} KB)`, 'green');

      if (size === 0) {
        colorLog(`⚠️ ${file} está vacío`, 'yellow');
        allChecksPassed = false;
      }
    } else {
      colorLog(`❌ ${file} no encontrado`, 'red');
      allChecksPassed = false;
    }
  }

  // Verificar directorio de logs
  colorLog('\n📝 Verificando directorio de logs:', 'blue');
  const logsDir = path.join(__dirname, '../../logs');
  if (fs.existsSync(logsDir)) {
    colorLog('✅ Directorio de logs encontrado', 'green');
  } else {
    colorLog('⚠️ Directorio de logs no encontrado', 'yellow');
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE PROCESOS Y SERVICIOS
 */
async function checkProcessesAndServicesQuick() {
  colorLog('\n⚙️ VERIFICACIÓN RÁPIDA DE PROCESOS Y SERVICIOS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Información del proceso actual
  colorLog('\n⚙️ Información del proceso:', 'blue');
  const uptime = process.uptime();
  colorLog(`⚙️ PID: ${process.pid}`, 'blue');
  colorLog(`⏱️ Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`, 'green');

  // Verificar servicios básicos
  colorLog('\n🔍 Verificando servicios básicos:', 'blue');

  const services = [
    { name: 'Node.js', command: 'node --version' },
    { name: 'npm', command: 'npm --version' },
  ];

  for (const service of services) {
    try {
      const { stdout } = await execAsync(service.command);
      colorLog(`✅ ${service.name}: ${stdout.trim()}`, 'green');
    } catch (error) {
      colorLog(`❌ ${service.name}: No disponible`, 'red');
      allChecksPassed = false;
    }
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE CONFIGURACIÓN
 */
async function checkConfigurationQuick() {
  colorLog('\n⚙️ VERIFICACIÓN RÁPIDA DE CONFIGURACIÓN', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar archivos de configuración
  colorLog('\n📁 Verificando archivos de configuración:', 'blue');

  const configFiles = [
    'config.env',
    'package.json',
    'package-lock.json',
    'node_modules/',
  ];

  for (const file of configFiles) {
    const filePath = path.join(__dirname, '../../', file);
    if (fs.existsSync(filePath)) {
      colorLog(`✅ ${file} encontrado`, 'green');
    } else {
      colorLog(`❌ ${file} no encontrado`, 'red');
      allChecksPassed = false;
    }
  }

  // Verificar estructura de directorios
  colorLog('\n📂 Verificando estructura de directorios:', 'blue');
  const directories = [
    'src/',
    'public/',
    'views/',
    'test/',
    'scripts/',
  ];

  for (const dir of directories) {
    const dirPath = path.join(__dirname, '../../', dir);
    if (fs.existsSync(dirPath)) {
      colorLog(`✅ ${dir} encontrado`, 'green');
    } else {
      colorLog(`❌ ${dir} no encontrado`, 'red');
      allChecksPassed = false;
    }
  }

  return allChecksPassed;
}

/**
 * EJECUCIÓN COMPLETA DEL MONITOREO RÁPIDO
 */
async function runQuickMonitoring() {
  const startTime = Date.now();

  colorLog('\n⚡ MONITOREO Y SALUD RÁPIDO INICIADO', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Verificación rápida de salud de la aplicación
  const appHealthOK = await checkApplicationHealthQuick();

  // 2. Verificación rápida de métricas del sistema
  const systemMetricsOK = await checkSystemMetricsQuick();

  // 3. Verificación rápida de archivos críticos
  const criticalFilesOK = await checkCriticalFilesQuick();

  // 4. Verificación rápida de procesos y servicios
  const processesOK = await checkProcessesAndServicesQuick();

  // 5. Verificación rápida de configuración
  const configOK = await checkConfigurationQuick();

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('\n📊 RESUMEN MONITOREO RÁPIDO', 'bright');
  colorLog('='.repeat(60), 'bright');
  colorLog(`🚀 Aplicación: ${appHealthOK ? '✅ OK' : '❌ Problemas'}`, appHealthOK ? 'green' : 'red');
  colorLog(`💻 Sistema: ${systemMetricsOK ? '✅ OK' : '❌ Problemas'}`, systemMetricsOK ? 'green' : 'red');
  colorLog(`📁 Archivos: ${criticalFilesOK ? '✅ OK' : '❌ Problemas'}`, criticalFilesOK ? 'green' : 'red');
  colorLog(`⚙️ Procesos: ${processesOK ? '✅ OK' : '❌ Problemas'}`, processesOK ? 'green' : 'red');
  colorLog(`⚙️ Configuración: ${configOK ? '✅ OK' : '❌ Problemas'}`, configOK ? 'green' : 'red');
  colorLog(`⏱️ Tiempo total: ${totalTime} segundos`, 'cyan');

  const allOK = appHealthOK && systemMetricsOK && criticalFilesOK && processesOK && configOK;
  colorLog(`\n🎯 Estado general: ${allOK ? '✅ SISTEMA SALUDABLE' : '❌ PROBLEMAS DE SALUD DETECTADOS'}`, allOK ? 'green' : 'red');

  colorLog('\n✅ MONITOREO Y SALUD RÁPIDO COMPLETADO', 'bright');
  colorLog('💡 Para verificación completa, ejecuta: node "scripts/Monitoreo&Salud/monitoring-complete.mjs"', 'blue');
}

// Ejecutar si se llama directamente
runQuickMonitoring().catch(console.error);
