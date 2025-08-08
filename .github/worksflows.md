# 🔄 GitHub Actions - Workflows de Verificación

Este directorio contiene los workflows de GitHub Actions configurados para automatizar las verificaciones del proyecto.

## 📋 Workflows Disponibles

### 1. 🔄 CI/CD Pipeline Principal (`ci.yml`)

**Descripción:** Workflow principal que ejecuta todas las verificaciones básicas del proyecto.

**Triggers:**

- Push a `main` y `develop`
- Pull Requests a `main` y `develop`
- Ejecución diaria a las 2:00 AM UTC
- Ejecución manual

**Jobs incluidos:**

- 🔒 **Verificaciones de Seguridad**
  - Auditoría de dependencias
  - Verificación de secretos
  - Configuraciones de seguridad
- 📝 **Calidad de Código**
  - ESLint
  - Prettier
- 🧪 **Tests y Cobertura**
  - Tests unitarios
  - Tests de seguridad
  - Cobertura de código
- 📁 **Estructura del Proyecto**
  - Verificación de carpetas y archivos
  - Configuraciones
- 📦 **Verificación de Dependencias**
  - Dependencias desactualizadas
  - Vulnerabilidades
  - Licencias
- ⚙️ **Verificación de Configuración**
  - Variables de entorno
  - Archivos de configuración
- 🏗️ **Build y Validación Final**
  - Build completo
  - Verificación de inicio

### 2. 🔒 Escaneo de Seguridad Avanzado (`security-scan.yml`)

**Descripción:** Workflow especializado en análisis de seguridad profundo.

**Triggers:**

- Ejecución semanal los domingos a las 3:00 AM UTC
- Ejecución manual
- Alertas de seguridad

**Jobs incluidos:**

- 🔍 **Snyk - Análisis de Dependencias**
  - Escaneo de vulnerabilidades
  - Monitoreo continuo
- 🔍 **CodeQL - Análisis de Código**
  - Detección de vulnerabilidades
  - Patrones inseguros
- 🔐 **Escaneo de Secretos**
  - TruffleHog
  - GitLeaks
- ⚙️ **Verificación de Configuración de Seguridad**
  - Headers de seguridad
  - Configuración de CORS
- 📄 **Análisis de Licencias**
  - Verificación de licencias de dependencias
  - Licencia del proyecto

### 3. ⚡ Verificaciones de Rendimiento (`performance.yml`)

**Descripción:** Workflow para análisis de rendimiento y optimización.

**Triggers:**

- Push a `main` y `develop`
- Pull Requests a `main` y `develop`
- Ejecución semanal los sábados a las 4:00 AM UTC
- Ejecución manual

**Jobs incluidos:**

- 🚀 **Tests de Rendimiento**
  - Tests de carga
  - Tests de estrés
- 📦 **Análisis de Bundle**
  - Tamaño de dependencias
  - Dependencias duplicadas
- ⚡ **Verificación de Optimizaciones**
  - Middleware de compresión
  - Minificación
  - Configuración de caché
- 🧠 **Análisis de Memoria**
  - Clinic Doctor
  - Patrones de memoria

## 🔧 Configuraciones Adicionales

### Dependabot (`dependabot.yml`)

**Configuración para actualización automática de dependencias:**

- **npm:** Actualización semanal los lunes a las 9:00 AM UTC
- **GitHub Actions:** Actualización semanal los lunes a las 10:00 AM UTC
- **Seguridad:** Actualización diaria a las 6:00 AM UTC
- **Grupos:** Agrupación de actualizaciones relacionadas
- **Filtros:** Ignorar actualizaciones mayores críticas

### CodeQL (`codeql/codeql-config.yml`)

**Configuración para análisis estático de seguridad:**

- Queries de seguridad extendidas
- Análisis específico para JavaScript/Node.js
- Filtros para CWE (Common Weakness Enumeration)
- Exclusión de archivos no relevantes

## 🚀 Cómo Usar

### Ejecución Manual

1. Ve a la pestaña **Actions** en tu repositorio
2. Selecciona el workflow que quieres ejecutar
3. Haz clic en **Run workflow**
4. Selecciona la rama y configuración
5. Ejecuta

### Configuración de Secretos

Para que algunos workflows funcionen correctamente, necesitas configurar estos secretos en tu repositorio:

- `SNYK_TOKEN`: Token de Snyk para análisis de dependencias
- `CODECOV_TOKEN`: Token de Codecov para reportes de cobertura

### Configuración de Dependabot

Edita el archivo `.github/dependabot.yml` y reemplaza `username` con tu nombre de usuario de GitHub.

## 📊 Monitoreo

### Reportes

Cada workflow genera reportes detallados que puedes ver en:

- **Actions tab:** Logs completos de ejecución
- **Security tab:** Alertas de seguridad
- **Pull Requests:** Resúmenes de verificaciones

### Métricas

Los workflows proporcionan métricas sobre:

- Tiempo de ejecución
- Tasa de éxito
- Cobertura de código
- Vulnerabilidades detectadas
- Problemas de rendimiento

## 🔧 Personalización

### Agregar Nuevos Jobs

Para agregar nuevos jobs a un workflow:

1. Edita el archivo `.yml` correspondiente
2. Agrega el nuevo job bajo la sección `jobs:`
3. Define los `steps` necesarios
4. Configura las dependencias con `needs:`

### Modificar Triggers

Para cambiar cuándo se ejecutan los workflows:

1. Edita la sección `on:` del workflow
2. Ajusta los triggers según tus necesidades
3. Configura horarios con `cron` si es necesario

### Agregar Nuevos Workflows

Para crear un nuevo workflow:

1. Crea un archivo `.yml` en `.github/workflows/`
2. Define la estructura básica
3. Configura triggers y jobs
4. Prueba la ejecución

## 🛠️ Troubleshooting

### Problemas Comunes

1. **Workflow falla en instalación de dependencias:**
   - Verifica que `package.json` esté actualizado
   - Revisa las versiones de Node.js

2. **Tests fallan:**
   - Ejecuta los tests localmente
   - Verifica la configuración de entorno

3. **Análisis de seguridad falla:**
   - Verifica que los tokens estén configurados
   - Revisa los permisos del repositorio

### Logs y Debugging

- Los logs completos están disponibles en la pestaña Actions
- Usa `echo` para debug en los workflows
- Revisa los reportes de resumen generados

## 📚 Recursos Adicionales

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CodeQL Documentation](https://docs.github.com/en/code-security/codeql-cli)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Snyk Documentation](https://docs.snyk.io/)

---

**Nota:** Asegúrate de revisar y actualizar regularmente estos workflows para mantenerlos al día con las mejores prácticas de seguridad y desarrollo.
