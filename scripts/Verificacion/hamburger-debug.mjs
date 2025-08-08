#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const size = stats.size;
      colorLog(`✅ ${description}: ${filePath} (${size} bytes)`, 'green');
      return true;
    } else {
      colorLog(`❌ ${description}: ${filePath} - NO ENCONTRADO`, 'red');
      return false;
    }
  } catch (error) {
    colorLog(`❌ ${description}: ${filePath} - ERROR: ${error.message}`, 'red');
    return false;
  }
}

function checkFileContent(filePath, searchText, description) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(searchText)) {
        colorLog(`✅ ${description}: Encontrado "${searchText}"`, 'green');
        return true;
      } else {
        colorLog(`❌ ${description}: NO encontrado "${searchText}"`, 'red');
        return false;
      }
    } else {
      colorLog(`❌ ${description}: Archivo no existe`, 'red');
      return false;
    }
  } catch (error) {
    colorLog(`❌ ${description}: Error leyendo archivo - ${error.message}`, 'red');
    return false;
  }
}

function main() {
  colorLog('\n🔍 ===== DIAGNÓSTICO DEL MENÚ HAMBURGUESA =====', 'cyan');
  
  const projectRoot = path.resolve(__dirname, '../../');
  
  // Verificar archivos CSS
  colorLog('\n📁 Verificando archivos CSS:', 'yellow');
  checkFile(path.join(projectRoot, 'data/public/assets/css/global/base.css'), 'CSS Base');
  checkFile(path.join(projectRoot, 'public/assets/css/global/base.min.css'), 'CSS Base Minificado');
  
  // Verificar archivos JavaScript
  colorLog('\n📁 Verificando archivos JavaScript:', 'yellow');
  checkFile(path.join(projectRoot, 'data/public/assets/js/navegacion/navegacion.js'), 'JS Navegación');
  checkFile(path.join(projectRoot, 'public/assets/js/navegacion/navegacion.min.js'), 'JS Navegación Minificado');
  checkFile(path.join(projectRoot, 'data/public/assets/js/index.js'), 'JS Index');
  
  // Verificar contenido específico
  colorLog('\n🔍 Verificando contenido específico:', 'yellow');
  checkFileContent(
    path.join(projectRoot, 'data/public/assets/js/index.js'),
    'initNavegacion',
    'Importación de initNavegacion en index.js'
  );
  
  checkFileContent(
    path.join(projectRoot, 'data/public/assets/js/index.js'),
    'initNavegacion()',
    'Llamada a initNavegacion en index.js'
  );
  
  checkFileContent(
    path.join(projectRoot, 'views/templates/header.ejs'),
    'menu-toggle',
    'Botón menu-toggle en header.ejs'
  );
  
  checkFileContent(
    path.join(projectRoot, 'views/templates/header.ejs'),
    'menu-items',
    'Contenedor menu-items en header.ejs'
  );
  
  checkFileContent(
    path.join(projectRoot, 'data/public/assets/css/global/base.css'),
    '.menu-toggle',
    'Estilos .menu-toggle en base.css'
  );
  
  checkFileContent(
    path.join(projectRoot, 'data/public/assets/css/global/base.css'),
    'display: flex',
    'Regla display: flex para menú hamburguesa'
  );
  
  // Verificar breakpoints
  colorLog('\n📱 Verificando breakpoints:', 'yellow');
  checkFileContent(
    path.join(projectRoot, 'data/public/assets/css/global/base.css'),
    '@media (max-width: min(100% - 1rem, 1470px))',
    'Breakpoint 1470px para menú hamburguesa'
  );
  
  checkFileContent(
    path.join(projectRoot, 'data/public/assets/css/global/base.css'),
    'display: flex !important',
    'Forzar display flex en menú hamburguesa'
  );
  
  // Verificar que el servidor esté ejecutándose
  colorLog('\n🌐 Verificando servidor:', 'yellow');
  try {
    const { execSync } = require('child_process');
    const result = execSync('netstat -ano | findstr :3000', { encoding: 'utf8' });
    if (result.trim()) {
      colorLog('✅ Servidor ejecutándose en puerto 3000', 'green');
    } else {
      colorLog('❌ Servidor NO ejecutándose en puerto 3000', 'red');
    }
  } catch (error) {
    colorLog('❌ Error verificando servidor', 'red');
  }
  
  colorLog('\n📋 Resumen de diagnóstico:', 'cyan');
  colorLog('1. Verifica que el servidor esté ejecutándose', 'yellow');
  colorLog('2. Abre http://localhost:3000 en el navegador', 'yellow');
  colorLog('3. Redimensiona la ventana a menos de 1470px de ancho', 'yellow');
  colorLog('4. El menú hamburguesa debería aparecer en la esquina superior izquierda', 'yellow');
  colorLog('5. Si no aparece, abre las herramientas de desarrollador (F12)', 'yellow');
  colorLog('6. Verifica en la consola si hay errores JavaScript', 'yellow');
  colorLog('7. Verifica en la pestaña Network si se cargan los archivos CSS y JS', 'yellow');
  
  colorLog('\n🔧 Posibles soluciones:', 'cyan');
  colorLog('• Ejecuta: npm run minify-css', 'yellow');
  colorLog('• Ejecuta: npm run minify-js', 'yellow');
  colorLog('• Limpia la caché del navegador (Ctrl+F5)', 'yellow');
  colorLog('• Verifica que no haya errores en la consola del navegador', 'yellow');
}

main();
