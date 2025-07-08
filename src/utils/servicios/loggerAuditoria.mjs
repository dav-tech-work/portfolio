// loggerAuditoria.mjs
import fs from 'fs';
import path from 'path';

import config from '../../config/index.mjs';

// const __filename = fileURLToPath(import.meta.url); // Currently unused
// const _dirname = path.dirname(__filename); // Currently unused

// Crear carpeta de logs de auditoría si no existe
const auditLogsPath = path.join(config.PATHS.LOGS, 'audit');
if (!fs.existsSync(auditLogsPath)) {
  fs.mkdirSync(auditLogsPath, { recursive: true });
}

/**
 * Registra un evento de auditoría
 * @param {Object} evento - Objeto con información del evento
 * @param {string} evento.tipo - Tipo de evento (login, logout, create, update, delete, etc.)
 * @param {string} evento.usuario - ID o email del usuario
 * @param {string} evento.ip - IP del usuario
 * @param {string} evento.mensaje - Descripción del evento
 * @param {Object} evento.datos - Datos adicionales del evento
 * @param {string} evento.agente - User agent del navegador
 */
export function auditar(evento) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      ...evento,
    };

    const fecha = timestamp.split('T')[0];
    const logPath = path.join(auditLogsPath, `audit-${fecha}.log`);

    const logLine = JSON.stringify(logEntry) + '\n';

    fs.appendFileSync(logPath, logLine);
  } catch (error) {
    console.error('Error al escribir log de auditoría:', error);
  }
}

/**
 * Busca eventos de auditoría por criterios
 * @param {Object} criterios - Criterios de búsqueda
 * @param {string} criterios.tipo - Tipo de evento
 * @param {string} criterios.usuario - Usuario
 * @param {string} criterios.fechaDesde - Fecha desde (YYYY-MM-DD)
 * @param {string} criterios.fechaHasta - Fecha hasta (YYYY-MM-DD)
 * @returns {Array} Array de eventos encontrados
 */
export function buscarAuditoria(criterios = {}) {
  const eventos = [];

  try {
    const archivos = fs.readdirSync(auditLogsPath);

    for (const archivo of archivos) {
      if (!archivo.startsWith('audit-') || !archivo.endsWith('.log')) continue;

      const fechaArchivo = archivo.replace('audit-', '').replace('.log', '');

      // Filtrar por fecha si se especifica
      if (criterios.fechaDesde && fechaArchivo < criterios.fechaDesde) continue;
      if (criterios.fechaHasta && fechaArchivo > criterios.fechaHasta) continue;

      const logPath = path.join(auditLogsPath, archivo);
      const contenido = fs.readFileSync(logPath, 'utf-8');

      const lineas = contenido.trim().split('\n');

      for (const linea of lineas) {
        if (!linea.trim()) continue;

        try {
          const evento = JSON.parse(linea);

          // Aplicar filtros
          if (criterios.tipo && evento.tipo !== criterios.tipo) continue;
          if (criterios.usuario && evento.usuario !== criterios.usuario) continue;

          eventos.push(evento);
        } catch (parseError) {
          console.error('Error al parsear línea de auditoría:', parseError);
        }
      }
    }
  } catch (error) {
    console.error('Error al buscar auditoría:', error);
  }

  return eventos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Limpia logs de auditoría antiguos
 * @param {number} dias - Número de días a mantener
 */
export function limpiarAuditoriaAntigua(dias = 30) {
  try {
    const archivos = fs.readdirSync(auditLogsPath);
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    for (const archivo of archivos) {
      if (!archivo.startsWith('audit-') || !archivo.endsWith('.log')) continue;

      const fechaArchivo = archivo.replace('audit-', '').replace('.log', '');
      const fechaArchivoObj = new Date(fechaArchivo);

      if (fechaArchivoObj < fechaLimite) {
        const logPath = path.join(auditLogsPath, archivo);
        fs.unlinkSync(logPath);
        console.log(`Log de auditoría eliminado: ${archivo}`);
      }
    }
  } catch (error) {
    console.error('Error al limpiar auditoría antigua:', error);
  }
}
