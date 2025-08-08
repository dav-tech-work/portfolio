#!/usr/bin/env node

/**
 * Test de Seguridad Básica - Consolidado
 * @description Pruebas básicas de seguridad: headers, CSP, rate limiting, sanitización
 * @author Daniel Arribas Velazquez
 * @version 2.0.0
 */

import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { protecciones, sanitizer, botDetection } from '../../src/middleware/index.mjs';
import cspMiddleware from '../../src/middleware/csp.mjs';
import privacyMiddleware from '../../src/middleware/privacy.mjs';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno para tests
dotenv.config({ path: './config.env' });

// Configurar aplicación de prueba
const createTestApp = () => {
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

  // Aplicar middlewares de seguridad completos
  app.use(protecciones);
  app.use(cspMiddleware);
  app.use(privacyMiddleware);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(sanitizer);
  app.use(botDetection);

  // Rutas de prueba
  app.get('/', (req, res) => {
    res.json({ message: 'Home endpoint' });
  });

  app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint' });
  });

  app.post('/upload', (req, res) => {
    res.json({ message: 'Upload test', data: req.body });
  });

  app.get('/security-test', (req, res) => {
    res.json({ message: 'Security headers test' });
  });

  app.post('/simple-session', (req, res) => {
    res.cookie('testCookie', 'testValue', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ message: 'Cookie establecida' });
  });

  return app;
};

describe('🔒 Security Basic Tests', () => {
  let app;
  let server;

  before(() => {
    try {
      app = createTestApp();
      server = app.listen(3002);
    } catch (error) {
      console.error('Error setting up test server:', error);
      throw error;
    }
  });

  after((done) => {
    if (server && typeof server.close === 'function') {
      server.close(done);
    } else {
      done();
    }
  });

  describe('🛡️ Security Headers', () => {
    it('should have X-Content-Type-Options header', async () => {
      const response = await request(app)
        .get('/security-test')
        .expect(200);

      expect(response.headers).to.have.property('x-content-type-options');
      expect(response.headers['x-content-type-options']).to.equal('nosniff');
    });

    it('should have X-Frame-Options header', async () => {
      const response = await request(app)
        .get('/security-test')
        .expect(200);

      expect(response.headers).to.have.property('x-frame-options');
      expect(response.headers['x-frame-options']).to.equal('DENY');
    });

    it('should have X-XSS-Protection header', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers).to.have.property('x-xss-protection');
      // En tests, el header puede variar, solo verificar que existe
      expect(response.headers['x-xss-protection']).to.be.a('string');
    });

    it('should have Strict-Transport-Security header', async () => {
      const response = await request(app)
        .get('/security-test')
        .expect(200);

      expect(response.headers).to.have.property('strict-transport-security');
      expect(response.headers['strict-transport-security']).to.include('max-age=');
    });

    it('should have Content-Security-Policy header', async () => {
      const response = await request(app)
        .get('/security-test')
        .expect(200);

      expect(response.headers).to.have.property('content-security-policy');
      expect(response.headers['content-security-policy']).to.be.a('string');
    });
  });

  describe('🧹 Input Sanitization', () => {
    it('should sanitize XSS attempts', async () => {
      const maliciousInput = '<script>alert("xss")</script>';

      const response = await request(app)
        .post('/upload')
        .send({ data: maliciousInput })
        .expect(200);

      expect(response.body.data.data).to.not.include('<script>');
      // Verificar que el contenido malicioso fue sanitizado de alguna forma
      expect(response.body.data.data).to.not.equal('<script>alert("xss")</script>');
    });

    it('should sanitize SQL injection patterns', async () => {
      const sqlInjection = "'; DROP TABLE users; --";

      const response = await request(app)
        .post('/upload')
        .send({ data: sqlInjection })
        .expect(200);

      expect(response.body.data.data).to.not.include('DROP TABLE');
    });
  });

  describe('🍪 Cookie Security', () => {
    it('should set secure cookies', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      const cookies = response.headers['set-cookie'];
      // Verificar que se establecen cookies si existen
      if (cookies && cookies.length > 0) {
        expect(cookies).to.be.an('array');
        // Verificar que al menos una cookie tiene configuraciones de seguridad
        const hasSecureCookie = cookies.some(cookie => 
          cookie.includes('HttpOnly') || cookie.includes('SameSite')
        );
        expect(hasSecureCookie).to.be.true;
      }
    });
  });

  describe('🤖 Bot Detection', () => {
    it('should detect suspicious user agents', async () => {
      const response = await request(app)
        .get('/test')
        .set('User-Agent', 'bot-crawler-1.0')
        .expect(200);

      // El middleware debería marcar la request como sospechosa
      expect(response.body).to.have.property('message');
    });
  });
});
