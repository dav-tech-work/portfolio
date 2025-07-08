import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { registrar } from './logger.mjs';
import { auditar } from './loggerAuditoria.mjs';
import { sanitize } from '../seguridad/sanitize.mjs';
import config from '../../config/index.mjs';

// Configurar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const carpetaUploads = path.join(__dirname, '..', '..', '..', 'uploads');

if (!fs.existsSync(carpetaUploads)) {
  fs.mkdirSync(carpetaUploads, { recursive: true });
}

/**
 * Guarda un archivo subido
 * @param {Object} archivo - Objeto del archivo (multer)
 * @param {string} carpeta - Carpeta de destino
 * @param {string} ip - IP del usuario
 * @returns {Object} Resultado del guardado
 */
export async function guardarArchivo(archivo, carpeta = 'uploads', ip = null) {
  try {
    if (!archivo) {
      return {
        success: false,
        error: 'No se proporcionó ningún archivo',
      };
    }

    // Validar tipo de archivo
    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!tiposPermitidos.includes(archivo.mimetype)) {
      return {
        success: false,
        error: 'Tipo de archivo no permitido',
      };
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (archivo.size > maxSize) {
      return {
        success: false,
        error: 'El archivo es demasiado grande (máximo 5MB)',
      };
    }

    // Sanitizar nombre del archivo
    const nombreOriginal = sanitize.filename(archivo.originalname);
    const extension = path.extname(nombreOriginal);
    const nombreBase = path.basename(nombreOriginal, extension);

    // Generar nombre único
    const timestamp = Date.now();
    const nombreUnico = `${nombreBase}_${timestamp}${extension}`;

    // Crear carpeta si no existe
    const carpetaDestino = path.join(config.PATHS.UPLOADS, carpeta);
    if (!fs.existsSync(carpetaDestino)) {
      fs.mkdirSync(carpetaDestino, { recursive: true });
    }

    // Ruta completa del archivo
    const rutaArchivo = path.join(carpetaDestino, nombreUnico);

    // Mover archivo
    await fs.promises.copyFile(archivo.path, rutaArchivo);
    await fs.promises.unlink(archivo.path); // Eliminar archivo temporal

    // Registrar en auditoría
    auditar({
      tipo: 'archivo_subido',
      usuario: ip || 'anonimo',
      ip,
      mensaje: `Archivo subido: ${nombreOriginal}`,
      datos: {
        nombreOriginal,
        nombreUnico,
        tamaño: archivo.size,
        tipo: archivo.mimetype,
        carpeta,
      },
      agente: 'sistema',
    });

    registrar(`Archivo guardado: ${nombreUnico}`, 'info');

    return {
      success: true,
      nombreOriginal,
      nombreUnico,
      ruta: `/uploads/${carpeta}/${nombreUnico}`,
      tamaño: archivo.size,
      tipo: archivo.mimetype,
    };
  } catch (error) {
    registrar(`Error guardando archivo: ${error.message}`, 'error');

    return {
      success: false,
      error: 'Error al guardar el archivo',
    };
  }
}

/**
 * Elimina un archivo
 * @param {string} rutaArchivo - Ruta del archivo a eliminar
 * @param {string} ip - IP del usuario
 * @returns {Object} Resultado de la eliminación
 */
export async function eliminarArchivo(rutaArchivo, ip = null) {
  try {
    if (!rutaArchivo) {
      return {
        success: false,
        error: 'No se proporcionó ruta del archivo',
      };
    }

    // Sanitizar ruta
    const rutaSanitizada = sanitize.filename(rutaArchivo);
    const rutaCompleta = path.join(config.PATHS.UPLOADS, rutaSanitizada);

    // Verificar que el archivo existe
    if (!fs.existsSync(rutaCompleta)) {
      return {
        success: false,
        error: 'El archivo no existe',
      };
    }

    // Verificar que está dentro de la carpeta de uploads
    const rutaReal = path.resolve(rutaCompleta);
    const uploadsReal = path.resolve(config.PATHS.UPLOADS);

    if (!rutaReal.startsWith(uploadsReal)) {
      return {
        success: false,
        error: 'Acceso denegado',
      };
    }

    // Eliminar archivo
    await fs.promises.unlink(rutaCompleta);

    // Registrar en auditoría
    auditar({
      tipo: 'archivo_eliminado',
      usuario: ip || 'anonimo',
      ip,
      mensaje: `Archivo eliminado: ${rutaArchivo}`,
      datos: { rutaArchivo },
      agente: 'sistema',
    });

    registrar(`Archivo eliminado: ${rutaArchivo}`, 'info');

    return {
      success: true,
      message: 'Archivo eliminado correctamente',
    };
  } catch (error) {
    registrar(`Error eliminando archivo: ${error.message}`, 'error');

    return {
      success: false,
      error: 'Error al eliminar el archivo',
    };
  }
}

/**
 * Obtiene información de un archivo
 * @param {string} rutaArchivo - Ruta del archivo
 * @returns {Object} Información del archivo
 */
export async function obtenerInfoArchivo(rutaArchivo) {
  try {
    if (!rutaArchivo) {
      return {
        success: false,
        error: 'No se proporcionó ruta del archivo',
      };
    }

    const rutaSanitizada = sanitize.filename(rutaArchivo);
    const rutaCompleta = path.join(config.PATHS.UPLOADS, rutaSanitizada);

    // Verificar que el archivo existe
    if (!fs.existsSync(rutaCompleta)) {
      return {
        success: false,
        error: 'El archivo no existe',
      };
    }

    // Obtener estadísticas del archivo
    const stats = await fs.promises.stat(rutaCompleta);

    return {
      success: true,
      nombre: path.basename(rutaCompleta),
      ruta: rutaArchivo,
      tamaño: stats.size,
      fechaCreacion: stats.birthtime,
      fechaModificacion: stats.mtime,
      esDirectorio: stats.isDirectory(),
    };
  } catch (error) {
    registrar(`Error obteniendo info del archivo: ${error.message}`, 'error');

    return {
      success: false,
      error: 'Error al obtener información del archivo',
    };
  }
}

/**
 * Lista archivos en una carpeta
 * @param {string} carpeta - Carpeta a listar
 * @param {number} limite - Número máximo de archivos
 * @returns {Object} Lista de archivos
 */
export async function listarArchivos(carpeta = '', limite = 50) {
  try {
    const carpetaCompleta = path.join(config.PATHS.UPLOADS, carpeta);

    // Verificar que la carpeta existe
    if (!fs.existsSync(carpetaCompleta)) {
      return {
        success: false,
        error: 'La carpeta no existe',
      };
    }

    // Verificar que está dentro de la carpeta de uploads
    const rutaReal = path.resolve(carpetaCompleta);
    const uploadsReal = path.resolve(config.PATHS.UPLOADS);

    if (!rutaReal.startsWith(uploadsReal)) {
      return {
        success: false,
        error: 'Acceso denegado',
      };
    }

    const archivos = await fs.promises.readdir(carpetaCompleta);
    const archivosInfo = [];

    for (const archivo of archivos.slice(0, limite)) {
      const rutaArchivo = path.join(carpetaCompleta, archivo);
      const stats = await fs.promises.stat(rutaArchivo);

      archivosInfo.push({
        nombre: archivo,
        ruta: path.join(carpeta, archivo),
        tamaño: stats.size,
        fechaModificacion: stats.mtime,
        esDirectorio: stats.isDirectory(),
      });
    }

    return {
      success: true,
      archivos: archivosInfo,
      total: archivos.length,
    };
  } catch (error) {
    registrar(`Error listando archivos: ${error.message}`, 'error');

    return {
      success: false,
      error: 'Error al listar archivos',
    };
  }
}

/**
 * Limpia archivos temporales antiguos
 * @param {number} horas - Horas de antigüedad para considerar temporal
 * @returns {Object} Resultado de la limpieza
 */
export async function limpiarArchivosTemporales(horas = 24) {
  try {
    const carpetaTemp = config.PATHS.TEMP;
    if (!fs.existsSync(carpetaTemp)) {
      return {
        success: true,
        eliminados: 0,
        message: 'No hay carpeta temporal',
      };
    }

    const archivos = await fs.promises.readdir(carpetaTemp);
    const ahora = new Date();
    const limite = new Date(ahora.getTime() - horas * 60 * 60 * 1000);
    let eliminados = 0;

    for (const archivo of archivos) {
      const rutaArchivo = path.join(carpetaTemp, archivo);
      const stats = await fs.promises.stat(rutaArchivo);

      if (stats.mtime < limite) {
        await fs.promises.unlink(rutaArchivo);
        eliminados++;
      }
    }

    registrar(`${eliminados} archivos temporales eliminados`, 'info');

    return {
      success: true,
      eliminados,
      message: `${eliminados} archivos temporales eliminados`,
    };
  } catch (error) {
    registrar(`Error limpiando archivos temporales: ${error.message}`, 'error');

    return {
      success: false,
      error: 'Error al limpiar archivos temporales',
    };
  }
}
