#!/usr/bin/env node

/**
 * Script para corregir automáticamente errores de ESLint comunes
 */

import fs from 'fs';
import path from 'path';

// Función para corregir variables no utilizadas
function fixUnusedVariables(content, _filePath) {
  let modified = false;

  // Patrones para variables no utilizadas
  const patterns = [
    // Variables importadas no utilizadas
    {
      regex: /import\s+{\s*([^}]+)\s*}\s+from\s+['"][^'"]+['"]/g,
      fix: (match, imports) => {
        const importList = imports.split(',').map((i) => i.trim());
        const usedImports = importList.filter((imp) => {
          const varName = imp.split(' as ')[0].trim();
          return (
            content.includes(varName) && !content.match(new RegExp(`\\b${varName}\\s*=\\s*[^;]+;`))
          );
        });
        if (usedImports.length !== importList.length) {
          modified = true;
          return `import { ${usedImports.join(', ')} } from '${match.match(/from\s+['"]([^'"]+)['"]/)[1]}'`;
        }
        return match;
      },
    },
    // Variables declaradas no utilizadas
    {
      regex: /const\s+(\w+)\s*=\s*[^;]+;/g,
      fix: (match, varName) => {
        if (
          !content.includes(varName) ||
          content.match(new RegExp(`\\b${varName}\\s*=\\s*[^;]+;`))
        ) {
          modified = true;
          return `const _${varName} = ${match.split('=')[1]}`;
        }
        return match;
      },
    },
  ];

  patterns.forEach((pattern) => {
    content = content.replace(pattern.regex, pattern.fix);
  });

  return { content, modified };
}

// Función para corregir caracteres de escape innecesarios
function fixUnnecessaryEscapes(content) {
  let modified = false;

  // Caracteres que no necesitan escape en regex
  const unnecessaryEscapes = [
    { from: '\\/', to: '/' },
    { from: '\\[', to: '[' },
    { from: '\\]', to: ']' },
    { from: '\\?', to: '?' },
    { from: '\\&', to: '&' },
    { from: '\\=', to: '=' },
    { from: '\\.', to: '.' },
    { from: '\\#', to: '#' },
    { from: '\\!', to: '!' },
    { from: '\\-', to: '-' },
  ];

  unnecessaryEscapes.forEach((escape) => {
    if (content.includes(escape.from)) {
      content = content.replace(new RegExp(escape.from.replace(/\\/g, '\\\\'), 'g'), escape.to);
      modified = true;
    }
  });

  return { content, modified };
}

// Función para corregir parámetros no utilizados
function fixUnusedParameters(content) {
  let modified = false;

  // Patrón para parámetros de función no utilizados
  const paramPattern = /function\s+\w+\s*\(([^)]+)\)/g;
  content = content.replace(paramPattern, (match, params) => {
    const paramList = params.split(',').map((p) => p.trim());
    const fixedParams = paramList.map((param) => {
      const paramName = param.split('=')[0].trim();
      if (!content.includes(paramName) || paramName.startsWith('_')) {
        return param;
      }
      modified = true;
      return `_${paramName}`;
    });
    return `function ${match.match(/function\s+(\w+)/)[1]}(${fixedParams.join(', ')})`;
  });

  return { content, modified };
}

// Función para procesar un archivo
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;

    // Aplicar correcciones
    const unusedVars = fixUnusedVariables(newContent, filePath);
    newContent = unusedVars.content;
    modified = modified || unusedVars.modified;

    const escapes = fixUnnecessaryEscapes(newContent);
    newContent = escapes.content;
    modified = modified || escapes.modified;

    const params = fixUnusedParameters(newContent);
    newContent = params.content;
    modified = modified || params.modified;

    // Guardar si se modificó
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Corregido: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función para procesar directorio recursivamente
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let totalFixed = 0;

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      totalFixed += processDirectory(filePath);
    } else if (file.endsWith('.mjs') || file.endsWith('.js')) {
      if (processFile(filePath)) {
        totalFixed++;
      }
    }
  });

  return totalFixed;
}

// Función principal
function main() {
  console.log('🔧 Corrigiendo errores de ESLint automáticamente...');
  console.log('================================================');

  const directories = ['src', 'scripts', 'test'];
  let totalFixed = 0;

  directories.forEach((dir) => {
    if (fs.existsSync(dir)) {
      console.log(`\n📁 Procesando directorio: ${dir}`);
      totalFixed += processDirectory(dir);
    }
  });

  console.log(`\n✅ Proceso completado. ${totalFixed} archivos corregidos.`);
  console.log('\n💡 Ejecuta "npm run lint" para verificar los cambios.');
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { processFile, processDirectory, main };
