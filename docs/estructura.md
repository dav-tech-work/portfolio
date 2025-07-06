# 📁 Estructura del Proyecto

## 🎯 Visión General

Este proyecto sigue una arquitectura modular y escalable, organizada en directorios específicos para cada funcionalidad. La estructura está diseñada para facilitar el mantenimiento, testing y escalabilidad.

## 📂 Estructura de Directorios

```
porfolio_produccion_new/
├── 📁 .github/                    # Configuración de GitHub Actions
├── 📁 .nyc_output/                # Reportes de cobertura de código
├── 📁 coverage/                   # Reportes de cobertura HTML
├── 📁 data/                       # Datos estáticos y configuración
├── 📁 docs/                       # Documentación del proyecto
├── 📁 logs/                       # Archivos de log
├── 📁 public/                     # Archivos públicos y estáticos
├── 📁 reports/                    # Reportes generados
├── 📁 scripts/                    # Scripts de utilidad
├── 📁 src/                        # Código fuente principal
├── 📁 test/                       # Tests y archivos de testing
├── 📁 test-results/               # Resultados de tests
├── 📁 uploads/                    # Archivos subidos por usuarios
├── 📁 views/                      # Plantillas EJS
├── 📄 app.mjs                     # Punto de entrada principal
├── 📄 config.env                  # Variables de entorno
├── 📄 config.env.example          # Ejemplo de configuración
├── 📄 package.json                # Configuración del proyecto
└── 📄 README.md                   # Documentación principal
```

## 🔍 Detalle de Directorios

### 📁 `.github/`

Configuración de GitHub Actions y herramientas de CI/CD.

```
.github/
├── 📁 workflows/                  # Workflows de GitHub Actions
│   ├── ci-simple.yml             # Pipeline principal CI/CD
│   ├── security-scan.yml         # Escaneo de seguridad
│   └── performance.yml           # Tests de rendimiento
├── 📁 codeql/                    # Configuración de CodeQL
├── 📄 README.md                  # Documentación de GitHub
├── 📄 security.yml               # Configuración de seguridad
└── 📄 dependabot.yml             # Configuración de Dependabot
```

### 📁 `src/`

Código fuente principal de la aplicación.

```
src/
├── 📁 checks/                    # Verificaciones del sistema
├── 📁 config/                    # Configuración de la aplicación
├── 📁 database/                  # Configuración de base de datos
├── 📁 middleware/                # Middlewares de Express
├── 📁 models/                    # Modelos de datos
├── 📁 routes/                    # Definición de rutas
├── 📁 tools/                     # Herramientas de desarrollo
└── 📁 utils/                     # Utilidades y helpers
```

#### 📁 `src/checks/`

Verificaciones automáticas del sistema.

```
checks/
├── checkCSP.mjs                  # Verificación de Content Security Policy
├── checkHelmet.mjs               # Verificación de headers de seguridad
├── checkRoutes.mjs               # Verificación de rutas
└── checkSecurity.mjs             # Verificación general de seguridad
```

#### 📁 `src/config/`

Configuración centralizada de la aplicación.

```
config/
├── environment.mjs               # Carga y validación de variables de entorno
└── index.mjs                     # Configuración principal
```

#### 📁 `src/middleware/`

Middlewares de Express para funcionalidades específicas.

```
middleware/
├── 📁 middlewares porfolio/      # Middlewares específicos del portfolio
├── auth.mjs                      # Autenticación y autorización
├── csrf-modern.mjs               # Protección CSRF
├── errorHandler.mjs              # Manejo de errores
├── index.mjs                     # Exportación de middlewares
├── limiter.mjs                   # Rate limiting
├── rateLimiters.mjs              # Configuración de rate limiters
└── sanitizer-advanced.mjs        # Sanitización avanzada de datos
```

#### 📁 `src/routes/`

Definición de rutas y endpoints de la API.

```
routes/
├── 📁 api/                       # Endpoints de API
│   ├── contacto.mjs              # API de contacto
│   └── email.mjs                 # API de email
├── auth.mjs                      # Rutas de autenticación
├── formacion.mjs                 # Rutas de formación
├── home.mjs                      # Rutas principales
└── index.mjs                     # Rutas de índice
```

#### 📁 `src/utils/`

Utilidades y helpers reutilizables.

```
utils/
├── 📁 generador/                 # Generadores de contenido
├── 📁 idioma/                    # Gestión de idiomas
├── 📁 navegacion/                # Utilidades de navegación
├── 📁 optimizacion/              # Optimizaciones de rendimiento
├── 📁 seguridad/                 # Utilidades de seguridad
├── 📁 servicios/                 # Servicios externos
├── 📁 validation/                # Validaciones
├── asyncHandler.mjs              # Manejo de funciones asíncronas
├── helpers.mjs                   # Helpers generales
└── logger-enhanced.mjs           # Sistema de logging mejorado
```

### 📁 `public/`

Archivos públicos y estáticos servidos directamente.

```
public/
├── 📁 assets/                    # Assets estáticos
│   ├── 📁 css/                   # Hojas de estilo
│   ├── 📁 data/                  # Datos estáticos
│   ├── 📁 img/                   # Imágenes
│   ├── 📁 js/                    # JavaScript del cliente
│   └── 📁 programacion/          # Contenido de programación
├── 📁 pages/                     # Páginas estáticas
└── 📄 robots.txt                 # Configuración para crawlers
```

#### 📁 `public/assets/css/`

Hojas de estilo organizadas por sección.

```
css/
├── 📁 global/                    # Estilos globales
├── 📁 secciones/                 # Estilos por sección
└── 📁 sistemas/                  # Estilos específicos de sistemas
```

#### 📁 `public/assets/js/`

JavaScript del lado del cliente.

```
js/
├── 📁 idioma/                    # Gestión de idiomas
├── 📁 navegacion/                # Navegación y transiciones
├── 📁 tema/                      # Gestión de temas
├── highlight-init.js             # Inicialización de syntax highlighting
├── index.js                      # JavaScript principal
├── muestra_contenido.js          # Gestión de contenido dinámico
└── navegacion.js                 # Funcionalidades de navegación
```

### 📁 `views/`

Plantillas EJS para renderizado del servidor.

```
views/
├── 📁 auth/                      # Plantillas de autenticación
├── 📁 pages/                     # Páginas principales
├── 📁 templates/                 # Plantillas base
├── layout.ejs                    # Layout principal
└── test.ejs                      # Plantilla de testing
```

### 📁 `test/`

Tests y archivos de testing.

```
test/
├── 📁 security/                  # Tests de seguridad
├── 📁 performance/               # Tests de rendimiento
├── check-url.mjs                 # Verificación de URLs
├── debug-simple.mjs              # Debug simple
├── debug-start.mjs               # Debug de inicio
└── verificar-proyecto.mjs        # Verificación del proyecto
```

### 📁 `scripts/`

Scripts de utilidad para desarrollo y mantenimiento.

```
scripts/
├── check-lockfile.mjs            # Verificación de package-lock.json
├── database-status.mjs           # Estado de la base de datos
├── debug-server.mjs              # Debug del servidor
├── fix-eslint-issues.mjs         # Corrección automática de ESLint
├── generate-secrets.mjs          # Generación de secrets
├── generate-test-config.mjs      # Configuración de testing
├── health-check.mjs              # Verificación de salud del sistema
├── init-database.mjs             # Inicialización de base de datos
├── performance-test.mjs          # Tests de rendimiento
├── pre-performance-check.mjs     # Verificaciones previas a performance
├── quick-fix.mjs                 # Correcciones rápidas
├── security-check.mjs            # Verificación de seguridad
└── verify-workflows.mjs          # Verificación de workflows
```

## 📄 Archivos Principales

### 📄 `app.mjs`

Punto de entrada principal de la aplicación.

**Responsabilidades:**

- Configuración del servidor Express
- Middlewares de seguridad
- Configuración de rutas
- Manejo de errores
- Inicialización del servidor

### 📄 `package.json`

Configuración del proyecto y dependencias.

**Secciones importantes:**

- `scripts`: Comandos npm disponibles
- `dependencies`: Dependencias de producción
- `devDependencies`: Dependencias de desarrollo
- `engines`: Versiones de Node.js y npm requeridas

### 📄 `config.env`

Variables de entorno de la aplicación.

**Variables críticas:**

- `NODE_ENV`: Entorno de ejecución
- `PORT`: Puerto del servidor
- `JWT_SECRET`: Secret para JWT
- `SESSION_SECRET`: Secret para sesiones
- `MONGODB_URI`: URI de la base de datos

## 🔧 Convenciones de Nomenclatura

### Archivos y Directorios

- **PascalCase**: Para clases y componentes
- **camelCase**: Para funciones y variables
- **kebab-case**: Para archivos y directorios
- **UPPER_SNAKE_CASE**: Para constantes y variables de entorno

### Estructura de Módulos

```javascript
// Estructura típica de un módulo
├── 📄 index.mjs                  # Exportación principal
├── 📄 config.mjs                 # Configuración específica
├── 📄 utils.mjs                  # Utilidades
└── 📄 tests/                     # Tests del módulo
```

## 🎯 Flujo de Datos

```
Cliente → Middleware → Rutas → Controladores → Modelos → Base de Datos
   ↑                                                           ↓
   ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

## 🔍 Archivos de Configuración

### Configuración de ESLint

- `.eslintrc.json`: Configuración principal
- `public/assets/js/.eslintrc.json`: Configuración para frontend

### Configuración de Prettier

- Configuración en `package.json`

### Configuración de NYC (Cobertura)

- Configuración en `package.json`

## 📊 Métricas y Monitoreo

### Logs

- `logs/app.log`: Logs de aplicación
- `logs/error.log`: Logs de errores
- `logs/security.log`: Logs de seguridad

### Reportes

- `coverage/`: Reportes de cobertura de código
- `test-results/`: Resultados de tests
- `reports/`: Reportes generados

## 🚀 Escalabilidad

La estructura está diseñada para escalar:

1. **Modularidad**: Cada funcionalidad en su propio módulo
2. **Separación de responsabilidades**: Backend, frontend y assets separados
3. **Configuración centralizada**: Variables de entorno y configuración
4. **Testing organizado**: Tests por funcionalidad
5. **Documentación integrada**: Documentación junto al código

## 🔧 Personalización

Para personalizar la estructura:

1. **Nuevas rutas**: Agregar en `src/routes/`
2. **Nuevos middlewares**: Agregar en `src/middleware/`
3. **Nuevos modelos**: Agregar en `src/models/`
4. **Nuevos assets**: Agregar en `public/assets/`
5. **Nuevas vistas**: Agregar en `views/`

---

**¿Necesitas más detalles sobre algún directorio específico?** Consulta la documentación específica o crea un issue en GitHub.
