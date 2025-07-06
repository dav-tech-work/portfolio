/**
 * main.js - Punto de entrada principal para la carga de módulos JavaScript
 * Este archivo se encarga de importar dinámicamente todos los módulos necesarios
 * para la aplicación, manteniendo un solo punto de entrada en el HTML.
 */

// Lista de módulos a cargar, en el orden deseado
const scripts = [
  // Utilidades generales
  'js/utilidad/index.js',
  'js/utilidad/crear-usuario.js',
  'js/utilidad/tareas.js',

  // Personalización
  'js/personalizacion/idioma.js',
  'js/personalizacion/tema.js',
];

/**
 * Carga un script dinámicamente
 * @param {string} src - Ruta del script a cargar
 * @returns {Promise} Promesa que se resuelve cuando el script se ha cargado
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.type = 'module';
    script.async = false; // Importante para mantener el orden de carga
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Error al cargar el script: ${src}`));
    document.body.appendChild(script);
  });
}

/**
 * Inicializa la carga de todos los scripts
 */
async function initializeScripts() {
  try {
    for (const script of scripts) {
      await loadScript(script);
      console.log(`Script cargado: ${script}`);
    }
    console.log('Todos los scripts se han cargado correctamente');

    // Opcional: Ejecutar cualquier inicialización necesaria después de cargar todos los scripts
    if (window.initApp && typeof window.initApp === 'function') {
      window.initApp();
    }
  } catch (error) {
    console.error('Error al cargar los scripts:', error);
  }
}

// Iniciar la carga de scripts cuando el DOM esté completamente cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeScripts);
} else {
  initializeScripts();
}
