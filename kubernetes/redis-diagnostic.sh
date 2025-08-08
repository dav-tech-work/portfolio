#!/bin/bash

# ===================================================================
# 🔍 SCRIPT DE DIAGNÓSTICO REDIS - KUBERNETES
# ===================================================================
# Script para diagnosticar problemas de conectividad con Redis
# Última actualización: 2025-01-27
# ===================================================================

set -e

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
# 🔍 DIAGNÓSTICO COMPLETO
# ===================================================================

log "Iniciando diagnóstico completo de Redis..."

echo ""
echo "==================================================================="
echo "🔍 DIAGNÓSTICO REDIS - KUBERNETES"
echo "==================================================================="
echo ""

# 1. Verificar estado de los pods
log "1. Verificando estado de los pods..."
echo "----------------------------------------"
kubectl get pods -l app=portfolio-redis -o wide
kubectl get pods -l app=porfolio -o wide
echo ""

# 2. Verificar servicios
log "2. Verificando servicios..."
echo "----------------------------------------"
kubectl get services -l app=portfolio-redis
kubectl get services -l app=porfolio
echo ""

# 3. Verificar endpoints
log "3. Verificando endpoints..."
echo "----------------------------------------"
kubectl get endpoints -l app=portfolio-redis
kubectl get endpoints -l app=porfolio
echo ""

# 4. Verificar logs de Redis
log "4. Verificando logs de Redis..."
echo "----------------------------------------"
REDIS_POD=$(kubectl get pods -l app=portfolio-redis -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "N/A")
if [ "$REDIS_POD" != "N/A" ]; then
    kubectl logs $REDIS_POD --tail=20
else
    error "No se encontró pod de Redis"
fi
echo ""

# 5. Verificar logs de la aplicación
log "5. Verificando logs de la aplicación..."
echo "----------------------------------------"
APP_POD=$(kubectl get pods -l app=porfolio -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "N/A")
if [ "$APP_POD" != "N/A" ]; then
    kubectl logs $APP_POD --tail=20 | grep -i redis
else
    error "No se encontró pod de la aplicación"
fi
echo ""

# 6. Verificar conectividad desde la aplicación hacia Redis
log "6. Verificando conectividad aplicación -> Redis..."
echo "----------------------------------------"
if [ "$APP_POD" != "N/A" ]; then
    if kubectl exec $APP_POD -- nc -zv portfolio-redis-service 6379 2>/dev/null; then
        success "Conectividad hacia Redis verificada"
    else
        error "No se puede conectar a Redis desde la aplicación"
    fi
else
    warning "No se puede verificar conectividad - pod de aplicación no disponible"
fi
echo ""

# 7. Verificar que Redis responda
log "7. Verificando respuesta de Redis..."
echo "----------------------------------------"
if [ "$REDIS_POD" != "N/A" ]; then
    if kubectl exec $REDIS_POD -- redis-cli ping 2>/dev/null | grep -q "PONG"; then
        success "Redis responde correctamente"
    else
        error "Redis no responde correctamente"
    fi
else
    warning "No se puede verificar respuesta de Redis - pod no disponible"
fi
echo ""

# 8. Verificar configuración de Redis
log "8. Verificando configuración de Redis..."
echo "----------------------------------------"
if [ "$REDIS_POD" != "N/A" ]; then
    kubectl exec $REDIS_POD -- redis-cli config get bind 2>/dev/null || warning "No se puede obtener configuración de Redis"
    kubectl exec $REDIS_POD -- redis-cli config get port 2>/dev/null || warning "No se puede obtener configuración de Redis"
else
    warning "No se puede verificar configuración - pod no disponible"
fi
echo ""

# 9. Verificar variables de entorno de la aplicación
log "9. Verificando variables de entorno de Redis en la aplicación..."
echo "----------------------------------------"
if [ "$APP_POD" != "N/A" ]; then
    kubectl exec $APP_POD -- env | grep REDIS
else
    warning "No se puede verificar variables de entorno - pod no disponible"
fi
echo ""

# 10. Verificar NetworkPolicies
log "10. Verificando NetworkPolicies..."
echo "----------------------------------------"
kubectl get networkpolicies -l app=portfolio-redis 2>/dev/null || warning "No se encontraron NetworkPolicies"
echo ""

# 11. Verificar conectividad DNS
log "11. Verificando resolución DNS..."
echo "----------------------------------------"
if [ "$APP_POD" != "N/A" ]; then
    if kubectl exec $APP_POD -- nslookup portfolio-redis-service 2>/dev/null; then
        success "Resolución DNS funcionando"
    else
        error "Problema con resolución DNS"
    fi
else
    warning "No se puede verificar DNS - pod no disponible"
fi
echo ""

# 12. Verificar puertos abiertos en Redis
log "12. Verificando puertos abiertos en Redis..."
echo "----------------------------------------"
if [ "$REDIS_POD" != "N/A" ]; then
    kubectl exec $REDIS_POD -- netstat -tlnp 2>/dev/null | grep 6379 || warning "Puerto 6379 no encontrado en netstat"
else
    warning "No se puede verificar puertos - pod no disponible"
fi
echo ""

# ===================================================================
# 📊 RESUMEN DEL DIAGNÓSTICO
# ===================================================================

echo ""
echo "==================================================================="
echo "📊 RESUMEN DEL DIAGNÓSTICO"
echo "==================================================================="
echo ""

# Contar errores y advertencias
ERRORS=0
WARNINGS=0

# Verificar cada componente
if ! kubectl get pods -l app=portfolio-redis --no-headers 2>/dev/null | grep -q Running; then
    ((ERRORS++))
    error "Pod de Redis no está ejecutándose"
fi

if ! kubectl get pods -l app=porfolio --no-headers 2>/dev/null | grep -q Running; then
    ((ERRORS++))
    error "Pod de la aplicación no está ejecutándose"
fi

if ! kubectl get service portfolio-redis-service 2>/dev/null >/dev/null; then
    ((ERRORS++))
    error "Servicio de Redis no existe"
fi

if [ "$REDIS_POD" != "N/A" ] && ! kubectl exec $REDIS_POD -- redis-cli ping 2>/dev/null | grep -q "PONG"; then
    ((ERRORS++))
    error "Redis no responde correctamente"
fi

if [ "$APP_POD" != "N/A" ] && ! kubectl exec $APP_POD -- nc -zv portfolio-redis-service 6379 2>/dev/null; then
    ((ERRORS++))
    error "No hay conectividad entre aplicación y Redis"
fi

echo ""
echo "==================================================================="
if [ $ERRORS -eq 0 ]; then
    success "DIAGNÓSTICO COMPLETADO - SIN ERRORES CRÍTICOS"
    echo "✅ Redis está funcionando correctamente"
    echo "✅ La aplicación puede conectarse a Redis"
else
    error "DIAGNÓSTICO COMPLETADO - SE ENCONTRARON $ERRORS ERRORES"
    echo ""
    echo "🔧 POSIBLES SOLUCIONES:"
    echo "   1. Reiniciar el pod de Redis: kubectl delete pod $REDIS_POD"
    echo "   2. Verificar configuración de Redis: kubectl describe pod $REDIS_POD"
    echo "   3. Verificar logs detallados: kubectl logs $REDIS_POD -f"
    echo "   4. Verificar NetworkPolicies: kubectl get networkpolicies"
    echo "   5. Reaplicar configuración: kubectl apply -f kubernetes/redis.yaml"
fi
echo "==================================================================="

# ===================================================================
# 🔧 COMANDOS DE SOLUCIÓN
# ===================================================================

echo ""
echo "🔧 COMANDOS DE SOLUCIÓN RÁPIDA:"
echo "----------------------------------------"
echo "• Reiniciar Redis: kubectl rollout restart deployment/portfolio-redis"
echo "• Reiniciar aplicación: kubectl rollout restart deployment/porfolio"
echo "• Ver logs en tiempo real: kubectl logs -f deployment/portfolio-redis"
echo "• Conectar a Redis CLI: kubectl exec -it $REDIS_POD -- redis-cli"
echo "• Verificar conectividad: kubectl exec $APP_POD -- nc -zv portfolio-redis-service 6379"
echo "• Verificar DNS: kubectl exec $APP_POD -- nslookup portfolio-redis-service"
echo ""

exit $ERRORS
