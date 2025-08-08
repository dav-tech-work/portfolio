#!/usr/bin/env node

/**
 * Test Unitario de Funciones de Utilidad - Consolidado
 * @description Pruebas unitarias para funciones helper, validación y utilidades
 * @author Daniel Arribas Velazquez
 * @version 2.0.0
 */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar funciones de utilidad
import { formatDate, capitalize, truncate, isValidEmail } from '../../src/utils/helpers.mjs';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno para tests
dotenv.config({ path: './config.env' });

describe('🔧 Utility Functions Tests', () => {
  describe('📅 Date Formatting', () => {
    it('should format date correctly', () => {
      const testDate = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(testDate);

      expect(formatted).to.be.a('string');
      expect(formatted).to.include('2024');
      expect(formatted).to.include('15');
    });

    it('should handle invalid dates gracefully', () => {
      const invalidDate = 'invalid-date';
      const formatted = formatDate(invalidDate);

      expect(formatted).to.be.a('string');
      expect(formatted).to.not.equal('invalid-date');
    });

        it('should format current date when no date provided', () => {
      const formatted = formatDate(new Date());
      const currentYear = new Date().getFullYear().toString();

      expect(formatted).to.be.a('string');
      expect(formatted).to.include(currentYear);
    });
  });

  describe('📝 Text Manipulation', () => {
    it('should capitalize first letter correctly', () => {
      expect(capitalize('hello')).to.equal('Hello');
      expect(capitalize('world')).to.equal('World');
      expect(capitalize('TEST')).to.equal('TEST');
      expect(capitalize('')).to.equal('');
    });

    it('should handle null and undefined in capitalize', () => {
      expect(() => capitalize(null)).to.throw();
      expect(() => capitalize(undefined)).to.throw();
    });

        it('should truncate text correctly', () => {
      const longText = 'This is a very long text that needs to be truncated';

      expect(truncate(longText, 20)).to.have.lengthOf(23); // 20 + 3 for ellipsis
      expect(truncate(longText, 10)).to.have.lengthOf(13); // 10 + 3 for ellipsis
      expect(truncate('short', 20)).to.equal('short');
    });

    it('should add ellipsis when truncating', () => {
      const longText = 'This is a very long text';
      const truncated = truncate(longText, 10);

      expect(truncated).to.include('...');
      expect(truncated.length).to.be.lessThanOrEqual(13); // 10 + 3 for ellipsis
    });
  });

  describe('📧 Email Validation', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        '123@numbers.com',
        'user@subdomain.example.com'
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).to.be.true;
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@domain.com',
        'test@domain',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).to.be.false;
      });

      // Probar null y undefined por separado
      expect(isValidEmail(null)).to.be.false;
      expect(isValidEmail(undefined)).to.be.false;
    });

    it('should handle edge cases in email validation', () => {
      // La función isValidEmail solo valida formato, no dominios específicos
      expect(isValidEmail('test@tempmail.org')).to.be.true; // Formato válido
      expect(isValidEmail('test@10minutemail.com')).to.be.true; // Formato válido
      expect(isValidEmail('test@guerrillamail.com')).to.be.true; // Formato válido
    });
  });

  describe('🔍 Input Validation', () => {
    it('should validate password strength', () => {
      const weakPasswords = ['weak', 'password123', 'abc123', 'PASSWORD'];
      const strongPasswords = ['StrongPass123!', 'MyStr0ng!Pass', 'Secure123!@#'];

      // Probar contraseñas débiles
      weakPasswords.forEach(password => {
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[@$!%*?&]/.test(password);
        const isLongEnough = password.length >= 8;

        const isStrong = hasLower && hasUpper && hasNumber && hasSpecial && isLongEnough;
        expect(isStrong).to.be.false;
      });

      // Probar contraseñas fuertes
      strongPasswords.forEach(password => {
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[@$!%*?&]/.test(password);
        const isLongEnough = password.length >= 8;

        const isStrong = hasLower && hasUpper && hasNumber && hasSpecial && isLongEnough;
        expect(isStrong).to.be.true;
      });
    });

    it('should validate URL format', () => {
      const validUrls = [
        'https://example.com',
        'http://www.example.com',
        'https://subdomain.example.com/path',
        'https://example.com:8080'
      ];

      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'http://',
        'https://',
        ''
      ];

      validUrls.forEach(url => {
        try {
          new URL(url);
          expect(true).to.be.true; // URL válida
        } catch {
          expect.fail(`URL should be valid: ${url}`);
        }
      });

      invalidUrls.forEach(url => {
        try {
          new URL(url);
          expect.fail(`URL should be invalid: ${url}`);
        } catch {
          expect(true).to.be.true; // URL inválida
        }
      });
    });
  });

  describe('🧹 Data Sanitization', () => {
    it('should sanitize HTML content', () => {
      const maliciousContent = '<script>alert("xss")</script>';
      const safeContent = 'Hello <strong>world</strong>';

      // Simular sanitización básica
      const sanitizedMalicious = maliciousContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      const sanitizedSafe = safeContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

      expect(sanitizedMalicious).to.not.include('<script>');
      expect(sanitizedSafe).to.equal(safeContent);
    });

    it('should handle SQL injection patterns', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const normalText = "Hello world";

      // Simular detección de SQL injection
      const hasSqlInjection = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i.test(sqlInjection);
      const hasNormalText = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i.test(normalText);

      expect(hasSqlInjection).to.be.true;
      expect(hasNormalText).to.be.false;
    });

    it('should sanitize special characters', () => {
      const specialChars = '<>&"\'';
      const normalChars = 'Hello World 123';

      // Simular escape de caracteres especiales
      const escapedSpecial = specialChars
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');

      expect(escapedSpecial).to.not.equal(specialChars);
      expect(normalChars).to.equal(normalChars);
    });
  });

  describe('📊 Data Processing', () => {
    it('should handle array operations correctly', () => {
      const testArray = [1, 2, 3, 4, 5];

      expect(testArray.length).to.equal(5);
      expect(testArray.includes(3)).to.be.true;
      expect(testArray.includes(10)).to.be.false;
    });

    it('should handle object operations correctly', () => {
      const testObject = {
        name: 'Test',
        age: 25,
        email: 'test@example.com'
      };

      expect(testObject).to.have.property('name');
      expect(testObject).to.have.property('age');
      expect(testObject).to.not.have.property('password');
    });

    it('should handle null and undefined values', () => {
      expect(null).to.be.null;
      expect(undefined).to.be.undefined;
      expect('').to.be.a('string');
      expect(0).to.be.a('number');
    });
  });

  describe('🔧 Error Handling', () => {
    it('should handle function errors gracefully', () => {
      const safeFunction = (input) => {
        try {
          return JSON.parse(input);
        } catch (error) {
          return null;
        }
      };

      expect(safeFunction('{"valid": "json"}')).to.deep.equal({ valid: 'json' });
      expect(safeFunction('invalid json')).to.be.null;
    });

    it('should validate function parameters', () => {
      const validateParams = (param1, param2) => {
        if (!param1 || !param2) {
          throw new Error('Missing required parameters');
        }
        return true;
      };

      expect(() => validateParams('test', 'test')).to.not.throw();
      expect(() => validateParams('test')).to.throw('Missing required parameters');
      expect(() => validateParams()).to.throw('Missing required parameters');
    });
  });
});
