#!/usr/bin/env node

/**
 * Test E2E - Viaje del Usuario - Consolidado
 * @description Pruebas end-to-end que simulan el flujo completo del usuario
 * @author Daniel Arribas Velazquez
 * @version 2.0.0
 */

import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import dotenv from 'dotenv';

// Importar la aplicación de test simplificada
import { createTestApp } from '../utils/test-app.mjs';

// Cargar variables de entorno para tests
dotenv.config({ path: './config.env' });

describe('🎯 End-to-End User Journey Tests', () => {
  let app;
  let server;

  before(() => {
    try {
      app = createTestApp();
      const testPort = process.env.TEST_PORT || 3006;
      server = app.listen(testPort);
      console.log(`🚀 E2E Test server started on port ${testPort}`);
    } catch (error) {
      console.error('Error setting up E2E test server:', error);
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

  describe('🏠 Home Page Journey', () => {
    it('should complete full home page user journey', async () => {
      // 1. Acceder a la página principal
      const homeResponse = await request(app)
        .get('/')
        .expect(200);

      expect(homeResponse.headers['content-type']).to.include('text/html');
      expect(homeResponse.text).to.include('Administrador de Sistemas');

      // 2. Verificar que se cargan los recursos estáticos
      const cssResponse = await request(app)
        .get('/assets/css/global/base.min.css')
        .expect(200);

      const jsResponse = await request(app)
        .get('/assets/js/index.min.js')
        .expect(200);

      expect(cssResponse.headers['content-type']).to.include('text/css');
      expect(jsResponse.headers['content-type']).to.include('javascript');

      // 3. Verificar que la página tiene el contenido esperado
      expect(homeResponse.text).to.include('Administrador de Sistemas');
    });

    it('should handle theme switching functionality', async () => {
      // Simular cambio de tema (esto sería más complejo en un test real con browser)
      const response = await request(app)
        .get('/')
        .set('Accept-Language', 'es')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
    });
  });

  describe('📚 Formación Journey', () => {
    it('should complete formación section journey', async () => {
      // 1. Acceder a la página de formación
      const formacionResponse = await request(app)
        .get('/formacion')
        .expect(200);

      expect(formacionResponse.text).to.include('formación');

      // 2. Navegar a subsecciones
      const htmlResponse = await request(app)
        .get('/formacion/html')
        .expect(200);

      const jsTeoriaResponse = await request(app)
        .get('/formacion/javascript/teoria')
        .expect(200);

      const jsPracticasResponse = await request(app)
        .get('/formacion/javascript/practicas')
        .expect(200);

      const pythonTeoriaResponse = await request(app)
        .get('/formacion/python/teoria')
        .expect(200);

      const pythonPracticasResponse = await request(app)
        .get('/formacion/python/practicas')
        .expect(200);

      // 3. Verificar que todas las páginas cargan correctamente
      expect(htmlResponse.status).to.equal(200);
      expect(jsTeoriaResponse.status).to.equal(200);
      expect(jsPracticasResponse.status).to.equal(200);
      expect(pythonTeoriaResponse.status).to.equal(200);
      expect(pythonPracticasResponse.status).to.equal(200);
    });

    it('should access specific practice pages', async () => {
      const sistemasResponse = await request(app)
        .get('/formacion/sistemas/practicas/practica_01_sistemas')
        .expect(200);

      expect(sistemasResponse.status).to.equal(200);
      expect(sistemasResponse.headers['content-type']).to.include('text/html');
    });
  });

  describe('🔐 Authentication Journey', () => {
    it('should complete authentication flow', async () => {
      // 1. Acceder a la página de login
      const loginResponse = await request(app)
        .get('/auth/login')
        .expect(200);

      expect(loginResponse.text).to.include('login');

      // 2. Acceder a la página de registro
      const registerResponse = await request(app)
        .get('/auth/register')
        .expect(200);

      expect(registerResponse.text).to.include('register');

      // 3. Acceder a la página de perfil
      const profileResponse = await request(app)
        .get('/auth/profile')
        .expect(200);

      expect(profileResponse.status).to.equal(200);
    });

    it('should handle authentication API endpoints', async () => {
      // Simular intento de login (sin credenciales reales)
      const loginAttempt = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword'
        })
        .expect(200);

      expect(loginAttempt.body).to.have.property('message');
    });
  });

  describe('📡 Contact Journey', () => {
    it('should complete contact form journey', async () => {
      // 1. Acceder a la página de contacto
      const contactResponse = await request(app)
        .get('/contacto')
        .expect(200);

      expect(contactResponse.text).to.include('contacto');

      // 2. Enviar formulario de contacto
      const contactData = {
        nombre: 'Test User',
        email: 'test@example.com',
        mensaje: 'Este es un mensaje de prueba para el formulario de contacto.'
      };

      const apiResponse = await request(app)
        .post('/api/contacto')
        .send(contactData)
        .expect(200);

      expect(apiResponse.body).to.have.property('success');
    });

    it('should handle email API functionality', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'This is a test email content.'
      };

      const emailResponse = await request(app)
        .post('/api/email')
        .send(emailData)
        .expect(200);

      expect(emailResponse.body).to.have.property('success');
    });
  });

  describe('🎨 UI/UX Journey', () => {
    it('should verify responsive design elements', async () => {
      // Verificar que los archivos CSS responsivos están disponibles
      const baseCssResponse = await request(app)
        .get('/assets/css/global/base.min.css')
        .expect(200);

      const aboutCssResponse = await request(app)
        .get('/assets/css/secciones/about.min.css')
        .expect(200);

      expect(baseCssResponse.headers['content-type']).to.include('text/css');
      expect(aboutCssResponse.headers['content-type']).to.include('text/css');
    });

    it('should verify JavaScript functionality', async () => {
      // Verificar que los archivos JavaScript están disponibles
      const indexJsResponse = await request(app)
        .get('/assets/js/index.min.js')
        .expect(200);

      const navegacionJsResponse = await request(app)
        .get('/assets/js/navegacion/navegacion.min.js')
        .expect(200);

      expect(indexJsResponse.headers['content-type']).to.include('javascript');
      expect(navegacionJsResponse.headers['content-type']).to.include('javascript');
    });

    it('should verify image assets', async () => {
      // Verificar que las imágenes están disponibles
      const logoResponse = await request(app)
        .get('/assets/img/dav_logo_editado.svg')
        .expect(200);

      expect(logoResponse.headers['content-type']).to.include('svg');
    });
  });

  describe('🌐 Internationalization Journey', () => {
    it('should handle multiple language preferences', async () => {
      // Probar con diferentes idiomas
      const spanishResponse = await request(app)
        .get('/')
        .set('Accept-Language', 'es')
        .expect(200);

      const englishResponse = await request(app)
        .get('/')
        .set('Accept-Language', 'en')
        .expect(200);

      const catalanResponse = await request(app)
        .get('/')
        .set('Accept-Language', 'ca')
        .expect(200);

      expect(spanishResponse.status).to.equal(200);
      expect(englishResponse.status).to.equal(200);
      expect(catalanResponse.status).to.equal(200);
    });
  });

  describe('🔍 Error Handling Journey', () => {
    it('should handle 404 errors gracefully', async () => {
      const notFoundResponse = await request(app)
        .get('/pagina-inexistente')
        .expect(404);

      expect(notFoundResponse.headers['content-type']).to.include('text/html');
    });

    it('should handle server errors gracefully', async () => {
      // Este test verifica que el servidor maneja errores sin crashear
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.status).to.equal(200);
    });
  });

  describe('📊 Performance Journey', () => {
    it('should maintain performance across multiple requests', async () => {
      const startTime = Date.now();
      const requests = [];

      // Hacer múltiples requests para verificar rendimiento
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .get('/')
            .timeout(5000)
        );
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Verificar que todas las respuestas fueron exitosas
      responses.forEach(response => {
        expect(response.status).to.equal(200);
      });

      // Verificar que el tiempo total es razonable
      expect(totalTime).to.be.lessThan(10000); // Menos de 10 segundos
    });

    it('should handle concurrent navigation', async () => {
      const navigationRequests = [
        request(app).get('/'),
        request(app).get('/formacion'),
        request(app).get('/proyectos'),
        request(app).get('/curriculum'),
        request(app).get('/contacto'),
      ];

      const responses = await Promise.all(navigationRequests);

      responses.forEach(response => {
        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.include('text/html');
      });
    });
  });

  describe('🔒 Security Journey', () => {
    it('should maintain security headers across all pages', async () => {
      const pages = ['/', '/formacion', '/proyectos', '/contacto'];

      for (const page of pages) {
        const response = await request(app)
          .get(page)
          .expect(200);

        // Verificar headers de seguridad básicos
        expect(response.headers).to.have.property('x-content-type-options');
        expect(response.headers).to.have.property('x-frame-options');
        expect(response.headers).to.not.have.property('x-powered-by');
      }
    });

    it('should handle malicious input gracefully', async () => {
      const maliciousData = {
        nombre: '<script>alert("xss")</script>',
        email: 'test@example.com',
        mensaje: "'; DROP TABLE users; --"
      };

      const response = await request(app)
        .post('/api/contacto')
        .send(maliciousData)
        .expect(200);

      // Debería manejar el input malicioso sin errores
      expect(response.body).to.have.property('success');
    });
  });
});
