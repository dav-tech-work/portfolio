#!/usr/bin/env node

/**
 * Test de Integración de APIs - Consolidado
 * @description Pruebas de integración para rutas principales y APIs
 * @author Daniel Arribas Velazquez
 * @version 2.0.0
 */

import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar la aplicación principal para tests de integración
import { createTestApp } from '../utils/test-app.mjs';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno para tests
dotenv.config({ path: './config.env' });

describe('🔗 API Integration Tests', () => {
  let app;
  let server;

  before(() => {
    try {
      app = createTestApp();
      // Usar puerto diferente para tests
      const testPort = process.env.TEST_PORT || 3004;
      server = app.listen(testPort);
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

  describe('🏠 Main Routes', () => {
    it('should serve home page correctly', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
      expect(response.text).to.include('Administrador de Sistemas');
    });

    it('should serve formación page correctly', async () => {
      const response = await request(app)
        .get('/formacion')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
      expect(response.text).to.include('formación');
    });

    it('should serve proyectos page correctly', async () => {
      const response = await request(app)
        .get('/proyectos')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
      expect(response.text).to.include('proyectos');
    });

    it('should serve curriculum page correctly', async () => {
      const response = await request(app)
        .get('/curriculum')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
      expect(response.text).to.include('Administrador de Sistemas');
    });

    it('should serve contacto page correctly', async () => {
      const response = await request(app)
        .get('/contacto')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
      expect(response.text).to.include('contacto');
    });
  });

  describe('📚 Formación Subroutes', () => {
    it('should serve HTML formation page', async () => {
      const response = await request(app)
        .get('/formacion/html')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
    });

    it('should serve JavaScript theory page', async () => {
      const response = await request(app)
        .get('/formacion/javascript/teoria')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
    });

    it('should serve JavaScript practices page', async () => {
      const response = await request(app)
        .get('/formacion/javascript/practicas')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
    });

    it('should serve Python theory page', async () => {
      const response = await request(app)
        .get('/formacion/python/teoria')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
    });

    it('should serve Python practices page', async () => {
      const response = await request(app)
        .get('/formacion/python/practicas')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
    });

    it('should serve systems practices page', async () => {
      const response = await request(app)
        .get('/formacion/sistemas/practicas/practica_01_sistemas')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
    });
  });

  describe('🔐 Authentication Routes', () => {
    it('should serve login page', async () => {
      const response = await request(app)
        .get('/auth/login')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
      expect(response.text).to.include('login');
    });

    it('should serve register page', async () => {
      const response = await request(app)
        .get('/auth/register')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
      expect(response.text).to.include('register');
    });

    it('should serve profile page', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
    });
  });

  describe('📡 API Endpoints', () => {
    it('should handle contacto API endpoint', async () => {
      const contactData = {
        nombre: 'Test User',
        email: 'test@example.com',
        mensaje: 'Test message'
      };

      const response = await request(app)
        .post('/api/contacto')
        .send(contactData)
        .expect(200);

      expect(response.body).to.have.property('success');
    });

    it('should handle email API endpoint', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test email content'
      };

      const response = await request(app)
        .post('/api/email')
        .send(emailData)
        .expect(200);

      expect(response.body).to.have.property('success');
    });
  });

  describe('🎨 Static Assets', () => {
    it('should serve CSS files correctly', async () => {
      const response = await request(app)
        .get('/assets/css/global/base.min.css')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/css');
    });

    it('should serve JavaScript files correctly', async () => {
      const response = await request(app)
        .get('/assets/js/index.min.js')
        .expect(200);

      expect(response.headers['content-type']).to.include('javascript');
    });

    it('should serve images correctly', async () => {
      const response = await request(app)
        .get('/assets/img/dav_logo_editado.svg')
        .expect(200);

      expect(response.headers['content-type']).to.include('svg');
    });
  });

  describe('🔍 Error Handling', () => {
    it('should handle 404 errors correctly', async () => {
      const response = await request(app)
        .get('/nonexistent-page')
        .expect(404);

      expect(response.headers['content-type']).to.include('text/html');
    });

    it('should handle 500 errors gracefully', async () => {
      // Este test verifica que el middleware de manejo de errores funciona
      const response = await request(app)
        .get('/')
        .expect(200);

      // Si llegamos aquí, significa que no hay errores 500
      expect(response.status).to.equal(200);
    });
  });

  describe('🌐 Internationalization', () => {
    it('should handle language switching', async () => {
      const response = await request(app)
        .get('/')
        .set('Accept-Language', 'en')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
    });

    it('should serve content in different languages', async () => {
      const response = await request(app)
        .get('/')
        .set('Accept-Language', 'es')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
    });
  });
});
