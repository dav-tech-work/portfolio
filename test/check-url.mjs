#!/usr/bin/env node

console.log('🔧 Verificando valores de URL...');

console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);
console.log('file://${process.argv[1]}:', `file://${process.argv[1]}`);

const condition = import.meta.url === `file://${process.argv[1]}`;
console.log('Condición de arranque:', condition);

if (condition) {
  console.log('✅ La condición es verdadera, el servidor debería iniciarse');
} else {
  console.log('❌ La condición es falsa, el servidor NO se iniciará');
}

// Verificar si hay diferencias en el encoding
console.log('\n🔍 Análisis detallado:');
console.log('import.meta.url length:', import.meta.url.length);
console.log('process.argv[1] length:', process.argv[1].length);
console.log('file://${process.argv[1]} length:', `file://${process.argv[1]}`.length);

// Verificar caracteres especiales
console.log('\n🔍 Caracteres especiales:');
console.log('import.meta.url includes %3A:', import.meta.url.includes('%3A'));
console.log('process.argv[1] includes %3A:', process.argv[1].includes('%3A'));
