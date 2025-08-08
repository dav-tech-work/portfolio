/**
 * Gestor Avanzado de JWT con Refresh Tokens
 * Implementa autenticación segura con detección de robo de tokens y rotación automática
 */

import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import crypto from 'crypto';
import { registrar } from '../servicios/logger.mjs';

class JWTManager {
  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET;
    this.refreshTokenSecret =
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET + '_refresh';
    this.accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';

    // En producción, usar Redis para almacenar refresh tokens
    this.refreshTokens = new Map();
    this.userSessions = new Map(); // Para rastrear sesiones por usuario
    this.redisClient = null;

    this.initializeRedis();
    this.startCleanupProcess();
  }

  async initializeRedis() {
    // Deshabilitar Redis en tests o si está configurado así
    if (process.env.NODE_ENV === 'test' || process.env.REDIS_ENABLED === 'false') {
      console.log('JWT Manager: Redis disabled for tests/config');
      this.redisClient = null;
      return;
    }

    try {
      const Redis = (await import('ioredis')).default;
      this.redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB) || 1, // Usar DB diferente para auth
        keyPrefix: 'auth:',
        retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY) || 1000,
        maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES) || 3,
        connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT) || 10000,
        commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT) || 5000,
        lazyConnect: true,
        enableReadyCheck: true,
        maxLoadingTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT) || 10000,
        retryDelayOnClusterDown: 300,
        enableOfflineQueue: false,
        keepAlive: 30000,
        family: 4, // Forzar IPv4
      });

      await this.redisClient.ping();
      registrar('JWT Manager: Redis conectado para gestión de tokens');
    } catch (error) {
      console.warn('JWT Manager: Redis no disponible, usando memoria:', error.message);
      this.redisClient = null;
    }
  }

  /**
   * Generar par de tokens (access + refresh)
   */
  generateTokenPair(user, req = {}) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      permissions: user.permissions || [],
      iat: Math.floor(Date.now() / 1000),
    };

    // Generar access token con información completa
    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'secure-app',
      audience: 'secure-app-users',
      subject: String(user.id),
    });

    // Generar refresh token criptográficamente seguro
    const refreshToken = crypto.randomBytes(64).toString('hex');

    // Crear fingerprint del dispositivo
    const deviceFingerprint = this.createDeviceFingerprint(req);

    // Metadata del token
    const tokenData = {
      userId: user.id,
      userEmail: user.email,
      deviceFingerprint: deviceFingerprint,
      issuedAt: Date.now(),
      lastUsed: Date.now(),
      userAgent: req.get ? req.get('User-Agent') : '',
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      expiresAt: Date.now() + this.parseExpiry(this.refreshTokenExpiry),
      isActive: true,
      familyId: crypto.randomBytes(16).toString('hex'), // Para detección de robo
    };

    this.storeRefreshToken(refreshToken, tokenData);
    this.trackUserSession(user.id, refreshToken, tokenData);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiry(this.accessTokenExpiry) / 1000,
      tokenType: 'Bearer',
    };
  }

  /**
   * Crear fingerprint único del dispositivo
   */
  createDeviceFingerprint(req) {
    const userAgent = req.get ? req.get('User-Agent') : '';
    const acceptLanguage = req.get ? req.get('Accept-Language') : '';
    const acceptEncoding = req.get ? req.get('Accept-Encoding') : '';
    const ip = req.ip || req.connection?.remoteAddress || '';

    return crypto
      .createHash('sha256')
      .update(userAgent + acceptLanguage + acceptEncoding + ip)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Almacenar refresh token
   */
  async storeRefreshToken(token, data) {
    if (this.redisClient) {
      try {
        const ttl = Math.floor((data.expiresAt - Date.now()) / 1000);
        await this.redisClient.setex(`refresh:${token}`, ttl, JSON.stringify(data));
        return;
      } catch (error) {
        console.warn('Error storing refresh token in Redis:', error.message);
      }
    }

    // Fallback a memoria
    this.refreshTokens.set(token, data);
  }

  /**
   * Obtener datos del refresh token
   */
  async getRefreshTokenData(token) {
    if (this.redisClient) {
      try {
        const data = await this.redisClient.get(`refresh:${token}`);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.warn('Error getting refresh token from Redis:', error.message);
      }
    }

    return this.refreshTokens.get(token) || null;
  }

  /**
   * Eliminar refresh token
   */
  async deleteRefreshToken(token) {
    if (this.redisClient) {
      try {
        await this.redisClient.del(`refresh:${token}`);
      } catch (error) {
        console.warn('Error deleting refresh token from Redis:', error.message);
      }
    }

    this.refreshTokens.delete(token);
  }

  /**
   * Rastrear sesiones por usuario
   */
  trackUserSession(userId, token, data) {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }

    this.userSessions.get(userId).add({
      token,
      deviceFingerprint: data.deviceFingerprint,
      lastUsed: data.lastUsed,
      userAgent: data.userAgent,
      ip: data.ip,
    });
  }

  /**
   * Verificar access token
   */
  async verifyAccessToken(token) {
    try {
      const decoded = await promisify(jwt.verify)(token, this.accessTokenSecret, {
        issuer: 'secure-app',
        audience: 'secure-app-users',
      });

      return {
        valid: true,
        payload: decoded,
        expired: false,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return {
          valid: false,
          error: 'Token expired',
          expired: true,
        };
      }

      return {
        valid: false,
        error: error.message,
        expired: false,
      };
    }
  }

  /**
   * Refrescar access token con detección de robo
   */
  async refreshAccessToken(refreshToken, req) {
    const tokenData = await this.getRefreshTokenData(refreshToken);

    if (!tokenData || !tokenData.isActive) {
      throw new Error('Invalid refresh token');
    }

    // Verificar expiración
    if (Date.now() > tokenData.expiresAt) {
      await this.deleteRefreshToken(refreshToken);
      throw new Error('Refresh token expired');
    }

    // Crear fingerprint actual y comparar
    const currentFingerprint = this.createDeviceFingerprint(req);

    // Detección de robo de token
    if (tokenData.deviceFingerprint !== currentFingerprint) {
      registrar(
        `Token theft detected! Original: ${tokenData.deviceFingerprint}, Current: ${currentFingerprint}`
      );

      // Invalidar todos los tokens del usuario
      await this.invalidateAllUserTokens(tokenData.userId);

      throw new Error('Token theft detected - all sessions invalidated');
    }

    // Verificar uso sospechoso (múltiples requests muy rápidos desde diferentes IPs)
    const currentTime = Date.now();
    const timeSinceLastUse = currentTime - tokenData.lastUsed;
    const currentIp = req.ip || req.connection?.remoteAddress || 'unknown';

    if (timeSinceLastUse < 1000 && tokenData.ip !== currentIp) {
      registrar(
        `Suspicious token usage detected: ${tokenData.userId} from ${currentIp} (previous: ${tokenData.ip})`
      );

      // Marcar como sospechoso pero no invalidar inmediatamente
      tokenData.suspiciousActivity = (tokenData.suspiciousActivity || 0) + 1;

      if (tokenData.suspiciousActivity >= 3) {
        await this.invalidateAllUserTokens(tokenData.userId);
        throw new Error('Suspicious activity detected - sessions invalidated');
      }
    }

    // Actualizar metadata
    tokenData.lastUsed = currentTime;
    tokenData.ip = currentIp;
    tokenData.userAgent = req.get ? req.get('User-Agent') : '';

    // Obtener datos actualizados del usuario
    const user = await this.getUserById(tokenData.userId);
    if (!user) {
      await this.deleteRefreshToken(refreshToken);
      throw new Error('User not found');
    }

    // Generar nuevo par de tokens (rotación automática)
    const newTokenPair = this.generateTokenPair(user, req);

    // Invalidar el refresh token anterior
    await this.deleteRefreshToken(refreshToken);

    registrar(`Tokens refreshed for user ${user.id} from ${currentIp}`);

    return newTokenPair;
  }

  /**
   * Invalidar todos los tokens de un usuario
   */
  async invalidateAllUserTokens(userId) {
    registrar(`Invalidating all tokens for user ${userId}`);

    if (this.redisClient) {
      try {
        const pattern = `refresh:*`;
        const keys = await this.redisClient.keys(pattern);

        for (const key of keys) {
          const data = await this.redisClient.get(key);
          if (data) {
            const tokenData = JSON.parse(data);
            if (tokenData.userId === userId) {
              await this.redisClient.del(key);
            }
          }
        }
      } catch (error) {
        console.warn('Error invalidating Redis tokens:', error.message);
      }
    }

    // Limpiar memoria
    for (const [token, data] of this.refreshTokens.entries()) {
      if (data.userId === userId) {
        this.refreshTokens.delete(token);
      }
    }

    this.userSessions.delete(userId);
  }

  /**
   * Logout seguro
   */
  async logout(refreshToken, _userId = null) {
    const tokenData = await this.getRefreshTokenData(refreshToken);

    if (tokenData) {
      await this.deleteRefreshToken(refreshToken);

      // Remover de sesiones de usuario
      if (tokenData.userId && this.userSessions.has(tokenData.userId)) {
        const sessions = this.userSessions.get(tokenData.userId);
        sessions.forEach((session) => {
          if (session.token === refreshToken) {
            sessions.delete(session);
          }
        });
      }

      registrar(`User ${tokenData.userId} logged out`);
      return true;
    }

    return false;
  }

  /**
   * Obtener sesiones activas de un usuario
   */
  async getUserActiveSessions(userId) {
    const sessions = [];

    if (this.redisClient) {
      try {
        const pattern = `refresh:*`;
        const keys = await this.redisClient.keys(pattern);

        for (const key of keys) {
          const data = await this.redisClient.get(key);
          if (data) {
            const tokenData = JSON.parse(data);
            if (tokenData.userId === userId && tokenData.isActive) {
              sessions.push({
                deviceFingerprint: tokenData.deviceFingerprint,
                lastUsed: new Date(tokenData.lastUsed),
                userAgent: tokenData.userAgent,
                ip: tokenData.ip,
                issuedAt: new Date(tokenData.issuedAt),
              });
            }
          }
        }
      } catch (error) {
        console.warn('Error getting user sessions from Redis:', error.message);
      }
    }

    // Fallback a memoria
    for (const data of this.refreshTokens.values()) {
      if (data.userId === userId && data.isActive) {
        sessions.push({
          deviceFingerprint: data.deviceFingerprint,
          lastUsed: new Date(data.lastUsed),
          userAgent: data.userAgent,
          ip: data.ip,
          issuedAt: new Date(data.issuedAt),
        });
      }
    }

    return sessions;
  }

  /**
   * Middleware de autenticación
   */
  authenticationMiddleware() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            error: 'Access token required',
            type: 'missing_token',
          });
        }

        const token = authHeader.substring(7);
        const result = await this.verifyAccessToken(token);

        if (!result.valid) {
          return res.status(401).json({
            error: result.error,
            type: result.expired ? 'token_expired' : 'invalid_token',
            expired: result.expired,
          });
        }

        // Añadir información del usuario al request
        req.user = result.payload;
        req.userId = result.payload.id;

        next();
      } catch (error) {
        registrar(`Authentication error: ${error.message}`);
        return res.status(500).json({
          error: 'Authentication failed',
        });
      }
    };
  }

  /**
   * Proceso de limpieza automática
   */
  startCleanupProcess() {
    setInterval(
      () => {
        const now = Date.now();

        // Limpiar tokens expirados de memoria
        for (const [token, data] of this.refreshTokens.entries()) {
          if (now > data.expiresAt) {
            this.refreshTokens.delete(token);
          }
        }

        // Limpiar sesiones vacías
        for (const [userId, sessions] of this.userSessions.entries()) {
          if (sessions.size === 0) {
            this.userSessions.delete(userId);
          }
        }
      },
      5 * 60 * 1000
    ); // Cada 5 minutos
  }

  /**
   * Parsear tiempo de expiración a milisegundos
   */
  parseExpiry(expiry) {
    const units = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const match = expiry.match(/^(\d+)([smhd])$/);
    if (match) {
      return parseInt(match[1]) * units[match[2]];
    }

    return 15 * 60 * 1000; // Default 15 minutos
  }

  /**
   * Obtener usuario por ID (placeholder - implementar según tu DB)
   */
  async getUserById(userId) {
    // Implementar según tu sistema de base de datos
    // Retornar objeto usuario con id, email, role, permissions
    return {
      id: userId,
      email: 'user@example.com',
      role: 'user',
      permissions: [],
    };
  }

  /**
   * Obtener estadísticas del sistema de tokens
   */
  async getTokenStats() {
    let totalTokens = this.refreshTokens.size;
    const activeUsers = this.userSessions.size;

    if (this.redisClient) {
      try {
        const keys = await this.redisClient.keys('refresh:*');
        totalTokens = keys.length;
      } catch (error) {
        console.warn('Error getting token stats from Redis:', error.message);
      }
    }

    return {
      totalRefreshTokens: totalTokens,
      activeUsers: activeUsers,
      memoryTokens: this.refreshTokens.size,
      redisConnected: !!this.redisClient,
      config: {
        accessTokenExpiry: this.accessTokenExpiry,
        refreshTokenExpiry: this.refreshTokenExpiry,
      },
    };
  }
}

// Instancia singleton
const jwtManager = new JWTManager();

export default jwtManager;
export { JWTManager };
