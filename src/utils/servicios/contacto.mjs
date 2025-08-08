import { sanitize } from '../seguridad/sanitize.mjs';
import { validarEmail } from '../seguridad/validate.mjs';
import { registrar } from './logger.mjs';
import { auditar } from './loggerAuditoria.mjs';
import { prepararCorreo } from './mail.mjs';
import config from '../../config/index.mjs';

/**
 * Procesa un formulario de contacto
 * @param {Object} datos - Datos del formulario
 * @param {string} datos.nombre - Nombre del remitente
 * @param {string} datos.email - Email del remitente
 * @param {string} datos.asunto - Asunto del mensaje
 * @param {string} datos.mensaje - Contenido del mensaje
 * @param {string} ip - IP del remitente
 * @param {string} userAgent - User agent del navegador
 * @returns {Object} Resultado del procesamiento
 */
export async function procesarFormularioContacto(datos, ip, userAgent) {
  try {
    // Sanitizar y validar datos
    const nombre = sanitize.text(datos.nombre || '', 100);
    const email = sanitize.email(datos.email || '');
    const asunto = sanitize.text(datos.asunto || '', 200);
    const mensaje = sanitize.text(datos.mensaje || '', 2000);

    // Validaciones
    if (!nombre || nombre.length < 2) {
      return {
        success: false,
        error: 'El nombre debe tener al menos 2 caracteres',
      };
    }

    if (!validarEmail(email)) {
      return {
        success: false,
        error: 'Email inválido',
      };
    }

    if (!asunto || asunto.length < 5) {
      return {
        success: false,
        error: 'El asunto debe tener al menos 5 caracteres',
      };
    }

    if (!mensaje || mensaje.length < 10) {
      return {
        success: false,
        error: 'El mensaje debe tener al menos 10 caracteres',
      };
    }

    // Preparar datos del correo
    const correoData = {
      to: config.EMAIL.ADMIN,
      subject: `📬 Nuevo mensaje de contacto: ${asunto}`,
      template: 'contacto',
      data: {
        nombre,
        email,
        asunto,
        mensaje,
        ip,
        userAgent,
        fecha: new Date().toISOString(),
      },
    };

    // Enviar correo
    const resultadoCorreo = await prepararCorreo(correoData, ip);

    if (!resultadoCorreo.success) {
      registrar(`Error al enviar correo de contacto: ${resultadoCorreo.error}`, 'error');
      return {
        success: false,
        error: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.',
      };
    }

    // Registrar en auditoría
    auditar({
      tipo: 'contacto',
      usuario: email,
      ip,
      mensaje: `Nuevo mensaje de contacto de ${nombre}`,
      datos: { asunto, longitudMensaje: mensaje.length },
      agente: userAgent,
    });

    registrar(`Mensaje de contacto enviado desde ${email}`, 'info');

    return {
      success: true,
      message: 'Mensaje enviado correctamente. Te responderemos pronto.',
    };
  } catch (error) {
    registrar(`Error procesando formulario de contacto: ${error.message}`, 'error');
    return {
      success: false,
      error: 'Error interno del servidor. Por favor, inténtalo de nuevo.',
    };
  }
}

/**
 * Valida un formulario de contacto antes del procesamiento
 * @param {Object} datos - Datos del formulario
 * @returns {Object} Resultado de la validación
 */
export function validarFormularioContacto(datos) {
  const errores = [];

  // Validar nombre
  if (!datos.nombre || datos.nombre.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }

  // Validar email
  if (!datos.email || !validarEmail(datos.email)) {
    errores.push('Email inválido');
  }

  // Validar asunto
  if (!datos.asunto || datos.asunto.trim().length < 5) {
    errores.push('El asunto debe tener al menos 5 caracteres');
  }

  // Validar mensaje
  if (!datos.mensaje || datos.mensaje.trim().length < 10) {
    errores.push('El mensaje debe tener al menos 10 caracteres');
  }

  // Validar longitud máxima
  if (datos.nombre && datos.nombre.length > 100) {
    errores.push('El nombre es demasiado largo');
  }

  if (datos.asunto && datos.asunto.length > 200) {
    errores.push('El asunto es demasiado largo');
  }

  if (datos.mensaje && datos.mensaje.length > 2000) {
    errores.push('El mensaje es demasiado largo');
  }

  return {
    isValid: errores.length === 0,
    errors: errores,
  };
}
