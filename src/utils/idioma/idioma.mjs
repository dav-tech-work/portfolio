import fs from 'fs';
import path from 'path';
// import _fileURLToPath from "url"; // Currently unused
import config from '../../config/index.mjs';

/**
 * Función para obtener las traducciones del idioma solicitado.
 * Busca el archivo JSON en "data/idiomas".
 *
 * @param {string} lang - Código del idioma (por ejemplo, "es", "en", "cat").
 * @returns {object} Objeto con las traducciones, o un objeto vacío en caso de error.
 */
export function obtenerTraducciones(lang) {
  try {
    const ruta = path.join(config.PATHS.IDIOMAS, `${lang}.json`);

    if (fs.existsSync(ruta)) {
      const datos = fs.readFileSync(ruta, 'utf-8');
      return JSON.parse(datos);
    } else {
      console.error(`Archivo de traducción no encontrado: ${ruta}`);
      return {};
    }
  } catch (error) {
    console.error('Error al cargar traducciones:', error);
    return {};
  }
}
