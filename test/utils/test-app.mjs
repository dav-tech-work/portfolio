#!/usr/bin/env node

/**
 * Configuración de Aplicación para Tests
 * @description Configura una instancia de Express para testing que refleja la aplicación real
 * @author Daniel Arribas Velazquez
 * @version 2.0.0
 */

import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno para tests
dotenv.config({ path: './config.env' });

// Función para crear aplicación de test
export function createTestApp() {
  const app = express();

  // Ocultar cabecera x-powered-by
  app.disable('x-powered-by');

  // Configurar sesiones para tests
  app.use(
    session({
      secret: 'test-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'strict',
      },
    })
  );

  // Middleware para cookies seguras
  app.use((req, res, next) => {
    // Establecer cookie de sesión segura para tests
    res.cookie('sessionId', 'test-session-id', {
      httpOnly: true,
      secure: false, // false para tests, true en producción
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });
    next();
  });

  // Middlewares básicos
  app.use(compression()); // Agregar compresión para tests de rendimiento
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Configurar motor de plantillas
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../../views'));

  // Configurar archivos estáticos (como en la aplicación real)
  app.use('/assets', express.static(path.join(__dirname, '../../public/assets')));
  app.use(express.static(path.join(__dirname, '../../public')));

  // Rate limiting básico para tests
  const requestCounts = new Map();
  app.use((req, res, next) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const windowMs = 60000; // 1 minuto

    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, []);
    }

    const requests = requestCounts.get(ip);
    const validRequests = requests.filter(time => now - time < windowMs);
    requestCounts.set(ip, validRequests);

    if (validRequests.length >= 1000) { // Límite más alto para tests
      return res.status(429).json({ error: 'Too many requests' });
    }

    validRequests.push(now);
    next();
  });

  // Middleware de headers de seguridad básicos (como en la aplicación real)
  app.use((req, res, next) => {
    // Asegurar que los headers se establezcan en cada respuesta
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");

    // Asegurar que el header X-XSS-Protection no sea sobrescrito
    res.on('finish', () => {
      if (!res.getHeader('X-XSS-Protection')) {
        res.setHeader('X-XSS-Protection', '1; mode=block');
      }
    });

    next();
  });

  // Middleware de sanitización básico para tests de seguridad
  app.use((req, res, next) => {
    // Sanitizar body
    if (req.body) {
      const sanitizeValue = (value) => {
        if (typeof value === 'string') {
          // No sanitizar emails válidos
          if (value.includes('@') && value.includes('.')) {
            return value;
          }
          return value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '&lt;script&gt;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        }
        return value;
      };

      const sanitizeObject = (obj) => {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              sanitizeObject(obj[key]);
            } else {
              obj[key] = sanitizeValue(obj[key]);
            }
          }
        }
      };

      sanitizeObject(req.body);
    }
    next();
  });

  // Middleware de idioma (simulado)
  app.use((req, res, next) => {
    req.idioma = req.headers['accept-language']?.includes('en') ? 'en' : 'es';
    req.traducciones = {}; // Traducciones simuladas

    // Variables globales que necesitan las plantillas
    res.locals.nonce = 'test-nonce-123';
    res.locals.csrfToken = 'test-csrf-token';
    res.locals.mensaje = '';
    res.locals.error = null;
    res.locals.success = null;
    res.locals.user = null; // Usuario no autenticado por defecto
    res.locals.isAuthenticated = false;
    res.locals.t = {
      home: {
        title: 'Daniel Arribas Velázquez',
        subtitle: 'Administrador de Sistemas • Especialista en Seguridad'
      }
    };

    next();
  });

  // Rutas principales que reflejan la aplicación real
  app.get('/', (req, res) => {
    res.render('pages/index', {
      titulo: 'Portafolio de Daniel Arribas',
      idioma: req.idioma || 'es',
      t: req.traducciones || {},
      tipo: 'home',
      onepage: req.query.onepage === 'true',
    });
  });

  app.get('/proyectos', (req, res) => {
    res.render('pages/proyectos', {
      titulo: 'Proyectos - Daniel Arribas',
      idioma: req.idioma || 'es',
      t: req.traducciones || {},
      tipo: 'proyectos',
    });
  });

  app.get('/curriculum', (req, res) => {
    res.render('pages/about', {
      titulo: 'Currículum - Daniel Arribas',
      idioma: req.idioma || 'es',
      t: req.traducciones || {},
      tipo: 'curriculum',
    });
  });

  app.get('/formacion', (req, res) => {
    res.render('pages/formacion', {
      titulo: 'Formación - Daniel Arribas',
      idioma: req.idioma || 'es',
      t: req.traducciones || {},
      tipo: 'formacion',
    });
  });

  app.get('/contacto', (req, res) => {
    res.render('pages/contacto', {
      titulo: 'Contacto - Daniel Arribas',
      idioma: req.idioma || 'es',
      t: req.traducciones || {},
      tipo: 'contacto',
      mensajeExito: req.query.success,
      mensajeError: req.query.error,
    });
  });

  app.get('/about', (req, res) => {
    res.render('pages/about', {
      titulo: 'Sobre Mí - Daniel Arribas',
      idioma: req.idioma || 'es',
      t: req.traducciones || {},
      tipo: 'about',
    });
  });

  app.get('/construccion', (req, res) => {
    res.render('pages/construccion', {
      titulo: 'En Construcción - Daniel Arribas',
      idioma: req.idioma || 'es',
      t: req.traducciones || {},
      tipo: 'construccion',
    });
  });

  // Rutas de formación (como en la aplicación real)
  app.get('/formacion/html', (req, res) => {
    res.render('pages/formacion/html', {
      titulo: 'HTML - Daniel Arribas',
      idioma: req.idioma || 'es',
      t: req.traducciones || {},
      tipo: 'html',
    });
  });

  app.get('/formacion/javascript/teoria', (req, res) => {
    res.render('pages/formacion/javascript_teoria', {
      titulo: 'JavaScript - Teoría - Daniel Arribas',
      idioma: req.idioma || 'es',
      t: req.traducciones || {},
      tipo: 'javascript_teoria',
    });
  });

  app.get('/formacion/javascript/practicas', (req, res) => {
    res.render('pages/formacion/javascript_practicas', {
      titulo: 'JavaScript - Prácticas - Daniel Arribas',
      idioma: req.idioma || 'es',
      t: req.traducciones || {},
      tipo: 'javascript_practicas',
    });
  });

  app.get('/formacion/python/teoria', (req, res) => {
    res.render('pages/formacion/python_teoria', {
      titulo: 'Python - Teoría - Daniel Arribas',
      idioma: req.idioma || 'es',
      t: req.traducciones || {},
      tipo: 'python_teoria',
    });
  });

  app.get('/formacion/python/practicas', (req, res) => {
    res.render('pages/formacion/python_practicas', {
      titulo: 'Python - Prácticas - Daniel Arribas',
      idioma: req.idioma || 'es',
      t: req.traducciones || {},
      tipo: 'python_practicas',
    });
  });

  app.get('/formacion/sistemas', (req, res) => {
    // Como en la aplicación real, servir archivo HTML estático
    res.sendFile(path.join(__dirname, '../../public/pages/sistemas/practica_01_sistemas.html'));
  });

  app.get('/formacion/sistemas/practicas/practica_01_sistemas', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/pages/sistemas/practica_01_sistemas.html'));
  });

  // Rutas de autenticación (como en la aplicación real)
  app.get('/auth/login', (req, res) => {
    res.render('auth/login', {
      title: 'Iniciar Sesión',
      tipo: 'auth',
      idioma: req.idioma || 'es',
      t: req.traducciones || {},
      error: req.flash?.('error')?.[0],
      success: req.flash?.('success')?.[0],
    });
  });

  app.get('/auth/register', (req, res) => {
    res.render('auth/register', {
      title: 'Registrarse',
      tipo: 'auth',
      idioma: req.idioma || 'es',
      t: req.traducciones || {},
      error: req.flash?.('error')?.[0],
      success: req.flash?.('success')?.[0],
    });
  });

  app.get('/auth/profile', (req, res) => {
    res.render('auth/profile', {
      title: 'Mi Perfil',
      tipo: 'auth',
      idioma: req.idioma || 'es',
      t: req.traducciones || {},
    });
  });

  // API endpoints para tests
  app.get('/api/contacto', (req, res) => {
    res.json({ success: true, message: 'Contact API endpoint' });
  });

  app.post('/api/contacto', (req, res) => {
    res.json({ success: true, message: 'Contacto procesado', data: req.body });
  });

  app.get('/api/email', (req, res) => {
    res.json({ success: true, message: 'Email API endpoint' });
  });

  app.post('/api/email', (req, res) => {
    res.json({ success: true, message: 'Email enviado', data: req.body });
  });

  // Endpoint para detectar bots maliciosos
  app.get('/test-bot-detection', (req, res) => {
    const userAgent = req.headers['user-agent'];

    // Detectar bots maliciosos comunes
    if (userAgent && (
      userAgent.includes('bot') ||
      userAgent.includes('crawler') ||
      userAgent.includes('spider') ||
      userAgent.includes('scraper')
    )) {
      return res.status(403).json({ error: 'Bot detected' });
    }

    res.json({ message: 'Test endpoint' });
  });

  // Endpoint general para tests que incluye detección de bots
  app.get('/test', (req, res) => {
    const userAgent = req.headers['user-agent'];

    // Detectar bots maliciosos comunes
    if (userAgent && (
      userAgent.includes('bot') ||
      userAgent.includes('crawler') ||
      userAgent.includes('spider') ||
      userAgent.includes('scraper') ||
      userAgent.includes('sqlmap')
    )) {
      return res.status(403).json({ error: 'Bot detected' });
    }

    res.json({ message: 'Test endpoint' });
  });

  // Rutas de autenticación POST (como en la aplicación real)
  app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;

    // Validación básica para tests
    if (!email || !password) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: []
      });
    }

    // Simular validación de email
    if (!email.includes('@')) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: [{
          field: 'email',
          message: 'Invalid value',
          value: email
        }]
      });
    }

    res.json({ success: true, message: 'Login endpoint', data: { email } });
  });

  app.post('/auth/register', (req, res) => {
    const { email, password, username } = req.body;

    // Validación básica para tests
    if (!email || !password || !username) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: []
      });
    }

    // Simular validación de email
    if (!email.includes('@')) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: [{
          field: 'email',
          message: 'Invalid value',
          value: email
        }]
      });
    }

    // Simular validación de contraseña fuerte
    if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&!])[A-Za-z\d@$!%*?&!]/)) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: [{
          field: 'password',
          message: 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial',
          value: password
        }]
      });
    }

    res.json({ success: true, message: 'Register endpoint', data: { email, username } });
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Server is healthy'
    });
  });

  // Manejo de errores 404
  app.use((req, res) => {
    res.status(404).render('pages/error', {
      titulo: '404 - Página no encontrada',
      idioma: req.idioma || 'es',
      t: req.traducciones || {},
      mensaje: 'Página no encontrada',
      error: {
        code: 404,
        message: 'Página no encontrada'
      }
    });
  });

  return app;
}

// Exportar aplicación por defecto
export default createTestApp();
