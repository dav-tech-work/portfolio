# Sistema de Contacto - Documentación

## 📋 Descripción General

El sistema de contacto permite a los usuarios enviar mensajes a través de un formulario web. El sistema incluye validación, sanitización, logging, auditoría y envío de correos electrónicos.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **Frontend (JavaScript)**
   - `data/public/assets/js/contacto.js` - Lógica del formulario
   - `views/pages/contacto.ejs` - Vista del formulario

2. **API Backend**
   - `src/routes/api/contacto.mjs` - Endpoints de la API
   - `src/utils/servicios/contacto.mjs` - Lógica de negocio
   - `src/utils/servicios/mail.mjs` - Servicio de envío de correos

3. **Seguridad y Validación**
   - `src/utils/seguridad/sanitize.mjs` - Sanitización de datos
   - `src/utils/seguridad/validate.mjs` - Validación de datos
   - `src/middleware/sanitizer-advanced.mjs` - Middleware de sanitización

4. **Logging y Auditoría**
   - `src/utils/servicios/logger.mjs` - Sistema de logs
   - `src/utils/servicios/loggerAuditoria.mjs` - Logs de auditoría

5. **Configuración**
   - `src/config/index.mjs` - Configuración centralizada
   - `config.env` - Variables de entorno

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
# Configuración de Email (Gmail)
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASS="tu-contraseña-de-aplicacion"
EMAIL_FROM="tu-email@gmail.com"
EMAIL_ADMIN="admin@tudominio.com"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_ENABLED=true
```

### Configuración de Gmail

Para usar Gmail como servidor SMTP:

1. **Habilitar verificación en dos pasos** en tu cuenta de Google
2. **Generar contraseña de aplicación**:
   - Ve a Configuración de la cuenta de Google
   - Seguridad > Verificación en dos pasos
   - Contraseñas de aplicación
   - Genera una nueva contraseña para "Correo"
3. **Usa esa contraseña** en `EMAIL_PASS`

## 🚀 Uso

### Scripts Disponibles

```bash
# Verificar estado del sistema
npm run contacto:check

# Probar el sistema (requiere servidor ejecutándose)
npm run contacto:test

# Iniciar servidor
npm start
```

### Endpoints de la API

#### GET `/api/contacto`
Verifica el estado del API de contacto.

**Respuesta:**
```json
{
  "success": true,
  "message": "API de contacto funcionando correctamente",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "endpoints": {
    "POST": "/api/contacto - Enviar mensaje de contacto",
    "GET": "/api/contacto - Verificar estado del API"
  }
}
```

#### GET `/api/contacto/simple`
Endpoint de prueba simple.

#### POST `/api/contacto`
Envía un mensaje de contacto.

**Datos de entrada:**
```json
{
  "nombre": "Nombre del usuario",
  "email": "usuario@ejemplo.com",
  "asunto": "Tipo de consulta",
  "mensaje": "Contenido del mensaje"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Mensaje enviado correctamente. Te responderemos pronto.",
  "data": {
    "nombre": "Nombre del usuario",
    "email": "usuario@ejemplo.com",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Respuesta de error:**
```json
{
  "success": false,
  "error": "Descripción del error"
}
```

## 🔒 Seguridad

### Validaciones Implementadas

1. **Nombre**: Mínimo 2 caracteres, máximo 100
2. **Email**: Formato válido, máximo 254 caracteres
3. **Asunto**: Mínimo 5 caracteres, máximo 200
4. **Mensaje**: Mínimo 10 caracteres, máximo 2000

### Sanitización

- Eliminación de caracteres peligrosos
- Prevención de inyección SQL
- Prevención de XSS
- Sanitización de HTML
- Validación de URLs

### Rate Limiting

- Límite de 100 requests por 15 minutos
- Límite de 5 requests de autenticación por 15 minutos

## 📊 Logging y Auditoría

### Logs Generales
- Ubicación: `logs/YYYY-MM-DD.log`
- Rotación automática diaria
- Compresión de logs antiguos

### Logs de Auditoría
- Ubicación: `logs/audit/audit-YYYY-MM-DD.log`
- Registro de todos los eventos de contacto
- Información: IP, User Agent, datos del mensaje

### Ejemplo de Log de Auditoría
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "tipo": "contacto",
  "usuario": "usuario@ejemplo.com",
  "ip": "192.168.1.1",
  "mensaje": "Nuevo mensaje de contacto de Usuario",
  "datos": {
    "asunto": "Consulta técnica",
    "longitudMensaje": 150
  },
  "agente": "Mozilla/5.0..."
}
```

## 📧 Sistema de Correos

### Modo Simulado
Cuando `EMAIL_ENABLED=false`, el sistema:
- Simula el envío de correos
- Muestra los datos en consola
- Registra en logs como "correo simulado"

### Modo Real
Cuando `EMAIL_ENABLED=true`, el sistema:
- Envía correos reales usando Gmail SMTP
- Usa plantillas HTML personalizadas
- Incluye versión texto plano

### Plantillas Disponibles

#### Plantilla de Contacto
- Diseño responsive
- Información del remitente
- Contenido del mensaje
- Información técnica (IP, User Agent)

## 🧪 Testing

### Pruebas Automatizadas
```bash
npm run contacto:test
```

### Pruebas Manuales
1. Inicia el servidor: `npm start`
2. Visita: `http://localhost:3000/contacto`
3. Completa el formulario
4. Verifica los logs en `logs/`

### Casos de Prueba
- ✅ Formulario válido
- ✅ Validación de campos vacíos
- ✅ Validación de email inválido
- ✅ Validación de longitud de mensaje
- ✅ Sanitización de datos peligrosos

## 🐛 Solución de Problemas

### Problemas Comunes

#### 1. Error de Autenticación Gmail
```
Error: Invalid login
```
**Solución**: Verifica que `EMAIL_PASS` sea una contraseña de aplicación válida.

#### 2. Correos no se envían
**Verificar**:
- `EMAIL_ENABLED=true` en config.env
- Credenciales correctas
- Conexión a internet

#### 3. Errores de validación
**Verificar**:
- Formato de email válido
- Longitud mínima de campos
- Caracteres especiales permitidos

### Debugging

#### Habilitar Logs Detallados
```env
LOG_LEVEL=debug
```

#### Verificar Logs
```bash
# Ver logs del día actual
tail -f logs/$(date +%Y-%m-%d).log

# Ver logs de auditoría
tail -f logs/audit/audit-$(date +%Y-%m-%d).log
```

## 📈 Monitoreo

### Métricas Disponibles
- Número de mensajes enviados
- Tasa de éxito/error
- Tiempo de respuesta
- Errores de validación

### Alertas Recomendadas
- Errores de envío de correos
- Intentos de inyección detectados
- Rate limiting excedido

## 🔄 Mantenimiento

### Tareas Periódicas
1. **Rotación de logs**: Automática diaria
2. **Limpieza de logs antiguos**: Mensual
3. **Verificación de credenciales**: Mensual
4. **Actualización de dependencias**: Según sea necesario

### Backup
- Configuración: `config.env`
- Logs: `logs/`
- Plantillas: `src/utils/servicios/mail.mjs`

## 📝 Notas de Desarrollo

### Estructura de Archivos
```
src/
├── routes/api/contacto.mjs          # API endpoints
├── utils/servicios/
│   ├── contacto.mjs                 # Lógica de negocio
│   ├── mail.mjs                     # Envío de correos
│   ├── logger.mjs                   # Sistema de logs
│   └── loggerAuditoria.mjs          # Logs de auditoría
├── utils/seguridad/
│   ├── sanitize.mjs                 # Sanitización
│   └── validate.mjs                 # Validación
└── config/index.mjs                 # Configuración
```

### Dependencias Principales
- `nodemailer`: Envío de correos
- `express`: Framework web
- `dotenv`: Variables de entorno

### Consideraciones de Rendimiento
- Sanitización memoizada
- Logs asíncronos con buffer
- Rate limiting configurable
- Compresión de logs automática
