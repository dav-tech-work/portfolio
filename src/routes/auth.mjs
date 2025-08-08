/**
 * Rutas de Autenticación Simplificada
 * @description Sistema básico de autenticación sin base de datos (solo para desarrollo)
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger-production.mjs';
import { sanitizeRequest } from '../middleware/sanitizer-advanced.mjs';

const router = Router();

// Sistema básico de usuarios en memoria (solo para desarrollo)
const users = new Map();

// Usuario por defecto configurable por entorno (sin secretos en código)
users.set('admin', {
  id: '1',
  username: 'admin',
  email: 'admin@example.com',
  // Proveer hash vía variable de entorno DEFAULT_ADMIN_PASSWORD_HASH para uso local
  passwordHash: process.env.DEFAULT_ADMIN_PASSWORD_HASH || '',
  isActive: true,
  role: 'admin',
});

/**
 * GET /auth/login - Mostrar formulario de login
 */
router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'Iniciar Sesión',
    tipo: 'auth',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    error: req.flash('error')[0],
    success: req.flash('success')[0],
  });
});

/**
 * POST /auth/login - Procesar login
 */
router.post('/login', sanitizeRequest, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar entrada
    if (!email || !password) {
      req.flash('error', 'Email y contraseña son requeridos');
      return res.redirect('/auth/login');
    }

    // Buscar usuario por email
    const user = Array.from(users.values()).find((u) => u.email === email);

    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      req.flash('error', 'Credenciales inválidas');
      return res.redirect('/auth/login');
    }

    if (!user.isActive) {
      req.flash('error', 'Cuenta desactivada');
      return res.redirect('/auth/login');
    }

    // Establecer sesión
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    logger.info(`Usuario ${user.username} inició sesión desde ${req.ip}`);
    req.flash('success', 'Sesión iniciada correctamente');
    res.redirect('/');
  } catch (error) {
    logger.error('Error en login:', error);
    req.flash('error', 'Error interno del servidor');
    res.redirect('/auth/login');
  }
});

/**
 * GET /auth/register - Mostrar formulario de registro
 */
router.get('/register', (req, res) => {
  res.render('auth/register', {
    title: 'Registrarse',
    tipo: 'auth',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    error: req.flash('error')[0],
    success: req.flash('success')[0],
  });
});

/**
 * POST /auth/register - Procesar registro
 */
router.post('/register', sanitizeRequest, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validar entrada
    if (!username || !email || !password) {
      req.flash('error', 'Todos los campos son requeridos');
      return res.redirect('/auth/register');
    }

    // Verificar si el usuario ya existe
    const existingUser = Array.from(users.values()).find(
      (u) => u.email === email || u.username === username
    );
    if (existingUser) {
      req.flash('error', 'El usuario ya existe');
      return res.redirect('/auth/register');
    }

    // Crear nuevo usuario
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      passwordHash: hashedPassword,
      isActive: true,
      role: 'user',
    };

    users.set(username, newUser);

    logger.info(`Nuevo usuario registrado: ${username} (${email})`);
    req.flash('success', 'Registro exitoso. Puedes iniciar sesión.');
    res.redirect('/auth/login');
  } catch (error) {
    logger.error('Error en registro:', error);
    req.flash('error', 'Error interno del servidor');
    res.redirect('/auth/register');
  }
});

/**
 * POST /auth/logout - Cerrar sesión
 */
router.post('/logout', (req, res) => {
  const username = req.session.user?.username;

  req.session.destroy((err) => {
    if (err) {
      logger.error('Error al cerrar sesión:', err);
      req.flash('error', 'Error al cerrar sesión');
    } else {
      logger.info(`Usuario ${username} cerró sesión`);
    }
    res.redirect('/');
  });
});

/**
 * GET /auth/profile - Ver perfil (requiere autenticación)
 */
router.get('/profile', (req, res) => {
  if (!req.session.user) {
    req.flash('error', 'Debes iniciar sesión');
    return res.redirect('/auth/login');
  }

  res.render('auth/profile', {
    title: 'Mi Perfil',
    tipo: 'auth',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    user: req.session.user,
    error: req.flash('error')[0],
    success: req.flash('success')[0],
  });
});

export default router;
