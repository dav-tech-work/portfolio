import { registrar } from './logger.mjs';
import { auditar } from './loggerAuditoria.mjs';
import config from '../../config/index.mjs';
import { sanitize } from '../seguridad/sanitize.mjs';
import { validarEmail } from '../seguridad/validate.mjs';

/**
 * Prepara y envía un correo electrónico
 * @param {Object} correoData - Datos del correo
 * @param {string} correoData.to - Destinatario (puede ser múltiple separado por comas)
 * @param {string} correoData.subject - Asunto
 * @param {string} correoData.template - Plantilla a usar
 * @param {Object} correoData.data - Datos para la plantilla
 * @param {string} ip - IP del remitente (opcional)
 * @returns {Object} Resultado del envío
 */
export async function prepararCorreo(correoData, ip = null) {
  try {
    // Sanitizar datos
    const to = sanitize.email(correoData.to);
    const subject = sanitize.text(correoData.subject || '', 200);
    const template = sanitize.text(correoData.template || '', 50);
    const data = sanitize.json(correoData.data || {});

    // Validaciones básicas
    if (!to || !validarEmail(to)) {
      return {
        success: false,
        error: 'Email de destinatario inválido',
      };
    }

    if (!subject || subject.length < 3) {
      return {
        success: false,
        error: 'Asunto inválido',
      };
    }

    // Verificar si el email está habilitado
    if (!config.EMAIL.ENABLED) {
      console.log('📧 CORREO SIMULADO (EMAIL DESHABILITADO):');
      console.log('Para:', to);
      console.log('Asunto:', subject);
      console.log('Plantilla:', template);
      console.log('Datos:', JSON.stringify(data, null, 2));

      registrar(`Correo simulado enviado a ${to} (email deshabilitado)`, 'info');

      return {
        success: true,
        message: 'Correo simulado - email deshabilitado',
      };
    }

    // Enviar correo real
    const resultado = await enviarCorreoReal({
      to,
      subject,
      template,
      data,
    });

    if (!resultado.success) {
      registrar(`Error enviando correo: ${resultado.error}`, 'error');
      return resultado;
    }

    // Registrar en auditoría
    auditar({
      tipo: 'email_enviado',
      usuario: to,
      ip: ip || 'sistema',
      mensaje: `Correo enviado: ${subject}`,
      datos: { template, destinatario: to },
      agente: 'sistema',
    });

    registrar(`Correo enviado exitosamente a ${to}`, 'info');

    return {
      success: true,
      message: 'Correo enviado correctamente',
    };
  } catch (error) {
    registrar(`Error enviando correo: ${error.message}`, 'error');

    return {
      success: false,
      error: 'Error al enviar el correo',
    };
  }
}

/**
 * Función para enviar correo real con nodemailer
 * @param {Object} correoData - Datos del correo
 * @returns {Promise<Object>} Resultado del envío
 */
async function enviarCorreoReal(correoData) {
  try {
    const { default: nodemailer } = await import('nodemailer');

    // Crear transporter con configuración de Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Usar servicio predefinido de Gmail
      auth: {
        user: config.EMAIL.USER,
        pass: config.EMAIL.PASS,
      },
      // Configuración adicional para Gmail
      tls: {
        rejectUnauthorized: false,
      },
      // Configuración para evitar problemas de certificados
      secure: false, // Usar STARTTLS en lugar de SSL directo
    });

    // Verificar conexión
    await transporter.verify();
    registrar('Conexión SMTP verificada correctamente', 'info');

    // Generar HTML del correo
    const html = await generarHTML(correoData.template, correoData.data);

    // Configurar opciones del correo
    const mailOptions = {
      from: `"Portfolio Daniel Arribas" <${config.EMAIL.FROM}>`,
      to: correoData.to,
      subject: correoData.subject,
      html: html,
      text: generarTextoPlano(correoData.template, correoData.data), // Versión texto plano
    };

    // Enviar correo
    const info = await transporter.sendMail(mailOptions);

    registrar(`Correo enviado con ID: ${info.messageId}`, 'info');

    return {
      success: true,
      messageId: info.messageId,
      message: 'Correo enviado correctamente',
    };
  } catch (error) {
    registrar(`Error en enviarCorreoReal: ${error.message}`, 'error');

    return {
      success: false,
      error: `Error al enviar correo: ${error.message}`,
    };
  }
}

/**
 * Genera el HTML del correo basado en la plantilla
 * @param {string} template - Nombre de la plantilla
 * @param {Object} data - Datos para la plantilla
 * @returns {string} HTML del correo
 */
async function generarHTML(template, data) {
  const plantillas = {
    contacto: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuevo mensaje de contacto</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 15px; }
          .field strong { color: #667eea; }
          .message { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📬 Nuevo mensaje de contacto</h1>
          </div>
          <div class="content">
            <div class="field">
              <strong>Nombre:</strong> ${data.nombre || 'N/A'}
            </div>
            <div class="field">
              <strong>Email:</strong> ${data.email || 'N/A'}
            </div>
            <div class="field">
              <strong>Asunto:</strong> ${data.asunto || 'N/A'}
            </div>
            <div class="field">
              <strong>Mensaje:</strong>
              <div class="message">
                ${data.mensaje || 'N/A'}
              </div>
            </div>
            <div class="footer">
              <p><strong>Información adicional:</strong></p>
              <p>IP: ${data.ip || 'N/A'}</p>
              <p>Fecha: ${data.fecha || new Date().toISOString()}</p>
              <p>User Agent: ${data.userAgent || 'N/A'}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    bienvenida: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Bienvenido!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido!</h1>
          </div>
          <p>Hola ${data.nombre || 'Usuario'},</p>
          <p>Gracias por registrarte en nuestra plataforma.</p>
          <p>Esperamos que disfrutes de nuestros servicios.</p>
        </div>
      </body>
      </html>
    `,
    resetPassword: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablecer contraseña</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Restablecer contraseña</h1>
          </div>
          <p>Has solicitado restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para continuar:</p>
          <a href="${data.resetUrl || '#'}" class="button">Restablecer contraseña</a>
          <p>Este enlace expirará en 1 hora.</p>
        </div>
      </body>
      </html>
    `,
  };

  return plantillas[template] || plantillas.contacto;
}

/**
 * Genera versión texto plano del correo
 * @param {string} template - Nombre de la plantilla
 * @param {Object} data - Datos para la plantilla
 * @returns {string} Texto plano del correo
 */
function generarTextoPlano(template, data) {
  const plantillas = {
    contacto: `
Nuevo mensaje de contacto

Nombre: ${data.nombre || 'N/A'}
Email: ${data.email || 'N/A'}
Asunto: ${data.asunto || 'N/A'}

Mensaje:
${data.mensaje || 'N/A'}

---
Información adicional:
IP: ${data.ip || 'N/A'}
Fecha: ${data.fecha || new Date().toISOString()}
User Agent: ${data.userAgent || 'N/A'}
    `,
    bienvenida: `
¡Bienvenido!

Hola ${data.nombre || 'Usuario'},

Gracias por registrarte en nuestra plataforma.
Esperamos que disfrutes de nuestros servicios.
    `,
    resetPassword: `
Restablecer contraseña

Has solicitado restablecer tu contraseña.

Haz clic en el siguiente enlace para continuar:
${data.resetUrl || '#'}

Este enlace expirará en 1 hora.
    `,
  };

  return plantillas[template] || plantillas.contacto;
}

/**
 * Enviar email de verificación
 * @param {string} userEmail - Email del usuario
 * @param {string} verificationToken - Token de verificación
 * @param {string} ip - IP del usuario (opcional)
 * @returns {Promise<Object>} Resultado del envío
 */
export async function enviarEmailVerificacion(userEmail, verificationToken, ip = null) {
  try {
    const verificationUrl = `${config.SERVER.HOST || 'http://localhost:3000'}/auth/verify-email/${verificationToken}`;

    const emailData = {
      to: userEmail,
      subject: 'Verificación de Email - Portfolio Daniel Arribas',
      template: 'email-verification',
      data: {
        verificationUrl,
        userEmail,
        appName: 'Portfolio Daniel Arribas',
        supportEmail: config.EMAIL.ADMIN,
      },
    };

    registrar(`Enviando email de verificación a ${userEmail}`, 'info');
    return await prepararCorreo(emailData, ip);
  } catch (error) {
    registrar(`Error enviando email de verificación: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Enviar email de recuperación de contraseña
 * @param {string} userEmail - Email del usuario
 * @param {string} resetToken - Token de recuperación
 * @param {string} ip - IP del usuario (opcional)
 * @returns {Promise<Object>} Resultado del envío
 */
export async function enviarEmailRecuperacion(userEmail, resetToken, ip = null) {
  try {
    const resetUrl = `${config.SERVER.HOST || 'http://localhost:3000'}/auth/reset-password/${resetToken}`;

    const emailData = {
      to: userEmail,
      subject: 'Recuperación de Contraseña - Portfolio Daniel Arribas',
      template: 'password-reset',
      data: {
        resetUrl,
        userEmail,
        appName: 'Portfolio Daniel Arribas',
        supportEmail: config.EMAIL.ADMIN,
      },
    };

    registrar(`Enviando email de recuperación a ${userEmail}`, 'info');
    return await prepararCorreo(emailData, ip);
  } catch (error) {
    registrar(`Error enviando email de recuperación: ${error.message}`, 'error');
    throw error;
  }
}
