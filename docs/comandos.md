# 📦 Comandos NPM

## 🎯 Descripción General

Este documento describe todos los comandos npm disponibles en el proyecto, organizados por categorías para facilitar su uso.

## 🚀 Comandos de Inicio

### `npm start`

Inicia la aplicación en modo producción.

```bash
npm start
```

**Descripción**: Ejecuta la aplicación con configuración de producción.
**Equivalente**: `cross-env NODE_ENV=production node app.mjs`

### `npm run start:prod`

Inicia la aplicación en modo producción con variables de entorno específicas.

```bash
npm run start:prod
```

**Descripción**: Similar a `npm start` pero con configuración explícita de producción.

### `npm run start:cluster`

Inicia la aplicación con clustering habilitado.

```bash
npm run start:cluster
```

**Descripción**: Utiliza múltiples workers para mejorar el rendimiento en producción.

### `npm run dev`

Inicia la aplicación en modo desarrollo con hot reload.

```bash
npm run dev
```

**Descripción**: Ejecuta la aplicación en modo desarrollo con recarga automática al detectar cambios.

### `npm run dev:debug`

Inicia la aplicación en modo debug.

```bash
npm run dev:debug
```

**Descripción**: Habilita el debugging de Node.js para desarrollo.

### `npm run dev:trace`

Inicia la aplicación con trace warnings habilitado.

```bash
npm run dev:trace
```

**Descripción**: Muestra warnings detallados para debugging.

## 🧪 Comandos de Testing

### `npm test`

Ejecuta todos los tests del proyecto.

```bash
npm test
```

**Descripción**: Ejecuta tests unitarios, de seguridad y de rendimiento.
**Equivalente**: `mocha test/**/*.test.mjs --timeout 10000`

### `npm run test:security`

Ejecuta tests específicos de seguridad.

```bash
npm run test:security
```

**Descripción**: Ejecuta tests de validación de entrada, autenticación, bot detection, etc.

### `npm run test:coverage`

Ejecuta tests con generación de reporte de cobertura.

```bash
npm run test:coverage
```

**Descripción**: Genera reportes de cobertura de código en formato HTML y LCOV.

### `npm run test:watch`

Ejecuta tests en modo watch.

```bash
npm run test:watch
```

**Descripción**: Ejecuta tests continuamente, re-ejecutando cuando hay cambios.

### `npm run test:performance`

Ejecuta tests de rendimiento.

```bash
npm run test:performance
```

**Descripción**: Ejecuta tests de tiempo de respuesta, uso de memoria y concurrencia.

## 🔍 Comandos de Linting y Formato

### `npm run lint`

Ejecuta ESLint en el código backend.

```bash
npm run lint
```

**Descripción**: Verifica la calidad del código JavaScript/ES6 en el backend.

### `npm run lint:fix`

Ejecuta ESLint con corrección automática.

```bash
npm run lint:fix
```

**Descripción**: Corrige automáticamente los errores de linting que sean corregibles.

### `npm run lint:frontend`

Ejecuta ESLint en el código frontend.

```bash
npm run lint:frontend
```

**Descripción**: Verifica la calidad del código JavaScript en la carpeta public/assets/js/.

### `npm run lint:auto-fix`

Corrige automáticamente problemas de ESLint.

```bash
npm run lint:auto-fix
```

**Descripción**: Ejecuta correcciones automáticas usando scripts personalizados.

### `npm run lint:quick-fix`

Corrección rápida de problemas comunes.

```bash
npm run lint:quick-fix
```

**Descripción**: Corrige problemas comunes de linting de forma rápida.

### `npm run format`

Formatea el código con Prettier.

```bash
npm run format
```

**Descripción**: Aplica formato consistente a todos los archivos del proyecto.

### `npm run format:check`

Verifica el formato sin modificarlo.

```bash
npm run format:check
```

**Descripción**: Verifica que el código esté correctamente formateado.

## 🔒 Comandos de Seguridad

### `npm run security:check`

Ejecuta verificaciones de seguridad.

```bash
npm run security:check
```

**Descripción**: Ejecuta auditoría de dependencias y verificaciones de seguridad personalizadas.

### `npm run security:generate-secrets`

Genera secrets seguros para la aplicación.

```bash
npm run security:generate-secrets
```

**Descripción**: Genera JWT_SECRET, SESSION_SECRET y otros secrets necesarios.

### `npm run security:audit`

Ejecuta auditoría de dependencias.

```bash
npm run security:audit
```

**Descripción**: Verifica vulnerabilidades en las dependencias del proyecto.

## ⚡ Comandos de Rendimiento

### `npm run performance:check`

Ejecuta verificaciones previas de rendimiento.

```bash
npm run performance:check
```

**Descripción**: Verifica la configuración antes de ejecutar tests de rendimiento.

### `npm run performance:test`

Ejecuta tests de rendimiento completos.

```bash
npm run performance:test
```

**Descripción**: Ejecuta tests de carga, estrés y análisis de rendimiento.

### `npm run performance:test:direct`

Ejecuta tests de rendimiento directamente.

```bash
npm run performance:test:direct
```

**Descripción**: Ejecuta tests de rendimiento sin verificaciones previas.

### `npm run performance:debug`

Ejecuta debug del servidor para análisis de rendimiento.

```bash
npm run performance:debug
```

**Descripción**: Inicia el servidor con herramientas de debugging de rendimiento.

### `npm run performance:setup`

Configura el entorno para tests de rendimiento.

```bash
npm run performance:setup
```

**Descripción**: Genera configuración específica para testing de rendimiento.

### `npm run performance:monitor`

Monitorea el rendimiento en tiempo real.

```bash
npm run performance:monitor
```

**Descripción**: Inicia monitoreo continuo del rendimiento del sistema.

## 🗄️ Comandos de Base de Datos

### `npm run db:init`

Inicializa la base de datos.

```bash
npm run db:init
```

**Descripción**: Crea las tablas y configuraciones iniciales de la base de datos.

### `npm run db:init:force`

Fuerza la inicialización de la base de datos.

```bash
npm run db:init:force
```

**Descripción**: Recrea completamente la base de datos (¡CUIDADO: borra datos existentes!).

### `npm run db:status`

Muestra el estado de la base de datos.

```bash
npm run db:status
```

**Descripción**: Verifica la conexión y estado de la base de datos.

### `npm run db:maintenance`

Ejecuta tareas de mantenimiento de la base de datos.

```bash
npm run db:maintenance
```

**Descripción**: Ejecuta optimizaciones y limpieza de la base de datos.

### `npm run db:backup`

Crea un backup de la base de datos.

```bash
npm run db:backup
```

**Descripción**: Genera un backup completo de la base de datos.

## 🛠️ Comandos de Utilidad

### `npm run verificar`

Verifica la configuración del proyecto.

```bash
npm run verificar
```

**Descripción**: Ejecuta verificaciones completas de la configuración del proyecto.

### `npm run verify:workflows`

Verifica la configuración de workflows de GitHub Actions.

```bash
npm run verify:workflows
```

**Descripción**: Verifica que todos los workflows estén correctamente configurados.

### `npm run health:check`

Ejecuta verificación de salud del sistema.

```bash
npm run health:check
```

**Descripción**: Verifica que todos los componentes del sistema estén funcionando.

### `npm run clean`

Limpia archivos temporales y logs.

```bash
npm run clean
```

**Descripción**: Elimina logs, reportes de cobertura y archivos temporales.

### `npm run clean:all`

Limpia completamente el proyecto.

```bash
npm run clean:all
```

**Descripción**: Elimina node_modules y package-lock.json (¡CUIDADO!).

## 🏗️ Comandos de Build y Despliegue

### `npm run build`

Construye el proyecto para producción.

```bash
npm run build
```

**Descripción**: Ejecuta validaciones, tests y verificaciones antes del despliegue.

### `npm run validate`

Valida el proyecto completo.

```bash
npm run validate
```

**Descripción**: Ejecuta linting, formato y tests en secuencia.

### `npm run deploy:check`

Verifica el proyecto para despliegue.

```bash
npm run deploy:check
```

**Descripción**: Ejecuta todas las verificaciones necesarias antes del despliegue.

## 🔧 Comandos de Desarrollo

### `npm run prestart`

Comando que se ejecuta antes de `npm start`.

```bash
npm run prestart
```

**Descripción**: Muestra mensaje de inicio de la aplicación.

### `npm run prestart:prod`

Comando que se ejecuta antes de `npm run start:prod`.

```bash
npm run prestart:prod
```

**Descripción**: Ejecuta verificaciones de despliegue antes de iniciar en producción.

### `npm run postinstall`

Comando que se ejecuta después de `npm install`.

```bash
npm run postinstall
```

**Descripción**: Genera secrets automáticamente después de instalar dependencias.

## 📊 Comandos de Monitoreo

### `npm run logs`

Muestra logs en tiempo real.

```bash
# Ver logs de aplicación
tail -f logs/app.log

# Ver logs de error
tail -f logs/error.log

# Ver logs de seguridad
tail -f logs/security.log
```

## 🎯 Uso Recomendado por Escenario

### Desarrollo Diario

```bash
# 1. Iniciar en desarrollo
npm run dev

# 2. En otra terminal, ejecutar tests
npm test

# 3. Verificar linting
npm run lint
```

### Antes de Commit

```bash
# 1. Ejecutar tests
npm test

# 2. Verificar linting
npm run lint

# 3. Verificar formato
npm run format:check

# 4. Verificar seguridad
npm run security:check
```

### Antes de Despliegue

```bash
# 1. Ejecutar build completo
npm run build

# 2. Verificar despliegue
npm run deploy:check

# 3. Ejecutar tests de rendimiento
npm run test:performance
```

### Mantenimiento

```bash
# 1. Verificar estado del sistema
npm run health:check

# 2. Verificar base de datos
npm run db:status

# 3. Limpiar archivos temporales
npm run clean
```

## 🔍 Troubleshooting

### Problemas Comunes

#### Error: "command not found"

```bash
# Verificar que npm está instalado
npm --version

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

#### Error: "permission denied"

```bash
# En Linux/macOS, dar permisos de ejecución
chmod +x scripts/*.mjs

# En Windows, ejecutar como administrador
```

#### Error: "port already in use"

```bash
# Cambiar puerto en config.env
PORT=3001
```

## 📚 Referencias

- [Documentación de npm](https://docs.npmjs.com/)
- [Scripts de npm](https://docs.npmjs.com/misc/scripts)
- [Variables de entorno](https://docs.npmjs.com/misc/config)

---

**¿Necesitas ayuda con algún comando específico?** Consulta la documentación completa o crea un issue en GitHub.
