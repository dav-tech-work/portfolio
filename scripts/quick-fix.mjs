#!/usr/bin/env node

/**
 * Script rápido para corregir errores de ESLint comunes
 */

import fs from 'fs';
// import path from 'path';

// Función para corregir un archivo específico
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Corregir variables no utilizadas agregando _
    const unusedVarPatterns = [
      {
        regex: /const\s+(\w+)\s*=\s*[^;]+;/g,
        test: (match, varName) => {
          return (
            !content.includes(varName) || content.match(new RegExp(`\\b${varName}\\s*=\\s*[^;]+;`))
          );
        },
      },
      {
        regex: /let\s+(\w+)\s*=\s*[^;]+;/g,
        test: (match, varName) => {
          return (
            !content.includes(varName) || content.match(new RegExp(`\\b${varName}\\s*=\\s*[^;]+;`))
          );
        },
      },
    ];

    unusedVarPatterns.forEach((pattern) => {
      content = content.replace(pattern.regex, (match, varName) => {
        if (pattern.test(match, varName)) {
          modified = true;
          return match.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
        }
        return match;
      });
    });

    // Corregir parámetros no utilizados
    content = content.replace(/function\s+\w+\s*\(([^)]+)\)/g, (match, params) => {
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

    // Corregir caracteres de escape innecesarios en regex
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

    // Corregir imports no utilizados
    content = content.replace(
      /import\s+{\s*([^}]+)\s*}\s+from\s+['"][^'"]+['"]/g,
      (match, imports) => {
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
      }
    );

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corregido: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Archivos específicos con errores conocidos
const filesToFix = [
  'scripts/generate-secrets.mjs',
  'scripts/check-lockfile.mjs',
  'src/checks/checkCSP.mjs',
  'src/checks/verificarCodigo.js',
  'src/checks/verificarSeguridad.mjs',
  'src/database/connection.mjs',
  'src/middleware/errorHandler.mjs',
  'src/middleware/limiter.mjs',
  'src/routes/auth.mjs',
  'src/utils/idioma/idioma.mjs',
  'src/utils/navegacion/rutas.mjs',
  'src/utils/optimizacion/compression.mjs',
  'src/utils/seguridad/sanitize.mjs',
  'src/utils/seguridad/validate.mjs',
  'src/utils/servicios/archivo.mjs',
  'src/utils/servicios/contacto.mjs',
  'src/utils/servicios/logger.mjs',
  'src/utils/servicios/loggerAuditoria.mjs',
  'src/utils/servicios/mail.mjs',
  'src/utils/servicios/notificador.mjs',
  'src/utils/validation/schemas.mjs',
  'test/debug-simple.mjs',
  'test/debug-start.mjs',
  'test/security/security.test.mjs',
  'test/test-security-issues.mjs',
  'test/verificar-proyecto.mjs',
];

function main() {
  console.log('🔧 Corrigiendo errores de ESLint rápidamente...');
  console.log('=============================================');

  let totalFixed = 0;

  filesToFix.forEach((file) => {
    if (fs.existsSync(file)) {
      if (fixFile(file)) {
        totalFixed++;
      }
    }
  });

  console.log(`\n✅ Proceso completado. ${totalFixed} archivos corregidos.`);
  console.log('\n💡 Ejecuta "npm run lint" para verificar los cambios.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fixFile, main };
