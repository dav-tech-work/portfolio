import express from 'express';
import os from 'os';
import { performance } from 'perf_hooks';

const router = express.Router();

/**
 * Endpoint de métricas del sistema
 */
router.get('/', (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          percentage: (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2),
        },
        cpu: {
          cores: os.cpus().length,
          loadAverage: os.loadavg(),
        },
      },
      process: {
        pid: process.pid,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        version: process.version,
      },
      performance: {
        timeOrigin: performance.timeOrigin,
        now: performance.now(),
      },
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo métricas', message: error.message });
  }
});

/**
 * Endpoint de salud simplificado
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
