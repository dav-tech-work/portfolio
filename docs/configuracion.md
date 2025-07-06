# ⚙️ Configuración del Proyecto

## 🎯 Descripción General

Este documento describe todas las opciones de configuración disponibles en el proyecto, incluyendo variables de entorno, configuraciones de seguridad, rendimiento y desarrollo.

## 📄 Archivos de Configuración

### 📄 `config.env`

Archivo principal de configuración con variables de entorno.

### 📄 `config.env.example`

Archivo de ejemplo que muestra todas las variables disponibles.

### 📄 `package.json`

Configuración del proyecto, dependencias y scripts.

## 🔧 Variables de Entorno

### 🌍 Entorno y Servidor

```env
# Entorno de ejecución
NODE_ENV=development          # development, production, test

# Configuración del servidor
PORT=3000                     # Puerto del servidor
HOST=localhost                # Host del servidor
PROTOCOL=http                 # Protocolo (http, https)

# Configuración de clustering
ENABLE_CLUSTERING=false       # Habilitar clustering en producción
CLUSTER_WORKERS=4             # Número de workers (CPU cores)
```

### 🔐 Seguridad

```env
# Secrets de autenticación
JWT_SECRET=tu_jwt_secret_muy_largo_y_seguro_aqui
SESSION_SECRET=tu_session_secret_muy_largo_y_seguro_aqui

# Configuración de bcrypt
BCRYPT_ROUNDS=10              # Rondas de hashing (10-12 recomendado)

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000    # Ventana de tiempo (1 minuto)
RATE_LIMIT_MAX_REQUESTS=1000  # Máximo de requests por ventana

# Configuración de sesiones
SESSION_MAX_AGE=3600000       # Duración de sesión (1 hora)
SESSION_SECURE=false          # Cookies seguras (true en producción)
SESSION_HTTP_ONLY=true        # Cookies solo HTTP
SESSION_SAME_SITE=strict      # Política SameSite

# Headers de seguridad
CSP_ENABLED=true              # Content Security Policy
HSTS_ENABLED=true             # HTTP Strict Transport Security
XSS_PROTECTION=true           # Protección XSS
CONTENT_TYPE_NOSNIFF=true     # Prevenir MIME sniffing
```

### 🗄️ Base de Datos

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/portfolio_dev
MONGODB_OPTIONS=retryWrites=true&w=majority

# Configuración de conexión
DB_CONNECTION_TIMEOUT=30000   # Timeout de conexión (30s)
DB_SOCKET_TIMEOUT=45000       # Timeout de socket (45s)
DB_POOL_SIZE=10               # Tamaño del pool de conexiones
```

### 📧 Email

```env
# Configuración SMTP
EMAIL_HOST=smtp.gmail.com     # Servidor SMTP
EMAIL_PORT=587                # Puerto SMTP
EMAIL_SECURE=false            # Usar TLS
EMAIL_USER=tu_email@gmail.com # Usuario SMTP
EMAIL_PASS=tu_password        # Contraseña SMTP

# Configuración de email
EMAIL_FROM=noreply@tuapp.com  # Email remitente
EMAIL_REPLY_TO=soporte@tuapp.com # Email de respuesta
```

### 🗜️ Compresión y Optimización

```env
# Compresión
COMPRESSION_ENABLED=true      # Habilitar compresión gzip
COMPRESSION_LEVEL=6           # Nivel de compresión (1-9)
COMPRESSION_THRESHOLD=1024    # Tamaño mínimo para comprimir

# Minificación
MINIFY_HTML=true              # Minificar HTML
MINIFY_CSS=true               # Minificar CSS
MINIFY_JS=true                # Minificar JavaScript

# Caché
CACHE_ENABLED=true            # Habilitar caché
CACHE_MAX_AGE=86400000        # Tiempo de caché (24 horas)
```

### 🌐 CORS y Headers

```env
# CORS
CORS_ENABLED=true             # Habilitar CORS
CORS_ORIGIN=http://localhost:3000 # Origen permitido
CORS_METHODS=GET,POST,PUT,DELETE # Métodos permitidos
CORS_CREDENTIALS=true         # Permitir credenciales

# Headers personalizados
CUSTOM_HEADERS_ENABLED=true   # Habilitar headers personalizados
X_FRAME_OPTIONS=SAMEORIGIN    # Protección clickjacking
X_CONTENT_TYPE_OPTIONS=nosniff # Prevenir MIME sniffing
```

### 📊 Logging

```env
# Configuración de logs
LOG_LEVEL=info                # Nivel de log (error, warn, info, debug)
LOG_FORMAT=combined           # Formato de log
LOG_FILE_ENABLED=true         # Habilitar logs en archivo
LOG_CONSOLE_ENABLED=true      # Habilitar logs en consola

# Archivos de log
LOG_APP_FILE=logs/app.log     # Log de aplicación
LOG_ERROR_FILE=logs/error.log # Log de errores
LOG_SECURITY_FILE=logs/security.log # Log de seguridad
```

### 🧪 Testing

```env
# Configuración de tests
TEST_TIMEOUT=10000            # Timeout de tests (10s)
TEST_ENVIRONMENT=test         # Entorno de testing
TEST_DATABASE=test_db         # Base de datos de test

# Cobertura de código
COVERAGE_ENABLED=true         # Habilitar cobertura
COVERAGE_REPORTERS=text,html,lcov # Reporters de cobertura
COVERAGE_THRESHOLD=80         # Umbral mínimo de cobertura (%)
```

### 🔍 Debugging

```env
# Configuración de debug
DEBUG_ENABLED=false           # Habilitar modo debug
DEBUG_PORT=9229               # Puerto de debug
DEBUG_HOST=localhost          # Host de debug

# Trace warnings
TRACE_WARNINGS=false          # Mostrar trace warnings
```

## 🛠️ Configuraciones Específicas

### Configuración de Seguridad Avanzada

```env
# Protección CSRF
CSRF_ENABLED=true
CSRF_SECRET=csrf_secret_aqui
CSRF_COOKIE_NAME=_csrf

# Sanitización
SANITIZE_ENABLED=true
SANITIZE_STRICT=true
SANITIZE_WHITELIST=[]         # Lista blanca de tags HTML

# Validación
VALIDATION_STRICT=true
VALIDATION_CUSTOM_RULES=true
```

### Configuración de Rendimiento

```env
# Optimización de memoria
MEMORY_LIMIT=512              # Límite de memoria (MB)
GC_INTERVAL=30000             # Intervalo de garbage collection

# Optimización de CPU
CPU_PROFILING=false           # Habilitar profiling de CPU
HEAP_PROFILING=false          # Habilitar profiling de heap

# Optimización de red
KEEP_ALIVE_TIMEOUT=65000      # Timeout de keep-alive
HEADERS_TIMEOUT=66000         # Timeout de headers
```

### Configuración de Desarrollo

```env
# Hot reload
HOT_RELOAD_ENABLED=true       # Habilitar hot reload
HOT_RELOAD_WATCH=src,views    # Directorios a vigilar
HOT_RELOAD_IGNORE=node_modules,logs # Directorios a ignorar

# Linting
LINT_ON_SAVE=true             # Lint automático al guardar
LINT_FIX_ON_SAVE=false        # Corregir automáticamente
LINT_IGNORE_PATTERNS=[]       # Patrones a ignorar

# Formateo
FORMAT_ON_SAVE=true           # Formatear automáticamente
FORMAT_IGNORE_PATTERNS=[]     # Patrones a ignorar
```

## 🎯 Configuraciones por Entorno

### Desarrollo (`NODE_ENV=development`)

```env
# Configuración optimizada para desarrollo
DEBUG_ENABLED=true
LOG_LEVEL=debug
HOT_RELOAD_ENABLED=true
LINT_ON_SAVE=true
FORMAT_ON_SAVE=true
CORS_ORIGIN=http://localhost:3000
SESSION_SECURE=false
```

### Producción (`NODE_ENV=production`)

```env
# Configuración optimizada para producción
DEBUG_ENABLED=false
LOG_LEVEL=warn
HOT_RELOAD_ENABLED=false
LINT_ON_SAVE=false
FORMAT_ON_SAVE=false
CORS_ORIGIN=https://tuapp.com
SESSION_SECURE=true
ENABLE_CLUSTERING=true
COMPRESSION_ENABLED=true
CACHE_ENABLED=true
```

### Testing (`NODE_ENV=test`)

```env
# Configuración optimizada para testing
DEBUG_ENABLED=false
LOG_LEVEL=error
HOT_RELOAD_ENABLED=false
LINT_ON_SAVE=false
FORMAT_ON_SAVE=false
TEST_ENVIRONMENT=test
COVERAGE_ENABLED=true
```

## 🔧 Configuración de Middlewares

### Rate Limiting

```javascript
// Configuración de rate limiting
const rateLimitConfig = {
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 1000,
  message: 'Demasiadas peticiones desde esta IP',
  standardHeaders: true,
  legacyHeaders: false,
};
```

### Compresión

```javascript
// Configuración de compresión
const compressionConfig = {
  level: process.env.COMPRESSION_LEVEL || 6,
  threshold: process.env.COMPRESSION_THRESHOLD || 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
};
```

### CORS

```javascript
// Configuración de CORS
const corsConfig = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: process.env.CORS_METHODS?.split(',') || ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: process.env.CORS_CREDENTIALS === 'true',
  optionsSuccessStatus: 200,
};
```

## 🔍 Validación de Configuración

### Script de Validación

```bash
# Validar configuración
npm run verificar

# Verificar variables de entorno
node scripts/health-check.mjs

# Verificar configuración de seguridad
npm run security:check
```

### Validación Automática

El proyecto incluye validación automática de configuración:

```javascript
// Validación de variables críticas
const requiredEnvVars = ['NODE_ENV', 'PORT', 'JWT_SECRET', 'SESSION_SECRET'];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Variable de entorno requerida: ${varName}`);
  }
});
```

## 🔧 Configuración Dinámica

### Carga de Configuración

```javascript
// src/config/environment.mjs
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), 'config.env') });

// Validar y exportar configuración
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 3000,
  // ... más configuraciones
};
```

### Configuración Condicional

```javascript
// Configuración basada en entorno
const getConfig = () => {
  const baseConfig = {
    // Configuración base
  };

  switch (process.env.NODE_ENV) {
    case 'production':
      return { ...baseConfig, ...productionConfig };
    case 'test':
      return { ...baseConfig, ...testConfig };
    default:
      return { ...baseConfig, ...developmentConfig };
  }
};
```

## 🔒 Seguridad de Configuración

### Protección de Secrets

```env
# NUNCA committear estos valores
JWT_SECRET=tu_secret_aqui
SESSION_SECRET=tu_secret_aqui
EMAIL_PASS=tu_password_aqui
MONGODB_URI=tu_uri_aqui
```

### Validación de Secrets

```javascript
// Validar que los secrets sean seguros
const validateSecrets = () => {
  const secrets = [process.env.JWT_SECRET, process.env.SESSION_SECRET];

  secrets.forEach((secret) => {
    if (!secret || secret.length < 32) {
      throw new Error('Los secrets deben tener al menos 32 caracteres');
    }
  });
};
```

## 📊 Monitoreo de Configuración

### Logs de Configuración

```javascript
// Log de configuración al inicio
console.log('🔧 Configuración cargada:', {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  database: process.env.MONGODB_URI ? 'Configurada' : 'No configurada',
  security: process.env.JWT_SECRET ? 'Configurada' : 'No configurada',
});
```

### Métricas de Configuración

```javascript
// Métricas de configuración
const configMetrics = {
  env: process.env.NODE_ENV,
  features: {
    clustering: process.env.ENABLE_CLUSTERING === 'true',
    compression: process.env.COMPRESSION_ENABLED === 'true',
    security: process.env.CSP_ENABLED === 'true',
  },
};
```

## 🔍 Troubleshooting

### Problemas Comunes

#### Variables de Entorno No Cargadas

```bash
# Verificar que config.env existe
ls -la config.env

# Verificar sintaxis
cat config.env | grep -v '^#' | grep -v '^$'
```

#### Configuración de Seguridad

```bash
# Verificar configuración de seguridad
npm run security:check

# Generar secrets seguros
npm run security:generate-secrets
```

#### Configuración de Base de Datos

```bash
# Verificar conexión
npm run db:status

# Inicializar base de datos
npm run db:init
```

## 📚 Referencias

- [Node.js Environment Variables](https://nodejs.org/api/process.html#process_process_env)
- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [Express Configuration](https://expressjs.com/en/advanced/best-practices-performance.html)
- [Security Best Practices](https://expressjs.com/en/advanced/best-practices-security.html)

---

**¿Necesitas ayuda con alguna configuración específica?** Consulta la documentación completa o crea un issue en GitHub.
