#!/usr/bin/env node

/**
 * Script de Optimización Completa
 * @description Escanea el proyecto y aplica optimizaciones seguras: lint/format, minificación de assets y HTML estático, y genera reporte.
 * @author Daniel Arribas Velázquez
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { minify as htmlMinify } from 'html-minifier-terser';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores consola
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
  publicDir: path.join(__dirname, '../../public'),
  assetsDir: path.join(__dirname, '../../public/assets'),
  dataAssetsDir: path.join(__dirname, '../../data/public/assets'),
  viewsDir: path.join(__dirname, '../../views'),
  resultsDir: path.join(__dirname, '../../results/optimization-results'),
  reportFile: 'optimizacion-complete-report.json',
};

async function run(cmd, cwd = config.projectRoot) {
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd });
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    return { ok: true };
  } catch (error) {
    colorLog(`❌ Error ejecutando: ${cmd}\n   ${error.message}`, 'red');
    return { ok: false, error: error.message };
  }
}

async function lintAndFormat() {
  colorLog('\n🧹 Lint y formato', 'magenta');
  colorLog('='.repeat(50), 'magenta');
  const lint = await run('npm run lint:fix');
  const format = await run('npm run format');
  return { lintOk: lint.ok, formatOk: format.ok };
}

async function minifyAssets() {
  colorLog('\n🗜️ Minificación de assets (CSS/JS)', 'magenta');
  colorLog('='.repeat(50), 'magenta');
  // Reutiliza el script existente de utilidades
  const res = await run('npm run minify-assets');
  return { assetsMinified: res.ok };
}

function findHtmlFiles(root) {
  const htmlFiles = [];
  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        // Excluir directorios grandes o no relevantes de public
        const rel = path.relative(config.publicDir, full);
        if (rel.startsWith('assets') || rel.startsWith('optimized')) continue;
        scan(full);
      } else if (item.endsWith('.html')) {
        htmlFiles.push(full);
      }
    }
  }
  scan(root);
  return htmlFiles;
}

async function minifyHtmlFiles() {
  colorLog('\n🗺️ Minificación de HTML estático en public/', 'magenta');
  colorLog('='.repeat(50), 'magenta');
  const files = findHtmlFiles(config.publicDir);
  let okCount = 0;
  for (const filePath of files) {
    // Backup simple por seguridad
    const backupPath = `${filePath}.backup`;
    try {
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(filePath, backupPath);
      }
    } catch (_) {}

    try {
      const html = fs.readFileSync(filePath, 'utf8');
      const minified = await htmlMinify(html, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        minifyCSS: true,
        minifyJS: true,
      });
      fs.writeFileSync(filePath, minified);
      colorLog(`✅ HTML minificado: ${path.relative(config.projectRoot, filePath)}`, 'green');
      okCount++;
    } catch (e) {
      colorLog(`⚠️ No se pudo minificar: ${path.relative(config.projectRoot, filePath)} (${e.message})`, 'yellow');
    }
  }
  colorLog(`📊 HTML minificado: ${okCount}/${files.length}`, 'cyan');
  return { htmlFiles: files.length, htmlMinified: okCount };
}

function analyzeBundleSizes() {
  colorLog('\n📦 Análisis de tamaños de bundle (public/assets)', 'magenta');
  colorLog('='.repeat(50), 'magenta');
  const results = { totalBytes: 0, files: [] };

  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) scan(full);
      else if (/\.(js|css)$/.test(item)) {
        results.totalBytes += stat.size;
        results.files.push({ path: full, size: stat.size });
      }
    }
  }
  scan(config.assetsDir);

  results.files.sort((a, b) => b.size - a.size);
  const top = results.files.slice(0, 10).map((f) => ({
    file: path.relative(config.projectRoot, f.path),
    sizeKB: +(f.size / 1024).toFixed(1),
  }));

  colorLog(`📊 Tamaño total JS+CSS: ${(results.totalBytes / 1024).toFixed(1)}KB`, 'blue');
  colorLog('🏋️  Top 10 archivos más pesados:', 'blue');
  top.forEach((t, i) => colorLog(`${i + 1}. ${t.file} — ${t.sizeKB}KB`, 'yellow'));

  return { totalKB: +(results.totalBytes / 1024).toFixed(1), top10: top };
}

function writeReport(summary) {
  if (!fs.existsSync(config.resultsDir)) {
    fs.mkdirSync(config.resultsDir, { recursive: true });
  }
  const reportPath = path.join(config.resultsDir, config.reportFile);
  fs.writeFileSync(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), ...summary }, null, 2));
  colorLog(`\n📄 Reporte guardado en: ${reportPath}`, 'cyan');
}

async function runCompleteOptimization() {
  const start = Date.now();
  colorLog('\n🚀 OPTIMIZACIÓN COMPLETA INICIADA', 'bright');
  colorLog('='.repeat(60), 'bright');

  const lintFormat = await lintAndFormat();
  const assets = await minifyAssets();
  const html = await minifyHtmlFiles();
  const bundle = analyzeBundleSizes();

  const totalTime = ((Date.now() - start) / 1000).toFixed(2);

  // Resumen
  colorLog('\n📊 RESUMEN FINAL', 'bright');
  colorLog('='.repeat(60), 'bright');
  colorLog(`🧹 Lint OK: ${lintFormat.lintOk ? '✅' : '❌'}`, lintFormat.lintOk ? 'green' : 'red');
  colorLog(`🖊️  Format OK: ${lintFormat.formatOk ? '✅' : '❌'}`, lintFormat.formatOk ? 'green' : 'red');
  colorLog(`🗜️  Minificado assets: ${assets.assetsMinified ? '✅' : '⚠️ parcial'}`, assets.assetsMinified ? 'green' : 'yellow');
  colorLog(`🗺️  HTML minificado: ${html.htmlMinified}/${html.htmlFiles}`, html.htmlMinified === html.htmlFiles ? 'green' : 'yellow');
  colorLog(`📦 Total JS+CSS: ${bundle.totalKB}KB`, 'cyan');
  colorLog(`⏱️  Tiempo total: ${totalTime}s`, 'cyan');

  writeReport({ lintFormat, assets, html, bundle, totalTime: +totalTime });

  colorLog('\n✅ OPTIMIZACIÓN COMPLETA FINALIZADA', 'bright');
  colorLog('💡 Para rendimiento completo: npm run rendimiento-completo', 'blue');
}

runCompleteOptimization().catch((err) => {
  colorLog(`❌ Error en optimización: ${err.message}`, 'red');
  process.exit(1);
});


