# 🧪 Tests del Proyecto - Documentación Completa

## 📋 Índice
1. [Estructura de Tests](#estructura-de-tests)
2. [Comandos de Ejecución](#comandos-de-ejecución)
3. [Tipos de Tests](#tipos-de-tests)
4. [Configuración](#configuración)
5. [Resultados](#resultados)
6. [Mantenimiento](#mantenimiento)

---

## 🏗️ Estructura de Tests

### Organización de Carpetas
```
test/
├── unit/                    # Pruebas unitarias
│   └── utility-functions.test.mjs
├── integration/             # Pruebas de integración
│   └── api-integration.test.mjs
├── performance/             # Pruebas de rendimiento
│   └── load-test.test.mjs
├── security/                # Pruebas de seguridad
│   ├── security-basic.test.mjs
│   └── security-advanced.test.mjs
├── e2e/                     # Pruebas end-to-end
│   └── user-journey.test.mjs
└── utils/                   # Utilidades de testing

results/
├── unit/                    # Resultados de tests unitarios
├── integration/             # Resultados de tests de integración
├── performance/             # Resultados de tests de rendimiento
├── security/                # Resultados de tests de seguridad
└── e2e/                     # Resultados de tests E2E
```

---

## 🚀 Comandos de Ejecución

### Comandos Principales
```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests por categoría
npm run test:unit           # Tests unitarios
npm run test:integration    # Tests de integración
npm run test:performance    # Tests de rendimiento
npm run test:security       # Tests de seguridad
npm run test:e2e           # Tests end-to-end

# Ejecutar todos los tests en secuencia
npm run test:all
```

### Comandos Específicos
```bash
# Tests unitarios con timeout de 10 segundos
npm run test:unit

# Tests de integración con timeout de 15 segundos
npm run test:integration

# Tests de rendimiento con timeout de 60 segundos
npm run test:performance

# Tests de seguridad con timeout de 20 segundos
npm run test:security

# Tests E2E con timeout de 30 segundos
npm run test:e2e
```

---

## 📊 Tipos de Tests

### 🔧 Tests Unitarios (`test/unit/`)
**Propósito**: Probar funciones individuales y componentes aislados.

**Archivos**:
- `utility-functions.test.mjs` - Funciones helper y utilidades

**Cobertura**:
- ✅ Formateo de fechas
- ✅ Manipulación de texto (capitalizar, truncar)
- ✅ Validación de emails
- ✅ Validación de contraseñas
- ✅ Sanitización de datos
- ✅ Manejo de errores

**Ejemplo de uso**:
```bash
npm run test:unit
```

### 🔗 Tests de Integración (`test/integration/`)
**Propósito**: Probar la interacción entre diferentes partes del sistema.

**Archivos**:
- `api-integration.test.mjs` - APIs y rutas principales

**Cobertura**:
- ✅ Rutas principales (home, formación, proyectos, etc.)
- ✅ Subrutas de formación (HTML, JavaScript, Python)
- ✅ Rutas de autenticación
- ✅ Endpoints de API
- ✅ Archivos estáticos
- ✅ Manejo de errores
- ✅ Internacionalización

**Ejemplo de uso**:
```bash
npm run test:integration
```

### ⚡ Tests de Rendimiento (`test/performance/`)
**Propósito**: Verificar el rendimiento y capacidad de carga del sistema.

**Archivos**:
- `load-test.test.mjs` - Tests de carga y rendimiento

**Cobertura**:
- ✅ Tiempo de respuesta
- ✅ Requests concurrentes
- ✅ Simulación de carga (50 usuarios)
- ✅ Tráfico en ráfaga
- ✅ Uso de memoria
- ✅ Optimizaciones (compresión, caché)

**Ejemplo de uso**:
```bash
npm run test:performance
```

### 🛡️ Tests de Seguridad (`test/security/`)
**Propósito**: Verificar que las medidas de seguridad funcionan correctamente.

**Archivos**:
- `security-basic.test.mjs` - Tests básicos de seguridad
- `security-advanced.test.mjs` - Tests avanzados de seguridad

**Cobertura**:
- ✅ Headers de seguridad
- ✅ Sanitización de entrada
- ✅ Rate limiting
- ✅ Detección de bots
- ✅ Validación de contraseñas
- ✅ Protección contra XSS
- ✅ Protección contra SQL injection

**Ejemplo de uso**:
```bash
npm run test:security
```

### 🎯 Tests E2E (`test/e2e/`)
**Propósito**: Simular el viaje completo del usuario por la aplicación.

**Archivos**:
- `user-journey.test.mjs` - Flujos completos de usuario

**Cobertura**:
- ✅ Viaje por página principal
- ✅ Navegación por formación
- ✅ Flujo de autenticación
- ✅ Formulario de contacto
- ✅ UI/UX y diseño responsivo
- ✅ Internacionalización
- ✅ Manejo de errores
- ✅ Rendimiento en navegación

**Ejemplo de uso**:
```bash
npm run test:e2e
```

---

## ⚙️ Configuración

### Variables de Entorno para Tests
```bash
# Puerto para tests (por defecto: 3001-3006)
TEST_PORT=3001

# URL del servidor para tests
SERVER_URL=http://localhost:3000

# Configuración de tests de carga
NUM_USERS=50
TEST_DURATION=30000
RAMP_UP_TIME=5000
THINK_TIME=1000
TIMEOUT=5000
```

### Dependencias de Testing
```json
{
  "devDependencies": {
    "mocha": "^10.4.0",
    "chai": "^4.4.1",
    "supertest": "^7.0.0"
  }
}
```

---

## 📈 Resultados

### Ubicación de Resultados
Los resultados de los tests se guardan automáticamente en:
```
results/
├── unit/
├── integration/
├── performance/
├── security/
└── e2e/
```

### Formato de Resultados
Los tests de rendimiento generan archivos JSON con:
- Tiempo total de ejecución
- Número total de requests
- Requests exitosos/fallidos
- Tiempo de respuesta promedio
- Tiempo de respuesta máximo/mínimo
- Timestamp de ejecución

### Ejemplo de Resultado
```json
{
  "testType": "Load Test - 50 Users",
  "duration": 15000,
  "totalRequests": 250,
  "successfulRequests": 245,
  "failedRequests": 5,
  "avgResponseTime": 150,
  "maxResponseTime": 500,
  "minResponseTime": 50,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔧 Mantenimiento

### Agregar Nuevos Tests
1. **Crear archivo de test** en la carpeta correspondiente
2. **Seguir convención de nombres**: `nombre-descriptivo.test.mjs`
3. **Usar estructura Mocha/Chai**:
   ```javascript
   import { describe, it, before, after } from 'mocha';
   import { expect } from 'chai';

   describe('Descripción del Test', () => {
     it('should do something', async () => {
       // Test implementation
     });
   });
   ```
4. **Probar el test** antes de commitear
5. **Actualizar documentación** si es necesario

### Debugging de Tests
```bash
# Ejecutar test específico con más información
npm run test:unit -- --reporter spec

# Ejecutar test con timeout extendido
npm run test:integration -- --timeout 30000

# Ejecutar test en modo watch
npm run test:unit -- --watch
```

### Troubleshooting Común
- **Timeout errors**: Aumentar timeout en package.json
- **Port conflicts**: Cambiar TEST_PORT en variables de entorno
- **Import errors**: Verificar rutas de importación
- **Async errors**: Usar async/await correctamente

---

## 📝 Notas Importantes

### Antes de Ejecutar Tests
1. ✅ Asegurar que el servidor está configurado correctamente
2. ✅ Verificar que las variables de entorno están definidas
3. ✅ Comprobar que las dependencias están instaladas
4. ✅ Asegurar que no hay conflictos de puertos

### Mejores Prácticas
- 🎯 Un test por funcionalidad
- 📝 Nombres descriptivos para tests
- 🔄 Tests independientes y aislados
- ⚡ Tests rápidos y eficientes
- 📊 Resultados claros y útiles
- 🔧 Mantenimiento regular

### Integración con CI/CD
Los tests están diseñados para ejecutarse en entornos de CI/CD:
- Timeouts apropiados
- Salidas estructuradas
- Códigos de salida correctos
- Resultados en formato JSON

---

## 🤝 Contribución

Para contribuir a los tests:
1. Crear tests para nuevas funcionalidades
2. Mantener tests existentes actualizados
3. Seguir las convenciones establecidas
4. Documentar cambios importantes
5. Probar en diferentes entornos

---

*Última actualización: Enero 2025*
*Versión: 2.0.0*
