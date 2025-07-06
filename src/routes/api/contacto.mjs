import express from 'express';
import {
  procesarFormularioContacto,
  prepararCorreo,
  registrar,
} from '../../utils/servicios/index.mjs';
import config from '../../config/index.mjs';
import { body, validationResult } from 'express-validator';
import asyncHandler from '../../utils/asyncHandler.mjs';

const router = express.Router();

// Validaciones para el formulario de contacto
const validateContacto = [
  body('email').isEmail().normalizeEmail().withMessage('Email debe ser válido'),
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  body('mensaje')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('El mensaje debe tener entre 10 y 1000 caracteres'),
];

router.post(
  '/contacto',
  express.json(),
  validateContacto,
  asyncHandler(async (req, res) => {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array(),
      });
    }

    // Los datos ya están validados
    const resultado = procesarFormularioContacto(req);

    if (!resultado.ok) {
      registrar(`❌ Formulario inválido: ${resultado.error}`, 'warn');
      return res.status(400).json({ error: resultado.error });
    }

    const correo = prepararCorreo({
      de: resultado.datos.email,
      para: config.EMAIL.ADMIN,
      asunto: '📬 Nuevo mensaje desde el formulario de contacto',
      mensaje: resultado.datos.mensaje,
    });

    if (!correo.ok) {
      registrar(`❌ Error al preparar correo: ${correo.error}`, 'error');
      return res.status(500).json({ error: correo.error });
    }

    registrar(`📨 Formulario procesado y correo preparado desde ${resultado.datos.email}`, 'info');

    res.json({
      mensaje: '✅ Formulario recibido correctamente',
      datos: resultado.datos,
    });
  })
);

router.get('/email', (_req, res) => {
  res.json({ email: config.EMAIL.ADMIN });
});

export default router;
