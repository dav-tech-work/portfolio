# 📁 Scripts & Utilidades - Documentación

## 🎯 **OBJETIVO**
Este documento describe todos los scripts consolidados del proyecto, organizados por categorías. Cada categoría tiene dos versiones: **completa** y **rápida**.

---

## ✅ **CATEGORÍAS COMPLETADAS**

### 🛠️ **1. MANTENIMIENTO**

#### 📝 **Script Completo: `maintenance-complete.mjs`**
**Comando:** `npm run mantenimiento-completo` o `node scripts/maintenance-complete.mjs`

**¿Qué hace?**
- **Minificación CSS**: Procesa todos los archivos CSS del proyecto usando `cssnano` y `postcss`
- **Limpieza de archivos**: Elimina archivos `.min.css` y `.optimized.css` existentes
- **Corrección ESLint**: Aplica correcciones automáticas a archivos `.mjs` y `.js`
- **Verificación**: Confirma que todos los procesos se completaron correctamente

**Archivos procesados:**
- `data/public/assets/css/global/base.css`
- `data/public/assets/css/global/search.css`
- `data/public/assets/css/global/helpers.css`
- `data/public/assets/css/global/error-code.css`
- `data/public/assets/css/secciones/home.css`
- `data/public/assets/css/secciones/formacion.css`
- `data/public/assets/css/secciones/contacto.css`
- `data/public/assets/css/secciones/about.css`
- `data/public/assets/css/secciones/proyectos.css`
- `data/public/assets/css/secciones/homelab.css`
- `data/public/assets/css/secciones/privacidad.css`
- `data/public/assets/css/secciones/seguridad.css`
- `data/public/assets/css/secciones/code.css`
- `data/public/assets/css/secciones/error.css`
- `data/public/assets/css/secciones/construccion.css`

**Salida esperada:**
```
🚀 MANTENIMIENTO COMPLETO INICIADO
============================================================
🧹 LIMPIEZA DE ARCHIVOS CSS
==================================================
📝 MINIFICACIÓN DE ARCHIVOS CSS
==================================================
🔧 CORRECCIÓN ESLINT
==================================================
📊 RESUMEN FINAL
============================================================
🧹 Archivos CSS eliminados: X
📝 Archivos CSS minificados: X
🔧 Archivos ESLint corregidos: X
⏱️  Tiempo total: X.XX segundos
✅ MANTENIMIENTO COMPLETO FINALIZADO
```

---

#### ⚡ **Script Rápido: `maintenance-quick.mjs`**
**Comando:** `npm run mantenimiento` o `node scripts/maintenance-quick.mjs`

**¿Qué hace?**
- **Verificación de estructura**: Comprueba que existan directorios y archivos críticos
- **Verificación de configuración**: Revisa `config.env` y `package.json` por secretos y scripts
- **Verificación CSS**: Cuenta archivos CSS originales vs minificados
- **Limpieza rápida**: Elimina archivos temporales básicos

**Archivos verificados:**
- Directorios: `src`, `public`, `views`, `test`
- Archivos: `app.mjs`, `package.json`, `config.env`, `data/public/assets/css/global/base.css`

**Salida esperada:**
```
⚡ MANTENIMIENTO RÁPIDO INICIADO
============================================================
🔍 VERIFICACIÓN RÁPIDA DE ESTRUCTURA
==================================================
⚙️ VERIFICACIÓN DE CONFIGURACIÓN BÁSICA
==================================================
🎨 VERIFICACIÓN RÁPIDA DE ARCHIVOS CSS
==================================================
🧹 LIMPIEZA RÁPIDA
==================================================
📊 RESUMEN MANTENIMIENTO RÁPIDO
============================================================
🔍 Estructura del proyecto: ✅ OK
⏱️  Tiempo total: X.XX segundos
✅ MANTENIMIENTO RÁPIDO COMPLETADO
```

---

### 🎨 **2. RESPONSIVE DESIGN AND CSS**

#### 📝 **Script Completo: `responsive-complete.mjs`**
**Comando:** `npm run responsive-completo` o `node scripts/responsive-complete.mjs`

**¿Qué hace?**
- **Variables CSS responsive**: Agrega variables CSS con `clamp()` para espaciado, tipografía y grids fluidos
- **Mejoras de responsividad**: Convierte valores fijos en valores fluidos usando `clamp()` y `min()`
- **Correcciones de breakpoint**: Aplica correcciones específicas para el breakpoint 608px (menú hamburguesa)
- **Mejoras de grid**: Convierte grids fijos en grids responsive con `auto-fit` y `minmax()`
- **Minificación**: Minifica todos los archivos CSS procesados

**Mejoras aplicadas:**
- `grid-template-columns: repeat(3, 1fr)` → `grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr))`
- `padding: 2rem 1rem` → `padding: clamp(1rem, 4vw, 2rem) clamp(0.5rem, 2vw, 1rem)`
- `font-size: 1.5rem` → `font-size: clamp(1.05rem, 4.5vw, 1.5rem)`
- `gap: 1rem` → `gap: clamp(0.5rem, 1.5vw, 1rem)`

**Archivos procesados:**
- `data/public/assets/css/global/base.css`
- `data/public/assets/css/secciones/home.css`
- `data/public/assets/css/secciones/about.css`
- `data/public/assets/css/secciones/proyectos.css`
- `data/public/assets/css/secciones/contacto.css`
- `data/public/assets/css/secciones/formacion.css`
- `data/public/assets/css/secciones/homelab.css`
- `data/public/assets/css/secciones/code.css`

**Salida esperada:**
```
🚀 RESPONSIVE DESIGN COMPLETO INICIADO
============================================================
🎨 PROCESAMIENTO DE ARCHIVOS CSS
==================================================
📝 Procesando: data/public/assets/css/global/base.css
✅ Mejorado: data/public/assets/css/global/base.css
✅ Minificado: public\assets\css\global\base.min.css
   📊 Reducción: 37.4%
...
🔍 VERIFICACIÓN DE MEJORAS
==================================================
✅ base.css - Completamente mejorado
...
📊 RESUMEN FINAL
============================================================
📝 Archivos procesados: 8
📦 Archivos minificados: 8
⏱️  Tiempo total: X.XX segundos
✅ RESPONSIVE DESIGN COMPLETO FINALIZADO
```

---

#### ⚡ **Script Rápido: `responsive-quick.mjs`**
**Comando:** `npm run responsive` o `node scripts/responsive-quick.mjs`

**¿Qué hace?**
- **Verificación CSS responsive**: Detecta uso de `clamp()`, `min()`, media queries y variables CSS
- **Verificación de breakpoints**: Busca breakpoints críticos (608px, 768px, 1024px)
- **Verificación de grids**: Analiza grids y verifica si son responsive
- **Verificación de variables**: Comprueba presencia de variables CSS responsive
- **Verificación de minificación**: Confirma que existan archivos minificados

**Archivos verificados:**
- `data/public/assets/css/global/base.css`
- `data/public/assets/css/secciones/home.css`
- `data/public/assets/css/secciones/about.css`

**Salida esperada:**
```
⚡ RESPONSIVE DESIGN RÁPIDO INICIADO
============================================================
🔍 VERIFICACIÓN RÁPIDA DE ARCHIVOS CSS
==================================================
✅ base.css - Responsive detectado
...
📱 VERIFICACIÓN DE BREAKPOINTS CRÍTICOS
==================================================
✅ base.css - Breakpoint 608px encontrado
...
🔲 VERIFICACIÓN DE GRIDS RESPONSIVE
==================================================
📊 Grids responsive: 21/38 (55.3%)
...
📊 RESUMEN RESPONSIVE RÁPIDO
============================================================
🔍 Archivos CSS: ✅ OK
📱 Breakpoints: ✅ OK
🔲 Grids responsive: ❌ Problemas
🎨 Variables CSS: ✅ OK
📦 Archivos minificados: ✅ OK
⏱️  Tiempo total: X.XX segundos
🎯 Estado general: ⚠️  PROBLEMAS DETECTADOS
✅ RESPONSIVE DESIGN RÁPIDO COMPLETADO
```

---

### ✅ **3. VERIFICACIÓN**

#### 📝 **Script Completo: `verify-complete.mjs`**
**Comando:** `npm run verificacion-completo` o `node scripts/verify-complete.mjs`

**¿Qué hace?**
- **Verificación de workflows**: Comprueba que existan workflows de GitHub Actions y scripts referenciados
- **Verificación de Docker**: Valida archivos Docker, Dockerfile y su contenido
- **Verificación de configuración**: Revisa package.json, archivos críticos y directorios del proyecto
- **Verificación de seguridad**: Confirma que config.env esté en .gitignore y secretos configurados
- **Verificación de dependencias**: Valida package.json, package-lock.json y node_modules

**Archivos verificados:**
- Workflows: `.github/workflows/ci-simple.yml`, `.github/workflows/security-scan.yml`, `.github/workflows/performance.yml`
- Scripts: `scripts/check-lockfile.mjs`, `scripts/security-check.mjs`, `scripts/performance-test.mjs`, `scripts/health-check.mjs`
- Docker: `docker/Dockerfile`, `docker/docker-compose.yml`, `.dockerignore`
- Configuración: `package.json`, `config.env`, `app.mjs`, `.gitignore`
- Directorios: `src`, `public`, `views`, `test`, `scripts`

**Salida esperada:**
```
🚀 VERIFICACIÓN COMPLETA INICIADA
============================================================
🔄 VERIFICACIÓN DE WORKFLOWS
==================================================
📁 Verificando workflows:
✅ Workflow CI/CD Principal: .github/workflows/ci-simple.yml
...
🐳 VERIFICACIÓN DE DOCKER
==================================================
📁 Verificando archivos Docker:
✅ Dockerfile: docker/Dockerfile
...
⚙️ VERIFICACIÓN DE CONFIGURACIÓN DEL PROYECTO
==================================================
📄 Verificando archivos de configuración:
✅ package.json: package.json
...
🔒 VERIFICACIÓN DE SEGURIDAD
==================================================
🛡️ Verificando archivos de seguridad:
✅ config.env está en .gitignore
...
📦 VERIFICACIÓN DE DEPENDENCIAS
==================================================
📄 Verificando archivos de dependencias:
✅ node_modules instalado
...
📊 RESUMEN FINAL
============================================================
🔄 Workflows: ✅ OK
🐳 Docker: ✅ OK
⚙️ Configuración: ✅ OK
🔒 Seguridad: ✅ OK
📦 Dependencias: ✅ OK
⏱️  Tiempo total: X.XX segundos
🎯 Estado general: ✅ TODO OK
✅ VERIFICACIÓN COMPLETA FINALIZADA
```

---

#### ⚡ **Script Rápido: `verify-quick.mjs`**
**Comando:** `npm run verificacion` o `node scripts/verify-quick.mjs`

**¿Qué hace?**
- **Verificación rápida de workflows**: Solo verifica workflows y scripts críticos
- **Verificación rápida de Docker**: Valida Dockerfile básico y archivos esenciales
- **Verificación rápida de configuración**: Revisa archivos y directorios críticos
- **Verificación rápida de seguridad**: Confirma config.env en .gitignore
- **Verificación rápida de dependencias**: Valida node_modules instalado

**Archivos verificados:**
- Workflows críticos: `.github/workflows/ci-simple.yml`, `.github/workflows/security-scan.yml`
- Scripts críticos: `scripts/security-check.mjs`, `scripts/health-check.mjs`
- Docker básico: `docker/Dockerfile`, `.dockerignore`
- Configuración básica: `package.json`, `app.mjs`, `config.env`
- Directorios críticos: `src`, `public`, `views`

**Salida esperada:**
```
⚡ VERIFICACIÓN RÁPIDA INICIADA
============================================================
🔄 VERIFICACIÓN RÁPIDA DE WORKFLOWS
==================================================
📁 Verificando workflows críticos:
✅ Workflow CI/CD Principal: .github/workflows/ci-simple.yml
...
🐳 VERIFICACIÓN RÁPIDA DE DOCKER
==================================================
📁 Verificando archivos Docker críticos:
✅ Dockerfile: docker/Dockerfile
...
📊 RESUMEN VERIFICACIÓN RÁPIDA
============================================================
🔄 Workflows: ✅ OK
🐳 Docker: ✅ OK
⚙️ Configuración: ✅ OK
🔒 Seguridad: ✅ OK
📦 Dependencias: ✅ OK
⏱️  Tiempo total: X.XX segundos
🎯 Estado general: ✅ TODO OK
✅ VERIFICACIÓN RÁPIDA COMPLETADA
```

---

### 🧪 **4. TESTING**

#### 📝 **Script Completo: `testing-complete.mjs`**
**Comando:** `npm run testing-completo` o `node scripts/testing-complete.mjs`

**¿Qué hace?**
- **Testing de performance**: Prueba endpoints del servidor y mide tiempos de respuesta
- **Testing de workflows**: Verifica estructura del proyecto, dependencias, configuración y seguridad
- **Testing de funcionalidad**: Valida scripts críticos y archivos de test
- **Generación de reportes**: Crea reportes detallados en formato JSON

**Pruebas realizadas:**
- **Performance**: Endpoints `/`, `/health`, `/auth/login`, `/auth/register`
- **Workflows**: Estructura, dependencias, configuración, seguridad
- **Funcionalidad**: Scripts críticos y archivos de test

**Archivos verificados:**
- Estructura: `src`, `public`, `views`, `test`, `scripts`
- Configuración: `package.json`, `app.mjs`, `config.env`
- Dependencias: `package-lock.json`, `node_modules`, `express`, `ejs`, `dotenv`
- Seguridad: `.gitignore`, `config.env`
- Scripts: `scripts/security-check.mjs`, `scripts/health-check.mjs`, `scripts/performance-test.mjs`

**Salida esperada:**
```
🚀 TESTING COMPLETO INICIADO
============================================================
🚀 TESTING DE PERFORMANCE
==================================================
🔍 Verificando servidor:
✅ Servidor respondiendo correctamente
📡 Probando endpoints:
✅ / - 45.23ms
✅ /health - 12.45ms
...
🔄 TESTING DE WORKFLOWS
==================================================
📁 Verificando estructura del proyecto:
✅ Directorio src
✅ Directorio public
...
📦 Verificando dependencias:
✅ package-lock.json encontrado
✅ node_modules instalado
...
🧪 TESTING DE FUNCIONALIDAD
==================================================
📜 Verificando scripts críticos:
✅ scripts/security-check.mjs
✅ scripts/health-check.mjs
...
📄 Reporte guardado en: test-results/testing-complete-report.json
📊 RESUMEN FINAL
============================================================
🚀 Performance: 4/4 exitosos
🔄 Workflows: 6/6 pasaron
🧪 Funcionalidad: 6/6 exitosos
⏱️  Tiempo total: X.XX segundos
🎯 Estado general: ✅ TODO OK
✅ TESTING COMPLETO FINALIZADO
```

---

#### ⚡ **Script Rápido: `testing-quick.mjs`**
**Comando:** `npm run testing` o `node scripts/testing-quick.mjs`

**¿Qué hace?**
- **Testing rápido de estructura**: Verifica directorios y archivos críticos
- **Testing rápido de dependencias**: Valida package-lock.json, node_modules y dependencias críticas
- **Testing rápido de configuración**: Revisa tipo ES module, scripts y archivos de configuración
- **Testing rápido de seguridad**: Confirma config.env en .gitignore
- **Testing rápido de scripts**: Valida scripts críticos y archivos de test básicos

**Archivos verificados:**
- Estructura básica: `src`, `public`, `views`, `test`, `scripts`
- Configuración básica: `package.json`, `app.mjs`, `config.env`
- Dependencias básicas: `package-lock.json`, `node_modules`, `express`, `ejs`, `dotenv`
- Seguridad básica: `.gitignore`, `config.env`
- Scripts básicos: `scripts/security-check.mjs`, `scripts/health-check.mjs`, `scripts/verify-complete.mjs`

**Salida esperada:**
```
⚡ TESTING RÁPIDO INICIADO
============================================================
📁 TESTING RÁPIDO DE ESTRUCTURA
==================================================
📁 Verificando directorios críticos:
✅ Directorio src
✅ Directorio public
...
📄 Verificando archivos críticos:
✅ Archivo package.json
✅ Archivo app.mjs
...
📊 RESUMEN TESTING RÁPIDO
============================================================
📁 Estructura: ✅ OK
📦 Dependencias: ✅ OK
⚙️ Configuración: ✅ OK
🔒 Seguridad: ✅ OK
📜 Scripts: ✅ OK
⏱️  Tiempo total: X.XX segundos
🎯 Estado general: ✅ TODO OK
✅ TESTING RÁPIDO COMPLETADO
```

---

### 🔍 **5. ANÁLISIS Y VERIFICACIÓN**

#### 📝 **Script Completo: `analysis-complete.mjs`**
**Comando:** `npm run analisis-completo` o `node scripts/analysis-complete.mjs`

**¿Qué hace?**
- **Análisis de performance**: Ejecuta análisis con Lighthouse, Core Web Vitals y métricas básicas
- **Análisis de SEO**: Verifica robots.txt, sitemap.xml, meta tags y páginas importantes
- **Análisis de seguridad**: Revisa configuración, archivos sensibles y secretos
- **Análisis de problemas específicos**: Valida scripts de CSP, SSL y Cloudflare
- **Generación de reportes**: Crea reportes detallados en formato JSON

**Análisis realizados:**
- **Performance**: Lighthouse scores, Core Web Vitals (LCP, FID, CLS), métricas básicas
- **SEO**: robots.txt, sitemap.xml, meta tags, páginas críticas
- **Seguridad**: .gitignore, config.env, archivos sensibles, secretos
- **Específicos**: Scripts de CSP, SSL, Cloudflare

**Archivos verificados:**
- SEO: `public/robots.txt`, `public/sitemap.xml`, `views/*.ejs`
- Seguridad: `.gitignore`, `config.env`, `package-lock.json`, `node_modules`
- Scripts: `scripts/check-csp-config.mjs`, `scripts/check-ssl-security.mjs`, `scripts/check-cloudflare-config.mjs`

**Salida esperada:**
```
🚀 ANÁLISIS COMPLETO INICIADO
============================================================
🚀 ANÁLISIS DE PERFORMANCE
==================================================
🔍 Verificando Lighthouse:
✅ Lighthouse disponible
📊 Ejecutando análisis básico:
✅ Análisis completado en X.XXms
📊 Tiempo de carga: XXXXms
📊 Tamaño del DOM: XXX elementos
📊 Peticiones: XX
📈 Scores de Lighthouse:
🟢 performance: XX/100
🟢 accessibility: XX/100
🟢 bestPractices: XX/100
🟢 seo: XX/100
🎯 Core Web Vitals:
🟢 LCP: XXXXms
🟢 FID: XXms
🟢 CLS: X.XXX
🔍 ANÁLISIS DE SEO
==================================================
🤖 Verificando robots.txt:
✅ robots.txt encontrado
📄 Tamaño: XXXX caracteres
✅ Contiene referencia a Sitemap
🗺️  Verificando sitemap.xml:
✅ sitemap.xml encontrado
📄 Tamaño: XXXX caracteres
📊 Total de URLs: XX
📄 Páginas importantes:
✅ /
✅ /about
✅ /contacto
...
🏷️  Verificando meta tags:
✅ Meta tags encontrados en vistas
🔒 ANÁLISIS DE SEGURIDAD
==================================================
⚙️ Verificando configuración de seguridad:
✅ config.env en .gitignore
✅ SESSION_SECRET configurado
✅ JWT_SECRET configurado
📁 Verificando archivos sensibles:
✅ package-lock.json presente (correcto)
✅ node_modules presente (correcto)
✅ .env no presente (correcto)
...
🔍 ANÁLISIS DE PROBLEMAS ESPECÍFICOS
==================================================
🛡️ Verificando headers de seguridad:
✅ scripts/check-csp-config.mjs
✅ scripts/apply-csp-fix.mjs
✅ scripts/test-csp-cloudflare.mjs
🔐 Verificando configuración SSL:
✅ scripts/check-ssl-security.mjs
✅ scripts/apply-ssl-improvements.mjs
✅ scripts/improve-ssl-config.mjs
☁️ Verificando configuración Cloudflare:
✅ scripts/check-cloudflare-config.mjs
✅ scripts/cloudflare-ssl-improvements.mjs
📄 Reporte guardado en: analysis-results/analysis-complete-report.json
📊 RESUMEN FINAL
============================================================
🚀 Performance: XX/100
🔍 SEO: X problemas
🔒 Seguridad: X problemas
🔧 Específicos: X problemas
⏱️  Tiempo total: X.XX segundos
🎯 Estado general: ✅ TODO OK
✅ ANÁLISIS COMPLETO FINALIZADO
```

---

#### ⚡ **Script Rápido: `analysis-quick.mjs`**
**Comando:** `npm run analisis` o `node scripts/analysis-quick.mjs`

**¿Qué hace?**
- **Análisis rápido de SEO**: Verifica robots.txt, sitemap.xml y páginas críticas
- **Análisis rápido de seguridad**: Revisa configuración básica y archivos sensibles
- **Análisis rápido de scripts**: Valida scripts de seguridad y análisis críticos
- **Análisis rápido de estructura**: Verifica directorios y archivos críticos

**Archivos verificados:**
- SEO básico: `public/robots.txt`, `public/sitemap.xml`
- Seguridad básica: `.gitignore`, `config.env`, `package-lock.json`, `node_modules`
- Scripts básicos: `scripts/check-csp-config.mjs`, `scripts/check-ssl-security.mjs`, `scripts/check-cloudflare-config.mjs`
- Estructura básica: `public`, `views`, `src`, `test`, `package.json`, `app.mjs`

**Salida esperada:**
```
⚡ ANÁLISIS RÁPIDO INICIADO
============================================================
🔍 ANÁLISIS RÁPIDO DE SEO
==================================================
🤖 Verificando robots.txt:
✅ robots.txt encontrado
📄 Tamaño: XXXX caracteres
✅ Contiene referencia a Sitemap
🗺️  Verificando sitemap.xml:
✅ sitemap.xml encontrado
📄 Tamaño: XXXX caracteres
📊 Total de URLs: XX
✅ Páginas críticas encontradas
🔒 ANÁLISIS RÁPIDO DE SEGURIDAD
==================================================
⚙️ Verificando configuración básica:
✅ config.env en .gitignore
✅ SESSION_SECRET configurado
✅ JWT_SECRET configurado
📁 Verificando archivos críticos:
✅ package-lock.json presente
✅ node_modules presente
✅ .env no presente (correcto)
...
📜 ANÁLISIS RÁPIDO DE SCRIPTS
==================================================
🛡️ Verificando scripts de seguridad:
✅ scripts/check-csp-config.mjs
✅ scripts/check-ssl-security.mjs
✅ scripts/check-cloudflare-config.mjs
🔍 Verificando scripts de análisis:
✅ scripts/check-seo.mjs
✅ scripts/validate-seo.mjs
✅ scripts/analyze-performance.mjs
📁 ANÁLISIS RÁPIDO DE ESTRUCTURA
==================================================
📁 Verificando directorios críticos:
✅ Directorio public
✅ Directorio views
✅ Directorio src
✅ Directorio test
📄 Verificando archivos críticos:
✅ Archivo package.json
✅ Archivo app.mjs
✅ Archivo config.env
📊 RESUMEN ANÁLISIS RÁPIDO
============================================================
🔍 SEO: ✅ OK
🔒 Seguridad: ✅ OK
📜 Scripts: ✅ OK
📁 Estructura: ✅ OK
⏱️  Tiempo total: X.XX segundos
🎯 Estado general: ✅ TODO OK
✅ ANÁLISIS RÁPIDO COMPLETADO
```

---

### 🚀 **6. RENDIMIENTO**

#### 📝 **Script Completo: `performance-complete.mjs`**
**Comando:** `npm run rendimiento-completo` o `node scripts/Rendimiento/performance-complete.mjs`

**¿Qué hace?**
- **Optimización de Lighthouse**: Verifica y optimiza JavaScript y CSS, analiza ahorros de tamaño
- **Corrección de problemas de layout**: Limpia archivos duplicados y aplica correcciones de layout shifts
- **Análisis de performance**: Ejecuta análisis con Lighthouse, Core Web Vitals y métricas básicas
- **Generación de reportes**: Crea reportes detallados en formato JSON

**Optimizaciones realizadas:**
- **JavaScript**: Verificación de archivos minificados, cálculo de ahorros de tamaño
- **CSS**: Verificación de archivos minificados, limpieza de duplicados
- **Layout**: Corrección de layout shifts, dimensiones explícitas, orden de encabezados
- **Performance**: Scores de Lighthouse, Core Web Vitals (LCP, FID, CLS)

**Archivos verificados:**
- JavaScript: `public/assets/js/*.js`, `public/assets/js/*.min.js`
- CSS: `public/assets/css/*.css`, `public/assets/css/*.min.css`
- Layout: Correcciones en vistas y estilos
- Performance: Análisis con Lighthouse

**Salida esperada:**
```
🚀 RENDIMIENTO COMPLETO INICIADO
============================================================
🎯 OPTIMIZACIÓN DE LIGHTHOUSE
==================================================
🔧 Verificando JavaScript optimizado:
📁 Encontrados X archivos JavaScript originales
📁 Encontrados X archivos JavaScript minificados
✅ archivo.js: XX.XKB → XX.XKB (XX.X% reducción)
💾 Ahorro total JS: XX.XKB
🎨 Verificando CSS optimizado:
📁 Encontrados X archivos CSS originales
📁 Encontrados X archivos CSS minificados
✅ archivo.css: XX.XKB → XX.XKB (XX.X% reducción)
💾 Ahorro total CSS: XX.XKB
🎯 CORRECCIÓN DE PROBLEMAS DE LAYOUT
==================================================
🧹 Limpiando archivos duplicados:
✅ X archivos duplicados eliminados
🎨 Aplicando correcciones de layout:
✅ Dimensiones explícitas aplicadas para prevenir layout shifts
   - main.container: min-height, transform, backface-visibility, will-change
   - .hero-subtitle: min-height, line-height, transform
   - .nav-right: min-width, min-height
♿ Corrigiendo orden de encabezados:
✅ Orden de encabezados corregido
✅ API deprecada reemplazada
📊 ANÁLISIS DE PERFORMANCE
==================================================
🔍 Verificando Lighthouse:
✅ Lighthouse disponible
📊 Ejecutando análisis básico:
✅ Análisis completado en X.XXms
📊 Tiempo de carga: XXXXms
📊 Tamaño del DOM: XXX elementos
📊 Peticiones: XX
📈 Scores de Lighthouse:
🟢 performance: XX/100
🟢 accessibility: XX/100
🟢 bestPractices: XX/100
🟢 seo: XX/100
🎯 Core Web Vitals:
🟢 LCP: XXXXms
🟢 FID: XXms
🟢 CLS: X.XXX
📄 Reporte guardado en: performance-results/performance-complete-report.json
📊 RESUMEN FINAL
============================================================
🚀 Performance: XX/100
🔧 JavaScript: ✅ Optimizado
🎨 CSS: ✅ Optimizado
🎯 Layout: ✅ Corregido
⏱️  Tiempo total: X.XX segundos
🎯 Estado general: ✅ TODO OK
✅ RENDIMIENTO COMPLETO FINALIZADO
```

---

#### ⚡ **Script Rápido: `performance-quick.mjs`**
**Comando:** `npm run rendimiento` o `node scripts/Rendimiento/performance-quick.mjs`

**¿Qué hace?**
- **Verificación rápida de JavaScript**: Verifica archivos JavaScript minificados críticos
- **Verificación rápida de CSS**: Verifica archivos CSS minificados críticos
- **Verificación rápida de Lighthouse**: Confirma disponibilidad de Lighthouse y scripts de optimización
- **Verificación rápida de archivos duplicados**: Detecta archivos CSS duplicados

**Archivos verificados:**
- JavaScript básico: `navegacion.js`, `contacto.js`, `highlight-init.js` y sus versiones minificadas
- CSS básico: `base.css`, `helpers.css`, `error-code.css` y sus versiones minificadas
- Lighthouse: Disponibilidad y scripts de optimización
- Duplicados: Archivos CSS con múltiples extensiones `.optimized`

**Salida esperada:**
```
⚡ RENDIMIENTO RÁPIDO INICIADO
============================================================
🔧 VERIFICACIÓN RÁPIDA DE JAVASCRIPT
==================================================
📁 Verificando archivos JavaScript:
📁 Encontrados X archivos JavaScript originales
📁 Encontrados X archivos JavaScript minificados
✅ navegacion.js encontrado
✅ navegacion.min.js encontrado
✅ contacto.js encontrado
✅ contacto.min.js encontrado
✅ highlight-init.js encontrado
✅ highlight-init.min.js encontrado
🎨 VERIFICACIÓN RÁPIDA DE CSS
==================================================
📁 Verificando archivos CSS:
📁 Encontrados X archivos CSS originales
📁 Encontrados X archivos CSS minificados
✅ base.css encontrado
✅ base.min.css encontrado
✅ helpers.css encontrado
✅ helpers.min.css encontrado
✅ error-code.css encontrado
✅ error-code.min.css encontrado
🎯 VERIFICACIÓN RÁPIDA DE LIGHTHOUSE
==================================================
🔍 Verificando Lighthouse:
✅ Lighthouse disponible
📜 Verificando scripts de optimización:
✅ scripts/lighthouse-optimization.mjs
✅ scripts/fix-lighthouse-issues.mjs
✅ scripts/generate-performance-report.mjs
🧹 VERIFICACIÓN RÁPIDA DE ARCHIVOS DUPLICADOS
==================================================
📁 Verificando archivos duplicados:
✅ No se encontraron archivos duplicados
📊 RESUMEN RENDIMIENTO RÁPIDO
============================================================
🔧 JavaScript: ✅ OK
🎨 CSS: ✅ OK
🎯 Lighthouse: ✅ OK
🧹 Archivos duplicados: ✅ OK
⏱️  Tiempo total: X.XX segundos
🎯 Estado general: ✅ TODO OK
✅ RENDIMIENTO RÁPIDO COMPLETADO
```

---

### 🔒 **7. SEGURIDAD**

#### 📝 **Script Completo: `security-complete.mjs`**
**Comando:** `npm run seguridad-completo` o `node scripts/Seguridad/security-complete.mjs`

**¿Qué hace?**
- **Verificación de configuración de entorno**: Analiza config.env, secretos críticos, configuración de seguridad y producción
- **Verificación de headers de seguridad**: Revisa middlewares, CSP, headers HTTP y configuración de Helmet
- **Verificación de uso de eval()**: Escanea código en busca de patrones inseguros (eval, new Function, etc.)
- **Generación de secretos seguros**: Crea secretos criptográficamente seguros y actualiza config.env
- **Pruebas de seguridad**: Ejecuta tests de seguridad automatizados

**Verificaciones realizadas:**
- **Configuración**: SESSION_SECRET, JWT_SECRET, CSRF_SECRET, rate limiting, CORS, bcrypt
- **Headers**: CSP, X-Content-Type-Options, X-Frame-Options, HSTS, Helmet
- **Código**: Patrones inseguros, eval(), new Function(), document.write(), innerHTML dinámico
- **Secretos**: Generación automática de secretos seguros con backup
- **Tests**: Verificación CSP, eval(), headers de seguridad

**Archivos verificados:**
- Configuración: `config.env`, `app.mjs`
- Middlewares: `src/middleware/csp.mjs`, `src/middleware/sri.mjs`
- Código: `src/`, `scripts/`, `views/`, `public/assets/js/`
- Seguridad: Tests de seguridad automatizados

**Salida esperada:**
```
🔒 SEGURIDAD COMPLETA INICIADA
============================================================
🔍 VERIFICACIÓN DE CONFIGURACIÓN DE ENTORNO
==================================================
📁 Verificando archivo config.env:
✅ Archivo config.env encontrado
🔐 Verificando secretos críticos:
✅ SESSION_SECRET configurado correctamente
✅ JWT_SECRET configurado correctamente
❌ CSRF_SECRET no está configurado
🛡️ Verificando configuración de seguridad:
✅ Rate limiting configurado
✅ CORS configurado
✅ Bcrypt rounds configurado correctamente
🏭 Verificando configuración de producción:
⚠️ NODE_ENV no está en producción
⚠️ Cookies seguras no habilitadas
🛡️ VERIFICACIÓN DE HEADERS DE SEGURIDAD
==================================================
📁 Verificando middlewares de seguridad:
✅ csp.mjs encontrado
✅ sri.mjs encontrado
❌ helmet.mjs no encontrado
❌ rateLimit.mjs no encontrado
🔒 Verificando Content Security Policy:
❌ CSP permite unsafe-eval
⚠️ CSP permite unsafe-inline
✅ CSP usa nonces para scripts
📄 Verificando headers en app.mjs:
❌ X-Content-Type-Options no configurado
❌ X-Frame-Options no configurado
✅ X-XSS-Protection configurado
❌ Referrer-Policy no configurado
❌ Strict-Transport-Security no configurado
✅ Helmet configurado
🚫 VERIFICACIÓN DE USO DE EVAL()
==================================================
📁 Escaneando src:
📁 Escaneando scripts:
❌ scripts\check-eval-usage.mjs: 6 problemas encontrados
   Línea 17: eval()
   Línea 20: new Function()
   Línea 35: document.write()
   Línea 36: document.write()
   Línea 137: eval()
   Línea 162: eval()
⚠️ Se encontraron 16 problemas de seguridad
📊 Archivos verificados: 142
🔐 GENERACIÓN DE SECRETOS SEGUROS
==================================================
📁 Archivo config.env encontrado:
✅ Backup creado en: config.env.backup.XXXXXXXXXX
🔑 Generando secretos seguros:
✅ SESSION_SECRET generado
✅ JWT_SECRET generado
✅ CSRF_SECRET generado
✅ Archivo config.env actualizado con secretos seguros
🧪 PRUEBAS DE SEGURIDAD
==================================================
🧪 Ejecutando: Verificación CSP
✅ Verificación CSP: PASÓ
🧪 Ejecutando: Verificación eval()
✅ Verificación eval(): PASÓ
🧪 Ejecutando: Verificación headers
✅ Verificación headers: PASÓ
📄 Reporte guardado en: security-results/security-complete-report.json
📊 RESUMEN FINAL
============================================================
🔍 Configuración: 80/100
🛡️ Headers: 0/100
🚫 Uso de eval(): -240/100
🧪 Pruebas: 100/100
🔐 Secretos: ✅ Generados
⏱️  Tiempo total: X.XX segundos
🎯 Puntuación general: -15/100
🎯 Estado general: ❌ PROBLEMAS DE SEGURIDAD DETECTADOS
✅ SEGURIDAD COMPLETA FINALIZADA
```

---

#### ⚡ **Script Rápido: `security-quick.mjs`**
**Comando:** `npm run seguridad` o `node scripts/Seguridad/security-quick.mjs`

**¿Qué hace?**
- **Verificación rápida de configuración**: Verifica config.env y secretos críticos
- **Verificación rápida de middlewares**: Revisa middlewares de seguridad críticos
- **Verificación rápida de headers**: Confirma headers de seguridad básicos
- **Verificación rápida de archivos sensibles**: Detecta archivos sensibles y .gitignore
- **Verificación rápida de dependencias**: Confirma dependencias de seguridad

**Verificaciones realizadas:**
- **Configuración**: SESSION_SECRET, JWT_SECRET, rate limiting, CORS
- **Middlewares**: csp.mjs, sri.mjs, configuración CSP básica
- **Headers**: Helmet, X-Content-Type-Options, X-Frame-Options, HSTS
- **Archivos**: config.env, .env, secrets.json, certificados, .gitignore
- **Dependencias**: helmet, express-rate-limit, cors, bcrypt

**Archivos verificados:**
- Configuración: `config.env`, `app.mjs`, `package.json`
- Middlewares: `src/middleware/csp.mjs`, `src/middleware/sri.mjs`
- Seguridad: `.gitignore`, archivos sensibles
- Dependencias: Dependencias de seguridad en package.json

**Salida esperada:**
```
⚡ SEGURIDAD RÁPIDO INICIADO
============================================================
🔍 VERIFICACIÓN RÁPIDA DE CONFIGURACIÓN
==================================================
📁 Verificando config.env:
✅ Archivo config.env encontrado
✅ SESSION_SECRET configurado
✅ JWT_SECRET configurado
✅ Rate limiting configurado
✅ CORS configurado
🛡️ VERIFICACIÓN RÁPIDA DE MIDDLEWARES
==================================================
📁 Verificando middlewares de seguridad:
✅ csp.mjs encontrado
✅ sri.mjs encontrado
❌ CSP permite unsafe-eval
✅ CSP usa nonces
📄 VERIFICACIÓN RÁPIDA DE HEADERS
==================================================
📄 Verificando headers en app.mjs:
✅ Helmet configurado
❌ X-Content-Type-Options no configurado
❌ X-Frame-Options no configurado
❌ Strict-Transport-Security no configurado
✅ CSP configurado
🚨 VERIFICACIÓN RÁPIDA DE ARCHIVOS SENSIBLES
==================================================
📁 Verificando archivos sensibles:
✅ config.env encontrado
❌ .env no encontrado
❌ secrets.json no encontrado
❌ private.key no encontrado
❌ certificate.pem no encontrado
📁 Verificando .gitignore:
✅ config.env en .gitignore
✅ .env en .gitignore
✅ *.key en .gitignore
✅ *.pem en .gitignore
❌ secrets.json no en .gitignore
📦 VERIFICACIÓN RÁPIDA DE DEPENDENCIAS
==================================================
📁 Verificando dependencias de seguridad:
✅ helmet instalado
✅ express-rate-limit instalado
✅ cors instalado
❌ bcrypt no instalado
⚠️ Script security no configurado
⚠️ Script test:security no configurado
⚠️ Script audit no configurado
📊 RESUMEN SEGURIDAD RÁPIDO
============================================================
🔍 Configuración: ✅ OK
🛡️ Middlewares: ❌ Problemas
📄 Headers: ❌ Problemas
🚨 Archivos sensibles: ❌ Problemas
📦 Dependencias: ❌ Problemas
⏱️  Tiempo total: X.XX segundos
🎯 Estado general: ❌ PROBLEMAS DE SEGURIDAD DETECTADOS
✅ SEGURIDAD RÁPIDO COMPLETADO
```

---

### 🔐 **8. SSL Y CLOUDFLARE**

#### 📝 **Script Completo: `ssl-cloudflare-complete.mjs`**
**Comando:** `npm run ssl-cloudflare-completo` o `node scripts/Red/ssl-cloudflare-complete.mjs`

**¿Qué hace?**
- **Verificación de certificado SSL**: Analiza certificados, protocolos TLS, OCSP Stapling y HSTS
- **Verificación de configuración Cloudflare**: Revisa DNS, SSL, headers de seguridad y rendimiento
- **Aplicación de mejoras SSL/TLS**: Genera configuraciones optimizadas para Nginx y Kubernetes
- **Pruebas CSP para Cloudflare**: Verifica configuración CSP y compatibilidad con Rocket Loader

**Verificaciones realizadas:**
- **SSL/TLS**: Certificados, protocolos (TLSv1.3, TLSv1.2), OCSP Stapling, HSTS, expiración
- **Cloudflare**: DNS, SSL, headers de seguridad, dominios incluidos en configuración
- **Mejoras**: Configuración Nginx optimizada, configuración Kubernetes, script de monitoreo
- **CSP**: Función CSP, dominios de Cloudflare, compatibilidad con Rocket Loader

**Archivos verificados:**
- Certificados: Verificación online de certificados SSL
- Configuración: `src/config/index.mjs`, `kubernetes/`, `docker/`
- Cloudflare: Headers HTTP, configuración DNS
- Generados: Configuraciones Nginx/Kubernetes, script de monitoreo

**Salida esperada:**
```
🔐 SSL Y CLOUDFLARE COMPLETO INICIADO
============================================================
🔐 VERIFICACIÓN DE CERTIFICADO SSL
==================================================
📋 Verificando certificado SSL:
✅ Sujeto: CN=daniel-arribas-velazquez.dav-tech.work
✅ Emisor: C=US, O=Cloudflare, Inc., CN=Cloudflare Inc ECC CA-3
✅ Válido desde: Jan 15 00:00:00 2025 GMT
✅ Válido hasta: Jan 15 23:59:59 2026 GMT
✅ Certificado válido por 365 días
✅ DNS incluidos: daniel-arribas-velazquez.dav-tech.work
🔒 Verificando protocolos SSL/TLS:
✅ TLSv1.3 soportado
✅ TLSv1.2 soportado
✅ No se detectaron protocolos SSL obsoletos
📌 Verificando OCSP Stapling:
✅ OCSP Stapling funcionando
🛡️ Verificando HSTS:
✅ HSTS configurado
✅ HSTS Preload habilitado
☁️ VERIFICACIÓN DE CONFIGURACIÓN CLOUDFLARE
==================================================
🌐 Verificando DNS de Cloudflare:
✅ DNS gestionado por Cloudflare
🔐 Verificando SSL de Cloudflare:
✅ SSL gestionado por Cloudflare
🛡️ Verificando headers de seguridad:
✅ X-Content-Type-Options configurado
✅ X-Frame-Options configurado
✅ X-XSS-Protection configurado
✅ Referrer-Policy configurado
✅ Content-Security-Policy configurado
⚡ Verificando configuración de rendimiento:
✅ Dominios de Cloudflare incluidos en configuración
🔧 APLICANDO MEJORAS SSL/TLS
==================================================
📝 Generando configuración Nginx mejorada:
✅ Configuración Nginx guardada en: ssl-cloudflare-results/nginx-ssl-improved.conf
📝 Generando configuración Kubernetes mejorada:
✅ Configuración Kubernetes guardada en: ssl-cloudflare-results/kubernetes-ssl-improved.yaml
📝 Generando script de monitoreo SSL:
✅ Script de monitoreo guardado en: ssl-cloudflare-results/ssl-monitor-improved.sh
🧪 PRUEBAS CSP PARA CLOUDFLARE
==================================================
📋 Verificando configuración CSP:
✅ Función CSP encontrada
✅ https://*.dav-tech.work incluido en CSP
✅ https://*.cloudflare.com incluido en CSP
✅ https://cdnjs.cloudflare.com incluido en CSP
✅ https://cdn.jsdelivr.net incluido en CSP
✅ Directiva script-src configurada
🚀 Simulando prueba de Rocket Loader:
URL de Rocket Loader: https://daniel-arribas-velazquez.dav-tech.work/cdn-cgi/scripts/7d0fa10a/cloudflare-static/rocket-loader.min.js
✅ Dominio base permitido en CSP
📄 Reporte guardado en: ssl-cloudflare-results/ssl-cloudflare-complete-report.json
📊 RESUMEN FINAL
============================================================
🔐 SSL/TLS: 100/100
☁️ Cloudflare: 100/100
🧪 CSP: 100/100
🔧 Mejoras: ✅ Aplicadas
⏱️  Tiempo total: X.XX segundos
🎯 Puntuación general: 100/100
🎯 Estado general: ✅ CONFIGURACIÓN SEGURA
✅ SSL Y CLOUDFLARE COMPLETO FINALIZADO
```

---

#### ⚡ **Script Rápido: `ssl-cloudflare-quick.mjs`**
**Comando:** `npm run ssl-cloudflare` o `node scripts/Red/ssl-cloudflare-quick.mjs`

**¿Qué hace?**
- **Verificación rápida de SSL**: Conectividad HTTPS y headers de seguridad básicos
- **Verificación rápida de Cloudflare**: Headers de Cloudflare y configuración CSP
- **Verificación rápida de certificados**: Validez SSL y archivos de certificados locales
- **Verificación rápida de configuración**: Archivos de configuración y configuraciones Kubernetes/Docker

**Verificaciones realizadas:**
- **SSL**: Conectividad HTTPS, headers de seguridad (HSTS, X-Content-Type-Options, etc.)
- **Cloudflare**: Headers de servidor, CF-Ray, configuración CSP, dominios incluidos
- **Certificados**: Validez SSL, archivos de certificados locales
- **Configuración**: config.env, app.mjs, package.json, kubernetes/, docker/

**Archivos verificados:**
- Conectividad: Verificación online de HTTPS
- Configuración: `src/config/index.mjs`, archivos de configuración principales
- Certificados: Archivos locales de certificados SSL
- Infraestructura: Configuraciones Kubernetes y Docker

**Salida esperada:**
```
⚡ SSL Y CLOUDFLARE RÁPIDO INICIADO
============================================================
🔐 VERIFICACIÓN RÁPIDA DE SSL
==================================================
🌐 Verificando conectividad HTTPS:
✅ Conectividad HTTPS funcionando
🛡️ Verificando headers de seguridad:
✅ strict-transport-security configurado
✅ x-content-type-options configurado
✅ x-frame-options configurado
✅ x-xss-protection configurado
✅ referrer-policy configurado
☁️ VERIFICACIÓN RÁPIDA DE CLOUDFLARE
==================================================
🌐 Verificando headers de Cloudflare:
✅ Servidor Cloudflare detectado
✅ CF-Ray header presente (Cloudflare activo)
🔒 Verificando configuración CSP:
✅ Dominios de Cloudflare incluidos en configuración
✅ Función CSP encontrada
📜 VERIFICACIÓN RÁPIDA DE CERTIFICADOS
==================================================
🔐 Verificando certificado SSL:
✅ Certificado SSL válido
📁 Verificando archivos de certificados:
⚠️ No se encontraron archivos de certificados locales
⚙️ VERIFICACIÓN RÁPIDA DE CONFIGURACIÓN
==================================================
📁 Verificando archivos de configuración:
✅ config.env encontrado
✅ app.mjs encontrado
✅ package.json encontrado
✅ kubernetes/ encontrado
✅ docker/ encontrado
☸️ Verificando configuración Kubernetes:
⚠️ No se encontraron archivos SSL/TLS en Kubernetes
🐳 Verificando configuración Docker:
⚠️ No se encontraron archivos SSL/TLS en Docker
📊 RESUMEN SSL Y CLOUDFLARE RÁPIDO
============================================================
🔐 SSL/TLS: ✅ OK
☁️ Cloudflare: ✅ OK
📜 Certificados: ✅ OK
⚙️ Configuración: ✅ OK
⏱️  Tiempo total: X.XX segundos
🎯 Estado general: ✅ CONFIGURACIÓN CORRECTA
✅ SSL Y CLOUDFLARE RÁPIDO COMPLETADO
```

---

### 🏥 **8. MONITOREO Y SALUD**

#### 📝 **Script Completo: `monitoring-complete.mjs`**
**Comando:** `npm run monitoreo-completo` o `node "scripts/Monitoreo&Salud/monitoring-complete.mjs"`

**¿Qué hace?**
- **Verificación de salud de la aplicación**: Analiza conectividad, endpoints y tiempos de respuesta
- **Verificación de métricas del sistema**: Revisa memoria, CPU, uptime y carga del sistema
- **Verificación de espacio en disco**: Analiza uso de disco y genera alertas
- **Verificación de memoria de la aplicación**: Monitorea heap, RSS y memoria externa
- **Verificación de archivos críticos**: Comprueba existencia y tamaño de archivos importantes
- **Verificación de procesos y servicios**: Analiza procesos actuales y servicios externos

**Verificaciones realizadas:**
- **Aplicación**: Endpoints `/health`, `/`, `/auth/login`, `/metrics`, `/api/contacto`
- **Sistema**: Memoria, CPU, uptime, carga promedio, plataforma
- **Disco**: Uso de espacio, alertas de umbral (Windows y Unix)
- **Memoria**: Heap usado/total, RSS, memoria externa
- **Archivos**: app.mjs, package.json, config.env, src/config/index.mjs, views/layout.ejs
- **Procesos**: PID, uptime, servicios Node.js y npm

**Archivos verificados:**
- Conectividad: Verificación online de endpoints
- Sistema: Métricas del sistema operativo
- Archivos: Archivos críticos del proyecto
- Logs: Archivos de log del sistema
- Generados: Reporte JSON detallado

**Salida esperada:**
```
🏥 MONITOREO Y SALUD COMPLETO INICIADO
============================================================
🚀 VERIFICACIÓN DE SALUD DE LA APLICACIÓN
==================================================
🌐 Verificando endpoint principal:
✅ Aplicación disponible (123.45ms)
🌐 Verificando endpoints específicos:
  ✅ /health: 200 (45.67ms)
  ✅ /: 200 (67.89ms)
  ✅ /auth/login: 200 (34.56ms)
  ✅ /metrics: 200 (23.45ms)
  ✅ /api/contacto: 200 (56.78ms)
💻 VERIFICACIÓN DE MÉTRICAS DEL SISTEMA
==================================================
📊 Memoria: 45.2% usada
🔧 CPU: 16 núcleos
⏱️ Uptime del sistema: 32 horas
⚡ Carga promedio: 0.15
🔧 CPU: 12.3% uso
💾 VERIFICACIÓN DE ESPACIO EN DISCO
==================================================
💾 Disco: 67.8% usado
🧠 VERIFICACIÓN DE MEMORIA DE LA APLICACIÓN
==================================================
🧠 Heap: 45.67 MB / 67.89 MB
📊 RSS: 123.45 MB
🔗 External: 12.34 MB
📁 VERIFICACIÓN DE ARCHIVOS CRÍTICOS
==================================================
✅ app.mjs encontrado
✅ package.json encontrado
✅ config.env encontrado
✅ src/config/index.mjs encontrado
✅ views/layout.ejs encontrado
📝 Verificando archivos de log:
✅ security.log (2.34 MB)
✅ application.log (1.23 MB)
✅ health.log (0.45 MB)
⚙️ VERIFICACIÓN DE PROCESOS Y SERVICIOS
==================================================
⚙️ PID: 12345
⏱️ Uptime: 2h 30m
🔍 Verificando servicios externos:
✅ Node.js: v22.17.0
✅ npm: 10.9.2
📄 Reporte guardado en: monitoring-results/monitoring-complete-report.json
📊 RESUMEN FINAL
============================================================
🚀 Aplicación: 100/100
💻 Sistema: 95/100
💾 Disco: 90/100
🧠 Memoria: 100/100
📁 Archivos: 100/100
⚙️ Procesos: 100/100
⏱️ Tiempo total: X.XX segundos
🎯 Puntuación general: 98/100
🎯 Estado general: ✅ SISTEMA SALUDABLE
✅ MONITOREO Y SALUD COMPLETO FINALIZADO
```

---

### 🚀 **10. OPTIMIZACIÓN**

#### 📝 **Script Completo: `optimizacion-complete.mjs`**
**Comando:** `npm run optimizacion-completo` o `node scripts/Optimizacion/optimizacion-complete.mjs`

**¿Qué hace?**
- **Lint & Format**: Ejecuta `eslint --fix` y `prettier --write` en el código fuente
- **Minificación de assets**: Reutiliza `npm run minify-assets` para minificar CSS/JS desde `data/public/assets` a `public/assets`
- **Minificación de HTML estático**: Minifica los `.html` dentro de `public/` (excluye `public/assets/` y `public/optimized/`)
- **Análisis de tamaños**: Lista los 10 archivos JS/CSS más pesados en `public/assets` y el tamaño total
- **Reporte JSON**: Guarda un reporte en `results/optimization-results/optimizacion-complete-report.json`

**Salida esperada:**
```
🚀 OPTIMIZACIÓN COMPLETA INICIADA
============================================================
🧹 Lint y formato
==================================================
🗜️ Minificación de assets (CSS/JS)
==================================================
🗺️ Minificación de HTML estático en public/
==================================================
📦 Análisis de tamaños de bundle (public/assets)
==================================================
📊 RESUMEN FINAL
============================================================
🧹 Lint OK: ✅
🖊️  Format OK: ✅
🗜️  Minificado assets: ✅
🗺️  HTML minificado: X/Y
📦 Total JS+CSS: XXXX.XKB
⏱️  Tiempo total: X.XXs
📄 Reporte guardado en: results/optimization-results/optimizacion-complete-report.json
✅ OPTIMIZACIÓN COMPLETA FINALIZADA
```

---

#### ⚡ **Script Rápido: `monitoring-quick.mjs`**
**Comando:** `npm run monitoreo` o `node "scripts/Monitoreo&Salud/monitoring-quick.mjs"`

**¿Qué hace?**
- **Verificación rápida de salud de la aplicación**: Conectividad básica y endpoint principal
- **Verificación rápida de métricas del sistema**: Memoria del sistema y aplicación
- **Verificación rápida de archivos críticos**: Existencia y tamaño de archivos importantes
- **Verificación rápida de procesos y servicios**: Información básica del proceso y servicios
- **Verificación rápida de configuración**: Archivos de configuración y estructura de directorios

**Verificaciones realizadas:**
- **Aplicación**: Endpoints `/health` y `/`
- **Sistema**: Memoria del sistema, memoria de aplicación (heap, RSS)
- **Archivos**: app.mjs, package.json, config.env, src/config/index.mjs, views/layout.ejs
- **Procesos**: PID, uptime, servicios Node.js y npm
- **Configuración**: config.env, package.json, package-lock.json, node_modules/, estructura de directorios

**Archivos verificados:**
- Conectividad: Verificación online de endpoints básicos
- Sistema: Métricas básicas del sistema operativo
- Archivos: Archivos críticos del proyecto
- Configuración: Archivos de configuración principales
- Estructura: Directorios principales del proyecto

**Salida esperada:**
```
⚡ MONITOREO Y SALUD RÁPIDO INICIADO
============================================================
🚀 VERIFICACIÓN RÁPIDA DE SALUD DE LA APLICACIÓN
==================================================
🌐 Verificando conectividad básica:
✅ Aplicación disponible
🏠 Verificando endpoint principal:
✅ Página principal disponible
💻 VERIFICACIÓN RÁPIDA DE MÉTRICAS DEL SISTEMA
==================================================
📊 Verificando memoria del sistema:
📊 Memoria: 45.2% usada
🔧 CPU: 16 núcleos
⏱️ Uptime del sistema: 32 horas
🧠 Verificando memoria de la aplicación:
🧠 Heap: 45.67 MB / 67.89 MB
📊 RSS: 123.45 MB
📁 VERIFICACIÓN RÁPIDA DE ARCHIVOS CRÍTICOS
==================================================
📁 Verificando archivos críticos:
✅ app.mjs encontrado (19.10 KB)
✅ package.json encontrado (4.86 KB)
✅ config.env encontrado (1.21 KB)
✅ src/config/index.mjs encontrado (3.67 KB)
✅ views/layout.ejs encontrado (2.09 KB)
📝 Verificando directorio de logs:
✅ Directorio de logs encontrado
⚙️ VERIFICACIÓN RÁPIDA DE PROCESOS Y SERVICIOS
==================================================
⚙️ Información del proceso:
⚙️ PID: 12345
⏱️ Uptime: 2h 30m
🔍 Verificando servicios básicos:
✅ Node.js: v22.17.0
✅ npm: 10.9.2
⚙️ VERIFICACIÓN RÁPIDA DE CONFIGURACIÓN
==================================================
📁 Verificando archivos de configuración:
✅ config.env encontrado
✅ package.json encontrado
✅ package-lock.json encontrado
✅ node_modules/ encontrado
📂 Verificando estructura de directorios:
✅ src/ encontrado
✅ public/ encontrado
✅ views/ encontrado
✅ test/ encontrado
✅ scripts/ encontrado
📊 RESUMEN MONITOREO RÁPIDO
============================================================
🚀 Aplicación: ✅ OK
💻 Sistema: ✅ OK
📁 Archivos: ✅ OK
⚙️ Procesos: ✅ OK
⚙️ Configuración: ✅ OK
⏱️ Tiempo total: X.XX segundos
🎯 Estado general: ✅ SISTEMA SALUDABLE
✅ MONITOREO Y SALUD RÁPIDO COMPLETADO
```

---

### 🔧 **9. UTILIDADES**

#### 📝 **Script Completo: `utilities-complete.mjs`**
**Comando:** `npm run utilidades-completo` o `node "scripts/Utilidades/utilities-complete.mjs"`

**¿Qué hace?**
- **Lint & Format**: Verifica ESLint y Prettier, ejecuta correcciones automáticas
- **Generate**: Genera SRI hashes, configuración de test, e imports automáticos
- **Setup**: Configura pre-commit hooks y Docker
- **Debug**: Ejecuta debug del servidor y verifica logs
- **Clean**: Limpia archivos CSS y optimiza recursos
- **Check**: Verifica configuración de contacto, lockfile, CSP y archivos minificados

**Salida esperada:**
```bash
🔧 UTILIDADES COMPLETO INICIADO
============================================================

🔧 LINT Y FORMAT
==================================================
📋 Verificando ESLint:
✅ Configuración ESLint encontrada
✅ ESLint sin errores

🎨 Verificando Prettier:
✅ Configuración Prettier encontrada
✅ Prettier sin problemas de formato

🔨 GENERATE
==================================================
🔐 Generando SRI hashes:
✅ SRI hashes generados correctamente

🧪 Generando configuración de test:
✅ Configuración de test generada correctamente

📦 Generando imports:
✅ Imports generados para app.mjs
✅ Imports generados para src/config/index.mjs
✅ Imports generados para src/routes/auth.mjs

⚙️ SETUP
==================================================
🔒 Configurando pre-commit hooks:
✅ Pre-commit hooks configurados correctamente

🐳 Configurando Docker:
✅ Docker configurado correctamente

🐛 DEBUG
==================================================
🚀 Ejecutando debug del servidor:
✅ Debug del servidor ejecutado correctamente

🧹 CLEAN
==================================================
🎨 Limpiando archivos CSS:
✅ Archivos CSS limpiados correctamente

🔍 CHECK
==================================================
📧 Verificando configuración de contacto:
✅ Configuración de contacto verificada correctamente

🔒 Verificando lockfile:
✅ Lockfile verificado correctamente

🛡️ Verificando configuración CSP:
✅ Configuración CSP verificada correctamente

📦 Verificando archivos minificados:
✅ Archivos minificados verificados correctamente

📊 RESUMEN FINAL
============================================================
🔧 Lint & Format: 100/100
🔨 Generate: 100/100
⚙️ Setup: 100/100
🐛 Debug: 100/100
🧹 Clean: 100/100
🔍 Check: 100/100
⏱️ Tiempo total: 15.30 segundos

🎯 Puntuación general: 100/100
🎯 Estado general: ✅ UTILIDADES FUNCIONANDO
```

#### ⚡ **Script Rápido: `utilities-quick.mjs`**
**Comando:** `npm run utilidades` o `node "scripts/Utilidades/utilities-quick.mjs"`

**¿Qué hace?**
- **Lint & Format**: Verifica disponibilidad de ESLint y Prettier
- **Generate**: Verifica existencia de scripts de generación
- **Setup**: Verifica scripts de setup y archivos de configuración
- **Debug**: Verifica scripts de debug y directorios de logs
- **Clean**: Verifica scripts de limpieza y directorios CSS
- **Check**: Verifica scripts de verificación y archivos críticos

**Salida esperada:**
```bash
⚡ UTILIDADES RÁPIDO INICIADO
============================================================

🔧 VERIFICACIÓN RÁPIDA DE LINT Y FORMAT
==================================================
📋 Verificando ESLint:
✅ Configuración ESLint encontrada
✅ ESLint disponible

🎨 Verificando Prettier:
✅ Configuración Prettier encontrada
✅ Prettier disponible

🔨 VERIFICACIÓN RÁPIDA DE GENERATE
==================================================
📦 Verificando scripts de generación:
✅ generate-sri.mjs encontrado
✅ generate-test-config.mjs encontrado
✅ generate-imports.mjs encontrado

⚙️ VERIFICACIÓN RÁPIDA DE SETUP
==================================================
🔧 Verificando scripts de setup:
✅ setup-pre-commit.mjs encontrado
✅ docker-setup.mjs encontrado

📁 Verificando archivos de configuración:
✅ .gitignore encontrado
✅ .eslintrc.json encontrado
✅ .prettierrc encontrado
✅ package.json encontrado

🐛 VERIFICACIÓN RÁPIDA DE DEBUG
==================================================
🔍 Verificando scripts de debug:
✅ debug-server.mjs encontrado

📝 Verificando directorios de logs:
✅ logs encontrado
✅ test-results encontrado

🧹 VERIFICACIÓN RÁPIDA DE CLEAN
==================================================
🧽 Verificando scripts de limpieza:
✅ clean-css-files.mjs encontrado

🎨 Verificando archivos CSS:
✅ public/assets/css encontrado
✅ data/public/assets/css encontrado

🔍 VERIFICACIÓN RÁPIDA DE CHECK
==================================================
✅ Verificando scripts de check:
✅ check-contacto-config.mjs encontrado
✅ check-lockfile.mjs encontrado
✅ check-csp-config.mjs encontrado
✅ check-minified.mjs encontrado

📁 Verificando archivos críticos:
✅ package-lock.json encontrado
✅ config.env encontrado
✅ app.mjs encontrado

📊 RESUMEN UTILIDADES RÁPIDO
============================================================
🔧 Lint & Format: ✅ OK
🔨 Generate: ✅ OK
⚙️ Setup: ✅ OK
🐛 Debug: ✅ OK
🧹 Clean: ✅ OK
🔍 Check: ✅ OK
⏱️ Tiempo total: 3.10 segundos

🎯 Estado general: ✅ UTILIDADES FUNCIONANDO
```

---
## 📖 **CÓMO USAR LOS SCRIPTS**

### **Ejecución básica:**
```bash
# Scripts completos (procesamiento completo)
npm run mantenimiento-completo
npm run responsive-completo
npm run verificacion-completo
npm run testing-completo
npm run analisis-completo
npm run rendimiento-completo
npm run seguridad-completo
npm run ssl-cloudflare-completo
npm run monitoreo-completo
npm run utilidades-completo
npm run optimizacion-completo

# Scripts rápidos (verificación rápida)
npm run mantenimiento
npm run responsive
npm run verificacion
npm run testing
npm run analisis
npm run rendimiento
npm run seguridad
npm run ssl-cloudflare
npm run monitoreo
npm run utilidades
```

### **Ejecución directa:**
```bash
# Scripts completos
node scripts/MANTENIMIENTO/maintenance-complete.mjs
node scripts/Diseño&CSS/responsive-complete.mjs
node scripts/Verificacion/verify-complete.mjs
node scripts/Testing/testing-complete.mjs
node scripts/Analisis/analysis-complete.mjs
node scripts/Rendimiento/performance-complete.mjs
node scripts/Seguridad/security-complete.mjs
node scripts/Red/ssl-cloudflare-complete.mjs
node "scripts/Monitoreo&Salud/monitoring-complete.mjs"
node "scripts/Utilidades/utilities-complete.mjs"
node scripts/Optimizacion/optimizacion-complete.mjs

# Scripts rápidos
node scripts/MANTENIMIENTO/maintenance-quick.mjs
node scripts/Diseño&CSS/responsive-quick.mjs
node scripts/Verificacion/verify-quick.mjs
node scripts/Testing/testing-quick.mjs
node scripts/Analisis/analysis-quick.mjs
node scripts/Rendimiento/performance-quick.mjs
node scripts/Seguridad/security-quick.mjs
node scripts/Red/ssl-cloudflare-quick.mjs
node "scripts/Monitoreo&Salud/monitoring-quick.mjs"
node "scripts/Utilidades/utilities-quick.mjs"
```

### **Flujo de trabajo recomendado:**
1. **Antes de cambios**: Ejecutar script rápido para verificar estado
2. **Después de cambios**: Ejecutar script completo para procesar todo
3. **Antes de deploy**: Ejecutar script completo para optimizar

---

## 🔧 **DEPENDENCIAS REQUERIDAS**

Los scripts requieren las siguientes dependencias instaladas:
```json
{
  "postcss": "^8.5.6",
  "cssnano": "^7.1.0"
}
```

**Instalación:**
```bash
npm install postcss cssnano
```

---

## 📝 **NOTAS IMPORTANTES**

- **Todos los scripts funcionan con ES Modules** (extensión `.mjs`)
- **Los scripts completos modifican archivos** - hacer backup antes de ejecutar
- **Los scripts rápidos solo verifican** - no modifican archivos
- **Siempre verificar la salida** para confirmar que todo funcionó correctamente
- **Los scripts incluyen logging con colores** para mejor legibilidad

---

*Documentación actualizada: [Fecha actual]*
*Autor: Daniel Arribas Velázquez*
