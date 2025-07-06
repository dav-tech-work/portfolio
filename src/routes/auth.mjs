/**
 * Rutas de Autenticación con Base de Datos
 * @description Sistema completo de autenticación usando MongoDB
 */

import { Router } from 'express';
import User from '../models/User.mjs';
import { asyncHandler } from '../middleware/errorHandler.mjs';
import { validateUserData } from '../utils/validation/schemas.mjs';

const router = Router();

/**
 * GET /auth/login - Mostrar formulario de login
 */
router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'Iniciar Sesión',
    error: req.flash('error'),
    success: req.flash('success'),
    csrfToken: req.csrfToken(),
  });
});

/**
 * POST /auth/login - Procesar login
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password, remember } = req.body;

    try {
      // Validar datos de entrada
      if (!email || !password) {
        req.flash('error', 'Email y contraseña son requeridos');
        return res.redirect('/auth/login');
      }

      // Autenticar usuario
      const authResult = await User.authenticate(email, password);

      if (!authResult.success) {
        // Log de intento de login fallido
        console.warn(`🔒 Login fallido para ${email} desde ${req.ip}`);

        req.flash('error', authResult.message);
        return res.redirect('/auth/login');
      }

      // Login exitoso
      console.log(`✅ Login exitoso para ${email} desde ${req.ip}`);

      // Configurar sesión
      req.session.user = {
        id: authResult.user._id,
        email: authResult.user.email,
        name: authResult.user.name,
        role: authResult.user.role,
        avatar: authResult.user.avatar,
        preferences: authResult.user.preferences,
      };

      // Configurar cookie de remember me
      if (remember) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
      }

      req.flash('success', `¡Bienvenido, ${authResult.user.name}!`);

      // Redireccionar a la página solicitada o al dashboard
      const redirectTo = req.session.returnTo || '/';
      delete req.session.returnTo;

      res.redirect(redirectTo);
    } catch (error) {
      console.error('❌ Error en login:', error.message);
      req.flash('error', 'Error interno del servidor');
      res.redirect('/auth/login');
    }
  })
);

/**
 * GET /auth/register - Mostrar formulario de registro
 */
router.get('/register', (req, res) => {
  res.render('auth/register', {
    title: 'Registrarse',
    error: req.flash('error'),
    success: req.flash('success'),
    csrfToken: req.csrfToken(),
  });
});

/**
 * POST /auth/register - Procesar registro
 */
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password, confirmPassword, username, terms } = req.body;

    try {
      // Validar que se aceptaron los términos
      if (!terms) {
        req.flash('error', 'Debes aceptar los términos y condiciones');
        return res.redirect('/auth/register');
      }

      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        req.flash('error', 'Las contraseñas no coinciden');
        return res.redirect('/auth/register');
      }

      // Validar datos del usuario
      const validation = validateUserData({
        name,
        email,
        password,
        username: username || undefined,
      });

      if (!validation.isValid) {
        req.flash('error', validation.errors.join('. '));
        return res.redirect('/auth/register');
      }

      // Crear usuario
      const userData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        username: username ? username.trim() : undefined,
        role: 'user',
        status: 'active',
        emailVerified: false,
        metadata: {
          registrationIp: req.ip,
          userAgent: req.get('User-Agent'),
          registrationDate: new Date(),
        },
      };

      const user = await User.create(userData);

      console.log(`✅ Usuario registrado: ${user.email} desde ${req.ip}`);

      // Generar token de verificación de email
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // TODO: Enviar email de verificación
      console.log(`📧 Token de verificación para ${user.email}: ${verificationToken}`);

      req.flash('success', 'Registro exitoso. Te hemos enviado un email de verificación.');
      res.redirect('/auth/login');
    } catch (error) {
      console.error('❌ Error en registro:', error.message);

      if (
        error.message.includes('ya está registrado') ||
        error.message.includes('ya está en uso')
      ) {
        req.flash('error', error.message);
      } else {
        req.flash('error', 'Error en el registro. Inténtalo de nuevo.');
      }

      res.redirect('/auth/register');
    }
  })
);

/**
 * GET /auth/profile - Mostrar perfil del usuario
 */
router.get(
  '/profile',
  asyncHandler(async (req, res) => {
    if (!req.session.user) {
      req.flash('error', 'Debes iniciar sesión para ver tu perfil');
      return res.redirect('/auth/login');
    }

    try {
      // Obtener datos actualizados del usuario
      const user = await User.findById(req.session.user.id);

      if (!user) {
        req.flash('error', 'Usuario no encontrado');
        return res.redirect('/auth/login');
      }

      res.render('auth/profile', {
        title: 'Mi Perfil',
        user: user.toJSON(),
        error: req.flash('error'),
        success: req.flash('success'),
        csrfToken: req.csrfToken(),
      });
    } catch (error) {
      console.error('❌ Error cargando perfil:', error.message);
      req.flash('error', 'Error cargando el perfil');
      res.redirect('/');
    }
  })
);

/**
 * POST /auth/profile - Actualizar perfil del usuario
 */
router.post(
  '/profile',
  asyncHandler(async (req, res) => {
    if (!req.session.user) {
      req.flash('error', 'Debes iniciar sesión');
      return res.redirect('/auth/login');
    }

    try {
      const { name, username, currentPassword, newPassword, confirmPassword } = req.body;

      const user = await User.findById(req.session.user.id);
      if (!user) {
        req.flash('error', 'Usuario no encontrado');
        return res.redirect('/auth/login');
      }

      let updated = false;

      // Actualizar nombre
      if (name && name.trim() !== user.name) {
        user.name = name.trim();
        updated = true;
      }

      // Actualizar username
      if (username && username.trim() !== user.username) {
        // Verificar que el username no esté en uso
        const existingUser = await User.findByUsername(username.trim());
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
          req.flash('error', 'El username ya está en uso');
          return res.redirect('/auth/profile');
        }

        user.username = username.trim();
        updated = true;
      }

      // Cambiar contraseña
      if (newPassword && newPassword.trim()) {
        if (!currentPassword) {
          req.flash('error', 'Debes proporcionar tu contraseña actual');
          return res.redirect('/auth/profile');
        }

        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
          req.flash('error', 'Contraseña actual incorrecta');
          return res.redirect('/auth/profile');
        }

        if (newPassword !== confirmPassword) {
          req.flash('error', 'Las nuevas contraseñas no coinciden');
          return res.redirect('/auth/profile');
        }

        // Validar nueva contraseña
        const passwordValidation = validateUserData({ password: newPassword });
        if (!passwordValidation.isValid) {
          req.flash('error', passwordValidation.errors.join('. '));
          return res.redirect('/auth/profile');
        }

        user.password = newPassword;
        await user.hashPassword();
        updated = true;
      }

      if (updated) {
        await user.save();

        // Actualizar datos de sesión
        req.session.user.name = user.name;
        req.session.user.username = user.username;

        req.flash('success', 'Perfil actualizado exitosamente');
      } else {
        req.flash('error', 'No se realizaron cambios');
      }

      res.redirect('/auth/profile');
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error.message);
      req.flash('error', 'Error actualizando el perfil');
      res.redirect('/auth/profile');
    }
  })
);

/**
 * POST /auth/logout - Cerrar sesión
 */
router.post('/logout', (req, res) => {
  const userEmail = req.session.user?.email || 'Usuario desconocido';

  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Error cerrando sesión:', err);
      req.flash('error', 'Error al cerrar sesión');
      return res.redirect('/');
    }

    console.log(`👋 Usuario ${userEmail} cerró sesión desde ${req.ip}`);
    res.clearCookie('sessionId');
    res.redirect('/');
  });
});

/**
 * GET /auth/verify-email/:token - Verificar email
 */
router.get(
  '/verify-email/:token',
  asyncHandler(async (req, res) => {
    const { token } = req.params;

    try {
      // Buscar usuario con el token
      const user = await User.findOne({ emailVerificationToken: token });

      if (!user) {
        req.flash('error', 'Token de verificación inválido o expirado');
        return res.redirect('/auth/login');
      }

      // Verificar token JWT
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.purpose !== 'email_verification' || decoded.email !== user.email) {
          throw new Error('Token inválido');
        }
      } catch (error) {
        req.flash('error', 'Token de verificación expirado');
        return res.redirect('/auth/login');
      }

      // Verificar email
      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      console.log(`✅ Email verificado para ${user.email}`);

      req.flash('success', '¡Email verificado exitosamente! Ya puedes iniciar sesión.');
      res.redirect('/auth/login');
    } catch (error) {
      console.error('❌ Error verificando email:', error.message);
      req.flash('error', 'Error en la verificación del email');
      res.redirect('/auth/login');
    }
  })
);

/**
 * GET /auth/forgot-password - Formulario de recuperación de contraseña
 */
router.get('/forgot-password', (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Recuperar Contraseña',
    error: req.flash('error'),
    success: req.flash('success'),
    csrfToken: req.csrfToken(),
  });
});

/**
 * POST /auth/forgot-password - Procesar recuperación de contraseña
 */
router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    try {
      if (!email) {
        req.flash('error', 'Email es requerido');
        return res.redirect('/auth/forgot-password');
      }

      const user = await User.findByEmail(email);

      // Siempre mostrar el mismo mensaje (seguridad)
      const successMessage =
        'Si el email está registrado, recibirás instrucciones para recuperar tu contraseña.';

      if (user) {
        const resetToken = user.generatePasswordResetToken();
        await user.save();

        console.log(`🔑 Token de reset para ${user.email}: ${resetToken}`);
        // TODO: Enviar email con token de reset
      }

      req.flash('success', successMessage);
      res.redirect('/auth/forgot-password');
    } catch (error) {
      console.error('❌ Error en forgot password:', error.message);
      req.flash('error', 'Error procesando la solicitud');
      res.redirect('/auth/forgot-password');
    }
  })
);

/**
 * GET /auth/reset-password/:token - Formulario de reset de contraseña
 */
router.get(
  '/reset-password/:token',
  asyncHandler(async (req, res) => {
    const { token } = req.params;

    try {
      // Verificar token
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.purpose !== 'password_reset') {
        req.flash('error', 'Token inválido');
        return res.redirect('/auth/login');
      }

      const user = await User.findByEmail(decoded.email);
      if (!user || user.passwordResetToken !== token) {
        req.flash('error', 'Token inválido o expirado');
        return res.redirect('/auth/login');
      }

      res.render('auth/reset-password', {
        title: 'Restablecer Contraseña',
        token,
        error: req.flash('error'),
        success: req.flash('success'),
        csrfToken: req.csrfToken(),
      });
    } catch (error) {
      console.error('❌ Error validando token de reset:', error.message);
      req.flash('error', 'Token inválido o expirado');
      res.redirect('/auth/login');
    }
  })
);

/**
 * POST /auth/reset-password/:token - Procesar reset de contraseña
 */
router.post(
  '/reset-password/:token',
  asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    try {
      if (password !== confirmPassword) {
        req.flash('error', 'Las contraseñas no coinciden');
        return res.redirect(`/auth/reset-password/${token}`);
      }

      // Verificar token
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findByEmail(decoded.email);
      if (!user || user.passwordResetToken !== token) {
        req.flash('error', 'Token inválido o expirado');
        return res.redirect('/auth/login');
      }

      // Validar nueva contraseña
      const validation = validateUserData({ password });
      if (!validation.isValid) {
        req.flash('error', validation.errors.join('. '));
        return res.redirect(`/auth/reset-password/${token}`);
      }

      // Actualizar contraseña
      user.password = password;
      await user.hashPassword();
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      console.log(`🔑 Contraseña restablecida para ${user.email}`);

      req.flash('success', 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.');
      res.redirect('/auth/login');
    } catch (error) {
      console.error('❌ Error restableciendo contraseña:', error.message);
      req.flash('error', 'Error restableciendo la contraseña');
      res.redirect('/auth/login');
    }
  })
);

/**
 * GET /auth/users - Listar usuarios (solo admin)
 */
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
      req.flash('error', 'Acceso denegado');
      return res.redirect('/');
    }

    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const status = req.query.status || '';
      const role = req.query.role || '';

      const options = {
        page,
        limit,
        filter: {
          ...(search && { search }),
          ...(status && { status }),
          ...(role && { role }),
        },
      };

      const result = await User.list(options);
      const stats = await User.getStats();

      res.render('auth/users', {
        title: 'Gestión de Usuarios',
        users: result.users,
        pagination: result.pagination,
        stats: stats.general,
        filters: { search, status, role },
        error: req.flash('error'),
        success: req.flash('success'),
        csrfToken: req.csrfToken(),
      });
    } catch (error) {
      console.error('❌ Error listando usuarios:', error.message);
      req.flash('error', 'Error cargando usuarios');
      res.redirect('/');
    }
  })
);

export default router;
