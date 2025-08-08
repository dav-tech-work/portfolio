# 🔄 Workflows de GitHub Actions - Documentación Completa

## 📋 **Resumen Ejecutivo**

Este documento describe la nueva arquitectura de workflows modulares implementada en el proyecto. Los workflows están diseñados para ser **independientes**, **eficientes** y **compatibles** tanto con entornos Linux (GitHub Actions) como Windows (desarrollo local).

## 🏗️ **Arquitectura de Workflows**

### **Estructura Modular**
```
.github/workflows/
├── security.yml          # 🔒 Análisis de seguridad
├── testing.yml           # 🧪 Suite de testing
├── performance.yml       # ⚡ Análisis de rendimiento
├── monitoring.yml        # 📊 Monitoreo y salud
└── code-quality.yml      # 📝 Calidad de código
```

### **Características Principales**
- ✅ **Modulares**: Cada workflow es independiente
- ✅ **Cross-platform**: Funcionan en Linux y Windows
- ✅ **Integrados**: Utilizan scripts existentes del proyecto
- ✅ **Eficientes**: Timeouts optimizados y ejecución paralela
- ✅ **Reportables**: Generan artifacts y reportes detallados

## 🔒 **Workflow de Seguridad**

### **Descripción**
Análisis completo de seguridad que incluye verificación de dependencias, escaneo de secretos, auditoría de configuración y análisis de vulnerabilidades.

### **Triggers**
- Push/PR a `main` y `develop`
- Ejecución diaria a las 3:00 AM UTC
- Ejecución manual (`workflow_dispatch`)

### **Jobs**
1. **Security Analysis** (15 min timeout)
   - Instalación de dependencias
   - Configuración de entorno CI
   - Ejecución de análisis de seguridad completo
   - Auditoría de dependencias con `npm audit`
   - Escaneo de secretos hardcodeados
   - Generación de reportes

### **Comando Local**
```bash
npm run workflow:security
```

### **Resultados**
- Reporte en: `results/workflows/security/security-report.json`
- Artifacts: `security-reports`

## 🧪 **Workflow de Testing**

### **Descripción**
Suite completa de testing que ejecuta tests unitarios, de integración, de seguridad y E2E, además de generar cobertura de código.

### **Triggers**
- Push/PR a `main` y `develop`
- Ejecución diaria a las 4:00 AM UTC
- Ejecución manual (`workflow_dispatch`)

### **Jobs**
1. **Test Suite** (20 min timeout)
   - Tests unitarios
   - Tests de integración
   - Tests de seguridad
   - Tests E2E
   - Generación de cobertura
   - Análisis completo de testing

### **Comando Local**
```bash
npm run workflow:testing
```

### **Resultados**
- Reporte en: `results/workflows/testing/testing-report.json`
- Cobertura en: `coverage/`
- Artifacts: `testing-reports`

## ⚡ **Workflow de Rendimiento**

### **Descripción**
Análisis de rendimiento que incluye optimización de Lighthouse, análisis de dependencias y verificación de optimizaciones implementadas.

### **Triggers**
- Push/PR a `main` y `develop`
- Ejecución diaria a las 5:00 AM UTC
- Ejecución manual (`workflow_dispatch`)

### **Jobs**
1. **Performance Analysis** (25 min timeout)
   - Análisis de rendimiento completo
   - Optimización de Lighthouse
   - Análisis de dependencias
   - Verificación de optimizaciones (compresión, minificación, caché)

### **Comando Local**
```bash
npm run workflow:performance
```

### **Resultados**
- Reporte en: `results/workflows/performance/performance-report.json`
- Análisis de dependencias: `dependencies-analysis.txt`
- Optimizaciones: `optimizations.txt`
- Artifacts: `performance-reports`

## 📊 **Workflow de Monitoreo**

### **Descripción**
Sistema de monitoreo que verifica la salud de la aplicación, analiza métricas del sistema y proporciona diagnóstico completo.

### **Triggers**
- Push/PR a `main` y `develop`
- Ejecución diaria a las 6:00 AM UTC
- Ejecución manual (`workflow_dispatch`)

### **Jobs**
1. **Monitoring Analysis** (20 min timeout)
   - Análisis de monitoreo completo
   - Verificación de salud de la aplicación
   - Análisis de métricas del sistema
   - Diagnóstico de la aplicación

### **Comando Local**
```bash
npm run workflow:monitoring
```

### **Resultados**
- Reporte en: `results/workflows/monitoring/monitoring-report.json`
- Health check: `health-check.txt`
- Métricas del sistema: `system-metrics.txt`
- Artifacts: `monitoring-reports`

## 📝 **Workflow de Calidad de Código**

### **Descripción**
Análisis de calidad de código que incluye linting, formateo, análisis de estructura y métricas de código.

### **Triggers**
- Push/PR a `main` y `develop`
- Ejecución diaria a las 7:00 AM UTC
- Ejecución manual (`workflow_dispatch`)

### **Jobs**
1. **Code Quality Analysis** (15 min timeout)
   - Análisis de código completo
   - Verificación con ESLint
   - Verificación con Prettier
   - Análisis de estructura del código

### **Comando Local**
```bash
npm run workflow:code-quality
```

### **Resultados**
- Reporte en: `results/workflows/code-quality/analysis-report.json`
- ESLint: `eslint-report.json`
- Prettier: `prettier-report.txt`
- Estadísticas: `code-stats.txt`
- Artifacts: `code-quality-reports`

## 🛠️ **Comandos de Verificación Local**

### **Comandos Individuales**
```bash
# Verificación de seguridad
npm run workflow:security

# Verificación de testing
npm run workflow:testing

# Verificación de rendimiento
npm run workflow:performance

# Verificación de monitoreo
npm run workflow:monitoring

# Verificación de calidad de código
npm run workflow:code-quality
```

### **Comandos de Utilidad**
```bash
# Ejecutar todos los workflows
npm run workflow:all

# Verificación general del proyecto
npm run workflow:verify

# Linting y formateo
npm run lint
npm run lint:fix
npm run format
npm run format:check

# Tests específicos
npm run test:unit
npm run test:integration
npm run test:security
npm run test:e2e
npm run test:coverage
```

## 📁 **Estructura de Resultados**

### **Directorio de Resultados**
```
results/workflows/
├── security/
│   └── security-report.json
├── testing/
│   └── testing-report.json
├── performance/
│   ├── performance-report.json
│   ├── dependencies-analysis.txt
│   └── optimizations.txt
├── monitoring/
│   ├── monitoring-report.json
│   ├── health-check.txt
│   └── system-metrics.txt
└── code-quality/
    ├── analysis-report.json
    ├── eslint-report.json
    ├── prettier-report.txt
    └── code-stats.txt
```

### **Artifacts de GitHub Actions**
- `security-reports`: Reportes de seguridad
- `testing-reports`: Reportes de testing y cobertura
- `performance-reports`: Reportes de rendimiento
- `monitoring-reports`: Reportes de monitoreo
- `code-quality-reports`: Reportes de calidad de código

## 🔧 **Configuración y Personalización**

### **Variables de Entorno**
Los workflows utilizan las siguientes variables de entorno:
- `NODE_VERSION`: Versión de Node.js (por defecto: '18')
- `RESULTS_DIR`: Directorio de resultados específico por workflow

### **Configuración de Timeouts**
- **Seguridad**: 15 minutos
- **Testing**: 20 minutos
- **Rendimiento**: 25 minutos
- **Monitoreo**: 20 minutos
- **Calidad de Código**: 15 minutos

### **Configuración de Caché**
Todos los workflows utilizan caché de npm para optimizar la instalación de dependencias.

## 🚀 **Cómo Usar**

### **Ejecución en GitHub Actions**
1. Ve a la pestaña **Actions** en tu repositorio
2. Selecciona el workflow que quieres ejecutar
3. Haz clic en **Run workflow**
4. Selecciona la rama y configuración
5. Ejecuta

### **Ejecución Local**
1. Asegúrate de tener Node.js 18+ instalado
2. Instala las dependencias: `npm ci`
3. Configura el entorno: `cp config.env.example config.env`
4. Ejecuta el workflow deseado: `npm run workflow:[nombre]`

### **Verificación Previa a GitHub**
Antes de hacer push a GitHub, ejecuta:
```bash
# Verificación completa
npm run workflow:all

# O verificación individual
npm run workflow:security
npm run workflow:testing
npm run workflow:performance
npm run workflow:monitoring
npm run workflow:code-quality
```

## 📊 **Monitoreo y Reportes**

### **Reportes Generados**
Cada workflow genera:
- **Reporte JSON**: Datos estructurados del análisis
- **Logs detallados**: Información de ejecución
- **Métricas**: Estadísticas y mediciones
- **Artifacts**: Archivos descargables

### **Integración con GitHub**
- **Step Summaries**: Resúmenes en la interfaz de GitHub Actions
- **Artifacts**: Archivos descargables por workflow
- **Status Checks**: Verificaciones de estado en PRs

## 🔍 **Troubleshooting**

### **Problemas Comunes**

#### **Workflow falla en instalación**
```bash
# Verificar Node.js
node --version

# Limpiar caché de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm ci
```

#### **Scripts no encontrados**
```bash
# Verificar que los scripts existen
ls scripts/Seguridad/
ls scripts/Testing/
ls scripts/Rendimiento/
ls scripts/Monitoreo\&Salud/
ls scripts/Analisis/
```

#### **Problemas de permisos**
```bash
# Configurar permisos correctos
chmod 600 config.env
chmod +x scripts/*/*.mjs
```

### **Logs y Debugging**
- Los logs completos están en la pestaña Actions de GitHub
- Los reportes locales están en `results/workflows/[tipo]/`
- Usa `echo` para debug en los workflows

## 📚 **Recursos Adicionales**

### **Documentación Relacionada**
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)

### **Scripts del Proyecto**
- `scripts/Seguridad/`: Scripts de seguridad
- `scripts/Testing/`: Scripts de testing
- `scripts/Rendimiento/`: Scripts de rendimiento
- `scripts/Monitoreo&Salud/`: Scripts de monitoreo
- `scripts/Analisis/`: Scripts de análisis

---

**Nota**: Esta documentación se actualiza automáticamente con cada cambio en los workflows. Para sugerencias o problemas, consulta los issues del repositorio.
