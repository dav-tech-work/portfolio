import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Carga el archivo de idioma correspondiente al código recibido.
 * Hace fallback a "es" si el idioma no existe o es inválido.
 * @param {string} idioma - Código del idioma, por ejemplo "es", "en", "pt-br".
 * @returns {Object} - Objeto con las traducciones o vacío si falla.
 */
export function cargarIdioma(idioma = 'es') {
  // Usar ruta absoluta desde la raíz del proyecto
  const projectRoot = path.resolve(__dirname, '../../../');
  const rutaIdioma = path.join(projectRoot, 'data', 'idiomas', `${idioma}.json`);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log(`📁 Buscando archivo de idioma: ${rutaIdioma}`);
  }

  try {
    const contenido = fs.readFileSync(rutaIdioma, 'utf8');
    const json = JSON.parse(contenido);

    // Validar que sea un objeto válido
    if (typeof json !== 'object' || Array.isArray(json)) {
      throw new Error('El contenido no es un objeto válido.');
    }

    return json;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`⚠️ Error al cargar '${idioma}.json': ${error.message}`);
    }

    // Fallback al español si no se encuentra el idioma
    if (idioma !== 'es') {
      return cargarIdioma('es');
    }
    return {};
  }
}

/**
 * Función externa para obtener traducciones.
 * @param {string} lang
 * @returns {Object} traducciones
 */
export function obtenerTraducciones(lang = 'es') {
  return cargarIdioma(lang);
}
