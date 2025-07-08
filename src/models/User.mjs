/**
 * ARCHIVO DESHABILITADO - User Model
 * @description Este archivo reemplaza el modelo User que dependía de MongoDB
 * 
 * Si necesitas autenticación con base de datos en el futuro:
 * 1. Ver el archivo User.mjs.original para referencia
 * 2. Adaptar el modelo según tu base de datos elegida
 * 3. Implementar las funciones según el ORM/driver que uses
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { configLoader } from '../config/environment.mjs';

const config = configLoader();

/**
 * Clase modelo User (versión stub sin base de datos)
 */
export class User {
  constructor(userData = {}) {
    this.email = userData.email;
    this.password = userData.password;
    this.name = userData.name;
    this.username = userData.username;
    this.role = userData.role || 'user';
    this.status = userData.status || 'active';
    this.avatar = userData.avatar;
    this.preferences = userData.preferences || {};
    this.metadata = userData.metadata || {};
    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = userData.updatedAt || new Date();
    this.lastLogin = userData.lastLogin;
    this.loginAttempts = userData.loginAttempts || 0;
    this.lockedUntil = userData.lockedUntil;
    this.emailVerified = userData.emailVerified || false;
    this.emailVerificationToken = userData.emailVerificationToken;
    this.passwordResetToken = userData.passwordResetToken;
    this.passwordResetExpires = userData.passwordResetExpires;
    this.twoFactorSecret = userData.twoFactorSecret;
    this.twoFactorEnabled = userData.twoFactorEnabled || false;
  }

  /**
   * Valida los datos del usuario
   * @returns {Object} Resultado de validación
   */
  validate() {
    console.warn('⚠️  User validation disabled - database not connected');
    return { valid: false, errors: ['Database connection disabled'] };
  }

  /**
   * Hashea la contraseña del usuario
   * @returns {Promise<void>}
   */
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  /**
   * Compara una contraseña con el hash almacenado
   * @param {string} candidatePassword - Contraseña a verificar
   * @returns {Promise<boolean>} True si coincide
   */
  async comparePassword(candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
  }

  /**
   * Genera un token JWT para el usuario
   * @returns {string} Token JWT
   */
  generateToken() {
    return jwt.sign(
      {
        id: this.id || this.email,
        email: this.email,
        role: this.role,
      },
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_EXPIRES_IN || '24h',
        issuer: config.JWT_ISSUER || 'portfolio-app',
      }
    );
  }

  // Métodos estáticos stub para mantener compatibilidad
  static async findByEmail(email) {
    console.warn('⚠️  User.findByEmail() disabled - database not connected');
    return null;
  }

  static async findById(id) {
    console.warn('⚠️  User.findById() disabled - database not connected');
    return null;
  }

  static async findByUsername(username) {
    console.warn('⚠️  User.findByUsername() disabled - database not connected');
    return null;
  }

  static async create(userData) {
    console.warn('⚠️  User.create() disabled - database not connected');
    return null;
  }

  static async findAll(options = {}) {
    console.warn('⚠️  User.findAll() disabled - database not connected');
    return [];
  }

  static async updateById(id, updateData) {
    console.warn('⚠️  User.updateById() disabled - database not connected');
    return null;
  }

  static async deleteById(id) {
    console.warn('⚠️  User.deleteById() disabled - database not connected');
    return false;
  }

  static async authenticate(email, password) {
    console.warn('⚠️  User.authenticate() disabled - database not connected');
    return null;
  }

  static async getStats() {
    return {
      total: 0,
      active: 0,
      inactive: 0,
      admins: 0,
      users: 0,
      message: 'Database connection disabled'
    };
  }
}

export default User;
