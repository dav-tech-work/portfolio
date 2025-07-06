# 🔧 Scripts Disponibles

## 🎯 Descripción General

El directorio `scripts/` contiene herramientas y utilidades para desarrollo, mantenimiento y automatización del proyecto. Todos los scripts están escritos en JavaScript ES6 y utilizan módulos ES.

## 📂 Estructura de Scripts

```
scripts/
├── 📄 check-lockfile.mjs           # Verificación de package-lock.json
├── 📄 database-status.mjs          # Estado de la base de datos
├── 📄 debug-server.mjs             # Debug del servidor
├── 📄 fix-eslint-issues.mjs        # Corrección automática de ESLint
├── 📄 generate-secrets.mjs         # Generación de secrets
├── 📄 generate-test-config.mjs     # Configuración de testing
├── 📄 health-check.mjs             # Verificación de salud del sistema
├── 📄 init-database.mjs            # Inicialización de base de datos
├── 📄 performance-test.mjs         # Tests de rendimiento
├── 📄 pre-performance-check.mjs    # Verificaciones previas a performance
├── 📄 quick-fix.mjs                # Correcciones rápidas
├── 📄 security-check.mjs           # Verificación de seguridad
└── 📄 verify-workflows.mjs         # Verificación de workflows
```

## 🔍 Scripts de Verificación

### 📄 `check-lockfile.mjs`

**Propósito**: Verifica la integridad del archivo `package-lock.json`.

**Uso**:

```bash
node scripts/check-lockfile.mjs
```

**Funcionalidades**:

- ✅ Verifica que `package-lock.json` existe
- ✅ Valida la estructura del archivo
- ✅ Comprueba consistencia con `package.json`
- ✅ Detecta dependencias desactualizadas

**Salida**:

```
🔍 Verificando package-lock.json...
✅ Archivo package-lock.json encontrado
✅ Estructura válida
✅ Consistente con package.json
✅ Dependencias actualizadas
```

### 📄 `health-check.mjs`

**Propósito**: Verificación completa de la salud del sistema.

**Uso**:

```bash
node scripts/health-check.mjs
```

**Funcionalidades**:

- ✅ Verifica configuración del entorno
- ✅ Valida variables de entorno críticas
- ✅ Comprueba conectividad de base de datos
- ✅ Verifica archivos críticos
- ✅ Analiza logs de error

**Salida**:

```
🏥 Health Check del Sistema
==========================
✅ Configuración de entorno: OK
✅ Variables de entorno: OK
✅ Base de datos: Conectada
✅ Archivos críticos: Presentes
✅ Logs: Sin errores críticos
```

### 📄 `verify-workflows.mjs`

**Propósito**: Verifica la configuración de workflows de GitHub Actions.

**Uso**:

```bash
node scripts/verify-workflows.mjs
```

**Funcionalidades**:

- ✅ Verifica existencia de workflows
- ✅ Valida sintaxis YAML
- ✅ Comprueba referencias a scripts
- ✅ Verifica triggers y jobs

## 🔒 Scripts de Seguridad

### 📄 `security-check.mjs`

**Propósito**: Verificaciones avanzadas de seguridad.

**Uso**:

```bash
node scripts/security-check.mjs
```

**Funcionalidades**:

- 🔍 Auditoría de dependencias
- 🛡️ Verificación de configuraciones de seguridad
- 🔐 Análisis de secrets y variables de entorno
- 📊 Reporte de vulnerabilidades

**Salida**:

```
🔒 Verificación de Seguridad
============================
✅ Auditoría de dependencias: Sin vulnerabilidades
✅ Configuración de seguridad: OK
✅ Variables de entorno: Seguras
✅ Headers de seguridad: Configurados
```

### 📄 `generate-secrets.mjs`

**Propósito**: Genera secrets seguros para la aplicación.

**Uso**:

```bash
node scripts/generate-secrets.mjs
```

**Funcionalidades**:

- 🔐 Genera JWT_SECRET seguro
- 🔐 Genera SESSION_SECRET seguro
- 🔐 Genera otros secrets necesarios
- 📝 Actualiza archivo config.env

**Salida**:

```
🔐 Generando Secrets Seguros
============================
✅ JWT_SECRET generado (64 caracteres)
✅ SESSION_SECRET generado (64 caracteres)
✅ Secrets guardados en config.env
```

## 🗄️ Scripts de Base de Datos

### 📄 `database-status.mjs`

**Propósito**: Muestra el estado actual de la base de datos.

**Uso**:

```bash
node scripts/database-status.mjs
```

**Funcionalidades**:

- 📊 Estado de conexión
- 📈 Estadísticas de la base de datos
- 🔍 Verificación de tablas
- ⚠️ Alertas de problemas

**Salida**:

```
🗄️ Estado de la Base de Datos
==============================
✅ Conexión: Activa
📊 Base de datos: portfolio_dev
📈 Tamaño: 2.5 MB
📋 Tablas: 3 encontradas
```

### 📄 `init-database.mjs`

**Propósito**: Inicializa la base de datos con estructura y datos iniciales.

**Uso**:

```bash
# Inicialización normal
node scripts/init-database.mjs

# Inicialización forzada (borra datos existentes)
node scripts/init-database.mjs --force
```

**Funcionalidades**:

- 🏗️ Crea estructura de base de datos
- 📝 Inserta datos iniciales
- 🔄 Migraciones automáticas
- ✅ Verificación de integridad

## ⚡ Scripts de Rendimiento

### 📄 `performance-test.mjs`

**Propósito**: Ejecuta tests de rendimiento completos.

**Uso**:

```bash
node scripts/performance-test.mjs
```

**Funcionalidades**:

- 🚀 Tests de carga
- 🧠 Análisis de memoria
- ⏱️ Tests de tiempo de respuesta
- 📊 Generación de reportes

**Opciones**:

```bash
# Test básico
node scripts/performance-test.mjs

# Test con configuración específica
node scripts/performance-test.mjs --config=production

# Test con reporte detallado
node scripts/performance-test.mjs --verbose
```

### 📄 `pre-performance-check.mjs`

**Propósito**: Verificaciones previas a tests de rendimiento.

**Uso**:

```bash
node scripts/pre-performance-check.mjs
```

**Funcionalidades**:

- 🔍 Verifica configuración del servidor
- 📊 Analiza recursos del sistema
- ⚙️ Valida configuraciones de rendimiento
- 🚨 Detecta problemas potenciales

## 🛠️ Scripts de Desarrollo

### 📄 `debug-server.mjs`

**Propósito**: Inicia el servidor en modo debug.

**Uso**:

```bash
node scripts/debug-server.mjs
```

**Funcionalidades**:

- 🐛 Habilita debugging de Node.js
- 📊 Monitoreo de memoria
- 🔍 Logs detallados
- ⚡ Hot reload mejorado

### 📄 `fix-eslint-issues.mjs`

**Propósito**: Corrige automáticamente problemas de ESLint.

**Uso**:

```bash
node scripts/fix-eslint-issues.mjs
```

**Funcionalidades**:

- 🔧 Corrección automática de errores
- 📝 Formateo de código
- 🎯 Corrección de problemas específicos
- 📊 Reporte de cambios realizados

### 📄 `quick-fix.mjs`

**Propósito**: Correcciones rápidas para problemas comunes.

**Uso**:

```bash
node scripts/quick-fix.mjs
```

**Funcionalidades**:

- 🔧 Corrección de permisos
- 📁 Limpieza de archivos temporales
- 🔄 Regeneración de configuraciones
- ⚡ Optimizaciones rápidas

## 🧪 Scripts de Testing

### 📄 `generate-test-config.mjs`

**Propósito**: Genera configuración específica para testing.

**Uso**:

```bash
node scripts/generate-test-config.mjs
```

**Funcionalidades**:

- ⚙️ Genera config.env para testing
- 🗄️ Configura base de datos de test
- 🔐 Genera secrets de test
- 📊 Configura logging para tests

## 🎯 Uso Avanzado

### Ejecución con Parámetros

```bash
# Script con parámetros
node scripts/performance-test.mjs --workers=4 --duration=60

# Script con configuración específica
node scripts/security-check.mjs --config=production

# Script con modo verbose
node scripts/health-check.mjs --verbose
```

### Ejecución en Secuencia

```bash
# Verificación completa del proyecto
node scripts/health-check.mjs && \
node scripts/security-check.mjs && \
node scripts/verify-workflows.mjs
```

### Integración con npm

```bash
# Usar scripts desde package.json
npm run security:check    # Ejecuta security-check.mjs
npm run health:check      # Ejecuta health-check.mjs
npm run verify:workflows  # Ejecuta verify-workflows.mjs
```

## 🔧 Personalización

### Crear Nuevo Script

```javascript
#!/usr/bin/env node

/**
 * Mi Script Personalizado
 * @description Descripción del script
 */

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  try {
    colorLog('🚀 Ejecutando mi script...', 'cyan');

    // Lógica del script aquí

    colorLog('✅ Script completado exitosamente', 'green');
  } catch (error) {
    colorLog(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
```

### Agregar a package.json

```json
{
  "scripts": {
    "mi-script": "node scripts/mi-script.mjs"
  }
}
```

## 🔍 Troubleshooting

### Problemas Comunes

#### Error: "Cannot find module"

```bash
# Verificar que el script existe
ls -la scripts/

# Verificar permisos de ejecución
chmod +x scripts/mi-script.mjs
```

#### Error: "Permission denied"

```bash
# Dar permisos de ejecución
chmod +x scripts/*.mjs

# En Windows, ejecutar como administrador
```

#### Error: "Unexpected token"

```bash
# Verificar versión de Node.js
node --version  # Debe ser 18+

# Verificar sintaxis del script
node -c scripts/mi-script.mjs
```

### Debug de Scripts

```bash
# Ejecutar con debug
node --inspect scripts/mi-script.mjs

# Ejecutar con trace
node --trace-warnings scripts/mi-script.mjs

# Ejecutar con más información
node --trace-uncaught scripts/mi-script.mjs
```

## 📚 Referencias

- [Node.js Documentation](https://nodejs.org/docs/)
- [ES Modules](https://nodejs.org/api/esm.html)
- [Process API](https://nodejs.org/api/process.html)
- [File System API](https://nodejs.org/api/fs.html)

## 🎯 Mejores Prácticas

### Estructura

- ✅ Usar shebang `#!/usr/bin/env node`
- ✅ Documentar con JSDoc
- ✅ Manejar errores apropiadamente
- ✅ Usar colores para output

### Funcionalidad

- ✅ Scripts modulares y reutilizables
- ✅ Parámetros configurables
- ✅ Logging apropiado
- ✅ Códigos de salida correctos

### Mantenimiento

- ✅ Actualizar documentación
- ✅ Versionar cambios
- ✅ Probar en diferentes entornos
- ✅ Mantener compatibilidad

---

**¿Necesitas ayuda con algún script específico?** Consulta la documentación completa o crea un issue en GitHub.
