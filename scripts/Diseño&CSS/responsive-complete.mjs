#!/usr/bin/env node

/**
 * Script de Responsive Design Completo
 * @description Consolida todas las mejoras de responsive design y correcciones CSS
 * @author Daniel Arribas Velázquez
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postcss from 'postcss';
import cssnano from 'cssnano';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const config = {
  projectRoot: path.join(__dirname, '../..'),
  reportsDir: path.join(__dirname, '../../results/responsive-results'),
  reportFile: 'responsive-complete-report.json',
};

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

// Archivos CSS a procesar
const CSS_FILES = [
  'data/public/assets/css/global/base.css',
  'data/public/assets/css/secciones/home.css',
  'data/public/assets/css/secciones/about.css',
  'data/public/assets/css/secciones/proyectos.css',
  'data/public/assets/css/secciones/contacto.css',
  'data/public/assets/css/secciones/formacion.css',
  'data/public/assets/css/secciones/homelab.css',
  'data/public/assets/css/secciones/code.css',
];

// Variables CSS para responsividad mejorada
const RESPONSIVE_VARIABLES = `
/* ===== VARIABLES DE RESPONSIVIDAD MEJORADAS ===== */
:root {
    --responsive-padding: clamp(1rem, 3vw, 2rem);
    --responsive-margin: clamp(1rem, 3vw, 2rem);
    --responsive-gap: clamp(1rem, 2vw, 1.5rem);
    --responsive-border-radius: clamp(8px, 1.5vw, 15px);
    --responsive-font-size: clamp(0.85rem, 2.5vw, 1rem);
    --responsive-title-size: clamp(1.5rem, 4vw, 2.5rem);
    --responsive-hero-size: clamp(2rem, 8vw, 3.5rem);
    --grid-min-width: min(100%, 280px);
    --desktop-width: 1200px;
}
`;

// Mejoras específicas de responsividad
const RESPONSIVE_IMPROVEMENTS = {
  // 1. Mejorar grids con auto-fit
  'grid-template-columns: repeat\\(\\d+, 1fr\\)':
    'grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr))',

  // 2. Mejorar padding fijo con clamp
  'padding: (\\d+)rem (\\d+)rem': (match, p1, p2) =>
    `padding: clamp(${p1 * 0.5}rem, ${p1 * 2}vw, ${p1}rem) clamp(${p2 * 0.5}rem, ${p2 * 2}vw, ${p2}rem)`,

  // 3. Mejorar márgenes fijos
  'margin: (\\d+)rem (\\d+)rem': (match, p1, p2) =>
    `margin: clamp(${p1 * 0.5}rem, ${p1 * 2}vw, ${p1}rem) clamp(${p2 * 0.5}rem, ${p2 * 2}vw, ${p2}rem)`,

  // 4. Mejorar tamaños de fuente fijos
  'font-size: (\\d+\\.?\\d*)rem': (match, size) =>
    `font-size: clamp(${size * 0.7}rem, ${size * 3}vw, ${size}rem)`,

  // 5. Mejorar gaps fijos
  'gap: (\\d+)rem': (match, gap) => `gap: clamp(${gap * 0.5}rem, ${gap * 1.5}vw, ${gap}rem)`,

  // 6. Mejorar border-radius fijo
  'border-radius: (\\d+)px': (match, radius) =>
    `border-radius: clamp(${radius * 0.5}px, ${radius * 0.5}vw, ${radius}px)`,

  // 7. Mejorar container width
  'width: calc\\(100% - 1rem\\)': 'width: min(100% - 2rem, var(--desktop-width))',

  // 8. Mejorar max-width fijo
  'max-width: (\\d+)px': (match, width) => `max-width: min(100% - 1rem, ${width}px)`,
};

// Correcciones específicas para breakpoint 608px
const BREAKPOINT_608_FIXES = `
/* ===== ARREGLO ESPECÍFICO PARA BREAKPOINT 608px ===== */
/* Soluciona el problema del menú hamburguesa y header en 608px */

/* Asegurar que el menú hamburguesa sea visible en pantallas < 1470px */
@media (max-width: 1470px) {
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

    /* Ocultar menú horizontal en pantallas < 1470px */
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
}

/* Correcciones específicas para 608px */
@media (max-width: 608px) {
    .container {
        padding: 0 1rem !important;
        width: 100% !important;
    }

    .hero-title {
        font-size: clamp(1.5rem, 8vw, 2.5rem) !important;
        line-height: 1.2 !important;
    }

    .section-title {
        font-size: clamp(1.2rem, 6vw, 2rem) !important;
    }

    .badges-grid,
    .featured-grid,
    .tech-grid {
        grid-template-columns: 1fr !important;
        gap: 1rem !important;
    }
}
`;

// Mejoras específicas para grids y containers
const GRID_IMPROVEMENTS = `
/* ===== MEJORAS DE GRID FLUIDO ===== */
.badges-grid,
.featured-grid,
.tech-grid,
.enterprise-stats,
.proyecto-metrics,
.security-stack {
    display: grid;
    gap: var(--responsive-gap);
    grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-width), 1fr));
    width: 100%;
}

/* ===== MEJORAS DE CONTAINER FLUIDO ===== */
.container {
    width: min(100% - 2rem, var(--desktop-width));
    margin: 0 auto;
    padding: 0 var(--responsive-padding);
    max-width: 100%;
}

/* ===== MEJORAS DE TIPOGRAFÍA FLUIDA ===== */
.hero-title {
    font-size: var(--responsive-hero-size);
    line-height: 1.1;
}

h2 {
    font-size: var(--responsive-title-size);
    line-height: 1.2;
}

p {
    font-size: var(--responsive-font-size);
    line-height: 1.6;
}

/* ===== MEJORAS DE ESPACIADO FLUIDO ===== */
.section {
    padding: var(--responsive-padding);
    margin: var(--responsive-margin) 0;
}

.card {
    padding: var(--responsive-padding);
    border-radius: var(--responsive-border-radius);
    gap: var(--responsive-gap);
}
`;

/**
 * APLICAR MEJORAS DE RESPONSIVIDAD
 */
function applyResponsiveImprovements(content) {
  let modified = false;
  let newContent = content;

  // Aplicar mejoras de responsividad
  Object.entries(RESPONSIVE_IMPROVEMENTS).forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern, 'g');
    if (typeof replacement === 'function') {
      newContent = newContent.replace(regex, replacement);
    } else {
      newContent = newContent.replace(regex, replacement);
    }
    if (newContent !== content) {
      modified = true;
    }
  });

  return { content: newContent, modified };
}

/**
 * AGREGAR VARIABLES CSS
 */
function addCSSVariables(content) {
  if (!content.includes('--responsive-padding')) {
    return content + '\n' + RESPONSIVE_VARIABLES;
  }
  return content;
}

/**
 * AGREGAR CORRECCIONES DE BREAKPOINT
 */
function addBreakpointFixes(content) {
  if (!content.includes('BREAKPOINT 608px')) {
    return content + '\n' + BREAKPOINT_608_FIXES;
  }
  return content;
}

/**
 * AGREGAR MEJORAS DE GRID
 */
function addGridImprovements(content) {
  if (!content.includes('MEJORAS DE GRID FLUIDO')) {
    return content + '\n' + GRID_IMPROVEMENTS;
  }
  return content;
}

/**
 * PROCESAR ARCHIVO CSS
 */
function processCSSFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      colorLog(`⚠️  Archivo no encontrado: ${filePath}`, 'yellow');
      return false;
    }

    colorLog(`📝 Procesando: ${filePath}`, 'cyan');

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Agregar variables CSS
    const withVariables = addCSSVariables(content);
    if (withVariables !== content) {
      content = withVariables;
      modified = true;
    }

    // 2. Aplicar mejoras de responsividad
    const withImprovements = applyResponsiveImprovements(content);
    if (withImprovements.modified) {
      content = withImprovements.content;
      modified = true;
    }

    // 3. Agregar correcciones de breakpoint
    const withBreakpoints = addBreakpointFixes(content);
    if (withBreakpoints !== content) {
      content = withBreakpoints;
      modified = true;
    }

    // 4. Agregar mejoras de grid
    const withGrids = addGridImprovements(content);
    if (withGrids !== content) {
      content = withGrids;
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      colorLog(`✅ Mejorado: ${filePath}`, 'green');
      return true;
    } else {
      colorLog(`ℹ️  Sin cambios: ${filePath}`, 'blue');
      return false;
    }
  } catch (error) {
    colorLog(`❌ Error procesando ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * MINIFICAR CSS
 */
async function minifyCSS(inputPath, outputPath) {
  try {
    const css = fs.readFileSync(inputPath, 'utf8');
    const result = await postcss([cssnano]).process(css, { from: inputPath });

    // Crear directorio si no existe
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, result.css);

    const originalSize = (fs.statSync(inputPath).size / 1024).toFixed(1);
    const minifiedSize = (fs.statSync(outputPath).size / 1024).toFixed(1);
    const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

    colorLog(`✅ Minificado: ${path.relative('.', outputPath)}`, 'green');
    colorLog(`   📊 Reducción: ${reduction}%`, 'blue');

    return true;
  } catch (error) {
    colorLog(`❌ Error minificando ${inputPath}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * PROCESAR TODOS LOS ARCHIVOS CSS
 */
async function processAllCSSFiles() {
  colorLog('\n🎨 PROCESAMIENTO DE ARCHIVOS CSS', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  let processedCount = 0;
  let minifiedCount = 0;

  for (const cssFile of CSS_FILES) {
    if (fs.existsSync(cssFile)) {
      // Procesar archivo CSS
      const processed = processCSSFile(cssFile);
      if (processed) processedCount++;

      // Minificar archivo procesado
      const relativePath = path.relative('data/public/assets/css', cssFile);
      const outputPath = path.join('public/assets/css', relativePath.replace('.css', '.min.css'));

      const minified = await minifyCSS(cssFile, outputPath);
      if (minified) minifiedCount++;
    } else {
      colorLog(`⚠️  Archivo no encontrado: ${cssFile}`, 'yellow');
    }
  }

  colorLog(`\n🎉 Procesamiento completado: ${processedCount} archivos mejorados, ${minifiedCount} minificados`, 'green');
  return { processedCount, minifiedCount };
}

/**
 * VERIFICAR MEJORAS APLICADAS
 */
function verifyImprovements() {
  colorLog('\n🔍 VERIFICACIÓN DE MEJORAS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let totalVerified = 0;
  let totalImproved = 0;

  CSS_FILES.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      totalVerified++;

      const hasVariables = content.includes('--responsive-padding');
      const hasBreakpoints = content.includes('BREAKPOINT 608px');
      const hasGrids = content.includes('MEJORAS DE GRID FLUIDO');

      if (hasVariables && hasBreakpoints && hasGrids) {
        colorLog(`✅ ${path.basename(filePath)} - Completamente mejorado`, 'green');
        totalImproved++;
      } else {
        colorLog(`⚠️  ${path.basename(filePath)} - Mejoras parciales`, 'yellow');
      }
    }
  });

  colorLog(`\n📊 Verificación completada: ${totalImproved}/${totalVerified} archivos mejorados`, 'blue');
}

/**
 * EJECUCIÓN COMPLETA
 */
async function runCompleteResponsiveDesign() {
  const startTime = Date.now();

  colorLog('\n🚀 RESPONSIVE DESIGN COMPLETO INICIADO', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Procesar archivos CSS
  const { processedCount, minifiedCount } = await processAllCSSFiles();

  // 2. Verificar mejoras
  verifyImprovements();

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('\n📊 RESUMEN FINAL', 'bright');
  colorLog('='.repeat(60), 'bright');
  colorLog(`📝 Archivos procesados: ${processedCount}`, 'green');
  colorLog(`📦 Archivos minificados: ${minifiedCount}`, 'green');
  colorLog(`⏱️  Tiempo total: ${totalTime} segundos`, 'cyan');

  // Generar reporte
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      processedCount,
      minifiedCount,
      totalTime: parseFloat(totalTime),
    },
    details: {
      processedCount,
      minifiedCount,
    },
  };

  // Crear directorio si no existe
  if (!fs.existsSync(config.reportsDir)) {
    fs.mkdirSync(config.reportsDir, { recursive: true });
  }

  const reportPath = path.join(config.reportsDir, config.reportFile);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  colorLog(`📄 Reporte guardado en: ${reportPath}`, 'cyan');

  colorLog('\n✅ RESPONSIVE DESIGN COMPLETO FINALIZADO', 'bright');
  colorLog('💡 Para verificación rápida, ejecuta: node scripts/Diseño&CSS/responsive-quick.mjs', 'blue');
}

// Ejecutar si se llama directamente
runCompleteResponsiveDesign().catch(console.error);
