#!/usr/bin/env node

/**
 * Script para generar configuración de tests
 * @description Genera archivos de configuración para diferentes tipos de tests
 * @author Daniel Arribas Velazquez
 * @version 1.0.0
 */

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
  cyan: '\x1b[36m',
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Generar configuración de test
 */
function generateTestConfig() {
  colorLog('\n🧪 GENERANDO CONFIGURACIÓN DE TESTS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  const testConfig = {
    unit: {
      timeout: 10000,
      files: ['test/unit/**/*.test.mjs'],
      environment: 'node'
    },
    integration: {
      timeout: 15000,
      files: ['test/integration/**/*.test.mjs'],
      environment: 'node'
    },
    security: {
      timeout: 20000,
      files: ['test/security/**/*.test.mjs'],
      environment: 'node'
    },
    performance: {
      timeout: 60000,
      files: ['test/performance/**/*.test.mjs'],
      environment: 'node'
    },
    e2e: {
      timeout: 30000,
      files: ['test/e2e/**/*.test.mjs'],
      environment: 'node'
    }
  };

  // Guardar configuración
  const outputPath = path.join(__dirname, '../../test/test-config.json');
  fs.writeFileSync(outputPath, JSON.stringify(testConfig, null, 2));

  colorLog(`✅ Configuración de tests guardada en: ${outputPath}`, 'green');

  // Crear archivo de configuración para Mocha
  const mochaConfig = {
    require: ['dotenv/config'],
    timeout: 15000,
    exit: true,
    recursive: true,
    extension: ['mjs'],
    spec: ['test/**/*.test.mjs']
  };

  const mochaConfigPath = path.join(__dirname, '../../.mocharc.json');
  fs.writeFileSync(mochaConfigPath, JSON.stringify(mochaConfig, null, 2));

  colorLog(`✅ Configuración de Mocha guardada en: ${mochaConfigPath}`, 'green');

  return { testConfig, mochaConfig };
}

/**
 * Verificar estructura de directorios de test
 */
function verifyTestStructure() {
  colorLog('\n📁 Verificando estructura de directorios de test:', 'blue');

  const testDirs = [
    'test/unit',
    'test/integration',
    'test/security',
    'test/performance',
    'test/e2e',
    'test/utils'
  ];

  testDirs.forEach(dir => {
    const dirPath = path.join(__dirname, '../../', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      colorLog(`📁 Creado directorio: ${dir}`, 'yellow');
    } else {
      colorLog(`✅ Directorio existente: ${dir}`, 'green');
    }
  });
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyTestStructure();
  generateTestConfig();
}

export { generateTestConfig, verifyTestStructure };
