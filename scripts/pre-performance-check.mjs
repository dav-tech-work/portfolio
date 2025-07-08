#!/usr/bin/env node

/**
 * Script de Verificación Previa a Tests de Rendimiento
 * @description Verifica que el entorno esté listo para ejecutar tests de rendimiento
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Verificación previa para tests de rendimiento
 */
class PrePerformanceCheck {
  constructor() {
    this.checks = [];
    this.warnings = [];
    this.errors = [];
  }

  /**
   * Ejecuta todas las verificaciones
   */
  async runAllChecks() {
    colorLog('\n🔍 ======================================', 'cyan');
    colorLog('🛠️  Verificación Previa - Tests de Rendimiento', 'bright');
    colorLog('🔍 ======================================', 'cyan');

    await this.checkSystemInfo();
    await this.checkNodejs();
    await this.checkDependencies();
    await this.checkProjectStructure();
    await this.checkEnvironmentConfig();
    await this.checkNetworkTools();
    await this.checkPort();

    this.displaySummary();

    if (this.errors.length > 0) {
      colorLog('\n❌ Hay errores que deben solucionarse antes de ejecutar los tests.', 'red');
      process.exit(1);
    } else if (this.warnings.length > 0) {
      colorLog('\n⚠️  Hay advertencias, pero los tests pueden ejecutarse.', 'yellow');
    } else {
      colorLog('\n✅ Todo está listo para ejecutar los tests de rendimiento!', 'green');
    }
  }

  /**
   * Verifica información del sistema
   */
  async checkSystemInfo() {
    colorLog('\n📋 Información del Sistema:', 'yellow');

    const platform = os.platform();
    const arch = os.arch();
    const type = os.type();
    const totalMem = Math.round(os.totalmem() / 1024 / 1024 / 1024);
    const freeMem = Math.round(os.freemem() / 1024 / 1024 / 1024);
    const cpus = os.cpus().length;

    colorLog(`  🖥️  SO: ${type} ${arch} (${platform})`, 'blue');
    colorLog(`  💾 Memoria: ${totalMem} GB total, ${freeMem} GB libre`, 'blue');
    colorLog(`  🔧 CPUs: ${cpus}`, 'blue');
    colorLog(`  🟢 Node.js: ${process.version}`, 'blue');

    // Verificar memoria mínima
    if (freeMem < 1) {
      this.errors.push('Memoria libre insuficiente (< 1GB)');
    } else if (freeMem < 2) {
      this.warnings.push('Poca memoria libre disponible (< 2GB)');
    }

    this.checks.push('✅ Información del sistema verificada');
  }

  /**
   * Verifica versión de Node.js
   */
  async checkNodejs() {
    colorLog('\n🟢 Node.js:', 'yellow');

    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);

    colorLog(`  📝 Versión: ${nodeVersion}`, 'blue');

    if (majorVersion < 16) {
      this.errors.push(`Node.js versión muy antigua (${nodeVersion}). Se requiere >= 16.0.0`);
    } else if (majorVersion < 18) {
      this.warnings.push(`Node.js versión antigua (${nodeVersion}). Se recomienda >= 18.0.0`);
    }

    this.checks.push('✅ Versión de Node.js verificada');
  }

  /**
   * Verifica dependencias del proyecto
   */
  async checkDependencies() {
    colorLog('\n📦 Dependencias:', 'yellow');

    const projectRoot = path.join(__dirname, '..');
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const nodeModulesPath = path.join(projectRoot, 'node_modules');

    // Verificar package.json
    if (!fs.existsSync(packageJsonPath)) {
      this.errors.push('No se encuentra package.json');
      return;
    }

    // Verificar node_modules
    if (!fs.existsSync(nodeModulesPath)) {
      this.errors.push('No se encuentra la carpeta node_modules. Ejecuta: npm install');
      return;
    }

    // Verificar dependencias críticas
    const criticalDeps = ['express', 'autocannon'];

    for (const dep of criticalDeps) {
      const depPath = path.join(nodeModulesPath, dep);
      if (!fs.existsSync(depPath)) {
        this.errors.push(`Dependencia faltante: ${dep}`);
      } else {
        colorLog(`  ✅ ${dep}`, 'green');
      }
    }

    this.checks.push('✅ Dependencias verificadas');
  }

  /**
   * Verifica estructura del proyecto
   */
  async checkProjectStructure() {
    colorLog('\n📁 Estructura del Proyecto:', 'yellow');

    const projectRoot = path.join(__dirname, '..');
    const criticalFiles = ['app.mjs', 'package.json', 'src/config/environment.mjs'];

    for (const file of criticalFiles) {
      const filePath = path.join(projectRoot, file);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Archivo faltante: ${file}`);
      } else {
        colorLog(`  ✅ ${file}`, 'green');
      }
    }

    this.checks.push('✅ Estructura del proyecto verificada');
  }

  /**
   * Verifica configuración del entorno
   */
  async checkEnvironmentConfig() {
    colorLog('\n🔧 Configuración del Entorno:', 'yellow');

    const projectRoot = path.join(__dirname, '..');
    const configFiles = ['config.env', 'config.env.example'];

    // Verificar archivos de configuración
    for (const file of configFiles) {
      const filePath = path.join(projectRoot, file);
      if (fs.existsSync(filePath)) {
        colorLog(`  ✅ ${file}`, 'green');
      } else {
        if (file === 'config.env') {
          this.warnings.push(`Archivo de configuración faltante: ${file}`);
        }
      }
    }

    // Verificar que config.env tenga las variables mínimas requeridas
    const configPath = path.join(projectRoot, 'config.env');
    if (fs.existsSync(configPath)) {
      try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const requiredVars = ['NODE_ENV', 'SESSION_SECRET', 'JWT_SECRET', 'BCRYPT_ROUNDS'];
        const missingVars = [];

        requiredVars.forEach((varName) => {
          if (!configContent.includes(`${varName}=`)) {
            missingVars.push(varName);
          }
        });

        if (missingVars.length > 0) {
          this.errors.push(`Variables faltantes en config.env: ${missingVars.join(', ')}`);
        } else {
          colorLog('  ✅ Variables de entorno requeridas configuradas', 'green');
        }
      } catch {
        this.warnings.push(`Error leyendo config.env`);
      }
    }

    this.checks.push('✅ Configuración del entorno verificada');
  }

  /**
   * Verifica herramientas de red disponibles
   */
  async checkNetworkTools() {
    colorLog('\n🌐 Herramientas de Red:', 'yellow');

    const platform = os.platform();

    if (platform === 'win32') {
      // Verificar PowerShell en Windows
      try {
        await execAsync('powershell -Command "Get-Command Invoke-WebRequest"');
        colorLog('  ✅ PowerShell con Invoke-WebRequest disponible', 'green');
      } catch {
        this.errors.push('PowerShell no disponible o sin Invoke-WebRequest');
      }
    } else {
      // Verificar curl en Linux/macOS
      try {
        await execAsync('which curl');
        colorLog('  ✅ curl disponible', 'green');
      } catch {
        this.errors.push('curl no está instalado');
      }
    }

    this.checks.push('✅ Herramientas de red verificadas');
  }

  /**
   * Verifica que el puerto 3000 esté libre
   */
  async checkPort() {
    colorLog('\n🔌 Puerto 3000:', 'yellow');

    try {
      const platform = os.platform();
      let cmd;

      if (platform === 'win32') {
        cmd = 'netstat -an | findstr :3000';
      } else {
        cmd = 'netstat -ln | grep :3000 || lsof -i :3000';
      }

      const { stdout } = await execAsync(cmd);

      if (stdout.trim()) {
        this.warnings.push(
          'Puerto 3000 parece estar en uso. El test intentará usar el servidor existente.'
        );
        colorLog('  ⚠️  Puerto 3000 en uso', 'yellow');
      } else {
        colorLog('  ✅ Puerto 3000 disponible', 'green');
      }
    } catch {
      // No hay salida = puerto libre
      colorLog('  ✅ Puerto 3000 disponible', 'green');
    }

    this.checks.push('✅ Puerto verificado');
  }

  /**
   * Muestra resumen de verificaciones
   */
  displaySummary() {
    colorLog('\n📊 ======================================', 'cyan');
    colorLog('📋 RESUMEN DE VERIFICACIONES', 'bright');
    colorLog('📊 ======================================', 'cyan');

    colorLog('\n✅ Verificaciones completadas:', 'green');
    this.checks.forEach((check) => {
      colorLog(`  ${check}`, 'green');
    });

    if (this.warnings.length > 0) {
      colorLog('\n⚠️  Advertencias:', 'yellow');
      this.warnings.forEach((warning) => {
        colorLog(`  ⚠️  ${warning}`, 'yellow');
      });
    }

    if (this.errors.length > 0) {
      colorLog('\n❌ Errores:', 'red');
      this.errors.forEach((error) => {
        colorLog(`  ❌ ${error}`, 'red');
      });
    }
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando verificación previa de performance...');
  const checker = new PrePerformanceCheck();
  await checker.runAllChecks();
}

// Ejecutar siempre
main().catch((error) => {
  console.error('❌ Error en verificación previa:', error);
  process.exit(1);
});

export default PrePerformanceCheck;
