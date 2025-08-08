#!/usr/bin/env node

/**
 * Script para Forzar Menú Hamburguesa
 * @description Fuerza que el menú hamburguesa sea visible en todas las pantallas para pruebas
 * @author Daniel Arribas Velázquez
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
  magenta: '\x1b[35m',
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuración
const config = {
  projectRoot: path.join(__dirname, '../..'),
  cssFile: path.join(__dirname, '../../data/public/assets/css/global/base.css'),
  backupFile: path.join(__dirname, '../../data/public/assets/css/global/base.css.hamburger-test-backup'),
};

/**
 * Crear backup del archivo CSS
 */
function createBackup() {
  try {
    if (fs.existsSync(config.cssFile)) {
      fs.copyFileSync(config.cssFile, config.backupFile);
      colorLog('✅ Backup creado del archivo CSS', 'green');
      return true;
    } else {
      colorLog('❌ Archivo CSS no encontrado', 'red');
      return false;
    }
  } catch (error) {
    colorLog(`❌ Error creando backup: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Restaurar backup del archivo CSS
 */
function restoreBackup() {
  try {
    if (fs.existsSync(config.backupFile)) {
      fs.copyFileSync(config.backupFile, config.cssFile);
      colorLog('✅ Backup restaurado del archivo CSS', 'green');
      return true;
    } else {
      colorLog('❌ Archivo de backup no encontrado', 'red');
      return false;
    }
  } catch (error) {
    colorLog(`❌ Error restaurando backup: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Forzar menú hamburguesa visible
 */
function forceHamburgerVisible() {
  try {
    if (!fs.existsSync(config.cssFile)) {
      colorLog('❌ Archivo CSS no encontrado', 'red');
      return false;
    }

    let cssContent = fs.readFileSync(config.cssFile, 'utf8');

    // Agregar reglas CSS para forzar menú hamburguesa visible
    const forceHamburgerCSS = `

/* ===== FORZAR MENÚ HAMBURGUESA VISIBLE (SOLO PARA PRUEBAS) ===== */
/* ESTAS REGLAS FUERZAN QUE EL MENÚ HAMBURGUESA SEA VISIBLE EN TODAS LAS PANTALLAS */

/* Forzar menú hamburguesa visible en TODAS las pantallas */
.menu-toggle {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    background: none !important;
    border: none !important;
    color: var(--text-primary) !important;
    font-size: clamp(1.05rem, 4.5vw, 1.5rem) !important;
    cursor: pointer !important;
    padding: 0.5rem !important;
    margin-right: 1rem !important;
    width: 40px !important;
    height: 40px !important;
    min-width: 40px !important;
    min-height: 40px !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
    z-index: 1001 !important;
}

/* Ocultar menú horizontal en TODAS las pantallas */
.menu-items {
    display: none !important;
    position: absolute !important;
    top: 100% !important;
    left: 0 !important;
    width: 100% !important;
    max-width: min(100% - 1rem, 300px) !important;
    background: var(--bg-secondary, #1a1a1a) !important;
    border: 1px solid var(--border-color, rgba(255,255,255,0.1)) !important;
    border-radius: 0 0 12px 12px !important;
    box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important;
    z-index: 1000 !important;
    padding: 1rem 0 !important;
    backdrop-filter: blur(10px) !important;
}

/* Mostrar menú cuando está activo */
body .nav-container .nav-left .menu-items.active {
    display: block !important;
    animation: slideDown 0.3s ease-out !important;
    backdrop-filter: blur(10px) !important;
    background: var(--bg-secondary, #1a1a1a) !important;
    border: 1px solid var(--border-color, rgba(255,255,255,0.1)) !important;
    border-radius: 0 0 12px 12px !important;
    box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important;
    position: absolute !important;
    top: 100% !important;
    left: 0 !important;
    width: 100% !important;
    max-width: min(100% - 1rem, 300px) !important;
    z-index: 1000 !important;
    padding: 1rem 0 !important;
}

/* Estilos para elementos del menú */
.menu-items li {
    list-style: none !important;
    margin: 0 !important;
    padding: 0 !important;
}

.menu-items a {
    display: block !important;
    padding: 1.2rem 1.8rem !important;
    color: var(--text-primary, #ffffff) !important;
    text-decoration: none !important;
    font-weight: 600 !important;
    font-size: clamp(0.77rem, 3.3vw, 1.1rem) !important;
    transition: all 0.3s ease !important;
}

.menu-items a:hover {
    background: var(--accent-color) !important;
    color: white !important;
}

/* Estilos para el botón hamburguesa */
.menu-toggle:hover {
    color: var(--accent-color) !important;
}

.menu-toggle:focus {
    outline: 2px solid var(--accent-color) !important;
    outline-offset: 2px !important;
}

.menu-toggle[aria-expanded="true"] {
    background: var(--accent-color) !important;
    color: white !important;
}

/* ===== FIN DE REGLAS DE PRUEBA ===== */
`;

    // Agregar las reglas al final del archivo CSS
    cssContent += forceHamburgerCSS;

    // Escribir el archivo modificado
    fs.writeFileSync(config.cssFile, cssContent, 'utf8');
    colorLog('✅ Reglas CSS agregadas para forzar menú hamburguesa visible', 'green');
    return true;

  } catch (error) {
    colorLog(`❌ Error modificando CSS: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Función principal
 */
function main() {
  const action = process.argv[2];

  colorLog('\n🍔 ===== GESTOR DE MENÚ HAMBURGUESA =====', 'cyan');

  switch (action) {
    case 'force':
      colorLog('\n🔧 Forzando menú hamburguesa visible...', 'yellow');
      if (createBackup()) {
        if (forceHamburgerVisible()) {
          colorLog('\n✅ Menú hamburguesa forzado visible', 'green');
          colorLog('📋 Instrucciones:', 'cyan');
          colorLog('1. Ejecuta: npm run minify-assets', 'yellow');
          colorLog('2. Recarga la página en el navegador', 'yellow');
          colorLog('3. El menú hamburguesa debería aparecer en todas las pantallas', 'yellow');
          colorLog('4. Para restaurar: npm run hamburger:restore', 'yellow');
        }
      }
      break;

    case 'restore':
      colorLog('\n🔄 Restaurando configuración original...', 'yellow');
      if (restoreBackup()) {
        colorLog('\n✅ Configuración original restaurada', 'green');
        colorLog('📋 Instrucciones:', 'cyan');
        colorLog('1. Ejecuta: npm run minify-assets', 'yellow');
        colorLog('2. Recarga la página en el navegador', 'yellow');
        colorLog('3. El menú hamburguesa volverá a su comportamiento normal', 'yellow');
      }
      break;

    default:
      colorLog('\n📋 Uso del script:', 'cyan');
      colorLog('npm run hamburger:force  - Forzar menú hamburguesa visible', 'yellow');
      colorLog('npm run hamburger:restore - Restaurar configuración original', 'yellow');
      break;
  }
}

main();
