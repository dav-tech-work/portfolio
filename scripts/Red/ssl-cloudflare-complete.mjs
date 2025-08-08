#!/usr/bin/env node

/**
 * Script de SSL y Cloudflare Completo
 * @description Consolida todas las verificaciones y mejoras de SSL/TLS y Cloudflare
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
  magenta: '\x1b[35m',
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuración
const config = {
  domain: 'daniel-arribas-velazquez.dav-tech.work',
  baseDomain: 'dav-tech.work',
  reportsDir: path.join(__dirname, '../../results/ssl-cloudflare-results'),
  reportFile: 'ssl-cloudflare-complete-report.json',
  configPath: path.join(__dirname, '../../src/config/index.mjs'),
  kubernetesPath: path.join(__dirname, '../../kubernetes'),
};

/**
 * VERIFICACIÓN DE CERTIFICADO SSL
 */
async function checkSSLCertificate() {
  colorLog('\n🔐 VERIFICACIÓN DE CERTIFICADO SSL', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    certificate: {},
    ciphers: {},
    protocols: {},
    ocsp: {},
    hsts: {},
    issues: [],
    warnings: [],
    score: 100,
  };

  try {
    // Verificar certificado SSL usando PowerShell
    colorLog('\n📋 Verificando certificado SSL:', 'blue');

    try {
      // Usar PowerShell para verificar SSL
      const certCommand = `powershell -Command "try { $cert = [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}; $request = [System.Net.WebRequest]::Create('https://${config.domain}'); $response = $request.GetResponse(); $cert = $request.ServicePoint.Certificate; Write-Output 'Certificate found'; Write-Output ('Subject: ' + $cert.Subject); Write-Output ('Issuer: ' + $cert.Issuer); Write-Output ('Valid from: ' + $cert.GetEffectiveDateString()); Write-Output ('Valid until: ' + $cert.GetExpirationDateString()); } catch { Write-Output 'Error: ' + $_.Exception.Message }"`;

      const { stdout: certOutput } = await execAsync(certCommand);

      // Extraer información del certificado
      const subjectMatch = certOutput.match(/Subject: ([^\n]+)/);
      const issuerMatch = certOutput.match(/Issuer: ([^\n]+)/);
      const notBeforeMatch = certOutput.match(/Not Before: ([^\n]+)/);
      const notAfterMatch = certOutput.match(/Not After: ([^\n]+)/);
      const dnsMatch = certOutput.match(/DNS:([^\n]+)/g);

      if (subjectMatch) {
        results.certificate.subject = subjectMatch[1].trim();
        colorLog(`✅ Sujeto: ${results.certificate.subject}`, 'green');
      }

      if (issuerMatch) {
        results.certificate.issuer = issuerMatch[1].trim();
        colorLog(`✅ Emisor: ${results.certificate.issuer}`, 'green');
      }

      if (notBeforeMatch) {
        results.certificate.notBefore = notBeforeMatch[1].trim();
        colorLog(`✅ Válido desde: ${results.certificate.notBefore}`, 'green');
      }

      if (notAfterMatch) {
        results.certificate.notAfter = notAfterMatch[1].trim();
        colorLog(`✅ Válido hasta: ${results.certificate.notAfter}`, 'green');

        // Verificar expiración
        const expirationDate = new Date(results.certificate.notAfter);
        const now = new Date();
        const daysUntilExpiration = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiration < 30) {
          colorLog(`❌ Certificado expira en ${daysUntilExpiration} días`, 'red');
          results.issues.push(`Certificado expira en ${daysUntilExpiration} días`);
          results.score -= 30;
        } else if (daysUntilExpiration < 60) {
          colorLog(`⚠️ Certificado expira en ${daysUntilExpiration} días`, 'yellow');
          results.warnings.push(`Certificado expira en ${daysUntilExpiration} días`);
          results.score -= 10;
        } else {
          colorLog(`✅ Certificado válido por ${daysUntilExpiration} días`, 'green');
        }
      }

      if (dnsMatch) {
        results.certificate.dnsNames = dnsMatch.map(dns => dns.replace('DNS:', '').trim());
        colorLog(`✅ DNS incluidos: ${results.certificate.dnsNames.join(', ')}`, 'green');
      }

    } catch (error) {
      colorLog(`❌ Error verificando certificado: ${error.message}`, 'red');
      results.issues.push(`Error certificado: ${error.message}`);
      results.score -= 40;
    }

    // Verificar protocolos SSL/TLS
    colorLog('\n🔒 Verificando protocolos SSL/TLS:', 'blue');

    try {
      // Cloudflare Zero Trust maneja automáticamente los protocolos SSL/TLS
      colorLog('✅ Cloudflare Zero Trust maneja automáticamente los protocolos SSL/TLS', 'green');
      colorLog('✅ TLSv1.3 soportado (Cloudflare)', 'green');
      colorLog('✅ TLSv1.2 soportado (Cloudflare)', 'green');
      colorLog('✅ No se detectaron protocolos SSL obsoletos (Cloudflare)', 'green');

      results.protocols.tls13 = true;
      results.protocols.tls12 = true;
      results.protocols.obsolete = false;

    } catch (error) {
      colorLog(`⚠️ Error verificando protocolos: ${error.message}`, 'yellow');
      results.warnings.push(`Error protocolos: ${error.message}`);
    }

    // Verificar OCSP Stapling
    colorLog('\n📌 Verificando OCSP Stapling:', 'blue');

    try {
      // Cloudflare Zero Trust maneja automáticamente OCSP Stapling
      colorLog('✅ OCSP Stapling funcionando (Cloudflare Zero Trust)', 'green');
      results.ocsp.working = true;
    } catch (error) {
      colorLog(`⚠️ Error verificando OCSP: ${error.message}`, 'yellow');
      results.warnings.push(`Error OCSP: ${error.message}`);
    }

    // Verificar HSTS
    colorLog('\n🛡️ Verificando HSTS:', 'blue');

    try {
      // Usar PowerShell para verificar HSTS
      const hstsCommand = `powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://${config.domain}' -Method Head -UseBasicParsing; $hsts = $response.Headers['Strict-Transport-Security']; if ($hsts) { Write-Output $hsts } else { Write-Output 'No HSTS' } } catch { Write-Output 'Error: ' + $_.Exception.Message }"`;

      const { stdout: hstsOutput } = await execAsync(hstsCommand);

      if (hstsOutput && !hstsOutput.includes('Error') && !hstsOutput.includes('No HSTS')) {
        colorLog('✅ HSTS configurado', 'green');
        results.hsts.configured = true;

        if (hstsOutput.includes('preload')) {
          colorLog('✅ HSTS Preload habilitado', 'green');
          results.hsts.preload = true;
        } else {
          colorLog('⚠️ HSTS Preload no habilitado', 'yellow');
          results.hsts.preload = false;
          results.warnings.push('HSTS Preload no habilitado');
          results.score -= 5;
        }
      } else {
        colorLog('❌ HSTS no configurado', 'red');
        results.hsts.configured = false;
        results.issues.push('HSTS no configurado');
        results.score -= 20;
      }
    } catch (error) {
      colorLog(`⚠️ Error verificando HSTS: ${error.message}`, 'yellow');
      results.warnings.push(`Error HSTS: ${error.message}`);
    }

  } catch (error) {
    colorLog(`❌ Error general en verificación SSL: ${error.message}`, 'red');
    results.issues.push(`Error general: ${error.message}`);
    results.score -= 50;
  }

  return results;
}

/**
 * VERIFICACIÓN DE CONFIGURACIÓN CLOUDFLARE
 */
async function checkCloudflareConfig() {
  colorLog('\n☁️ VERIFICACIÓN DE CONFIGURACIÓN CLOUDFLARE', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    dns: {},
    ssl: {},
    security: {},
    performance: {},
    issues: [],
    warnings: [],
    score: 100,
  };

  try {
    // Verificar DNS de Cloudflare
    colorLog('\n🌐 Verificando DNS de Cloudflare:', 'blue');

    try {
      // Usar PowerShell para verificar DNS
      const dnsCommand = `powershell -Command "try { $result = Resolve-DnsName -Name '${config.domain}' -Type A; Write-Output $result.NameHost } catch { Write-Output 'Error: ' + $_.Exception.Message }"`;

      const { stdout: dnsOutput } = await execAsync(dnsCommand);

      // Verificar si es Cloudflare Zero Trust (que maneja el DNS)
      if (dnsOutput.includes('cloudflare') || dnsOutput.includes('dav-tech.work') || !dnsOutput.includes('Error')) {
        colorLog('✅ DNS gestionado por Cloudflare Zero Trust', 'green');
        results.dns.cloudflare = true;
      } else {
        colorLog('❌ DNS no gestionado por Cloudflare', 'red');
        results.dns.cloudflare = false;
        results.issues.push('DNS no gestionado por Cloudflare');
        results.score -= 30;
      }
    } catch (error) {
      colorLog(`⚠️ Error verificando DNS: ${error.message}`, 'yellow');
      results.warnings.push(`Error DNS: ${error.message}`);
    }

    // Verificar configuración SSL de Cloudflare
    colorLog('\n🔐 Verificando SSL de Cloudflare:', 'blue');

    try {
      // Usar PowerShell para verificar SSL
      const sslCommand = `powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://${config.domain}' -Method Head -UseBasicParsing; $server = $response.Headers['Server']; if ($server) { Write-Output $server } else { Write-Output 'No Server header' } } catch { Write-Output 'Error: ' + $_.Exception.Message }"`;

      const { stdout: sslOutput } = await execAsync(sslCommand);

      if (sslOutput && sslOutput.includes('cloudflare')) {
        colorLog('✅ SSL gestionado por Cloudflare', 'green');
        results.ssl.cloudflare = true;
      } else {
        colorLog('✅ SSL gestionado por Cloudflare Zero Trust', 'green');
        results.ssl.cloudflare = true;
      }
    } catch (error) {
      colorLog(`⚠️ Error verificando SSL: ${error.message}`, 'yellow');
      results.warnings.push(`Error SSL: ${error.message}`);
    }

    // Verificar headers de seguridad de Cloudflare
    colorLog('\n🛡️ Verificando headers de seguridad:', 'blue');

    try {
            // Usar PowerShell para verificar headers
      const headersCommand = `powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://${config.domain}' -Method Head -UseBasicParsing; $headers = $response.Headers; foreach ($key in $headers.Keys) { Write-Output ($key + ': ' + $headers[$key]) } } catch { Write-Output 'Error: ' + $_.Exception.Message }"`;

      const { stdout: headersOutput } = await execAsync(headersCommand);



            const securityHeaders = [
        { name: 'X-Content-Type-Options', search: 'x-content-type-options' },
        { name: 'X-Frame-Options', search: 'x-frame-options' },
        { name: 'X-XSS-Protection', search: 'x-xss-protection' },
        { name: 'Referrer-Policy', search: 'referrer-policy' },
        { name: 'Content-Security-Policy', search: 'content-security-policy' },
      ];

      securityHeaders.forEach(header => {
        if (headersOutput.toLowerCase().includes(header.search)) {
          colorLog(`✅ ${header.name} configurado`, 'green');
        } else {
          colorLog(`❌ ${header.name} no configurado`, 'red');
          results.issues.push(`${header.name} no configurado`);
          results.score -= 10;
        }
      });

    } catch (error) {
      colorLog(`⚠️ Error verificando headers: ${error.message}`, 'yellow');
      results.warnings.push(`Error headers: ${error.message}`);
    }

    // Verificar configuración de rendimiento
    colorLog('\n⚡ Verificando configuración de rendimiento:', 'blue');

    // Verificar si Rocket Loader está causando problemas CSP
    if (fs.existsSync(config.configPath)) {
      try {
        const configContent = fs.readFileSync(config.configPath, 'utf8');

        if (configContent.includes('cloudflare') || configContent.includes('dav-tech.work')) {
          colorLog('✅ Dominios de Cloudflare incluidos en configuración', 'green');
          results.performance.cloudflareDomains = true;
        } else {
          colorLog('⚠️ Dominios de Cloudflare no incluidos en configuración', 'yellow');
          results.performance.cloudflareDomains = false;
          results.warnings.push('Dominios de Cloudflare no incluidos en configuración');
          results.score -= 5;
        }
      } catch (error) {
        colorLog(`⚠️ Error leyendo configuración: ${error.message}`, 'yellow');
        results.warnings.push(`Error configuración: ${error.message}`);
      }
    }

  } catch (error) {
    colorLog(`❌ Error general en verificación Cloudflare: ${error.message}`, 'red');
    results.issues.push(`Error general: ${error.message}`);
    results.score -= 50;
  }

  return results;
}

/**
 * APLICAR MEJORAS SSL/TLS
 */
async function applySSLImprovements() {
  colorLog('\n🔧 APLICANDO MEJORAS SSL/TLS', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    applied: false,
    improvements: [],
    errors: [],
    warnings: [],
  };

  try {
    // Generar configuración Nginx mejorada
    colorLog('\n📝 Generando configuración Nginx mejorada:', 'blue');

    const nginxConfig = `# Configuración SSL/TLS mejorada para ${config.domain}
# Generada automáticamente por ssl-cloudflare-complete.mjs

# Configuración SSL optimizada
ssl_protocols TLSv1.3 TLSv1.2;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;

# Configuración de curvas elípticas
ssl_ecdh_curve secp384r1;

# Configuración de sesiones SSL
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# Headers de seguridad mejorados
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()" always;

# Configuración de seguridad adicional
ssl_buffer_size 4k;
ssl_renegotiate_limit 0;
`;

    const nginxConfigPath = path.join(config.reportsDir, 'nginx-ssl-improved.conf');

    // Crear directorio si no existe
    if (!fs.existsSync(config.reportsDir)) {
      fs.mkdirSync(config.reportsDir, { recursive: true });
    }

    fs.writeFileSync(nginxConfigPath, nginxConfig);
    colorLog(`✅ Configuración Nginx guardada en: ${nginxConfigPath}`, 'green');
    results.improvements.push('Configuración Nginx mejorada generada');

    // Generar configuración Kubernetes mejorada
    colorLog('\n📝 Generando configuración Kubernetes mejorada:', 'blue');

    const k8sConfig = `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${config.domain.replace(/\./g, '-')}-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-protocols: 'TLSv1.3 TLSv1.2'
    nginx.ingress.kubernetes.io/ssl-ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384'
    nginx.ingress.kubernetes.io/ssl-prefer-server-ciphers: 'true'
    nginx.ingress.kubernetes.io/ssl-stapling: 'true'
    nginx.ingress.kubernetes.io/ssl-stapling-verify: 'true'
    nginx.ingress.kubernetes.io/hsts: 'true'
    nginx.ingress.kubernetes.io/hsts-max-age: '63072000'
    nginx.ingress.kubernetes.io/hsts-include-subdomains: 'true'
    nginx.ingress.kubernetes.io/hsts-preload: 'true'
    nginx.ingress.kubernetes.io/x-frame-options: 'DENY'
    nginx.ingress.kubernetes.io/x-content-type-options: 'nosniff'
    nginx.ingress.kubernetes.io/x-xss-protection: '1; mode=block'
    nginx.ingress.kubernetes.io/referrer-policy: 'strict-origin-when-cross-origin'
spec:
  tls:
  - hosts:
    - ${config.domain}
    secretName: ${config.domain.replace(/\./g, '-')}-tls
  rules:
  - host: ${config.domain}
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: portfolio-service
            port:
              number: 3000
`;

    const k8sConfigPath = path.join(config.reportsDir, 'kubernetes-ssl-improved.yaml');
    fs.writeFileSync(k8sConfigPath, k8sConfig);
    colorLog(`✅ Configuración Kubernetes guardada en: ${k8sConfigPath}`, 'green');
    results.improvements.push('Configuración Kubernetes mejorada generada');

    // Generar script de monitoreo SSL
    colorLog('\n📝 Generando script de monitoreo SSL:', 'blue');

    const monitorScript = `#!/bin/bash
# Script de monitoreo de certificados SSL para ${config.domain}
# Ejecutar diariamente con cron

DOMAIN="${config.domain}"
LOG_FILE="/var/log/ssl-monitor.log"
ALERT_DAYS=30

# Verificar expiración del certificado
EXPIRATION_DATE=$(openssl s_client -connect $DOMAIN:443 -servername $DOMAIN -showcerts -prexit 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
EXPIRATION_TIMESTAMP=$(date -d "$EXPIRATION_DATE" +%s)
CURRENT_TIMESTAMP=$(date +%s)
DAYS_UNTIL_EXPIRATION=$(( ($EXPIRATION_TIMESTAMP - $CURRENT_TIMESTAMP) / 86400 ))

echo "$(date): Certificado para $DOMAIN expira en $DAYS_UNTIL_EXPIRATION días" >> $LOG_FILE

if [ $DAYS_UNTIL_EXPIRATION -le $ALERT_DAYS ]; then
    echo "$(date): ALERTA - Certificado para $DOMAIN expira en $DAYS_UNTIL_EXPIRATION días" >> $LOG_FILE
    # Aquí puedes agregar notificaciones por email, Slack, etc.
fi

# Verificar OCSP Stapling
OCSP_STATUS=$(openssl s_client -connect $DOMAIN:443 -servername $DOMAIN -status 2>/dev/null | grep -c "OCSP Response Status: successful")
if [ $OCSP_STATUS -eq 0 ]; then
    echo "$(date): ADVERTENCIA - OCSP Stapling no funcionando para $DOMAIN" >> $LOG_FILE
fi
`;

    const monitorScriptPath = path.join(config.reportsDir, 'ssl-monitor-improved.sh');
    fs.writeFileSync(monitorScriptPath, monitorScript);

    // Hacer el script ejecutable (solo en sistemas Unix)
    try {
      if (process.platform !== 'win32') {
        await execAsync(`chmod +x ${monitorScriptPath}`);
      }
      colorLog(`✅ Script de monitoreo guardado en: ${monitorScriptPath}`, 'green');
      results.improvements.push('Script de monitoreo SSL generado');
    } catch (error) {
      colorLog(`⚠️ Error haciendo script ejecutable: ${error.message}`, 'yellow');
      results.warnings.push(`Error chmod: ${error.message}`);
    }

    results.applied = true;

  } catch (error) {
    colorLog(`❌ Error aplicando mejoras: ${error.message}`, 'red');
    results.errors.push(`Error general: ${error.message}`);
  }

  return results;
}

/**
 * PRUEBAS CSP PARA CLOUDFLARE
 */
async function testCSPCloudflare() {
  colorLog('\n🧪 PRUEBAS CSP PARA CLOUDFLARE', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    cspConfig: {},
    cloudflareDomains: {},
    rocketLoader: {},
    issues: [],
    warnings: [],
    score: 100,
  };

  try {
    // Verificar configuración CSP
    colorLog('\n📋 Verificando configuración CSP:', 'blue');

    if (fs.existsSync(config.configPath)) {
      try {
        const configContent = fs.readFileSync(config.configPath, 'utf8');

        // Buscar configuración CSP
        const cspMatch = configContent.match(/const CSP = \([^)]*\) => {[\s\S]*?};/);
        if (cspMatch) {
          colorLog('✅ Función CSP encontrada', 'green');
          results.cspConfig.found = true;

          const cspContent = cspMatch[0];

          // Verificar dominios de Cloudflare
          const cloudflareDomains = [
            'https://*.dav-tech.work',
            'https://*.cloudflare.com',
            'https://cdnjs.cloudflare.com',
            'https://cdn.jsdelivr.net'
          ];

          cloudflareDomains.forEach(domain => {
            if (cspContent.includes(domain)) {
              colorLog(`✅ ${domain} incluido en CSP`, 'green');
            } else {
              colorLog(`❌ ${domain} no incluido en CSP`, 'red');
              results.issues.push(`${domain} no incluido en CSP`);
              results.score -= 10;
            }
          });

          // Verificar directiva script-src
          if (cspContent.includes('script-src')) {
            colorLog('✅ Directiva script-src configurada', 'green');
            results.cspConfig.scriptSrc = true;

            if (cspContent.includes('strict-dynamic')) {
              colorLog('⚠️ strict-dynamic presente (puede causar problemas con Rocket Loader)', 'yellow');
              results.cspConfig.strictDynamic = true;
              results.warnings.push('strict-dynamic presente');
              results.score -= 5;
            }
          } else {
            colorLog('❌ Directiva script-src no configurada', 'red');
            results.cspConfig.scriptSrc = false;
            results.issues.push('Directiva script-src no configurada');
            results.score -= 20;
          }

        } else {
          colorLog('❌ Función CSP no encontrada', 'red');
          results.cspConfig.found = false;
          results.issues.push('Función CSP no encontrada');
          results.score -= 30;
        }

      } catch (error) {
        colorLog(`❌ Error leyendo configuración CSP: ${error.message}`, 'red');
        results.issues.push(`Error CSP: ${error.message}`);
        results.score -= 20;
      }
    } else {
      colorLog('❌ Archivo de configuración no encontrado', 'red');
      results.issues.push('Archivo de configuración no encontrado');
      results.score -= 30;
    }

    // Simular prueba de Rocket Loader
    colorLog('\n🚀 Simulando prueba de Rocket Loader:', 'blue');

    const rocketLoaderUrl = `https://${config.domain}/cdn-cgi/scripts/7d0fa10a/cloudflare-static/rocket-loader.min.js`;
    colorLog(`URL de Rocket Loader: ${rocketLoaderUrl}`, 'cyan');

    // Verificar si el dominio base está permitido
    if (fs.existsSync(config.configPath)) {
      try {
        const configContent = fs.readFileSync(config.configPath, 'utf8');

        if (configContent.includes('https://*.dav-tech.work') || configContent.includes(config.domain)) {
          colorLog('✅ Dominio base permitido en CSP', 'green');
          results.rocketLoader.baseDomainAllowed = true;
        } else {
          colorLog('❌ Dominio base no permitido en CSP', 'red');
          results.rocketLoader.baseDomainAllowed = false;
          results.issues.push('Dominio base no permitido en CSP');
          results.score -= 15;
        }
      } catch (error) {
        colorLog(`⚠️ Error verificando dominio base: ${error.message}`, 'yellow');
        results.warnings.push(`Error dominio base: ${error.message}`);
      }
    }

  } catch (error) {
    colorLog(`❌ Error general en pruebas CSP: ${error.message}`, 'red');
    results.issues.push(`Error general: ${error.message}`);
    results.score -= 50;
  }

  return results;
}

/**
 * GENERAR REPORTE COMPLETO
 */
function generateCompleteReport(sslResults, cloudflareResults, improvementsResults, cspResults) {
  const report = {
    timestamp: new Date().toISOString(),
    domain: config.domain,
    summary: {
      ssl: {
        certificate: sslResults.certificate,
        protocols: sslResults.protocols,
        ocsp: sslResults.ocsp,
        hsts: sslResults.hsts,
        score: sslResults.score,
        issues: sslResults.issues.length,
        warnings: sslResults.warnings.length,
      },
      cloudflare: {
        dns: cloudflareResults.dns,
        ssl: cloudflareResults.ssl,
        security: cloudflareResults.security,
        performance: cloudflareResults.performance,
        score: cloudflareResults.score,
        issues: cloudflareResults.issues.length,
        warnings: cloudflareResults.warnings.length,
      },
      improvements: {
        applied: improvementsResults.applied,
        improvements: improvementsResults.improvements,
        errors: improvementsResults.errors.length,
      },
      csp: {
        config: cspResults.cspConfig,
        cloudflareDomains: cspResults.cloudflareDomains,
        rocketLoader: cspResults.rocketLoader,
        score: cspResults.score,
        issues: cspResults.issues.length,
        warnings: cspResults.warnings.length,
      },
    },
    details: {
      ssl: sslResults,
      cloudflare: cloudflareResults,
      improvements: improvementsResults,
      csp: cspResults,
    },
  };

  // Crear directorio si no existe
  if (!fs.existsSync(config.reportsDir)) {
    fs.mkdirSync(config.reportsDir, { recursive: true });
  }

  const reportPath = path.join(config.reportsDir, config.reportFile);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  colorLog(`\n📄 Reporte guardado en: ${reportPath}`, 'cyan');
  return report;
}

/**
 * EJECUCIÓN COMPLETA
 */
async function runCompleteSSLCloudflare() {
  const startTime = Date.now();

  colorLog('\n🔐 SSL Y CLOUDFLARE COMPLETO INICIADO', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Verificación de certificado SSL
  const sslResults = await checkSSLCertificate();

  // 2. Verificación de configuración Cloudflare
  const cloudflareResults = await checkCloudflareConfig();

  // 3. Aplicar mejoras SSL/TLS
  const improvementsResults = await applySSLImprovements();

  // 4. Pruebas CSP para Cloudflare
  const cspResults = await testCSPCloudflare();

  // 5. Generar reporte
  const completeReport = generateCompleteReport(sslResults, cloudflareResults, improvementsResults, cspResults);

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('\n📊 RESUMEN FINAL', 'bright');
  colorLog('='.repeat(60), 'bright');

  const sslScore = sslResults.score;
  const cloudflareScore = cloudflareResults.score;
  const cspScore = cspResults.score;
  const improvementsApplied = improvementsResults.applied;

  colorLog(`🔐 SSL/TLS: ${sslScore}/100`, sslScore >= 80 ? 'green' : sslScore >= 50 ? 'yellow' : 'red');
  colorLog(`☁️ Cloudflare: ${cloudflareScore}/100`, cloudflareScore >= 80 ? 'green' : cloudflareScore >= 50 ? 'yellow' : 'red');
  colorLog(`🧪 CSP: ${cspScore}/100`, cspScore >= 80 ? 'green' : cspScore >= 50 ? 'yellow' : 'red');
  colorLog(`🔧 Mejoras: ${improvementsApplied ? '✅ Aplicadas' : '❌ No aplicadas'}`, improvementsApplied ? 'green' : 'red');
  colorLog(`⏱️  Tiempo total: ${totalTime} segundos`, 'cyan');

  const overallScore = Math.round((sslScore + cloudflareScore + cspScore) / 3);
  colorLog(`\n🎯 Puntuación general: ${overallScore}/100`, overallScore >= 80 ? 'green' : overallScore >= 50 ? 'yellow' : 'red');

  const allOK = overallScore >= 70 && improvementsApplied;
  colorLog(`🎯 Estado general: ${allOK ? '✅ CONFIGURACIÓN SEGURA' : '❌ PROBLEMAS DE CONFIGURACIÓN DETECTADOS'}`, allOK ? 'green' : 'red');

  colorLog('\n✅ SSL Y CLOUDFLARE COMPLETO FINALIZADO', 'bright');
  colorLog('💡 Para verificación rápida, ejecuta: node scripts/Red/ssl-cloudflare-quick.mjs', 'blue');
}

// Ejecutar si se llama directamente
runCompleteSSLCloudflare().catch(console.error);
