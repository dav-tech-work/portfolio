# 🐳 Docker - Guía Completa

## 🎯 Descripción General

Este proyecto incluye configuración completa de Docker para facilitar el despliegue y desarrollo. El contenedor está optimizado para seguridad, rendimiento y autonomía.

## 📋 Requisitos Previos

### Software Requerido

- **Docker**: Versión 20.10.0 o superior
- **Docker Compose**: Versión 2.0.0 o superior
- **Git**: Para clonar el repositorio

### Verificar Instalaciones

```bash
# Verificar Docker
docker --version
# Debe mostrar: Docker version 20.x.x

# Verificar Docker Compose
docker-compose --version
# Debe mostrar: Docker Compose version 2.x.x

# Verificar que Docker está funcionando
docker run hello-world
```

## 🚀 Creación del Contenedor

### 1. Preparación del Entorno

```bash
# 1. Clonar el repositorio (si no lo tienes)
git clone <repository-url>
cd porfolio_produccion_new

# 2. Verificar que todo esté listo
npm run verify:docker
```

### 2. Construcción de la Imagen

#### Opción A: Usando Docker Compose (Recomendado)

```bash
# Construir y ejecutar en modo desarrollo
docker-compose up --build

# Construir y ejecutar en background
docker-compose up --build -d

# Solo construir sin ejecutar
docker-compose build
```

#### Opción B: Usando Docker directamente

```bash
# Construir la imagen
docker build -f docker/Dockerfile -t portfolio-web-seguro .

# Ejecutar el contenedor
docker run -p 3000:3000 --name portfolio-container portfolio-web-seguro
```

### 3. Verificación de la Construcción

```bash
# Verificar que la imagen se creó correctamente
docker images | grep portfolio

# Verificar que el contenedor está ejecutándose
docker ps | grep portfolio

# Verificar logs del contenedor
docker-compose logs portfolio-web-seguro
```

## 🔧 Configuración del Contenedor

### Variables de Entorno

El contenedor genera automáticamente las siguientes variables de entorno:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<generado_automáticamente>
SESSION_SECRET=<generado_automáticamente>
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
LOG_LEVEL=warn
ENABLE_CLUSTERING=true
COMPRESSION_ENABLED=true
CSP_ENABLED=true
HSTS_ENABLED=true
```

### Personalización de Variables

Para personalizar las variables de entorno:

```bash
# Crear archivo .env personalizado
cp config.env.example .env
# Editar .env con tus valores

# Ejecutar con variables personalizadas
docker-compose --env-file .env up -d
```

### Configuración de Red

```bash
# Cambiar puerto de exposición
# Editar docker/docker-compose.yml
ports:
  - "8080:3000"  # Cambiar 3000 por 8080

# Ejecutar en red personalizada
docker network create portfolio-network
docker-compose --network portfolio-network up -d
```

## 🗄️ Base de Datos (Opcional)

### Configurar MongoDB

```bash
# Ejecutar con base de datos
docker-compose --profile database up -d

# Verificar que MongoDB está ejecutándose
docker ps | grep mongodb

# Conectar a MongoDB
docker exec -it portfolio-mongodb mongosh
```

### Configuración de Base de Datos

```yaml
# En docker/docker-compose.yml
mongodb:
  image: mongo:7.0
  environment:
    - MONGO_INITDB_ROOT_USERNAME=admin
    - MONGO_INITDB_ROOT_PASSWORD=secure_password_here
    - MONGO_INITDB_DATABASE=portfolio
  ports:
    - '27017:27017'
  volumes:
    - mongodb_data:/data/db
```

## 🔒 Seguridad del Contenedor

### Características de Seguridad Implementadas

- ✅ **Usuario no-root**: Contenedor ejecuta como usuario `appuser:appgroup`
- ✅ **Read-only**: Sistema de archivos de solo lectura
- ✅ **Sin privilegios**: Contenedor sin capacidades especiales
- ✅ **Tmpfs**: Datos temporales en memoria RAM
- ✅ **Secrets generados**: Secrets únicos por contenedor
- ✅ **Headers de seguridad**: CSP, HSTS, XSS Protection

### Verificación de Seguridad

```bash
# Verificar configuración de seguridad
docker inspect portfolio-web-seguro | grep -A 10 "SecurityOpt"

# Verificar usuario del contenedor
docker exec portfolio-web-seguro whoami
# Debe mostrar: appuser

# Verificar permisos de archivos
docker exec portfolio-web-seguro ls -la /app
```

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real

```bash
# Ver logs del contenedor
docker-compose logs -f portfolio-web-seguro

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs con timestamps
docker-compose logs -f -t portfolio-web-seguro
```

### Health Check

```bash
# Verificar estado del contenedor
docker-compose ps

# Verificar health check manualmente
curl -f http://localhost:3000/health

# Ver logs de health check
docker inspect portfolio-web-seguro | grep -A 5 "Health"
```

### Métricas del Contenedor

```bash
# Ver uso de recursos
docker stats portfolio-web-seguro

# Ver información detallada
docker inspect portfolio-web-seguro

# Ver historial de comandos
docker history portfolio-web-seguro
```

## 🔄 Gestión del Contenedor

### Comandos Básicos

```bash
# Iniciar contenedor
docker-compose up -d

# Detener contenedor
docker-compose down

# Reiniciar contenedor
docker-compose restart

# Pausar contenedor
docker-compose pause

# Reanudar contenedor
docker-compose unpause
```

### Actualización del Contenedor

```bash
# Detener y eliminar contenedor actual
docker-compose down

# Reconstruir imagen con cambios
docker-compose up --build -d

# Verificar nueva versión
docker-compose logs portfolio-web-seguro
```

### Limpieza

```bash
# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes no utilizadas
docker image prune

# Limpieza completa
docker system prune -a

# Eliminar volúmenes no utilizados
docker volume prune
```

## 🚀 Despliegue en Producción

### Configuración de Producción

```bash
# 1. Configurar variables de producción
export NODE_ENV=production
export PORT=3000

# 2. Construir imagen optimizada
docker-compose -f docker/docker-compose.yml build --no-cache

# 3. Ejecutar en producción
docker-compose -f docker/docker-compose.yml up -d

# 4. Verificar despliegue
curl -f http://localhost:3000/health
```

### Configuración con Reverse Proxy

```nginx
# Ejemplo de configuración Nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Configuración con SSL

```bash
# Usar Let's Encrypt con Docker
docker run -d \
  --name letsencrypt \
  --volumes-from portfolio-web-seguro \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  certbot/certbot certonly --webroot \
  --webroot-path=/app/public \
  --email tu-email@dominio.com \
  --agree-tos --no-eff-email \
  -d tu-dominio.com
```

## 🔍 Troubleshooting

### Problemas Comunes

#### Contenedor No Inicia

```bash
# Verificar logs de error
docker-compose logs portfolio-web-seguro

# Verificar configuración
npm run verify:docker

# Verificar puerto disponible
netstat -tulpn | grep :3000
```

#### Error de Permisos

```bash
# Verificar permisos de archivos
ls -la docker/

# Corregir permisos
chmod +x docker/Dockerfile
chmod 644 docker/docker-compose.yml
```

#### Error de Memoria

```bash
# Verificar uso de memoria
docker stats portfolio-web-seguro

# Aumentar límites en docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
```

#### Error de Red

```bash
# Verificar conectividad
docker exec portfolio-web-seguro curl -f http://localhost:3000/health

# Verificar configuración de red
docker network ls
docker network inspect portfolio_default
```

### Debug del Contenedor

```bash
# Acceder al contenedor
docker exec -it portfolio-web-seguro sh

# Verificar procesos
docker exec portfolio-web-seguro ps aux

# Verificar variables de entorno
docker exec portfolio-web-seguro env

# Verificar archivos
docker exec portfolio-web-seguro ls -la /app
```

## 📚 Referencias

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Docker Security Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🎯 Mejores Prácticas

### Seguridad

- ✅ Usar siempre usuario no-root
- ✅ Mantener imágenes actualizadas
- ✅ Escanear vulnerabilidades regularmente
- ✅ Usar secrets para datos sensibles

### Rendimiento

- ✅ Usar multi-stage builds
- ✅ Optimizar tamaño de imagen
- ✅ Usar .dockerignore apropiado
- ✅ Configurar límites de recursos

### Mantenimiento

- ✅ Etiquetar imágenes apropiadamente
- ✅ Mantener logs organizados
- ✅ Monitorear uso de recursos
- ✅ Actualizar dependencias regularmente

---

**¿Necesitas ayuda con algún aspecto específico de Docker?** Consulta la documentación completa o crea un issue en GitHub.
