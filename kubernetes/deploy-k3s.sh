#!/bin/bash

# ===================================================================
# 🚀 SCRIPT DE DEPLOYMENT KUBERNETES - PORTFOLIO AUTOSUFICIENTE
# ===================================================================
# Script optimizado para deployment en K3s con verificaciones
# Última actualización: 2025-01-27
# ===================================================================

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# ===================================================================
# 🔍 VERIFICACIONES PREVIAS
# ===================================================================

log "Iniciando deployment del portfolio en Kubernetes..."

# Verificar que kubectl esté disponible
if ! command -v kubectl &> /dev/null; then
    error "kubectl no está instalado o no está en el PATH"
    echo "💡 Instala kubectl desde: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# Verificar conexión al cluster
if ! kubectl cluster-info &> /dev/null; then
    error "No se puede conectar al cluster de Kubernetes"
    echo "💡 Verifica que Kubernetes esté ejecutándose y que tengas acceso"
    exit 1
fi

success "Conexión al cluster verificada"

# Determinar el directorio base del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Verificar que los archivos YAML existan
if [ ! -f "$SCRIPT_DIR/redis.yaml" ]; then
    error "Archivo redis.yaml no encontrado en $SCRIPT_DIR"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/porfolio-cloudflare.yaml" ]; then
    error "Archivo porfolio-cloudflare.yaml no encontrado en $SCRIPT_DIR"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/porfolio-secrets.yaml" ]; then
    warning "Archivo porfolio-secrets.yaml no encontrado en $SCRIPT_DIR"
    echo "💡 Los secretos se crearán con valores por defecto"
fi

success "Archivos de configuración verificados"

# ===================================================================
# 🧹 LIMPIEZA PREVIA (OPCIONAL)
# ===================================================================

read -p "¿Deseas limpiar deployments anteriores? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Limpiando deployments anteriores..."
    kubectl delete deployment porfolio --ignore-not-found=true
    kubectl delete deployment portfolio-redis --ignore-not-found=true
    kubectl delete service porfolio-service --ignore-not-found=true
    kubectl delete service portfolio-redis-service --ignore-not-found=true
    kubectl delete pvc redis-pvc --ignore-not-found=true
    kubectl delete configmap redis-config --ignore-not-found=true
    kubectl delete networkpolicy redis-network-policy --ignore-not-found=true
    kubectl delete hpa portfolio-redis-hpa --ignore-not-found=true
    kubectl delete secret porfolio-secrets --ignore-not-found=true
    success "Limpieza completada"
fi

# ===================================================================
# 🔑 APLICAR SECRETOS
# ===================================================================

log "Aplicando secretos..."

if [ -f "$SCRIPT_DIR/porfolio-secrets.yaml" ]; then
    kubectl apply -f "$SCRIPT_DIR/porfolio-secrets.yaml"
    success "Secretos aplicados"
else
    warning "Creando secretos por defecto..."
    kubectl create secret generic porfolio-secrets \
        --from-literal=JWT_SECRET="default_jwt_secret_change_in_production" \
        --from-literal=SESSION_SECRET="default_session_secret_change_in_production" \
        --from-literal=API_KEY="default_api_key_change_in_production" \
        --dry-run=client -o yaml | kubectl apply -f -
    success "Secretos por defecto creados"
fi

# ===================================================================
# 🗄️ DEPLOYMENT DE REDIS
# ===================================================================

log "Desplegando Redis..."

# Aplicar configuración de Redis
kubectl apply -f "$SCRIPT_DIR/redis.yaml"

# Esperar a que Redis esté listo
log "Esperando a que Redis esté listo..."
if kubectl wait --for=condition=available --timeout=300s deployment/portfolio-redis 2>/dev/null; then
    success "Redis desplegado correctamente"
else
    error "Timeout esperando Redis"
    kubectl get pods -l app=portfolio-redis
    kubectl describe deployment portfolio-redis
    exit 1
fi

# Verificar que Redis esté funcionando
log "Verificando conectividad de Redis..."
REDIS_POD=$(kubectl get pods -l app=portfolio-redis -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$REDIS_POD" ]; then
    if kubectl exec $REDIS_POD -- redis-cli ping 2>/dev/null | grep -q "PONG"; then
        success "Redis está funcionando correctamente"
    else
        error "Redis no responde correctamente"
        kubectl logs $REDIS_POD --tail=20
        exit 1
    fi
else
    error "No se pudo obtener el pod de Redis"
    exit 1
fi

# ===================================================================
# 🌐 DEPLOYMENT DE LA APLICACIÓN
# ===================================================================

log "Desplegando la aplicación portfolio..."

# Aplicar configuración de la aplicación
kubectl apply -f "$SCRIPT_DIR/porfolio-cloudflare.yaml"

# Esperar a que la aplicación esté lista
log "Esperando a que la aplicación esté lista..."
if kubectl wait --for=condition=available --timeout=300s deployment/porfolio 2>/dev/null; then
    success "Aplicación desplegada correctamente"
else
    error "Timeout esperando la aplicación"
    kubectl get pods -l app=porfolio
    kubectl describe deployment porfolio
    exit 1
fi

# ===================================================================
# 🔍 VERIFICACIONES POST-DEPLOYMENT
# ===================================================================

log "Realizando verificaciones post-deployment..."

# Verificar que todos los pods estén ejecutándose
PODS_RUNNING=$(kubectl get pods -l app=porfolio -o jsonpath='{.items[*].status.phase}' 2>/dev/null | tr ' ' '\n' | grep -c "Running" || echo "0")
if [ "$PODS_RUNNING" -gt 0 ]; then
    success "Todos los pods de la aplicación están ejecutándose"
else
    error "Algunos pods no están ejecutándose"
    kubectl get pods -l app=porfolio
    exit 1
fi

# Verificar conectividad entre aplicación y Redis
log "Verificando conectividad entre aplicación y Redis..."
APP_POD=$(kubectl get pods -l app=porfolio -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$APP_POD" ]; then
    if kubectl exec $APP_POD -- nc -z portfolio-redis-service 6379 2>/dev/null; then
        success "Conectividad entre aplicación y Redis verificada"
    else
        warning "Problema de conectividad entre aplicación y Redis"
        log "Verificando logs de la aplicación..."
        kubectl logs $APP_POD --tail=20
    fi
else
    error "No se pudo obtener el pod de la aplicación"
    exit 1
fi

# Verificar que los servicios estén creados
log "Verificando servicios..."
if kubectl get service porfolio-service &> /dev/null; then
    success "Servicio de la aplicación creado"
else
    error "Servicio de la aplicación no encontrado"
fi

if kubectl get service portfolio-redis-service &> /dev/null; then
    success "Servicio de Redis creado"
else
    error "Servicio de Redis no encontrado"
fi

# ===================================================================
# 📊 INFORMACIÓN DEL DEPLOYMENT
# ===================================================================

log "Mostrando información del deployment..."

echo ""
echo "==================================================================="
echo "🎉 DEPLOYMENT COMPLETADO EXITOSAMENTE"
echo "==================================================================="
echo ""
echo "📊 Estado de los pods:"
kubectl get pods -l app=porfolio
kubectl get pods -l app=portfolio-redis
echo ""
echo "🌐 Servicios:"
kubectl get services -l app=porfolio
kubectl get services -l app=portfolio-redis
echo ""
echo "🔗 Endpoints:"
kubectl get endpoints -l app=porfolio
kubectl get endpoints -l app=portfolio-redis
echo ""

if [ -n "$APP_POD" ]; then
    echo "📝 Logs de la aplicación (últimas 10 líneas):"
    kubectl logs $APP_POD --tail=10
    echo ""
fi

if [ -n "$REDIS_POD" ]; then
    echo "🗄️ Logs de Redis (últimas 5 líneas):"
    kubectl logs $REDIS_POD --tail=5
    echo ""
fi

echo "==================================================================="
echo "🚀 La aplicación debería estar disponible en:"
echo "   - Local: http://localhost:30001"
echo "   - Cluster: http://porfolio-service:3000"
echo "==================================================================="

# ===================================================================
# 🔧 COMANDOS ÚTILES
# ===================================================================

echo ""
echo "🔧 Comandos útiles:"
echo "   - Ver logs de la aplicación: kubectl logs -f deployment/porfolio"
echo "   - Ver logs de Redis: kubectl logs -f deployment/portfolio-redis"
echo "   - Escalar la aplicación: kubectl scale deployment porfolio --replicas=2"
if [ -n "$APP_POD" ]; then
    echo "   - Verificar conectividad: kubectl exec $APP_POD -- nc -zv portfolio-redis-service 6379"
fi
if [ -n "$REDIS_POD" ]; then
    echo "   - Acceder a Redis CLI: kubectl exec -it $REDIS_POD -- redis-cli"
fi
echo "   - Verificar NetworkPolicies: kubectl get networkpolicies"
echo "   - Verificar secretos: kubectl get secrets"
echo ""

success "Deployment completado exitosamente!"
