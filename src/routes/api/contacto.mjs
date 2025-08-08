import express from 'express';
import {
  sanitizeRequest,
  validateAndSanitizeEmail,
  validateAndSanitizeName,
  validateAndSanitizeMessage,
} from '../../middleware/sanitizer-advanced.mjs';
import { procesarFormularioContacto } from '../../utils/servicios/contacto.mjs';

const router = express.Router();

/**
 * Endpoint de prueba muy simple sin middleware
 */
router.get('/simple', (req, res) => {
  res.json({
    success: true,
    message: 'API de contacto funcionando - endpoint simple',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Endpoint de prueba simple sin middleware
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API de contacto funcionando - endpoint de prueba',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Endpoint de prueba con middleware
 */
router.get('/test-with-middleware', sanitizeRequest, (req, res) => {
  res.json({
    success: true,
    message: 'API de contacto funcionando - endpoint con middleware',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Endpoint API para contacto
 */
router.post('/', sanitizeRequest, async (req, res) => {
  try {
    const { nombre, email, asunto, mensaje } = req.body;

    // Validar y sanitizar datos
    const nombreValidation = validateAndSanitizeName(nombre);
    const emailValidation = validateAndSanitizeEmail(email);
    const mensajeValidation = validateAndSanitizeMessage(mensaje);

    // Verificar si hay errores de validación
    const errors = [];
    if (!nombreValidation.valid) errors.push(nombreValidation.error);
    if (!emailValidation.valid) errors.push(emailValidation.error);
    if (!mensajeValidation.valid) errors.push(mensajeValidation.error);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: errors,
      });
    }

    // Preparar datos para el servicio
    const contactoData = {
      nombre: nombreValidation.value,
      email: emailValidation.value,
      asunto: asunto || 'Consulta desde el formulario de contacto',
      mensaje: mensajeValidation.value,
    };

    // Procesar el formulario usando el servicio
    const resultado = await procesarFormularioContacto(
      contactoData,
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent')
    );

    if (resultado.success) {
      res.json({
        success: true,
        message: resultado.message,
        data: {
          nombre: contactoData.nombre,
          email: contactoData.email,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: resultado.error,
      });
    }
  } catch (error) {
    console.error('❌ Error en endpoint de contacto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message,
    });
  }
});

/**
 * Endpoint GET para verificar estado del API de contacto
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de contacto funcionando correctamente',
    timestamp: new Date().toISOString(),
    endpoints: {
      POST: '/api/contacto - Enviar mensaje de contacto',
      GET: '/api/contacto - Verificar estado del API',
    },
  });
});

export default router;
