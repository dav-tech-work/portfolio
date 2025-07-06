/**
 * Modelo de Usuario
 * @description Modelo completo con validaciones, seguridad y operaciones de base de datos
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../database/connection.mjs';
import { configLoader } from '../config/environment.mjs';
import { validateUserData } from '../utils/validation/schemas.mjs';

const config = configLoader();
const COLLECTION_NAME = 'users';

/**
 * Clase modelo User
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
    return validateUserData({
      email: this.email,
      password: this.password,
      name: this.name,
      username: this.username,
      role: this.role,
    });
  }

  /**
   * Hashea la contraseña
   * @returns {Promise<void>}
   */
  async hashPassword() {
    if (!this.password) {
      throw new Error('Contraseña requerida para hashear');
    }

    this.password = await bcrypt.hash(this.password, config.BCRYPT_ROUNDS);
  }

  /**
   * Compara contraseña con hash
   * @param {string} candidatePassword - Contraseña candidata
   * @returns {Promise<boolean>}
   */
  async comparePassword(candidatePassword) {
    if (!this.password) {
      return false;
    }

    return await bcrypt.compare(candidatePassword, this.password);
  }

  /**
   * Genera token JWT
   * @returns {string} Token JWT
   */
  generateToken() {
    return jwt.sign(
      {
        id: this._id,
        email: this.email,
        role: this.role,
      },
      config.JWT_SECRET,
      {
        expiresIn: config.TOKEN_EXPIRES_IN,
        issuer: config.APP_NAME,
        audience: config.APP_NAME,
      }
    );
  }

  /**
   * Genera token de verificación de email
   * @returns {string} Token de verificación
   */
  generateEmailVerificationToken() {
    this.emailVerificationToken = jwt.sign(
      { email: this.email, purpose: 'email_verification' },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );
    return this.emailVerificationToken;
  }

  /**
   * Genera token de reset de contraseña
   * @returns {string} Token de reset
   */
  generatePasswordResetToken() {
    this.passwordResetToken = jwt.sign(
      { email: this.email, purpose: 'password_reset' },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );
    this.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hora
    return this.passwordResetToken;
  }

  /**
   * Verifica si la cuenta está bloqueada
   * @returns {boolean}
   */
  isLocked() {
    return !!(this.lockedUntil && this.lockedUntil > Date.now());
  }

  /**
   * Incrementa intentos de login fallidos
   * @returns {Promise<void>}
   */
  async incLoginAttempts() {
    this.loginAttempts += 1;

    // Bloquear cuenta después de 5 intentos fallidos
    if (this.loginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
    }

    await this.save();
  }

  /**
   * Resetea intentos de login
   * @returns {Promise<void>}
   */
  async resetLoginAttempts() {
    this.loginAttempts = 0;
    this.lockedUntil = undefined;
    await this.save();
  }

  /**
   * Actualiza último login
   * @returns {Promise<void>}
   */
  async updateLastLogin() {
    this.lastLogin = new Date();
    await this.save();
  }

  /**
   * Convierte a objeto para respuesta (sin datos sensibles)
   * @returns {Object}
   */
  toJSON() {
    const obj = { ...this };
    delete obj.password;
    delete obj.emailVerificationToken;
    delete obj.passwordResetToken;
    delete obj.twoFactorSecret;
    return obj;
  }

  /**
   * Guarda el usuario en la base de datos
   * @returns {Promise<Object>} Usuario guardado
   */
  async save() {
    const db = await getDatabase();
    this.updatedAt = new Date();

    if (this._id) {
      // Actualizar usuario existente
      const result = await db
        .collection(COLLECTION_NAME)
        .findOneAndUpdate(
          { _id: new ObjectId(this._id) },
          { $set: this },
          { returnDocument: 'after' }
        );
      return result.value;
    } else {
      // Crear nuevo usuario
      const validation = this.validate();
      if (!validation.isValid) {
        throw new Error(`Datos de usuario inválidos: ${validation.errors.join(', ')}`);
      }

      await this.hashPassword();

      const result = await db.collection(COLLECTION_NAME).insertOne(this);
      this._id = result.insertedId;
      return this;
    }
  }

  /**
   * Elimina el usuario de la base de datos
   * @returns {Promise<boolean>}
   */
  async delete() {
    if (!this._id) {
      throw new Error('No se puede eliminar usuario sin ID');
    }

    const db = await getDatabase();
    const result = await db.collection(COLLECTION_NAME).deleteOne({
      _id: new ObjectId(this._id),
    });

    return result.deletedCount > 0;
  }

  // ================================
  // MÉTODOS ESTÁTICOS
  // ================================

  /**
   * Busca usuario por ID
   * @param {string} id - ID del usuario
   * @returns {Promise<User|null>}
   */
  static async findById(id) {
    try {
      const db = await getDatabase();
      const userData = await db.collection(COLLECTION_NAME).findOne({
        _id: new ObjectId(id),
      });

      return userData ? new User(userData) : null;
    } catch (error) {
      console.error('Error buscando usuario por ID:', error);
      return null;
    }
  }

  /**
   * Busca usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<User|null>}
   */
  static async findByEmail(email) {
    try {
      const db = await getDatabase();
      const userData = await db.collection(COLLECTION_NAME).findOne({
        email: email.toLowerCase(),
      });

      return userData ? new User(userData) : null;
    } catch (error) {
      console.error('Error buscando usuario por email:', error);
      return null;
    }
  }

  /**
   * Busca usuario por username
   * @param {string} username - Username del usuario
   * @returns {Promise<User|null>}
   */
  static async findByUsername(username) {
    try {
      const db = await getDatabase();
      const userData = await db.collection(COLLECTION_NAME).findOne({
        username: username,
      });

      return userData ? new User(userData) : null;
    } catch (error) {
      console.error('Error buscando usuario por username:', error);
      return null;
    }
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<User>}
   */
  static async create(userData) {
    // Verificar si el email ya existe
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Verificar si el username ya existe (si se proporciona)
    if (userData.username) {
      const existingUsername = await User.findByUsername(userData.username);
      if (existingUsername) {
        throw new Error('El username ya está en uso');
      }
    }

    const user = new User(userData);
    await user.save();
    return user;
  }

  /**
   * Autentica usuario con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} Resultado de autenticación
   */
  static async authenticate(email, password) {
    const user = await User.findByEmail(email);

    if (!user) {
      return { success: false, message: 'Credenciales inválidas' };
    }

    if (user.isLocked()) {
      const unlockTime = new Date(user.lockedUntil).toLocaleTimeString();
      return {
        success: false,
        message: `Cuenta bloqueada hasta ${unlockTime}`,
        locked: true,
      };
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return { success: false, message: 'Credenciales inválidas' };
    }

    // Login exitoso
    await user.resetLoginAttempts();
    await user.updateLastLogin();

    const token = user.generateToken();

    return {
      success: true,
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Verifica token JWT
   * @param {string} token - Token JWT
   * @returns {Promise<Object>} Datos del token
   */
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || user.status !== 'active') {
        return null;
      }

      return { user: user.toJSON(), decoded };
    } catch (error) {
      console.error('Error verificando token:', error);
      return null;
    }
  }

  /**
   * Lista usuarios con paginación y filtros
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Object>} Lista de usuarios
   */
  static async list(options = {}) {
    try {
      const db = await getDatabase();
      const { page = 1, limit = 10, sort = { createdAt: -1 }, filter = {} } = options;

      const skip = (page - 1) * limit;

      // Construir query de filtro
      const query = {};
      if (filter.status) query.status = filter.status;
      if (filter.role) query.role = filter.role;
      if (filter.search) {
        query.$or = [
          { name: { $regex: filter.search, $options: 'i' } },
          { email: { $regex: filter.search, $options: 'i' } },
          { username: { $regex: filter.search, $options: 'i' } },
        ];
      }

      const [users, total] = await Promise.all([
        db
          .collection(COLLECTION_NAME)
          .find(query, {
            projection: {
              password: 0,
              emailVerificationToken: 0,
              passwordResetToken: 0,
              twoFactorSecret: 0,
            },
          })
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .toArray(),
        db.collection(COLLECTION_NAME).countDocuments(query),
      ]);

      return {
        users: users.map((userData) => new User(userData)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error listando usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   * @returns {Promise<Object>} Estadísticas
   */
  static async getStats() {
    try {
      const db = await getDatabase();

      const stats = await db
        .collection(COLLECTION_NAME)
        .aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
              inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
              verified: { $sum: { $cond: ['$emailVerified', 1, 0] } },
              admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
              users: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } },
            },
          },
        ])
        .toArray();

      // Estadísticas por fecha de registro
      const registrationStats = await db
        .collection(COLLECTION_NAME)
        .aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
          { $limit: 30 },
        ])
        .toArray();

      return {
        general: stats[0] || {
          total: 0,
          active: 0,
          inactive: 0,
          verified: 0,
          admins: 0,
          users: 0,
        },
        registrations: registrationStats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Elimina usuarios inactivos antiguos
   * @param {number} days - Días de inactividad
   * @returns {Promise<number>} Usuarios eliminados
   */
  static async cleanupInactiveUsers(days = 365) {
    try {
      const db = await getDatabase();
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const result = await db.collection(COLLECTION_NAME).deleteMany({
        status: 'inactive',
        lastLogin: { $lt: cutoffDate },
        emailVerified: false,
      });

      console.log(`🧹 Limpieza: ${result.deletedCount} usuarios inactivos eliminados`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error en limpieza de usuarios:', error);
      throw error;
    }
  }
}

export default User;
