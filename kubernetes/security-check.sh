#!/bin/bash

# 🔒 SCRIPT DE VERIFICACIÓN DE SEGURIDAD - PORTFOLIO WEB
# =====================================================
# Verificación completa del estado de seguridad del despliegue
# Autor: Daniel Arribas Velázquez
# Fecha: 2025-01-28
# =====================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
NAMESPACE="default"
APP_NAME="porfolio"

echo -e "${BLUE}🔒 VERIFICACIÓN DE SEGURIDAD DEL PORTFOLIO${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# Función para verificar pods privilegiados
check_privileged_pods() {
    echo -e "${YELLOW}🔍 Verificando pods privilegiados...${NC}"

    PRIVILEGED_PODS=$(kubectl get pods -n $NAMESPACE -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].securityContext.privileged}{"\n"}{end}' | grep -v "false\|<none>")

    if [ -z "$PRIVILEGED_PODS" ]; then
        echo -e "${GREEN}✅ No se encontraron pods privilegiados${NC}"
    else
        echo -e "${RED}❌ Se encontraron pods privilegiados:${NC}"
        echo "$PRIVILEGED_PODS"
    fi
}

# Función para verificar contenedores que se ejecutan como root
check_root_containers() {
    echo -e "${YELLOW}🔍 Verificando contenedores que se ejecutan como root...${NC}"

    ROOT_CONTAINERS=$(kubectl get pods -n $NAMESPACE -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].securityContext.runAsUser}{"\n"}{end}' | grep -E "\t0$|^[^\t]*\t<none>")

    if [ -z "$ROOT_CONTAINERS" ]; then
        echo -e "${GREEN}✅ No se encontraron contenedores ejecutándose como root${NC}"
    else
        echo -e "${RED}❌ Se encontraron contenedores ejecutándose como root:${NC}"
        echo "$ROOT_CONTAINERS"
    fi
}

# Función para verificar escalación de privilegios
check_privilege_escalation() {
    echo -e "${YELLOW}🔍 Verificando escalación de privilegios...${NC}"

    ESCALATION_PODS=$(kubectl get pods -n $NAMESPACE -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].securityContext.allowPrivilegeEscalation}{"\n"}{end}' | grep -v "false\|<none>")

    if [ -z "$ESCALATION_PODS" ]; then
        echo -e "${GREEN}✅ No se encontró escalación de privilegios habilitada${NC}"
    else
        echo -e "${RED}❌ Se encontró escalación de privilegios habilitada:${NC}"
        echo "$ESCALATION_PODS"
    fi
}

# Función para verificar capacidades peligrosas
check_dangerous_capabilities() {
    echo -e "${YELLOW}🔍 Verificando capacidades peligrosas...${NC}"

    DANGEROUS_CAPS=$(kubectl get pods -n $NAMESPACE -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].securityContext.capabilities.add[*]}{"\n"}{end}' | grep -E "SYS_ADMIN|NET_ADMIN|SYS_MODULE|ALL")

    if [ -z "$DANGEROUS_CAPS" ]; then
        echo -e "${GREEN}✅ No se encontraron capacidades peligrosas${NC}"
    else
        echo -e "${RED}❌ Se encontraron capacidades peligrosas:${NC}"
        echo "$DANGEROUS_CAPS"
    fi
}

# Función para verificar mounts de host
check_host_mounts() {
    echo -e "${YELLOW}🔍 Verificando mounts de host...${NC}"

    HOST_MOUNTS=$(kubectl get pods -n $NAMESPACE -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.volumes[*].hostPath.path}{"\n"}{end}' | grep -v "<none>")

    if [ -z "$HOST_MOUNTS" ]; then
        echo -e "${GREEN}✅ No se encontraron mounts de host${NC}"
    else
        echo -e "${RED}❌ Se encontraron mounts de host:${NC}"
        echo "$HOST_MOUNTS"
    fi
}

# Función para verificar network policies
check_network_policies() {
    echo -e "${YELLOW}🔍 Verificando políticas de red...${NC}"

    NETWORK_POLICIES=$(kubectl get networkpolicies -n $NAMESPACE --no-headers | wc -l)

    if [ "$NETWORK_POLICIES" -gt 0 ]; then
        echo -e "${GREEN}✅ Se encontraron $NETWORK_POLICIES políticas de red${NC}"
        kubectl get networkpolicies -n $NAMESPACE
    else
        echo -e "${YELLOW}⚠️ No se encontraron políticas de red${NC}"
    fi
}

# Función para verificar secretos
check_secrets() {
    echo -e "${YELLOW}🔍 Verificando secretos...${NC}"

    SECRETS=$(kubectl get secrets -n $NAMESPACE --no-headers | wc -l)

    if [ "$SECRETS" -gt 0 ]; then
        echo -e "${GREEN}✅ Se encontraron $SECRETS secretos${NC}"
        kubectl get secrets -n $NAMESPACE
    else
        echo -e "${YELLOW}⚠️ No se encontraron secretos${NC}"
    fi
}

# Función para verificar RBAC
check_rbac() {
    echo -e "${YELLOW}🔍 Verificando configuración RBAC...${NC}"

    ROLES=$(kubectl get roles -n $NAMESPACE --no-headers | wc -l)
    ROLEBINDINGS=$(kubectl get rolebindings -n $NAMESPACE --no-headers | wc -l)

    echo -e "${GREEN}✅ Se encontraron $ROLES roles y $ROLEBINDINGS role bindings${NC}"

    if [ "$ROLES" -gt 0 ]; then
        echo -e "${BLUE}📋 Roles en el namespace:${NC}"
        kubectl get roles -n $NAMESPACE
    fi
}

# Función para verificar resource quotas
check_resource_quotas() {
    echo -e "${YELLOW}🔍 Verificando cuotas de recursos...${NC}"

    QUOTAS=$(kubectl get resourcequotas -n $NAMESPACE --no-headers | wc -l)

    if [ "$QUOTAS" -gt 0 ]; then
        echo -e "${GREEN}✅ Se encontraron $QUOTAS cuotas de recursos${NC}"
        kubectl get resourcequotas -n $NAMESPACE
    else
        echo -e "${YELLOW}⚠️ No se encontraron cuotas de recursos${NC}"
    fi
}

# Función para verificar health checks
check_health_checks() {
    echo -e "${YELLOW}🔍 Verificando health checks...${NC}"

    PODS_WITH_PROBES=$(kubectl get pods -n $NAMESPACE -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].livenessProbe}{"\t"}{.spec.containers[*].readinessProbe}{"\n"}{end}' | grep -v "<none>")

    if [ ! -z "$PODS_WITH_PROBES" ]; then
        echo -e "${GREEN}✅ Los pods tienen health checks configurados${NC}"
    else
        echo -e "${YELLOW}⚠️ Algunos pods no tienen health checks configurados${NC}"
    fi
}

# Función para verificar TLS/HTTPS
check_tls() {
    echo -e "${YELLOW}🔍 Verificando configuración TLS...${NC}"

    TLS_SECRETS=$(kubectl get secrets -n $NAMESPACE -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.type}{"\n"}{end}' | grep "kubernetes.io/tls")

    if [ ! -z "$TLS_SECRETS" ]; then
        echo -e "${GREEN}✅ Se encontraron secretos TLS${NC}"
        echo "$TLS_SECRETS"
    else
        echo -e "${YELLOW}⚠️ No se encontraron secretos TLS${NC}"
    fi
}

# Función para generar reporte de seguridad
generate_security_report() {
    echo ""
    echo -e "${BLUE}📊 REPORTE DE SEGURIDAD${NC}"
    echo -e "${BLUE}=====================${NC}"

    # Contar problemas encontrados
    PROBLEMS=0

    # Verificar cada aspecto
    check_privileged_pods
    if [ ! -z "$PRIVILEGED_PODS" ]; then
        ((PROBLEMS++))
    fi

    check_root_containers
    if [ ! -z "$ROOT_CONTAINERS" ]; then
        ((PROBLEMS++))
    fi

    check_privilege_escalation
    if [ ! -z "$ESCALATION_PODS" ]; then
        ((PROBLEMS++))
    fi

    check_dangerous_capabilities
    if [ ! -z "$DANGEROUS_CAPS" ]; then
        ((PROBLEMS++))
    fi

    check_host_mounts
    if [ ! -z "$HOST_MOUNTS" ]; then
        ((PROBLEMS++))
    fi

    check_network_policies
    check_secrets
    check_rbac
    check_resource_quotas
    check_health_checks
    check_tls

    echo ""
    echo -e "${BLUE}🎯 RESUMEN DE SEGURIDAD${NC}"
    echo -e "${BLUE}=====================${NC}"

    if [ $PROBLEMS -eq 0 ]; then
        echo -e "${GREEN}✅ Estado de seguridad: EXCELENTE${NC}"
        echo -e "${GREEN}✅ No se encontraron problemas críticos de seguridad${NC}"
    elif [ $PROBLEMS -le 2 ]; then
        echo -e "${YELLOW}⚠️ Estado de seguridad: BUENO${NC}"
        echo -e "${YELLOW}⚠️ Se encontraron $PROBLEMS problemas menores${NC}"
    else
        echo -e "${RED}❌ Estado de seguridad: REQUIERE ATENCIÓN${NC}"
        echo -e "${RED}❌ Se encontraron $PROBLEMS problemas de seguridad${NC}"
    fi
}

# Función principal
main() {
    echo -e "${YELLOW}🔍 Iniciando verificación de seguridad...${NC}"

    # Verificar que kubectl esté disponible
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}❌ kubectl no está instalado${NC}"
        exit 1
    fi

    # Verificar conexión al cluster
    if ! kubectl cluster-info &> /dev/null; then
        echo -e "${RED}❌ No se puede conectar al cluster${NC}"
        exit 1
    fi

    # Ejecutar verificaciones
    generate_security_report

    echo ""
    echo -e "${BLUE}💡 Recomendaciones:${NC}"
    echo -e "${BLUE}  - Revisar regularmente los logs de auditoría${NC}"
    echo -e "${BLUE}  - Mantener actualizadas las imágenes de contenedores${NC}"
    echo -e "${BLUE}  - Monitorear alertas de seguridad${NC}"
    echo -e "${BLUE}  - Ejecutar escaneos de vulnerabilidades periódicamente${NC}"
}

# Ejecutar función principal
main "$@"
