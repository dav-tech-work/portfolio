#!/usr/bin/env node

/**
 * Script de Análisis Rápido
 * @description Versión ligera para verificaciones rápidas de análisis
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
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * ANÁLISIS RÁPIDO DE SEO
 */
function analyzeSEOQuick() {
  colorLog('\n🔍 ANÁLISIS RÁPIDO DE SEO', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar robots.txt
  colorLog('\n🤖 Verificando robots.txt:', 'blue');
  const robotsPath = path.join(__dirname, '../../public', 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    const robotsContent = fs.readFileSync(robotsPath, 'utf8');
    colorLog('✅ robots.txt encontrado', 'green');
    colorLog(`📄 Tamaño: ${robotsContent.length} caracteres`, 'blue');

    // Verificar problemas críticos
    if (robotsContent.includes('config.env') && !robotsContent.includes('Disallow: /config.env')) {
      colorLog('❌ Contiene config.env (problema de seguridad)', 'red');
      allChecksPassed = false;
    } else if (robotsContent.includes('Disallow: /config.env')) {
      colorLog('✅ Bloquea config.env (correcto)', 'green');
    }
    if (robotsContent.includes('.env') && !robotsContent.includes('Disallow: /.env')) {
      colorLog('❌ Contiene .env (problema de seguridad)', 'red');
      allChecksPassed = false;
    } else if (robotsContent.includes('Disallow: /.env')) {
      colorLog('✅ Bloquea .env (correcto)', 'green');
    }
    if (robotsContent.includes('Sitemap:')) {
      colorLog('✅ Contiene referencia a Sitemap', 'green');
    } else {
      colorLog('⚠️  No contiene referencia a Sitemap', 'yellow');
    }
  } else {
    colorLog('❌ robots.txt no encontrado', 'red');
    allChecksPassed = false;
  }

  // Verificar sitemap.xml
  colorLog('\n🗺️  Verificando sitemap.xml:', 'blue');
  const sitemapPath = path.join(__dirname, '../../public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    colorLog('✅ sitemap.xml encontrado', 'green');
    colorLog(`📄 Tamaño: ${sitemapContent.length} caracteres`, 'blue');

    // Contar URLs
    const urlMatches = sitemapContent.match(/<url>/g);
    const urlCount = urlMatches ? urlMatches.length : 0;
    colorLog(`📊 Total de URLs: ${urlCount}`, 'blue');

    // Verificar páginas críticas
    const criticalPages = ['/', '/about', '/contacto'];
    let criticalPagesFound = 0;
    criticalPages.forEach((page) => {
      if (sitemapContent.includes(`daniel-arribas-velazquez.dav-tech.work${page}`)) {
        criticalPagesFound++;
      }
    });

    if (criticalPagesFound === criticalPages.length) {
      colorLog('✅ Páginas críticas encontradas', 'green');
    } else {
      colorLog(`⚠️  Solo ${criticalPagesFound}/${criticalPages.length} páginas críticas`, 'yellow');
    }
  } else {
    colorLog('❌ sitemap.xml no encontrado', 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * ANÁLISIS RÁPIDO DE SEGURIDAD
 */
function analyzeSecurityQuick() {
  colorLog('\n🔒 ANÁLISIS RÁPIDO DE SEGURIDAD', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar configuración básica
  colorLog('\n⚙️ Verificando configuración básica:', 'blue');

  // Verificar .gitignore
  const gitignorePath = path.join(__dirname, '../../.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (gitignoreContent.includes('config.env')) {
      colorLog('✅ config.env en .gitignore', 'green');
    } else {
      colorLog('❌ config.env NO en .gitignore', 'red');
      allChecksPassed = false;
    }
  } else {
    colorLog('❌ .gitignore no encontrado', 'red');
    allChecksPassed = false;
  }

  // Verificar config.env
  const configPath = path.join(__dirname, '../../config.env');
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const requiredSecrets = ['SESSION_SECRET', 'JWT_SECRET'];

    requiredSecrets.forEach(secret => {
      if (configContent.includes(secret)) {
        colorLog(`✅ ${secret} configurado`, 'green');
      } else {
        colorLog(`❌ ${secret} faltante`, 'red');
        allChecksPassed = false;
      }
    });
  } else {
    colorLog('❌ config.env no encontrado', 'red');
    allChecksPassed = false;
  }

  // Verificar archivos críticos
  colorLog('\n📁 Verificando archivos críticos:', 'blue');
  const criticalFiles = ['package-lock.json', 'node_modules'];
  const sensitiveFiles = ['.env', '.env.local', '.env.production'];

  criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, '../../', file);
    if (fs.existsSync(filePath)) {
      colorLog(`✅ ${file} presente`, 'green');
    } else {
      colorLog(`❌ ${file} faltante`, 'red');
      allChecksPassed = false;
    }
  });

  sensitiveFiles.forEach(file => {
    const filePath = path.join(__dirname, '../../', file);
    if (fs.existsSync(filePath)) {
      colorLog(`❌ ${file} presente (problema de seguridad)`, 'red');
      allChecksPassed = false;
    } else {
      colorLog(`✅ ${file} no presente (correcto)`, 'green');
    }
  });

  return allChecksPassed;
}

/**
 * ANÁLISIS RÁPIDO DE SCRIPTS
 */
function analyzeScriptsQuick() {
  colorLog('\n📜 ANÁLISIS RÁPIDO DE SCRIPTS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar scripts de seguridad críticos
  colorLog('\n🛡️ Verificando scripts de seguridad:', 'blue');
  const securityScripts = [
    'scripts/Seguridad/security-complete.mjs',
    'scripts/Red/ssl-cloudflare-complete.mjs',
    'scripts/Verificacion/verify-complete.mjs',
  ];

  securityScripts.forEach(script => {
    if (fs.existsSync(script)) {
      colorLog(`✅ ${script}`, 'green');
    } else {
      colorLog(`❌ ${script}`, 'red');
      allChecksPassed = false;
    }
  });

  // Verificar scripts de análisis
  colorLog('\n🔍 Verificando scripts de análisis:', 'blue');
  const analysisScripts = [
    'scripts/Analisis/analysis-complete.mjs',
    'scripts/Testing/testing-complete.mjs',
    'scripts/Rendimiento/performance-complete.mjs',
  ];

  analysisScripts.forEach(script => {
    if (fs.existsSync(script)) {
      colorLog(`✅ ${script}`, 'green');
    } else {
      colorLog(`❌ ${script}`, 'red');
      allChecksPassed = false;
    }
  });

  return allChecksPassed;
}

/**
 * ANÁLISIS RÁPIDO DE ESTRUCTURA
 */
function analyzeStructureQuick() {
  colorLog('\n📁 ANÁLISIS RÁPIDO DE ESTRUCTURA', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar directorios críticos
  colorLog('\n📁 Verificando directorios críticos:', 'blue');
  const criticalDirs = ['public', 'views', 'src', 'test'];

  criticalDirs.forEach(dir => {
    const dirPath = path.join(__dirname, '../../', dir);
    if (fs.existsSync(dirPath)) {
      colorLog(`✅ Directorio ${dir}`, 'green');
    } else {
      colorLog(`❌ Directorio ${dir} faltante`, 'red');
      allChecksPassed = false;
    }
  });

  // Verificar archivos críticos
  colorLog('\n📄 Verificando archivos críticos:', 'blue');
  const criticalFiles = ['package.json', 'app.mjs', 'config.env'];

  criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, '../../', file);
    if (fs.existsSync(filePath)) {
      colorLog(`✅ Archivo ${file}`, 'green');
    } else {
      colorLog(`❌ Archivo ${file} faltante`, 'red');
      allChecksPassed = false;
    }
  });

  return allChecksPassed;
}

/**
 * EJECUCIÓN COMPLETA DEL ANÁLISIS RÁPIDO
 */
function runQuickAnalysis() {
  const startTime = Date.now();

  colorLog('\n⚡ ANÁLISIS RÁPIDO INICIADO', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Análisis de SEO
  const seoOK = analyzeSEOQuick();

  // 2. Análisis de seguridad
  const securityOK = analyzeSecurityQuick();

  // 3. Análisis de scripts
  const scriptsOK = analyzeScriptsQuick();

  // 4. Análisis de estructura
  const structureOK = analyzeStructureQuick();

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('\n📊 RESUMEN ANÁLISIS RÁPIDO', 'bright');
  colorLog('='.repeat(60), 'bright');
  colorLog(`🔍 SEO: ${seoOK ? '✅ OK' : '❌ Problemas'}`, seoOK ? 'green' : 'red');
  colorLog(`🔒 Seguridad: ${securityOK ? '✅ OK' : '❌ Problemas'}`, securityOK ? 'green' : 'red');
  colorLog(`📜 Scripts: ${scriptsOK ? '✅ OK' : '❌ Problemas'}`, scriptsOK ? 'green' : 'red');
  colorLog(`📁 Estructura: ${structureOK ? '✅ OK' : '❌ Problemas'}`, structureOK ? 'green' : 'red');
  colorLog(`⏱️  Tiempo total: ${totalTime} segundos`, 'cyan');

  const allOK = seoOK && securityOK && scriptsOK && structureOK;
  colorLog(`\n🎯 Estado general: ${allOK ? '✅ TODO OK' : '❌ PROBLEMAS DETECTADOS'}`, allOK ? 'green' : 'red');

  colorLog('\n✅ ANÁLISIS RÁPIDO COMPLETADO', 'bright');
  colorLog('💡 Para análisis completo, ejecuta: node scripts/analysis-complete.mjs', 'blue');
}

// Ejecutar si se llama directamente
runQuickAnalysis();
