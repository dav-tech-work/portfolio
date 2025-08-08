#!/usr/bin/env node

/**
 * Debug de configuración
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Debug de configuración...\n');

// Cargar config.env manualmente
const configPath = path.join(__dirname, '..', 'config.env');
console.log('📁 Ruta del archivo config.env:', configPath);
console.log('📁 ¿Existe el archivo?', fs.existsSync(configPath));

if (fs.existsSync(configPath)) {
  console.log('\n📄 Contenido del archivo config.env:');
  const content = fs.readFileSync(configPath, 'utf8');
  console.log(content);

  console.log('\n🔍 Variables de entorno antes de cargar:');
  console.log('SESSION_SECRET:', process.env.SESSION_SECRET);
  console.log('JWT_SECRET:', process.env.JWT_SECRET);

  // Cargar dotenv
  dotenv.config({ path: configPath });

  console.log('\n🔍 Variables de entorno después de cargar:');
  console.log('SESSION_SECRET:', process.env.SESSION_SECRET);
  console.log('JWT_SECRET:', process.env.JWT_SECRET);

  console.log('\n📏 Longitudes:');
  console.log('SESSION_SECRET length:', process.env.SESSION_SECRET?.length);
  console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);

  // Verificar si hay caracteres especiales
  if (process.env.SESSION_SECRET) {
    console.log('\n🔍 Análisis de SESSION_SECRET:');
    console.log(
      'Contiene espacios al inicio/final:',
      process.env.SESSION_SECRET !== process.env.SESSION_SECRET.trim()
    );
    console.log('Contiene saltos de línea:', process.env.SESSION_SECRET.includes('\n'));
    console.log('Contiene retornos de carro:', process.env.SESSION_SECRET.includes('\r'));
  }

  if (process.env.JWT_SECRET) {
    console.log('\n🔍 Análisis de JWT_SECRET:');
    console.log(
      'Contiene espacios al inicio/final:',
      process.env.JWT_SECRET !== process.env.JWT_SECRET.trim()
    );
    console.log('Contiene saltos de línea:', process.env.JWT_SECRET.includes('\n'));
    console.log('Contiene retornos de carro:', process.env.JWT_SECRET.includes('\r'));
  }
} else {
  console.log('❌ El archivo config.env no existe');
}
