#!/bin/bash

# 🚀 SCRIPT DE DESPLIEGUE PARA K3S - PORTFOLIO WEB SEGURO
# =====================================================
# Despliegue optimizado para k3s con descarga desde Docker Hub
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
IMAGE_VERSION="v19"
IMAGE_NAME="davtechw/porfolio:${IMAGE_VERSION}"
DOCKER_HUB_REGISTRY="docker.io"

echo -e "${BLUE}🚀 INICIANDO DESPLIEGUE DE PORTFOLIO EN K3S${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Función para verificar si kubectl está disponible
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}❌ kubectl no está instalado o no está en el PATH${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ kubectl disponible${NC}"
}

# Función para verificar conexión al cluster k3s
check_k3s_cluster() {
    if ! kubectl cluster-info &> /dev/null; then
        echo -e "${RED}❌ No se puede conectar al cluster k3s${NC}"
        echo -e "${YELLOW}💡 Asegúrate de que k3s esté ejecutándose y que tengas acceso al kubeconfig${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Conexión al cluster k3s establecida${NC}"
}

# Función para verificar conectividad a Docker Hub
check_docker_hub_connectivity() {
    echo -e "${YELLOW}🌐 Verificando conectividad a Docker Hub...${NC}"
    if ! curl -s --connect-timeout 10 https://hub.docker.com > /dev/null; then
        echo -e "${RED}❌ No se puede conectar a Docker Hub${NC}"
        echo -e "${YELLOW}💡 Verifica tu conexión a internet${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Conectividad a Docker Hub establecida${NC}"
}

# Función para descargar imagen desde Docker Hub
download_image_from_docker_hub() {
    echo -e "${YELLOW}📥 Descargando imagen desde Docker Hub...${NC}"
    echo -e "${BLUE}🔍 Imagen: ${DOCKER_HUB_REGISTRY}/${IMAGE_NAME}${NC}"

    # Verificar si Docker está disponible
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker no está instalado o no está en el PATH${NC}"
        exit 1
    fi

    # Descargar la imagen desde Docker Hub
    if docker pull ${DOCKER_HUB_REGISTRY}/${IMAGE_NAME}; then
        echo -e "${GREEN}✅ Imagen descargada exitosamente desde Docker Hub${NC}"
    else
        echo -e "${RED}❌ Error al descargar la imagen desde Docker Hub${NC}"
        echo -e "${YELLOW}💡 Verifica que la imagen ${IMAGE_NAME} existe en Docker Hub${NC}"
        exit 1
    fi
}

# Función para importar imagen a k3s desde Docker Hub
import_image_to_k3s() {
    echo -e "${YELLOW}📦 Preparando imagen para k3s...${NC}"

    # Crear archivo tar temporal de la imagen descargada
    TAR_FILE="porfolio-${IMAGE_VERSION}-dockerhub.tar"
    echo -e "${YELLOW}🔧 Creando archivo tar de la imagen descargada...${NC}"
    docker save ${DOCKER_HUB_REGISTRY}/${IMAGE_NAME} -o ${TAR_FILE}

    # Importar imagen a k3s
    echo -e "${YELLOW}📥 Importando imagen a k3s...${NC}"

    # Para k3s, podemos usar ctr (containerd) o k3s ctr
    if command -v k3s &> /dev/null; then
        sudo k3s ctr images import ${TAR_FILE}
        echo -e "${GREEN}✅ Imagen importada a k3s usando k3s ctr${NC}"
    elif command -v ctr &> /dev/null; then
        sudo ctr -n k8s.io images import ${TAR_FILE}
        echo -e "${GREEN}✅ Imagen importada a k3s usando ctr${NC}"
    else
        echo -e "${YELLOW}⚠️ No se encontró k3s ctr ni ctr, intentando con docker load en el nodo...${NC}"
        # Como alternativa, podemos copiar la imagen al nodo k3s
        echo -e "${YELLOW}💡 Asegúrate de que la imagen esté disponible en el nodo k3s${NC}"
    fi

    # Limpiar archivo tar temporal
    if [ -f "${TAR_FILE}" ]; then
        rm ${TAR_FILE}
        echo -e "${GREEN}✅ Archivo tar temporal eliminado${NC}"
    fi
}

# Función para crear namespace si no existe
create_namespace() {
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        echo -e "${YELLOW}📁 Creando namespace: $NAMESPACE${NC}"
        kubectl create namespace $NAMESPACE
    else
        echo -e "${GREEN}✅ Namespace $NAMESPACE ya existe${NC}"
    fi
}

# Función para actualizar la política de pull de imagen
update_image_pull_policy() {
    echo -e "${YELLOW}🔧 Configurando política de imagen para k3s...${NC}"

    # Crear una copia temporal del manifiesto con imagePullPolicy: Never
    # y actualizar la imagen para usar la referencia completa de Docker Hub
    sed -e 's/imagePullPolicy: IfNotPresent/imagePullPolicy: Never/g' \
        -e "s|image: ${IMAGE_NAME}|image: ${DOCKER_HUB_REGISTRY}/${IMAGE_NAME}|g" \
        porfolio.yaml > porfolio-k3s.yaml

    echo -e "${GREEN}✅ Política de imagen configurada para usar imagen local importada desde Docker Hub${NC}"
}

# Función para aplicar manifiestos
apply_manifests() {
    echo -e "${YELLOW}📋 Aplicando configuraciones básicas...${NC}"
    kubectl apply -f porfolio-k3s.yaml

    echo -e "${YELLOW}🔒 Aplicando configuraciones de seguridad...${NC}"
    kubectl apply -f porfolio-security.yaml

    echo -e "${GREEN}✅ Manifiestos aplicados correctamente${NC}"
}

# Función para verificar el despliegue
verify_deployment() {
    echo -e "${YELLOW}🔍 Verificando despliegue...${NC}"

    # Esperar a que el deployment esté listo
    kubectl rollout status deployment/$APP_NAME -n $NAMESPACE --timeout=300s

    # Verificar pods
    echo -e "${YELLOW}📊 Estado de los pods:${NC}"
    kubectl get pods -l app=$APP_NAME -n $NAMESPACE

    # Verificar servicios
    echo -e "${YELLOW}🌐 Estado de los servicios:${NC}"
    kubectl get services -l app=$APP_NAME -n $NAMESPACE

    # Verificar HPA si existe
    if kubectl get hpa -l app=$APP_NAME -n $NAMESPACE &> /dev/null; then
        echo -e "${YELLOW}📈 Estado del HPA:${NC}"
        kubectl get hpa -l app=$APP_NAME -n $NAMESPACE
    fi
}

# Función para mostrar información de acceso específica de k3s
show_k3s_access_info() {
    echo ""
    echo -e "${BLUE}🎯 INFORMACIÓN DE ACCESO K3S${NC}"
    echo -e "${BLUE}=============================${NC}"

    # Obtener NodePort
    NODE_PORT=$(kubectl get service porfolio-service -n $NAMESPACE -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "N/A")

    # Obtener IP del nodo k3s
    NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')

    # Para k3s, también intentar obtener la IP externa si está disponible
    EXTERNAL_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}' 2>/dev/null || echo "")

    echo -e "${GREEN}🌐 Acceso NodePort: http://$NODE_IP:$NODE_PORT${NC}"
    if [ ! -z "$EXTERNAL_IP" ]; then
        echo -e "${GREEN}🌍 Acceso Externo: http://$EXTERNAL_IP:$NODE_PORT${NC}"
    fi
    echo -e "${GREEN}🔒 Imagen: ${DOCKER_HUB_REGISTRY}/${IMAGE_NAME}${NC}"
    echo -e "${GREEN}📊 Namespace: $NAMESPACE${NC}"
    echo -e "${GREEN}🎯 Cluster: k3s${NC}"
    echo -e "${GREEN}📦 Fuente: Docker Hub${NC}"
}

# Función para mostrar logs
show_logs() {
    echo ""
    echo -e "${YELLOW}📝 Últimos logs de la aplicación:${NC}"
    kubectl logs -l app=$APP_NAME -n $NAMESPACE --tail=10
}

# Función para limpiar archivos temporales
cleanup() {
    echo -e "${YELLOW}🧹 Limpiando archivos temporales...${NC}"
    if [ -f "porfolio-k3s.yaml" ]; then
        rm porfolio-k3s.yaml
        echo -e "${GREEN}✅ Archivo temporal eliminado${NC}"
    fi
    # Limpiar cualquier archivo tar temporal que pueda haber quedado
    if [ -f "porfolio-${IMAGE_VERSION}-dockerhub.tar" ]; then
        rm "porfolio-${IMAGE_VERSION}-dockerhub.tar"
        echo -e "${GREEN}✅ Archivo tar temporal eliminado${NC}"
    fi
}

# Función principal
main() {
    echo -e "${YELLOW}1. Verificando prerrequisitos...${NC}"
    check_kubectl
    check_k3s_cluster
    check_docker_hub_connectivity

    echo -e "${YELLOW}2. Descargando imagen desde Docker Hub...${NC}"
    download_image_from_docker_hub

    echo -e "${YELLOW}3. Importando imagen a k3s...${NC}"
    import_image_to_k3s

    echo -e "${YELLOW}4. Preparando namespace...${NC}"
    create_namespace

    echo -e "${YELLOW}5. Configurando manifiestos para k3s...${NC}"
    update_image_pull_policy

    echo -e "${YELLOW}6. Desplegando aplicación...${NC}"
    apply_manifests

    echo -e "${YELLOW}7. Verificando despliegue...${NC}"
    verify_deployment

    echo -e "${YELLOW}8. Mostrando información de acceso...${NC}"
    show_k3s_access_info

    echo -e "${YELLOW}9. Mostrando logs...${NC}"
    show_logs

    echo -e "${YELLOW}10. Limpiando archivos temporales...${NC}"
    cleanup

    echo ""
    echo -e "${GREEN}🎉 DESPLIEGUE EN K3S COMPLETADO EXITOSAMENTE${NC}"
    echo -e "${GREEN}===========================================${NC}"
    echo ""
    echo -e "${BLUE}Comandos útiles para k3s:${NC}"
    echo -e "${BLUE}  - Ver pods: kubectl get pods -l app=$APP_NAME -n $NAMESPACE${NC}"
    echo -e "${BLUE}  - Ver logs: kubectl logs -l app=$APP_NAME -n $NAMESPACE -f${NC}"
    echo -e "${BLUE}  - Escalar: kubectl scale deployment $APP_NAME --replicas=3 -n $NAMESPACE${NC}"
    echo -e "${BLUE}  - Eliminar: kubectl delete -f porfolio-k3s.yaml && kubectl delete -f porfolio-security.yaml${NC}"
    echo -e "${BLUE}  - Ver imágenes k3s: sudo k3s ctr images list | grep porfolio${NC}"
    echo -e "${BLUE}  - Actualizar imagen: docker pull ${DOCKER_HUB_REGISTRY}/${IMAGE_NAME} && ./deploy-k3s.sh${NC}"
}

# Trap para limpiar en caso de error
trap cleanup EXIT

# Ejecutar función principal
main "$@"
