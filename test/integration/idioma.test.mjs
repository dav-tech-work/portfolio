#!/usr/bin/env node

/**
 * Script de prueba para verificar la funcionalidad del cambio de idioma
 * @author Daniel Arribas Velázquez
 * @version 1.0.0
 */

console.log('🧪 PRUEBA DE FUNCIONALIDAD DE IDIOMA');
console.log('='.repeat(50));

try {
  const { cargarIdioma } = await import('../../src/utils/idioma/index.mjs');

  console.log('✅ Importación exitosa');

  // Probar carga de diferentes idiomas
  const idiomas = ['es', 'en', 'cat'];

  for (const idioma of idiomas) {
    console.log(`\n📋 Probando idioma: ${idioma}`);

    try {
      const traducciones = cargarIdioma(idioma);

      if (traducciones && Object.keys(traducciones).length > 0) {
        console.log(`✅ Traducciones cargadas correctamente para ${idioma}`);
        console.log(`   - Título: ${traducciones.meta?.title || 'No encontrado'}`);
        console.log(`   - Navegación: ${traducciones.navigation?.home || 'No encontrado'}`);
      } else {
        console.log(`❌ No se pudieron cargar las traducciones para ${idioma}`);
      }
    } catch (error) {
      console.log(`❌ Error al cargar ${idioma}: ${error.message}`);
    }
  }
} catch (error) {
  console.log(`❌ Error en la importación: ${error.message}`);
}

console.log('\n' + '='.repeat(50));
console.log('✅ Prueba completada');
