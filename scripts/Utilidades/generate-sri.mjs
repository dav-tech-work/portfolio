#!/usr/bin/env node

/**
 * Script para generar SRI (Subresource Integrity) hashes
 * @description Genera hashes SHA-384 para archivos CSS y JS
 * @author Daniel Arribas Velazquez
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

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
 * Generar hash SHA-384 para un archivo
 */
function generateHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha384').update(content).digest('base64');
    return `sha384-${hash}`;
  } catch (error) {
    colorLog(`❌ Error generando hash para ${filePath}: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Generar SRI hashes para archivos CSS y JS
 */
function generateSRIHashes() {
  colorLog('\n🔐 GENERANDO SRI HASHES', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  const publicDir = path.join(__dirname, '../../public/assets');
  const sriData = {};

  // Función recursiva para procesar directorios
  function processDirectory(dir, relativePath = '') {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        processDirectory(filePath, path.join(relativePath, file));
      } else if (file.endsWith('.min.css') || file.endsWith('.min.js')) {
        const relativeFilePath = path.join(relativePath, file);
        const hash = generateHash(filePath);

        if (hash) {
          sriData[relativeFilePath] = hash;
          colorLog(`✅ ${relativeFilePath}: ${hash}`, 'green');
        }
      }
    });
  }

  // Procesar archivos CSS y JS
  processDirectory(path.join(publicDir, 'css'));
  processDirectory(path.join(publicDir, 'js'));

  // Guardar en archivo JSON
  const outputPath = path.join(__dirname, '../../data/sri-hashes.json');
  fs.writeFileSync(outputPath, JSON.stringify(sriData, null, 2));

  colorLog(`\n📄 SRI hashes guardados en: ${outputPath}`, 'cyan');
  colorLog(`📊 Total de archivos procesados: ${Object.keys(sriData).length}`, 'blue');

  return sriData;
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSRIHashes();
}

export { generateSRIHashes };
