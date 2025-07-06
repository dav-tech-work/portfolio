# 🚀 Instalación y Configuración

## 📋 Requisitos Previos

### Sistema Operativo

- ✅ **Windows 10/11** (recomendado)
- ✅ **macOS 10.15+**
- ✅ **Ubuntu 18.04+** / **Debian 10+**

### Software Requerido

- **Node.js**: Versión 18.0.0 o superior
- **npm**: Versión 8.0.0 o superior
- **Git**: Para clonar el repositorio
- **Editor de código**: VS Code (recomendado)

### Verificar Instalaciones

```bash
# Verificar Node.js
node --version
# Debe mostrar: v18.x.x o superior

# Verificar npm
npm --version
# Debe mostrar: 8.x.x o superior

# Verificar Git
git --version
# Debe mostrar: git version 2.x.x
```

## 🔧 Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/username/estructura_base.git
cd estructura_base

# O si ya tienes el proyecto local
cd porfolio_produccion_new
```

### 2. Instalar Dependencias

```bash
# Instalar todas las dependencias
npm install

# Verificar que la instalación fue exitosa
npm list --depth=0
```

### 3. Configurar Variables de Entorno

```bash
# Copiar el archivo de configuración de ejemplo
cp config.env.example config.env

# Editar el archivo config.env con tus valores
# En Windows:
notepad config.env
# En macOS/Linux:
nano config.env
```

### 4. Configuración Básica

Edita el archivo `config.env` con los siguientes valores mínimos:

```env
# Entorno
NODE_ENV=development
PORT=3000

# Secrets de Seguridad (generar nuevos)
JWT_SECRET=tu_jwt_secret_muy_largo_y_seguro_aqui
SESSION_SECRET=tu_session_secret_muy_largo_y_seguro_aqui

# Base de Datos (opcional para desarrollo)
MONGODB_URI=mongodb://localhost:27017/portfolio_dev

# Configuraciones de Seguridad
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000

# Configuraciones Adicionales
LOG_LEVEL=info
ENABLE_CLUSTERING=false
CORS_ORIGIN=http://localhost:3000
```

### 5. Generar Secrets Seguros

```bash
# Generar secrets automáticamente
npm run security:generate-secrets
```

### 6. Verificar la Instalación

```bash
# Verificar que todo está configurado correctamente
npm run verificar

# Verificar workflows
npm run verify:workflows
```

## 🚀 Ejecutar el Proyecto

### Modo Desarrollo

```bash
# Iniciar en modo desarrollo con hot reload
npm run dev

# El servidor estará disponible en:
# http://localhost:3000
```

### Modo Producción

```bash
# Construir y verificar el proyecto
npm run build

# Iniciar en modo producción
npm start

# O con clustering (recomendado para producción)
npm run start:cluster
```

### Modo Debug

```bash
# Iniciar con debugging habilitado
npm run dev:debug

# Luego abrir Chrome DevTools y conectar a:
# chrome://inspect
```

## 🔍 Verificar que Todo Funciona

### 1. Health Check

```bash
# Verificar que el servidor responde
curl http://localhost:3000/health
# Debe devolver un JSON con información del sistema
```

### 2. Tests Básicos

```bash
# Ejecutar tests unitarios
npm test

# Ejecutar tests de seguridad
npm run test:security

# Ejecutar tests de rendimiento
npm run test:performance
```

### 3. Linting

```bash
# Verificar calidad del código backend
npm run lint

# Verificar calidad del código frontend
npm run lint:frontend
```

## 🛠️ Configuración Avanzada

### Configurar Base de Datos

Si quieres usar MongoDB:

```bash
# 1. Instalar MongoDB localmente o usar MongoDB Atlas
# 2. Configurar la URI en config.env
MONGODB_URI=mongodb://localhost:27017/portfolio_dev

# 3. Inicializar la base de datos
npm run db:init

# 4. Verificar el estado
npm run db:status
```

### Configurar Email

Para funcionalidades de email:

```env
# En config.env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
```

### Configurar SSL/HTTPS

Para desarrollo local con HTTPS:

```bash
# Generar certificados SSL locales
npm run security:generate-secrets

# Configurar en config.env
SSL_KEY_PATH=./ssl/key.pem
SSL_CERT_PATH=./ssl/cert.pem
```

## 🔧 Solución de Problemas

### Problemas Comunes

#### 1. Puerto en Uso

```bash
# Error: EADDRINUSE
# Solución: Cambiar el puerto en config.env
PORT=3001
```

#### 2. Dependencias Faltantes

```bash
# Error: Cannot find module
# Solución: Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

#### 3. Permisos de Archivos

```bash
# Error: EACCES
# Solución: Verificar permisos
chmod +x scripts/*.mjs
```

#### 4. Variables de Entorno

```bash
# Error: Variables de entorno faltantes
# Solución: Verificar config.env
npm run security:generate-secrets
```

### Logs y Debugging

```bash
# Ver logs en tiempo real
tail -f logs/app.log

# Ver logs de error
tail -f logs/error.log

# Debug del servidor
npm run dev:debug
```

## 📊 Verificación Final

Ejecuta esta secuencia para verificar que todo funciona:

```bash
# 1. Verificar instalación
npm run verificar

# 2. Ejecutar tests
npm test

# 3. Verificar linting
npm run lint

# 4. Iniciar servidor
npm run dev

# 5. Verificar endpoints
curl http://localhost:3000/health
curl http://localhost:3000/
```

## 🎉 ¡Listo!

Si todos los pasos anteriores funcionan correctamente, tu proyecto está listo para desarrollo.

### Próximos Pasos:

1. 📖 Leer la [Guía de Desarrollo](./desarrollo.md)
2. 🔒 Revisar la [Guía de Seguridad](./seguridad.md)
3. 🧪 Familiarizarse con los [Tests](./testing.md)
4. 🚀 Preparar para [Despliegue](./despliegue.md)

---

**¿Necesitas ayuda?** Consulta la [documentación completa](./README.md) o crea un issue en GitHub.
