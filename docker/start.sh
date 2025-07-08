#!/bin/sh

# ===================================================================
# 🚀 SCRIPT DE INICIO PARA CONTENEDOR DOCKER
# ===================================================================

set -e

echo "🚀 Iniciando aplicación..."

# Verificar si MongoDB está disponible
check_mongodb() {
    echo "🔍 Verificando conexión a MongoDB..."

    # Intentar conectar a MongoDB
    if timeout 10 sh -c "until nc -z mongodb 27017; do echo '⏳ Esperando MongoDB...'; sleep 1; done"; then
        echo "✅ MongoDB disponible"
        return 0
    else
        echo "⚠️ MongoDB no disponible, usando configuración sin base de datos"
        return 1
    fi
}

# Configurar variables de entorno según disponibilidad de MongoDB
setup_environment() {
    if check_mongodb; then
        echo "📝 Configurando para uso con MongoDB..."
        sed -i 's/^DB_URI=.*/DB_URI=mongodb:\/\/mongodb:27017\/estructura_base/' /app/config.env
        sed -i 's/^ENABLE_SESSIONS=.*/ENABLE_SESSIONS=true/' /app/config.env
        # Ya está en production, no toques NODE_ENV, COOKIE_SECURE ni CORS_ORIGIN
    else
        echo "📝 Configurando para uso sin MongoDB..."
        # Cambia a development y pon valores válidos para development
        sed -i 's/^NODE_ENV=.*/NODE_ENV=development/' /app/config.env
        sed -i 's/^COOKIE_SECURE=.*/COOKIE_SECURE=false/' /app/config.env
        sed -i 's/^CORS_ORIGIN=.*/CORS_ORIGIN=*/' /app/config.env
        sed -i 's/^ENABLE_SESSIONS=.*/ENABLE_SESSIONS=false/' /app/config.env
        sed -i 's/^DB_URI=.*/DB_URI=/' /app/config.env
        echo "✅ Configuración lista para funcionar sin base de datos"
    fi
}

# Función principal
main() {
    echo "🔧 Configurando entorno..."
    setup_environment

    echo "🎯 Iniciando aplicación Node.js..."
    set -a
    . /app/config.env
    set +a
    exec dumb-init -- node app.mjs
}

# Ejecutar función principal
main "$@"
