#!/usr/bin/env node

/**
 * Script para verificar y generar archivo de lock de dependencias
 * Utilizado en workflows de GitHub Actions
 */

import fs from 'fs';
import { execSync } from 'child_process';

const lockFiles = ['package-lock.json', 'npm-shrinkwrap.json', 'yarn.lock'];

function checkLockFile() {
  console.log('🔍 Verificando archivo de lock de dependencias...');

  // Verificar si existe algún archivo de lock
  const existingLockFile = lockFiles.find((file) => fs.existsSync(file));

  if (existingLockFile) {
    console.log(`✅ Archivo de lock encontrado: ${existingLockFile}`);
    return true;
  }

  console.log('❌ No se encontró archivo de lock de dependencias');
  console.log('📦 Generando package-lock.json...');

  try {
    // Generar package-lock.json
    execSync('npm install', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    if (fs.existsSync('package-lock.json')) {
      console.log('✅ package-lock.json generado exitosamente');
      return true;
    } else {
      console.log('❌ Error: No se pudo generar package-lock.json');
      return false;
    }
  } catch (error) {
    console.error('❌ Error durante la generación del archivo de lock:', error.message);
    return false;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = checkLockFile();
  process.exit(success ? 0 : 1);
}

export { checkLockFile };
