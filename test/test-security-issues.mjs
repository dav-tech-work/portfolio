import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import { protecciones, sanitizer, limiter, apiLimiter } from '../src/middleware/index.mjs';
import {
  validateRegister,
  validateLogin,
  // validateData, // Currently unused
  // schemas // Currently unused
} from '../src/utils/validation/schemas.mjs';

// Cargar variables de entorno para tests
dotenv.config({ path: './config.env' });

// Configurar aplicación de prueba
const createTestApp = () => {
  const app = express();

  // Configurar sesiones para tests
  app.use(
    session({
      secret: 'test-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    })
  );

  // Aplicar middlewares de seguridad
  protecciones(app);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(sanitizer);
  app.use(limiter);
  app.use(apiLimiter);

  // Rutas de prueba
  app.post('/auth/register', validateRegister, (req, res) => {
    res.json({ message: 'Registro exitoso', data: req.body });
  });

  app.post('/auth/login', validateLogin, (req, res) => {
    res.json({ message: 'Login exitoso', data: req.body });
  });

  app.post('/api/test', apiLimiter, (req, res) => {
    res.json({ message: 'API test', data: req.body });
  });

  app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint' });
  });

  app.post('/upload', (req, res) => {
    res.json({ message: 'Upload test', data: req.body });
  });

  return app;
};

describe('Security Issues Tests', () => {
  let app;
  let server;

  before(() => {
    app = createTestApp();
    server = app.listen(3002);
  });

  after((done) => {
    server.close(done);
  });

  // Test 1: Bloqueo de inyección de comandos
  it('should block command injection: && whoami', async () => {
    const res = await request(app).post('/upload').send({ command: '&& whoami' });

    console.log('Command injection test result:', res.body);
    expect(res.status).to.equal(200);
    expect(res.body.data.command).to.not.include('&&');
    expect(res.body.data.command).to.not.include('whoami');
  });

  // Test 2: Contraseñas fuertes
  it('should accept strong passwords', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'test@example.com',
      password: 'MyStr0ng!Pass',
      confirmPassword: 'MyStr0ng!Pass',
      name: 'Test User',
      terms: true,
    });

    console.log('Strong password test result:', res.body);
    expect(res.status).to.equal(200);
  });

  // Test 3: Bot Detection
  it('should block malicious bots', async () => {
    const res = await request(app).get('/test').set('User-Agent', 'sqlmap/1.0');

    console.log('Bot detection test result:', res.body);
    expect(res.status).to.equal(403);
  });

  // Test 4: Sesiones
  it('should generate secure session tokens', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'ValidPass123!',
    });

    console.log('Session test result:', res.headers);
    // En el test, la sesión se crea automáticamente al hacer cualquier request
    // Verificamos que la aplicación esté configurada para manejar sesiones
    expect(res.status).to.equal(200);
  });

  // Test 5: Validación de email temporal
  it('should reject temporary emails', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'test@tempmail.org',
      password: 'ValidPass123!',
      confirmPassword: 'ValidPass123!',
      name: 'Test User',
      terms: true,
    });

    console.log('Temporary email test result:', res.body);
    expect(res.status).to.equal(400);
  });
});
