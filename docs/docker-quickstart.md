# 🚀 Docker - Inicio Rápido

## ⚡ Comandos Esenciales

### 1. Verificar Configuración

```bash
# Verificar que todo esté listo
npm run verify:docker
```

### 2. Construir y Ejecutar

```bash
# Opción 1: Desarrollo (con logs)
docker-compose up --build

# Opción 2: Producción (en background)
docker-compose up --build -d

# Opción 3: Con base de datos
docker-compose --profile database up -d
```

### 3. Verificar Estado

```bash
# Ver contenedores ejecutándose
docker-compose ps

# Ver logs
docker-compose logs -f portfolio-web-seguro

# Verificar aplicación
curl http://localhost:3000/health
```

### 4. Gestión Básica

```bash
# Detener contenedor
docker-compose down

# Reiniciar contenedor
docker-compose restart

# Ver uso de recursos
docker stats portfolio-web-seguro
```

## 🔧 Configuración Rápida

### Cambiar Puerto

```bash
# Editar docker/docker-compose.yml
ports:
  - "8080:3000"  # Cambiar 3000 por 8080
```

### Variables de Entorno Personalizadas

```bash
# Crear archivo .env
cp config.env.example .env
# Editar .env

# Ejecutar con variables personalizadas
docker-compose --env-file .env up -d
```

## 🚨 Solución Rápida de Problemas

### Contenedor No Inicia

```bash
# Ver logs de error
docker-compose logs portfolio-web-seguro

# Verificar configuración
npm run verify:docker

# Reconstruir desde cero
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Puerto en Uso

```bash
# Ver qué usa el puerto
netstat -tulpn | grep :3000

# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"
```

### Error de Memoria

```bash
# Ver uso de memoria
docker stats portfolio-web-seguro

# Aumentar límites en docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
```

## 📋 Checklist de Verificación

- [ ] Docker instalado y funcionando
- [ ] `npm run verify:docker` pasa sin errores
- [ ] Contenedor se construye correctamente
- [ ] Aplicación responde en http://localhost:3000
- [ ] Health check pasa: http://localhost:3000/health
- [ ] Logs sin errores críticos

## 🎯 Comandos de Referencia

| Acción                  | Comando                                   |
| ----------------------- | ----------------------------------------- |
| Verificar configuración | `npm run verify:docker`                   |
| Construir y ejecutar    | `docker-compose up --build -d`            |
| Ver logs                | `docker-compose logs -f`                  |
| Detener                 | `docker-compose down`                     |
| Reiniciar               | `docker-compose restart`                  |
| Ver estado              | `docker-compose ps`                       |
| Ver recursos            | `docker stats`                            |
| Acceder al contenedor   | `docker exec -it portfolio-web-seguro sh` |

## 🔗 Enlaces Útiles

- [Guía Completa de Docker](./docker.md)
- [Documentación Principal](./README.md)
- [Configuración del Proyecto](./configuracion.md)

---

**¿Problemas?** Consulta la [guía completa de Docker](./docker.md) o la [documentación de troubleshooting](./docker.md#troubleshooting).
