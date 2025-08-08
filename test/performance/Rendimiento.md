# Tests de Performance

Este directorio contiene tests de rendimiento y carga para la aplicación.

## Archivos

- `performance.test.mjs` - Tests básicos de rendimiento usando Mocha
- `load-test.mjs` - Test de carga avanzado que simula 100 usuarios concurrentes

## Test de Carga

El test de carga (`load-test.mjs`) es una herramienta completa que:

### Características Principales

- ✅ **Verificación automática del servidor** antes de iniciar
- 👥 **Simulación realista** de 100 usuarios concurrentes
- 📊 **Métricas detalladas** de rendimiento
- 🎯 **Escenarios reales** de uso
- 📈 **Reporte completo** con evaluación

### Uso Rápido

```bash
# Test estándar (100 usuarios, 1 minuto)
npm run test:load

# Test con logs detallados
npm run test:load:verbose

# Test rápido (10 usuarios, 30 segundos)
npm run test:load:quick

# Test de estrés (100 usuarios, 2 minutos)
npm run test:load:stress
```

### Configuraciones Disponibles

| Comando             | Usuarios | Duración | Descripción    |
| ------------------- | -------- | -------- | -------------- |
| `test:load:quick`   | 10       | 30s      | Test básico    |
| `test:load:normal`  | 50       | 1m       | Test estándar  |
| `test:load:stress`  | 100      | 2m       | Test de estrés |
| `test:load:extreme` | 200      | 3m       | Test extremo   |

### Script Wrapper

Para configuraciones más flexibles:

```bash
# Mostrar ayuda
npm run test:load:help

# Configuración personalizada
node scripts/run-load-test.mjs --users 25 --duration 45000 --verbose

# Usar preset específico
node scripts/run-load-test.mjs --preset stress
```

### Ejemplos Prácticos

```bash
# Ejecutar todos los ejemplos
npm run test:load:ejemplos
```

## Escenarios Simulados

El test simula usuarios reales visitando:

- **Páginas principales** (30%): `/`, `/formacion`, etc.
- **Recursos estáticos** (25%): CSS, JS, imágenes
- **APIs** (5%): `/api/contacto`, `/api/email`
- **Autenticación** (10%): `/auth/login`, `/auth/register`
- **Páginas de sistema** (12%): Prácticas de sistemas
- **Monitoreo** (2%): `/health`

## Resultados

Los resultados se guardan en `test-results/load-test-results.json` e incluyen:

- Estadísticas detalladas
- Tiempos de respuesta
- Códigos de estado
- Errores encontrados
- Evaluación del rendimiento

## Requisitos

- Servidor ejecutándose en `http://localhost:3000`
- Node.js 18+
- Dependencias instaladas (`npm install`)

## Documentación Completa

Para información detallada, consulta: [docs/test-carga.md](../../docs/test-carga.md)
