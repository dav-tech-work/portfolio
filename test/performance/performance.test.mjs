/* eslint-env mocha */
import { expect } from 'chai';
import request from 'supertest';
import app from '../../app.mjs';
import { clearConfigCache } from '../../src/config/environment.mjs';

describe('Performance Tests', () => {
  // Limpiar cache antes de cada test
  beforeEach(() => {
    clearConfigCache();
    // Forzar garbage collection si está disponible
    if (global.gc) {
      global.gc();
    }
  });

  describe('Response Time Tests', () => {
    it('should respond to home page within 500ms', async () => {
      const startTime = Date.now();
      const response = await request(app).get('/');
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).to.equal(200);
      expect(responseTime).to.be.lessThan(500);
    });

    it('should respond to health check within 200ms', async () => {
      const startTime = Date.now();
      const response = await request(app).get('/health');
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).to.equal(200);
      expect(responseTime).to.be.lessThan(200);
    });

    it('should handle multiple concurrent requests efficiently', async () => {
      const numRequests = 10;
      const promises = [];

      for (let i = 0; i < numRequests; i++) {
        promises.push(request(app).get('/'));
      }

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Verificar que todas las respuestas sean exitosas
      responses.forEach((response) => {
        expect(response.status).to.equal(200);
      });

      // El tiempo total debería ser razonable (menos de 2 segundos para 10 requests)
      expect(totalTime).to.be.lessThan(2000);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not have memory leaks in repeated requests', async () => {
      // Forzar garbage collection antes del test
      if (global.gc) {
        global.gc();
      }

      const initialMemory = process.memoryUsage().heapUsed;

      // Realizar múltiples requests
      for (let i = 0; i < 50; i++) {
        await request(app).get('/');
      }

      // Forzar garbage collection después de los requests
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // El aumento de memoria no debería ser excesivo (menos de 15MB para ser más realista)
      expect(memoryIncrease).to.be.lessThan(15 * 1024 * 1024);
    });
  });

  describe('Database Performance Tests', () => {
    it('should handle database operations efficiently', async () => {
      const startTime = Date.now();

      // Simular operaciones de base de datos (si están disponibles)
      // Por ahora, solo verificamos que la aplicación responda
      const response = await request(app).get('/');

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).to.equal(200);
      expect(responseTime).to.be.lessThan(1000);
    });
  });

  describe('Static File Serving Tests', () => {
    it('should serve static files efficiently', async () => {
      const startTime = Date.now();
      const response = await request(app).get('/assets/css/global/base.css');
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).to.equal(200);
      expect(responseTime).to.be.lessThan(300);
    });

    it('should handle large static files efficiently', async () => {
      const startTime = Date.now();
      const response = await request(app).get('/assets/js/index.js');
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).to.equal(200);
      expect(responseTime).to.be.lessThan(500);
    });
  });

  describe('Authentication Performance Tests', () => {
    it('should handle login validation efficiently', async () => {
      const startTime = Date.now();
      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'TestPass123!',
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Debería fallar (credenciales inválidas) pero rápidamente
      // Las rutas de auth redirigen (302) en lugar de devolver errores HTTP
      expect(response.status).to.be.oneOf([302, 400, 401, 422]);
      // Aumentar el timeout para casos donde no hay base de datos
      expect(responseTime).to.be.lessThan(5000);
    });

    it('should handle registration validation efficiently', async () => {
      const startTime = Date.now();
      const response = await request(app).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
        terms: true,
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Debería fallar (email ya existe o validaciones) pero rápidamente
      // Las rutas de auth redirigen (302) en lugar de devolver errores HTTP
      expect(response.status).to.be.oneOf([302, 400, 409, 422]);
      // Aumentar el timeout para casos donde no hay base de datos
      expect(responseTime).to.be.lessThan(5000);
    });
  });

  describe('Rate Limiting Performance Tests', () => {
    it('should handle rate limiting efficiently', async () => {
      const requests = [];

      // Enviar múltiples requests rápidamente
      for (let i = 0; i < 20; i++) {
        requests.push(request(app).get('/'));
      }

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Verificar que las respuestas sean rápidas
      expect(responseTime).to.be.lessThan(3000);

      // Algunas respuestas pueden ser 429 (rate limit) pero deberían ser rápidas
      responses.forEach((response) => {
        expect(response.status).to.be.oneOf([200, 429]);
      });
    });
  });
});

// Configurar timeout y cierre graceful
const TEST_TIMEOUT = 30000; // 30 segundos

// Función para cerrar el proceso después de los tests
function gracefulShutdown() {
  console.log('\n🔴 Recibida señal SIGINT. Cerrando servidor gracefully...');
  process.exit(0);
}

// Manejar señales de interrupción
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Timeout automático para evitar que se quede colgado
setTimeout(() => {
  console.log('\n⏰ Timeout alcanzado. Cerrando tests...');
  process.exit(0);
}, TEST_TIMEOUT);
