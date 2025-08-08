#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Probando carga de configuración...');

// Cargar config.env desde la raíz del proyecto
const configPath = path.join(__dirname, '../config.env');
console.log('📁 Ruta del archivo:', configPath);
console.log('📁 Archivo existe:', fs.existsSync(configPath));

if (fs.existsSync(configPath)) {
  const content = fs.readFileSync(configPath, 'utf8');
  console.log('📄 Contenido del archivo:');
  console.log(content);

  // Cargar con dotenv
  const result = dotenv.config({ path: configPath });
  console.log('📦 Resultado de dotenv:', result);

  console.log('🔑 SESSION_SECRET:', process.env.SESSION_SECRET);
  console.log('🔑 SESSION_SECRET length:', process.env.SESSION_SECRET ? process.env.SESSION_SECRET.length : 'undefined');
  console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET);
  console.log('🔑 JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'undefined');
}
