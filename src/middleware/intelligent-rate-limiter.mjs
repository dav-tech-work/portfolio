/**
 * Rate Limiting Inteligente con Redis
 * Implementa sliding window, detección de comportamiento sospechoso y límites adaptativos
 */

import { createHash } from 'crypto';
import { registrar } from '../utils/servicios/logger.mjs';

class IntelligentRateLimiter {
  constructor(options = {}) {
    this.redisClient = null;
    this.fallbackMemory = new Map();
    this.suspiciousIPs = new Set();
    this.config = {
      windowSize: options.windowSize || 60, // 60 segundos
      maxRequests: options.maxRequests || 100,
      banDuration: options.banDuration || 300, // 5 minutos
      suspiciousThreshold: options.suspiciousThreshold || 0.8,
      useRedis: options.useRedis !== false,
      ...options,
    };

    this.initializeRedis();
  }

  async initializeRedis() {
    if (
      !this.config.useRedis ||
      process.env.NODE_ENV === 'test' ||
      process.env.REDIS_ENABLED === 'false'
    ) {
      console.log('Rate Limiter: Using memory fallback (Redis disabled)');
      return;
    }

    try {
      // Intentar conectar con Redis usando ioredis
      const Redis = (await import('ioredis')).default;
      this.redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB) || 0,
        keyPrefix: 'rate_limit:',
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

      // Verificar conexión
      await this.redisClient.ping();
      registrar('Rate Limiter: Redis conectado exitosamente');

      // Manejar errores de conexión
      this.redisClient.on('error', (err) => {
        console.warn('Redis error, falling back to memory:', err.message);
        this.redisClient = null;
      });
    } catch (error) {
      console.warn('Redis no disponible, usando memoria:', error.message);
      this.redisClient = null;
    }
  }

  getIdentifier(req) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || '';
    const acceptLanguage = req.get('Accept-Language') || '';

    // Crear fingerprint más robusto
    const fingerprint = createHash('sha256')
      .update(ip + userAgent + acceptLanguage)
      .digest('hex')
      .substring(0, 12);

    return `${ip}:${fingerprint}`;
  }

  async getCurrentCount(identifier, window) {
    const key = `rate_limit:${identifier}:${window}`;

    if (this.redisClient) {
      try {
        const count = await this.redisClient.get(key);
        return parseInt(count) || 0;
      } catch (error) {
        console.warn('Redis get error:', error.message);
        return this.getMemoryCount(key);
      }
    }

    return this.getMemoryCount(key);
  }

  async incrementCount(identifier, window) {
    const key = `rate_limit:${identifier}:${window}`;

    if (this.redisClient) {
      try {
        const count = await this.redisClient.incr(key);
        if (count === 1) {
          await this.redisClient.expire(key, this.config.windowSize);
        }
        return count;
      } catch (error) {
        console.warn('Redis incr error:', error.message);
        return this.incrementMemoryCount(key);
      }
    }

    return this.incrementMemoryCount(key);
  }

  getMemoryCount(key) {
    const entry = this.fallbackMemory.get(key);
    if (!entry || Date.now() > entry.expiry) {
      return 0;
    }
    return entry.count;
  }

  incrementMemoryCount(key) {
    const now = Date.now();
    const entry = this.fallbackMemory.get(key);

    if (!entry || now > entry.expiry) {
      const newEntry = {
        count: 1,
        expiry: now + this.config.windowSize * 1000,
      };
      this.fallbackMemory.set(key, newEntry);
      return 1;
    }

    entry.count++;
    return entry.count;
  }

  async markSuspicious(identifier, reason) {
    this.suspiciousIPs.add(identifier);
    registrar(`Marked suspicious: ${identifier} - ${reason}`);

    // Limpiar IPs sospechosas cada hora
    setTimeout(() => {
      this.suspiciousIPs.delete(identifier);
    }, 3600000);
  }

  getAdaptiveLimit(req, identifier) {
    let baseLimit = this.config.maxRequests;

    // Reducir límite para IPs sospechosas
    if (this.suspiciousIPs.has(identifier)) {
      baseLimit = Math.floor(baseLimit * 0.3);
    }

    // Diferentes límites por tipo de endpoint
    const path = req.path.toLowerCase();

    if (path.includes('/auth/') || path.includes('/login')) {
      return Math.floor(baseLimit * 0.1); // 10% del límite base para auth
    }

    if (path.includes('/api/')) {
      return Math.floor(baseLimit * 0.7); // 70% para APIs
    }

    if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      return baseLimit * 3; // 3x para assets estáticos
    }

    return baseLimit;
  }

  async checkRateLimit(req, res, next) {
    const identifier = this.getIdentifier(req);
    const currentWindow = Math.floor(Date.now() / 1000 / this.config.windowSize);
    const limit = this.getAdaptiveLimit(req, identifier);

    // Sliding window check (ventana actual + anterior)
    const currentCount = await this.getCurrentCount(identifier, currentWindow);
    const previousCount = await this.getCurrentCount(identifier, currentWindow - 1);

    // Calcular peso de la ventana anterior
    const timeInCurrentWindow = (Date.now() / 1000) % this.config.windowSize;
    const weightPrevious = Math.max(
      0,
      (this.config.windowSize - timeInCurrentWindow) / this.config.windowSize
    );

    const effectiveCount = currentCount + previousCount * weightPrevious;

    // Detectar comportamiento sospechoso
    if (effectiveCount > limit * this.config.suspiciousThreshold) {
      await this.markSuspicious(identifier, `High request rate: ${effectiveCount}/${limit}`);
    }

    // Incrementar contador
    const newCount = await this.incrementCount(identifier, currentWindow);

    // Headers informativos
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - newCount));
    res.setHeader('X-RateLimit-Reset', (currentWindow + 1) * this.config.windowSize);
    res.setHeader('X-RateLimit-Window', this.config.windowSize);

    // Verificar si excede el límite
    if (effectiveCount > limit) {
      registrar(`Rate limit exceeded: ${identifier} - ${effectiveCount}/${limit} requests`);

      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: this.config.windowSize,
        limit: limit,
        current: Math.floor(effectiveCount),
        type: 'intelligent_rate_limit',
        window: this.config.windowSize,
      });
    }

    next();
  }

  // Middleware factory para diferentes configuraciones
  static create(options = {}) {
    const limiter = new IntelligentRateLimiter(options);
    return limiter.checkRateLimit.bind(limiter);
  }

  // Limpiar memoria periódicamente
  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.fallbackMemory.entries()) {
        if (now > entry.expiry) {
          this.fallbackMemory.delete(key);
        }
      }
    }, 60000); // Limpiar cada minuto
  }

  async getStats() {
    const stats = {
      suspiciousIPs: this.suspiciousIPs.size,
      memoryEntries: this.fallbackMemory.size,
      redisConnected: !!this.redisClient,
      config: this.config,
    };

    if (this.redisClient) {
      try {
        const info = await this.redisClient.info('memory');
        stats.redisMemory = info;
      } catch (error) {
        stats.redisError = error.message;
      }
    }

    return stats;
  }
}

// Configuraciones predefinidas
export const rateLimiters = {
  // Rate limiter general
  general: IntelligentRateLimiter.create({
    maxRequests: 100,
    windowSize: 60,
    suspiciousThreshold: 0.8,
  }),

  // Rate limiter para autenticación
  auth: IntelligentRateLimiter.create({
    maxRequests: 5,
    windowSize: 300, // 5 minutos
    suspiciousThreshold: 0.6,
    banDuration: 900, // 15 minutos
  }),

  // Rate limiter para APIs
  api: IntelligentRateLimiter.create({
    maxRequests: 1000,
    windowSize: 60,
    suspiciousThreshold: 0.9,
  }),

  // Rate limiter estricto
  strict: IntelligentRateLimiter.create({
    maxRequests: 10,
    windowSize: 300,
    suspiciousThreshold: 0.5,
  }),
};

export default IntelligentRateLimiter;
