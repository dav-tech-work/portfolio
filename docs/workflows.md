# 🔄 Workflows de GitHub Actions

## 🎯 Descripción General

Este proyecto incluye workflows de GitHub Actions automatizados para CI/CD, seguridad y rendimiento. Los workflows están configurados para ejecutarse automáticamente en push, pull requests y en horarios programados.

## 📋 Workflows Disponibles

### 1. 🔄 `ci-simple.yml` - Pipeline CI/CD Principal

**Descripción**: Pipeline completo de integración continua y despliegue.

**Triggers**:

- Push a `main` y `develop`
- Pull requests a `main` y `develop`
- Ejecución manual (`workflow_dispatch`)
- Programado diariamente a las 2:00 AM UTC

**Jobs**:

#### 🔒 Security Checks

```yaml
security-checks:
  - Verificación de dependencias
  - Auditoría de seguridad
  - Generación de secrets
  - Verificación de configuraciones
```

#### 📝 Code Quality

```yaml
code-quality:
  - ESLint (Backend)
  - ESLint (Frontend)
  - Prettier format check
```

#### 🧪 Testing

```yaml
testing:
  - Tests unitarios
  - Tests de seguridad
  - Cobertura de código
  - Subida a Codecov
```

#### 📁 Project Structure

```yaml
project-structure:
  - Verificación de estructura
  - Validación de archivos
  - Verificación de configuraciones
```

#### 📦 Dependencies

```yaml
dependencies:
  - Verificación de dependencias desactualizadas
  - Auditoría de vulnerabilidades
  - Verificación de licencias
```

#### ⚙️ Configuration

```yaml
configuration:
  - Verificación de variables de entorno
  - Validación de configuraciones críticas
```

#### 🏗️ Build

```yaml
build:
  - Build completo del proyecto
  - Verificación de inicio
  - Validación final
```

#### 📢 Notifications

```yaml
notifications:
  - Resumen de resultados
  - Notificaciones de estado
```

### 2. 🛡️ `security-scan.yml` - Escaneo de Seguridad

**Descripción**: Escaneo avanzado de seguridad y vulnerabilidades.

**Triggers**:

- Push a `main` y `develop`
- Pull requests a `main` y `develop`
- Programado semanalmente los domingos a las 3:00 AM UTC
- Ejecución manual

**Jobs**:

#### 🔍 Dependency Analysis

```yaml
dependency-scan:
  - npm audit con reporte JSON
  - Verificación de dependencias desactualizadas
  - Subida de reportes como artifacts
```

#### ⚙️ Security Configuration

```yaml
security-config:
  - Verificación de configuraciones de seguridad
  - Análisis de bot detection
  - Verificación de headers de seguridad
  - Validación de CORS
```

#### 🔐 Secrets Scan

```yaml
secrets-scan:
  - Búsqueda de patrones de secretos
  - Verificación de archivos de configuración
  - Validación de .gitignore
```

### 3. ⚡ `performance.yml` - Verificaciones de Rendimiento

**Descripción**: Tests y análisis de rendimiento automatizados.

**Triggers**:

- Push a `main` y `develop`
- Pull requests a `main` y `develop`
- Programado semanalmente los sábados a las 4:00 AM UTC
- Ejecución manual

**Jobs**:

#### 🚀 Performance Tests

```yaml
performance-tests:
  - Generación de configuración de testing
  - Tests de rendimiento
  - Análisis de logs de error
  - Subida de reportes
```

#### 📦 Bundle Analysis

```yaml
bundle-analysis:
  - Análisis de tamaño de dependencias
  - Verificación de dependencias duplicadas
```

#### ⚡ Optimization Checks

```yaml
optimization-checks:
  - Verificación de compresión
  - Análisis de minificación
  - Validación de caché
```

#### 🧠 Memory Analysis

```yaml
memory-analysis:
  - Análisis de memoria con Clinic
  - Generación de reportes de rendimiento
```

## 🔧 Configuración de Workflows

### Variables de Entorno

Los workflows utilizan las siguientes variables de entorno:

```yaml
env:
  NODE_VERSION: '18'
  CI: true
```

### Secrets Requeridos

Para funcionamiento completo, configurar estos secrets en GitHub:

```yaml
secrets:
  CODECOV_TOKEN: Token para subir cobertura a Codecov
  SLACK_WEBHOOK: Webhook de Slack para notificaciones (opcional)
  EMAIL_NOTIFICATIONS: Configuración de email (opcional)
```

### Configuración de Caché

Los workflows utilizan caché de npm para optimizar el rendimiento:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}
    cache: 'npm'
```

## 📊 Reportes y Artifacts

### Artifacts Generados

#### CI/CD Pipeline

- `npm-audit-report`: Reporte de auditoría de dependencias
- `coverage-report`: Reporte de cobertura de código
- `security-report`: Reporte de verificaciones de seguridad

#### Performance Workflow

- `performance-report`: Reporte de tests de rendimiento
- `memory-report`: Reporte de análisis de memoria
- `bundle-report`: Reporte de análisis de bundle

### Reportes en GitHub

Los workflows generan reportes detallados en:

- **Step Summary**: Resumen ejecutivo de cada job
- **Actions Tab**: Logs completos de ejecución
- **Security Tab**: Alertas de seguridad (si las hay)

## 🚀 Ejecución Manual

### Ejecutar Workflow Completo

1. Ir a la pestaña **Actions** en GitHub
2. Seleccionar el workflow deseado
3. Hacer clic en **Run workflow**
4. Seleccionar la rama y opciones
5. Hacer clic en **Run workflow**

### Ejecutar Jobs Específicos

```bash
# Ejecutar solo tests de seguridad
gh workflow run security-scan.yml

# Ejecutar solo tests de rendimiento
gh workflow run performance.yml

# Ejecutar pipeline completo
gh workflow run ci-simple.yml
```

## 📈 Monitoreo y Métricas

### Métricas de Workflows

- **Tiempo de ejecución**: Monitorear duración de jobs
- **Tasa de éxito**: Porcentaje de workflows exitosos
- **Tiempo de respuesta**: Desde push hasta resultado
- **Cobertura de código**: Tendencias de cobertura

### Alertas y Notificaciones

Los workflows pueden configurarse para enviar notificaciones:

```yaml
# Ejemplo de notificación en Slack
- name: Notify on Failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🔍 Troubleshooting

### Problemas Comunes

#### Workflow No Se Ejecuta

```yaml
# Verificar triggers en el workflow
on:
  push:
    branches: [main, develop] # Asegurar que la rama esté incluida
```

#### Tests Fallan en CI pero Pasan Localmente

```bash
# Verificar variables de entorno
# Verificar versiones de Node.js
# Verificar dependencias
```

#### Timeout en Jobs

```yaml
# Aumentar timeout en el job
timeout-minutes: 30 # Por defecto es 360 minutos
```

#### Problemas de Caché

```bash
# Limpiar caché manualmente
gh run list --workflow=ci-simple.yml
gh run rerun <run-id>
```

### Logs y Debugging

#### Ver Logs Detallados

1. Ir a **Actions** → **Workflow** → **Run**
2. Hacer clic en el job fallido
3. Expandir los steps para ver logs detallados

#### Debug Mode

```yaml
# Habilitar debug en workflows
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

## 🔧 Personalización

### Agregar Nuevos Jobs

```yaml
# Ejemplo de nuevo job
new-job:
  name: 🆕 Nuevo Job
  runs-on: ubuntu-latest
  needs: [build] # Dependencias

  steps:
    - name: 📥 Checkout
      uses: actions/checkout@v4

    - name: 🟢 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: 📦 Install dependencies
      run: npm ci

    - name: 🔧 Execute custom script
      run: npm run custom-script
```

### Modificar Triggers

```yaml
# Ejemplo de triggers personalizados
on:
  push:
    branches: [main, develop, feature/*]
    paths: ['src/**', 'package.json']
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1-5' # Lunes a viernes a las 2 AM
```

### Agregar Notificaciones

```yaml
# Ejemplo de notificación personalizada
- name: 📢 Custom Notification
  if: always()
  run: |
    echo "## 📊 Custom Report" >> $GITHUB_STEP_SUMMARY
    echo "Workflow: ${{ github.workflow }}" >> $GITHUB_STEP_SUMMARY
    echo "Status: ${{ job.status }}" >> $GITHUB_STEP_SUMMARY
```

## 📚 Referencias

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Actions Marketplace](https://github.com/marketplace?type=actions)
- [Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

## 🎯 Mejores Prácticas

### Seguridad

- ✅ Usar `GITHUB_TOKEN` con permisos mínimos
- ✅ No exponer secrets en logs
- ✅ Usar dependabot para actualizaciones automáticas
- ✅ Escanear dependencias regularmente

### Rendimiento

- ✅ Usar caché de dependencias
- ✅ Paralelizar jobs cuando sea posible
- ✅ Optimizar tiempos de timeout
- ✅ Usar runners apropiados

### Mantenimiento

- ✅ Revisar workflows regularmente
- ✅ Actualizar actions a versiones estables
- ✅ Monitorear métricas de ejecución
- ✅ Documentar cambios en workflows

---

**¿Necesitas ayuda con algún workflow específico?** Consulta los logs en GitHub Actions o crea un issue en el repositorio.
