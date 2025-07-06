import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Middleware para verificar JWT
export const verifyToken = (req, res, next) => {
  const token =
    req.headers.authorization?.split(' ')[1] || req.cookies?.token || req.session?.token;

  if (!token) {
    return res.status(401).json({
      error: 'Token de acceso requerido',
      message: 'Debes iniciar sesión para acceder a este recurso',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error verificando token:', error.message);
    return res.status(401).json({
      error: 'Token inválido',
      message: 'Tu sesión ha expirado, por favor inicia sesión nuevamente',
    });
  }
};

// Middleware para verificar roles
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Debes iniciar sesión para acceder a este recurso',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para acceder a este recurso',
      });
    }

    next();
  };
};

// Función para generar JWT
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'fallback_secret',
    {
      expiresIn: process.env.TOKEN_EXPIRES_IN || '24h',
    }
  );
};

// Función para hashear contraseñas
export const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

// Función para verificar contraseñas
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Middleware para verificar si el usuario está autenticado (para vistas)
export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    res.locals.user = req.session.user;
    res.locals.isAuthenticated = true;
  } else {
    res.locals.isAuthenticated = false;
  }
  next();
};

// Middleware para requerir autenticación en vistas
export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    req.flash('error', 'Debes iniciar sesión para acceder a esta página');
    return res.redirect('/login');
  }
  next();
};

// Middleware para verificar si el usuario ya está autenticado (evitar acceso a login/register)
export const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
};
