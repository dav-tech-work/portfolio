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
      colorLog(`✅ ${description}: ${filePath}`, 'green');
      return true;
    } else {
      colorLog(`❌ ${description}: ${filePath} - NO ENCONTRADO`, 'red');
      return false;
    }
  } catch (error) {
    colorLog(`❌ Error verificando ${description}: ${error.message}`, 'red');
    return false;
  }
}

function checkConfig() {
  colorLog('\n🔧 ===== VERIFICACIÓN DEL SISTEMA DE CONTACTO =====', 'cyan');
  
  const rootDir = path.resolve(__dirname, '../../');
  
  // Verificar archivos de configuración
  colorLog('\n📋 Verificando archivos de configuración:', 'blue');
  const configEnv = path.join(rootDir, 'config.env');
  const configEnvExample = path.join(rootDir, 'config.env.example');
  
  checkFile(configEnv, 'Archivo config.env');
  checkFile(configEnvExample, 'Archivo config.env.example');
  
  // Verificar si config.env existe
  if (!fs.existsSync(configEnv)) {
    colorLog('\n⚠️  ADVERTENCIA: No existe el archivo config.env', 'yellow');
    colorLog('   Para habilitar el envío de correos, copia config.env.example a config.env', 'yellow');
    colorLog('   y configura las variables de email:', 'yellow');
    colorLog('   - EMAIL_USER', 'yellow');
    colorLog('   - EMAIL_PASS (contraseña de aplicación de Gmail)', 'yellow');
    colorLog('   - EMAIL_FROM', 'yellow');
    colorLog('   - EMAIL_ADMIN', 'yellow');
    colorLog('   - EMAIL_ENABLED=true', 'yellow');
  }
  
  // Verificar archivos del sistema de contacto
  colorLog('\n📧 Verificando archivos del sistema de contacto:', 'blue');
  
  const files = [
    { path: 'src/routes/api/contacto.mjs', desc: 'API de contacto' },
    { path: 'src/utils/servicios/contacto.mjs', desc: 'Servicio de contacto' },
    { path: 'src/utils/servicios/mail.mjs', desc: 'Servicio de email' },
    { path: 'src/utils/seguridad/sanitize.mjs', desc: 'Sanitización' },
    { path: 'src/utils/seguridad/validate.mjs', desc: 'Validación' },
    { path: 'src/utils/servicios/logger.mjs', desc: 'Logger' },
    { path: 'src/utils/servicios/loggerAuditoria.mjs', desc: 'Logger de auditoría' },
    { path: 'src/config/index.mjs', desc: 'Configuración' },
    { path: 'data/public/assets/js/contacto.js', desc: 'JavaScript frontend' },
    { path: 'views/pages/contacto.ejs', desc: 'Vista de contacto' },
  ];
  
  let allFilesExist = true;
  files.forEach(file => {
    const fullPath = path.join(rootDir, file.path);
    if (!checkFile(fullPath, file.desc)) {
      allFilesExist = false;
    }
  });
  
  // Verificar dependencias
  colorLog('\n📦 Verificando dependencias:', 'blue');
  const packageJsonPath = path.join(rootDir, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = packageJson.dependencies || {};
      
      const requiredDeps = ['nodemailer', 'express', 'dotenv'];
      requiredDeps.forEach(dep => {
        if (dependencies[dep]) {
          colorLog(`✅ ${dep}: ${dependencies[dep]}`, 'green');
        } else {
          colorLog(`❌ ${dep}: NO INSTALADO`, 'red');
        }
      });
    } catch (error) {
      colorLog(`❌ Error leyendo package.json: ${error.message}`, 'red');
    }
  }
  
  // Verificar estructura de directorios
  colorLog('\n📁 Verificando estructura de directorios:', 'blue');
  const dirs = [
    'logs',
    'uploads',
    'temp',
  ];
  
  dirs.forEach(dir => {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath)) {
      colorLog(`✅ ${dir}/`, 'green');
    } else {
      colorLog(`❌ ${dir}/ - NO EXISTE`, 'red');
    }
  });
  
  // Resumen
  colorLog('\n📊 ===== RESUMEN =====', 'cyan');
  
  if (allFilesExist) {
    colorLog('✅ Todos los archivos del sistema de contacto están presentes', 'green');
  } else {
    colorLog('❌ Faltan algunos archivos del sistema de contacto', 'red');
  }
  
  if (!fs.existsSync(configEnv)) {
    colorLog('⚠️  El sistema de contacto funcionará en modo simulado (sin envío real de correos)', 'yellow');
    colorLog('   Para habilitar el envío real, configura config.env', 'yellow');
  } else {
    colorLog('✅ Archivo config.env encontrado', 'green');
  }
  
  colorLog('\n🚀 Para probar el sistema:', 'blue');
  colorLog('   1. npm start', 'blue');
  colorLog('   2. Visita http://localhost:3000/contacto', 'blue');
  colorLog('   3. Completa el formulario de contacto', 'blue');
  
  colorLog('\n🔧 ===== FIN VERIFICACIÓN =====', 'cyan');
}

// Ejecutar verificación
checkConfig();
