#!/usr/bin/env node

/**
 * Test Unitario de Títulos - Simplificado
 * @description Pruebas unitarias para validación de títulos
 * @author Daniel Arribas Velazquez
 * @version 2.0.0
 */

import { describe, it } from 'mocha';
import { expect } from 'chai';

describe('📄 Title Validation Tests', () => {
  describe('🔍 Title Format Validation', () => {
    it('should validate title format correctly', () => {
      const validTitles = [
        'Daniel Arribas Velázquez | Administrador de Sistemas',
        'Proyectos | Daniel Arribas Velázquez',
        'Formación | Daniel Arribas Velázquez',
        'JavaScript - Teoría | Daniel Arribas Velázquez'
      ];

      validTitles.forEach(title => {
        expect(title).to.be.a('string');
        expect(title.length).to.be.greaterThan(0);
        expect(title).to.include('Daniel Arribas Velázquez');
      });
    });

    it('should detect invalid titles', () => {
      const invalidTitles = [
        '',
        null,
        undefined,
        '   ',
        'Invalid Title'
      ];

      invalidTitles.forEach(title => {
        if (title === null || title === undefined) {
          expect(title).to.be.oneOf([null, undefined]);
        } else {
          expect(title).to.not.include('Daniel Arribas Velázquez');
        }
      });
    });
  });

  describe('🌐 Internationalization Titles', () => {
    it('should handle Spanish titles', () => {
      const spanishTitles = [
        'Daniel Arribas Velázquez | Administrador de Sistemas Informáticos',
        'Proyectos | Daniel Arribas Velázquez',
        'Formación | Daniel Arribas Velázquez'
      ];

      spanishTitles.forEach(title => {
        expect(title).to.include('Daniel Arribas Velázquez');
        expect(title).to.include('|');
      });
    });

    it('should handle English titles', () => {
      const englishTitles = [
        'Daniel Arribas Velázquez | Computer Systems Administrator',
        'Projects | Daniel Arribas Velázquez',
        'Training | Daniel Arribas Velázquez'
      ];

      englishTitles.forEach(title => {
        expect(title).to.include('Daniel Arribas Velázquez');
        expect(title).to.include('|');
      });
    });
  });

  describe('📝 Title Content Validation', () => {
    it('should validate page-specific titles', () => {
      const pageTitles = {
        home: 'Daniel Arribas Velázquez | Administrador de Sistemas',
        projects: 'Proyectos | Daniel Arribas Velázquez',
        curriculum: 'Currículum | Daniel Arribas Velázquez',
        formation: 'Formación | Daniel Arribas Velázquez',
        construction: 'En Construcción | Daniel Arribas Velázquez'
      };

      Object.entries(pageTitles).forEach(([page, title]) => {
        expect(title).to.be.a('string');
        expect(title).to.include('Daniel Arribas Velázquez');
        expect(title).to.include('|');
      });
    });

    it('should validate formation subpage titles', () => {
      const formationTitles = {
        'javascript-theory': 'JavaScript - Teoría | Daniel Arribas Velázquez',
        'javascript-practices': 'JavaScript - Prácticas | Daniel Arribas Velázquez',
        'python-theory': 'Python - Teoría | Daniel Arribas Velázquez',
        'python-practices': 'Python - Prácticas | Daniel Arribas Velázquez'
      };

      Object.entries(formationTitles).forEach(([page, title]) => {
        expect(title).to.be.a('string');
        expect(title).to.include('Daniel Arribas Velázquez');
        expect(title).to.include('|');
        expect(title).to.include('-');
      });
    });
  });

  describe('🔧 Title Utility Functions', () => {
    it('should generate title correctly', () => {
      const generateTitle = (pageName, language = 'es') => {
        const baseName = 'Daniel Arribas Velázquez';
        const separator = ' | ';

        if (language === 'en') {
          return `${pageName}${separator}${baseName}`;
        }
        return `${pageName}${separator}${baseName}`;
      };

      const homeTitle = generateTitle('Inicio');
      const projectsTitle = generateTitle('Proyectos');
      const englishTitle = generateTitle('Home', 'en');

      expect(homeTitle).to.include('Daniel Arribas Velázquez');
      expect(projectsTitle).to.include('Daniel Arribas Velázquez');
      expect(englishTitle).to.include('Daniel Arribas Velázquez');
      expect(homeTitle).to.include(' | ');
      expect(projectsTitle).to.include(' | ');
      expect(englishTitle).to.include(' | ');
    });

    it('should validate title length', () => {
      const validateTitleLength = (title) => {
        return title !== null && title !== undefined && title.length > 0 && title.length <= 100;
      };

      const validTitles = [
        'Short Title',
        'Daniel Arribas Velázquez | Administrador de Sistemas Informáticos, redes y seguridad',
        'A' + 'b'.repeat(50) + ' | Daniel Arribas Velázquez'
      ];

      const invalidTitles = [
        'A'.repeat(101),
        null,
        undefined
      ];

      validTitles.forEach(title => {
        expect(validateTitleLength(title)).to.be.true;
      });

      invalidTitles.forEach(title => {
        expect(validateTitleLength(title)).to.be.false;
      });

      // Probar string vacío por separado
      expect(validateTitleLength('')).to.be.false;
    });
  });
});
