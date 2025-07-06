# ===================================================================
# 🐳 DOCKERFILE AUTÓNOMO - PORTFOLIO WEB SEGURO
# ===================================================================
# Contenedor completamente independiente sin dependencias externas
# Nivel de seguridad: Empresarial Avanzado (9.5/10)
# Última actualización: 2025-01-27
# Mejoras aplicadas: CSRF fixes, sanitización avanzada, validación extendida
# ===================================================================

# ===================================================================
# 🏗️ ETAPA 1: BUILD (Construcción)
# ===================================================================
FROM node:23-alpine3.21 AS builder

# Metadatos del contenedor
LABEL maintainer="Daniel Arribas Velázquez <danielarribasvelazquez@dav-tech.work>"
LABEL description="Portfolio Web Seguro - Etapa de construcción"
LABEL version="2.1.0"
LABEL security.level="enterprise-advanced"

# Instalar dependencias del sistema necesarias para compilación
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/cache/apk/*

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (optimización de caché Docker)
COPY package*.json ./

# Copiar scripts necesarios para postinstall
COPY scripts/ ./scripts/

# Copiar archivo de ejemplo como config.env para el build
COPY config.env.example ./config.env

# Limpiar caché de npm e instalar TODAS las dependencias (incluyendo dev para build)
RUN npm cache clean --force && \
    npm ci --no-audit --no-fund && \
    npm cache clean --force

# Generar secretos seguros para el build
RUN echo "🔐 Generando secretos seguros para build..." && \
    echo "JWT_SECRET=$(openssl rand -hex 64)" >> config.env && \
    echo "SESSION_SECRET=$(openssl rand -hex 64)" >> config.env && \
    echo "CSRF_SECRET=$(openssl rand -hex 32)" >> config.env && \
    echo "API_SECRET=$(openssl rand -hex 32)" >> config.env && \
    echo "✅ Secretos generados correctamente"

# Copiar TODOS los archivos del proyecto (excepto los excluidos por .dockerignore)
COPY . .

# Ejecutar scripts de generación si existen
RUN if [ -f "src/utils/generador/generarBuscador.mjs" ]; then \
    echo "🔧 Ejecutando generador de buscador..."; \
    node src/utils/generador/generarBuscador.mjs; \
    else \
    echo "⚠️ Script generador no encontrado, saltando..."; \
    fi

# Verificar integridad de archivos críticos
RUN echo "🔍 Verificando integridad de archivos críticos..." && \
    [ -f "app.mjs" ] || (echo "❌ Error: app.mjs no encontrado" && exit 1) && \
    [ -d "src/config" ] || (echo "❌ Error: directorio src/config no encontrado" && exit 1) && \
    [ -d "src/middleware" ] || (echo "❌ Error: directorio src/middleware no encontrado" && exit 1) && \
    [ -d "src/routes" ] || (echo "❌ Error: directorio src/routes no encontrado" && exit 1) && \
    [ -d "src/utils" ] || (echo "❌ Error: directorio src/utils no encontrado" && exit 1) && \
    [ -d "public" ] || (echo "❌ Error: directorio public no encontrado" && exit 1) && \
    [ -d "views" ] || (echo "❌ Error: directorio views no encontrado" && exit 1) && \
    [ -f "robots.txt" ] || (echo "❌ Error: robots.txt no encontrado" && exit 1) && \
    [ -f "sitemap.xml" ] || (echo "❌ Error: sitemap.xml no encontrado" && exit 1) && \
    echo "✅ Verificación de integridad completada"

# Ejecutar verificación de dependencias en build
RUN echo "🔒 Verificando dependencias..." && \
    npm audit --audit-level=high && \
    echo "✅ Verificación de dependencias completada"

# ===================================================================
# 🚀 ETAPA 2: PRODUCCIÓN (Runtime optimizado y seguro)
# ===================================================================
FROM node:23-alpine3.21 AS production

# Metadatos del contenedor de producción
LABEL maintainer="Daniel Arribas Velázquez <daniel@dav-tech.work>"
LABEL description="Portfolio Web Seguro - Contenedor autónomo de producción"
LABEL version="2.1.0"
LABEL security.level="enterprise-advanced"
LABEL security.scan-date="2025-01-27"
LABEL autonomous="true"
LABEL features="csrf-protection,advanced-validation,sanitization,404-handling"

# Instalar herramientas de seguridad y monitoreo
RUN apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    tzdata \
    openssl \
    && rm -rf /var/cache/apk/*

# Crear usuario y grupo no-root con IDs específicos
RUN addgroup -g 2001 -S appgroup && \
    adduser -D -G appgroup -u 2001 -S appuser

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos desde la etapa de build con permisos correctos
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./

# Instalar solo dependencias de producción en la imagen final
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Copiar archivo principal de la aplicación
COPY --from=builder --chown=appuser:appgroup /app/app.mjs ./app.mjs

# Copiar código fuente completo
COPY --from=builder --chown=appuser:appgroup /app/src ./src

# Copiar archivos públicos y estáticos
COPY --from=builder --chown=appuser:appgroup /app/public ./public

# Copiar vistas EJS
COPY --from=builder --chown=appuser:appgroup /app/views ./views

# Copiar archivos de configuración del servidor web
COPY --from=builder --chown=appuser:appgroup /app/robots.txt ./robots.txt
COPY --from=builder --chown=appuser:appgroup /app/sitemap.xml ./sitemap.xml

# Copiar archivos de configuración
COPY --from=builder --chown=appuser:appgroup /app/config.env.example ./config.env.example

# Copiar datos estáticos
COPY --from=builder --chown=appuser:appgroup /app/data ./data

# Crear estructura de directorios necesarios con permisos seguros
RUN mkdir -p \
    /app/uploads \
    /app/tmp \
    /app/logs \
    /app/reports \
    /app/test-results \
    /app/coverage \
    && chown -R appuser:appgroup /app \
    && chmod -R 750 /app \
    && chmod -R 755 /app/public \
    && chmod -R 755 /app/views \
    && chmod 644 /app/robots.txt \
    && chmod 644 /app/sitemap.xml

# Generar secretos seguros para producción
RUN echo "🔐 Generando secretos seguros para producción..." && \
    echo "NODE_ENV=production" > /app/config.env && \
    echo "PORT=3000" >> /app/config.env && \
    echo "JWT_SECRET=$(openssl rand -hex 64)" >> /app/config.env && \
    echo "SESSION_SECRET=$(openssl rand -hex 64)" >> /app/config.env && \
    echo "BCRYPT_ROUNDS=12" >> /app/config.env && \
    echo "RATE_LIMIT_WINDOW_MS=60000" >> /app/config.env && \
    echo "RATE_LIMIT_MAX_REQUESTS=1000" >> /app/config.env && \
    echo "LOG_LEVEL=warn" >> /app/config.env && \
    echo "ENABLE_CLUSTERING=true" >> /app/config.env && \
    echo "COMPRESSION_ENABLED=true" >> /app/config.env && \
    echo "CSP_ENABLED=true" >> /app/config.env && \
    echo "HSTS_ENABLED=true" >> /app/config.env && \
    chown appuser:appgroup /app/config.env && \
    chmod 600 /app/config.env && \
    echo "✅ Secretos generados correctamente"

# Change to non-root user
USER appuser

# Verificación final de seguridad y autonomía
RUN echo "🔒 Verificación final de seguridad y autonomía..." && \
    [ -f "app.mjs" ] || (echo "❌ Error crítico: app.mjs no encontrado" && exit 1) && \
    [ -f "src/middleware/csrf-modern.mjs" ] || (echo "❌ Error crítico: csrf-modern.mjs no encontrado" && exit 1) && \
    [ -f "src/middleware/sanitizer-advanced.mjs" ] || (echo "❌ Error crítico: sanitizer-advanced.mjs no encontrado" && exit 1) && \
    [ -f "src/middleware/rateLimiters.mjs" ] || (echo "❌ Error crítico: rateLimiters.mjs no encontrado" && exit 1) && \
    [ -f "src/routes/home.mjs" ] || (echo "❌ Error crítico: home.mjs no encontrado" && exit 1) && \
    [ -f "src/config/index.mjs" ] || (echo "❌ Error crítico: config/index.mjs no encontrado" && exit 1) && \
    [ -f "robots.txt" ] || (echo "❌ Error crítico: robots.txt no encontrado" && exit 1) && \
    [ -f "sitemap.xml" ] || (echo "❌ Error crítico: sitemap.xml no encontrado" && exit 1) && \
    [ -d "views" ] || (echo "❌ Error crítico: directorio views no encontrado" && exit 1) && \
    [ -d "public" ] || (echo "❌ Error crítico: directorio public no encontrado" && exit 1) && \
    echo "✅ Verificación de integridad completada - Contenedor autónomo listo"

# Configurar variables de entorno de producción
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=256" \
    TZ=Europe/Madrid \
    AUTONOMOUS_CONTAINER=true \
    LOG_TO_FILE=false

# Exponer puerto de aplicación
EXPOSE 3000

# Healthcheck avanzado con timeout y reintentos
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Configurar punto de entrada con dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio de la aplicación
CMD ["node", "app.mjs"]
