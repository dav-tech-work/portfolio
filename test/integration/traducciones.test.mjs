#!/usr/bin/env node

import { cargarIdioma, obtenerTraduccion, obtenerSeccion } from '../../src/utils/idioma/index.mjs';

/**
 * Script de prueba para verificar el sistema de traducciones
 */
function testTraducciones() {
  console.log('🧪 Probando sistema de traducciones...\n');

  // Probar carga de idiomas
  const idiomas = ['es', 'cat', 'en'];

  for (const idioma of idiomas) {
    console.log(`📋 Probando idioma: ${idioma}`);

    try {
      const traducciones = cargarIdioma(idioma);

      if (!traducciones || Object.keys(traducciones).length === 0) {
        console.log(`❌ Error: No se pudieron cargar las traducciones para ${idioma}`);
        continue;
      }

      console.log(`✅ Traducciones cargadas correctamente para ${idioma}`);

      // Probar acceso a secciones principales
      const secciones = ['meta', 'navigation', 'home', 'cv', 'projects', 'education', 'contact'];

      for (const seccion of secciones) {
        const seccionTraducciones = obtenerSeccion(traducciones, seccion);
        if (Object.keys(seccionTraducciones).length > 0) {
          console.log(`  ✅ Sección '${seccion}' encontrada`);
        } else {
          console.log(`  ⚠️ Sección '${seccion}' vacía o no encontrada`);
        }
      }

      // Probar acceso a traducciones específicas
      const pruebas = [
        { clave: 'navigation.home', descripcion: 'Navegación - Inicio' },
        { clave: 'home.title', descripcion: 'Home - Título' },
        { clave: 'cv.subtitle', descripcion: 'CV - Subtítulo' },
        { clave: 'projects.title', descripcion: 'Proyectos - Título' },
        { clave: 'education.title', descripcion: 'Educación - Título' },
        { clave: 'contact.title', descripcion: 'Contacto - Título' },
        { clave: 'meta.title', descripcion: 'Meta - Título' },
      ];

      for (const prueba of pruebas) {
        const traduccion = obtenerTraduccion(traducciones, prueba.clave, 'NO_ENCONTRADO');
        if (traduccion !== 'NO_ENCONTRADO') {
          console.log(`  ✅ ${prueba.descripcion}: "${traduccion.substring(0, 50)}..."`);
        } else {
          console.log(`  ❌ ${prueba.descripcion}: No encontrado`);
        }
      }

      // Probar acceso anidado
      const pruebasAnidadas = [
        { clave: 'home.sections.development.title', descripcion: 'Home - Sección Desarrollo' },
        { clave: 'cv.experience.title', descripcion: 'CV - Experiencia' },
        { clave: 'education.python.title', descripcion: 'Educación - Python' },
      ];

      for (const prueba of pruebasAnidadas) {
        const traduccion = obtenerTraduccion(traducciones, prueba.clave, 'NO_ENCONTRADO');
        if (traduccion !== 'NO_ENCONTRADO') {
          console.log(`  ✅ ${prueba.descripcion}: "${traduccion}"`);
        } else {
          console.log(`  ❌ ${prueba.descripcion}: No encontrado`);
        }
      }

      console.log(''); // Línea en blanco para separar idiomas
    } catch (error) {
      console.log(`❌ Error al probar ${idioma}: ${error.message}`);
    }
  }

  console.log('🏁 Pruebas completadas');
}

// Ejecutar pruebas
testTraducciones();
