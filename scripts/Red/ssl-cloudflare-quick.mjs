#!/usr/bin/env node

/**
 * Script de SSL y Cloudflare Rápido
 * @description Versión ligera para verificaciones rápidas de SSL/TLS y Cloudflare
 * @author Daniel Arribas Velázquez
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

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
  domain: 'daniel-arribas-velazquez.dav-tech.work',
  configPath: path.join(__dirname, '../../src/config/index.mjs'),
};

/**
 * VERIFICACIÓN RÁPIDA DE SSL
 */
async function checkSSLQuick() {
  colorLog('\n🔐 VERIFICACIÓN RÁPIDA DE SSL', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar conectividad HTTPS
  colorLog('\n🌐 Verificando conectividad HTTPS:', 'blue');
  try {
    const response = await fetch(`https://${config.domain}`);
    if (response.ok) {
      colorLog('✅ Conectividad HTTPS funcionando', 'green');
    } else {
      colorLog(`❌ Error HTTP: ${response.status}`, 'red');
      allChecksPassed = false;
    }
  } catch (error) {
    colorLog(`❌ Error de conectividad: ${error.message}`, 'red');
    allChecksPassed = false;
  }

  // Verificar headers de seguridad básicos
  colorLog('\n🛡️ Verificando headers de seguridad:', 'blue');
  try {
    const response = await fetch(`https://${config.domain}`);
    const headers = response.headers;

    const securityHeaders = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'referrer-policy',
    ];

    securityHeaders.forEach(header => {
      if (headers.get(header)) {
        colorLog(`✅ ${header} configurado`, 'green');
      } else {
        colorLog(`❌ ${header} no configurado`, 'red');
        allChecksPassed = false;
      }
    });

  } catch (error) {
    colorLog(`❌ Error verificando headers: ${error.message}`, 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE CLOUDFLARE
 */
async function checkCloudflareQuick() {
  colorLog('\n☁️ VERIFICACIÓN RÁPIDA DE CLOUDFLARE', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar headers de Cloudflare
  colorLog('\n🌐 Verificando headers de Cloudflare:', 'blue');
  try {
    const response = await fetch(`https://${config.domain}`);
    const headers = response.headers;

    if (headers.get('server') && headers.get('server').includes('cloudflare')) {
      colorLog('✅ Servidor Cloudflare detectado', 'green');
    } else {
      colorLog('❌ Servidor Cloudflare no detectado', 'red');
      allChecksPassed = false;
    }

    if (headers.get('cf-ray')) {
      colorLog('✅ CF-Ray header presente (Cloudflare activo)', 'green');
    } else {
      colorLog('❌ CF-Ray header no presente', 'red');
      allChecksPassed = false;
    }

  } catch (error) {
    colorLog(`❌ Error verificando Cloudflare: ${error.message}`, 'red');
    allChecksPassed = false;
  }

  // Verificar configuración CSP para Cloudflare
  colorLog('\n🔒 Verificando configuración CSP:', 'blue');
  if (fs.existsSync(config.configPath)) {
    try {
      const configContent = fs.readFileSync(config.configPath, 'utf8');

      if (configContent.includes('cloudflare') || configContent.includes('dav-tech.work')) {
        colorLog('✅ Dominios de Cloudflare incluidos en configuración', 'green');
      } else {
        colorLog('❌ Dominios de Cloudflare no incluidos en configuración', 'red');
        allChecksPassed = false;
      }

      if (configContent.includes('CSP')) {
        colorLog('✅ Función CSP encontrada', 'green');
      } else {
        colorLog('❌ Función CSP no encontrada', 'red');
        allChecksPassed = false;
      }

    } catch (error) {
      colorLog(`❌ Error leyendo configuración: ${error.message}`, 'red');
      allChecksPassed = false;
    }
  } else {
    colorLog('❌ Archivo de configuración no encontrado', 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE CERTIFICADOS
 */
async function checkCertificatesQuick() {
  colorLog('\n📜 VERIFICACIÓN RÁPIDA DE CERTIFICADOS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar certificado SSL básico
  colorLog('\n🔐 Verificando certificado SSL:', 'blue');
  try {
    const response = await fetch(`https://${config.domain}`);

    if (response.url.startsWith('https://')) {
      colorLog('✅ Certificado SSL válido', 'green');
    } else {
      colorLog('❌ Certificado SSL inválido', 'red');
      allChecksPassed = false;
    }

  } catch (error) {
    colorLog(`❌ Error verificando certificado: ${error.message}`, 'red');
    allChecksPassed = false;
  }

  // Verificar archivos de certificados locales
  colorLog('\n📁 Verificando archivos de certificados:', 'blue');
  const certFiles = [
    'cert.pem',
    'key.pem',
    'chain.pem',
    'fullchain.pem',
    'privkey.pem',
  ];

  const certPaths = [
    path.join(__dirname, '../../'),
    path.join(__dirname, '../../ssl'),
    path.join(__dirname, '../../certs'),
    path.join(__dirname, '../../certificates'),
  ];

  let certsFound = false;
  certPaths.forEach(certPath => {
    if (fs.existsSync(certPath)) {
      certFiles.forEach(certFile => {
        const fullPath = path.join(certPath, certFile);
        if (fs.existsSync(fullPath)) {
          colorLog(`✅ ${certFile} encontrado en ${certPath}`, 'green');
          certsFound = true;
        }
      });
    }
  });

  if (!certsFound) {
    colorLog('⚠️ No se encontraron archivos de certificados locales', 'yellow');
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE CONFIGURACIÓN
 */
function checkConfigurationQuick() {
  colorLog('\n⚙️ VERIFICACIÓN RÁPIDA DE CONFIGURACIÓN', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar archivos de configuración
  colorLog('\n📁 Verificando archivos de configuración:', 'blue');

  const configFiles = [
    'config.env',
    'app.mjs',
    'package.json',
    'kubernetes/',
    'docker/',
  ];

  configFiles.forEach(file => {
    const filePath = path.join(__dirname, '../../', file);
    if (fs.existsSync(filePath)) {
      colorLog(`✅ ${file} encontrado`, 'green');
    } else {
      colorLog(`❌ ${file} no encontrado`, 'red');
      allChecksPassed = false;
    }
  });

  // Verificar configuración de Kubernetes
  colorLog('\n☸️ Verificando configuración Kubernetes:', 'blue');
  const k8sPath = path.join(__dirname, '../../kubernetes');
  if (fs.existsSync(k8sPath)) {
    const k8sFiles = fs.readdirSync(k8sPath);
    const sslFiles = k8sFiles.filter(file => file.includes('ssl') || file.includes('tls') || file.includes('ingress'));

    if (sslFiles.length > 0) {
      colorLog(`✅ ${sslFiles.length} archivos SSL/TLS encontrados en Kubernetes`, 'green');
    } else {
      colorLog('⚠️ No se encontraron archivos SSL/TLS en Kubernetes', 'yellow');
    }
  } else {
    colorLog('❌ Directorio Kubernetes no encontrado', 'red');
    allChecksPassed = false;
  }

  // Verificar configuración de Docker
  colorLog('\n🐳 Verificando configuración Docker:', 'blue');
  const dockerPath = path.join(__dirname, '../../docker');
  if (fs.existsSync(dockerPath)) {
    const dockerFiles = fs.readdirSync(dockerPath);
    const sslFiles = dockerFiles.filter(file => file.includes('ssl') || file.includes('tls'));

    if (sslFiles.length > 0) {
      colorLog(`✅ ${sslFiles.length} archivos SSL/TLS encontrados en Docker`, 'green');
    } else {
      colorLog('⚠️ No se encontraron archivos SSL/TLS en Docker', 'yellow');
    }
  } else {
    colorLog('❌ Directorio Docker no encontrado', 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * EJECUCIÓN COMPLETA DEL SSL Y CLOUDFLARE RÁPIDO
 */
async function runQuickSSLCloudflare() {
  const startTime = Date.now();

  colorLog('\n⚡ SSL Y CLOUDFLARE RÁPIDO INICIADO', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Verificación rápida de SSL
  const sslOK = await checkSSLQuick();

  // 2. Verificación rápida de Cloudflare
  const cloudflareOK = await checkCloudflareQuick();

  // 3. Verificación rápida de certificados
  const certsOK = await checkCertificatesQuick();

  // 4. Verificación rápida de configuración
  const configOK = checkConfigurationQuick();

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('\n📊 RESUMEN SSL Y CLOUDFLARE RÁPIDO', 'bright');
  colorLog('='.repeat(60), 'bright');
  colorLog(`🔐 SSL/TLS: ${sslOK ? '✅ OK' : '❌ Problemas'}`, sslOK ? 'green' : 'red');
  colorLog(`☁️ Cloudflare: ${cloudflareOK ? '✅ OK' : '❌ Problemas'}`, cloudflareOK ? 'green' : 'red');
  colorLog(`📜 Certificados: ${certsOK ? '✅ OK' : '❌ Problemas'}`, certsOK ? 'green' : 'red');
  colorLog(`⚙️ Configuración: ${configOK ? '✅ OK' : '❌ Problemas'}`, configOK ? 'green' : 'red');
  colorLog(`⏱️  Tiempo total: ${totalTime} segundos`, 'cyan');

  const allOK = sslOK && cloudflareOK && certsOK && configOK;
  colorLog(`\n🎯 Estado general: ${allOK ? '✅ CONFIGURACIÓN CORRECTA' : '❌ PROBLEMAS DE CONFIGURACIÓN DETECTADOS'}`, allOK ? 'green' : 'red');

  colorLog('\n✅ SSL Y CLOUDFLARE RÁPIDO COMPLETADO', 'bright');
  colorLog('💡 Para verificación completa, ejecuta: node scripts/Red/ssl-cloudflare-complete.mjs', 'blue');
}

// Ejecutar si se llama directamente
runQuickSSLCloudflare().catch(console.error);
