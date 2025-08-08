# 🚀 SCRIPT DE DESPLIEGUE PARA WINDOWS - PORTFOLIO WEB
# ===================================================
# Despliegue optimizado para Windows con Docker Desktop y Kubernetes local
# Autor: Daniel Arribas Velázquez
# Fecha: 2025-01-28
# ===================================================

param(
  [string]$Environment = "local",
  [string]$ImageVersion = "v4",
  [switch]$SkipImagePull,
  [switch]$Force
)

# Configuración de colores para PowerShell
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

# Variables
$Namespace = "default"
$AppName = "porfolio"
$ImageName = "davtechw/porfolio:$ImageVersion"
$DockerHubRegistry = "docker.io"

Write-Host "🚀 INICIANDO DESPLIEGUE DE PORTFOLIO EN WINDOWS" -ForegroundColor $Blue
Write-Host "=================================================" -ForegroundColor $Blue
Write-Host ""

# Función para escribir mensajes con colores
function Write-Status {
  param(
    [string]$Message,
    [string]$Color = "White",
    [string]$Type = "INFO"
  )

  $timestamp = Get-Date -Format "HH:mm:ss"
  $prefix = switch ($Type) {
    "SUCCESS" { "✅" }
    "ERROR" { "❌" }
    "WARNING" { "⚠️" }
    "INFO" { "ℹ️" }
    default { "ℹ️" }
  }

  Write-Host "[$timestamp] $prefix $Message" -ForegroundColor $Color
}

# Función para verificar si kubectl está disponible
function Test-Kubectl {
  try {
    $null = kubectl version --client
    Write-Status "kubectl disponible" $Green "SUCCESS"
    return $true
  }
  catch {
    Write-Status "kubectl no está instalado o no está en el PATH" $Red "ERROR"
    Write-Status "Instala kubectl desde: https://kubernetes.io/docs/tasks/tools/" $Yellow "WARNING"
    return $false
  }
}

# Función para verificar conexión al cluster
function Test-KubernetesCluster {
  try {
    $null = kubectl cluster-info
    Write-Status "Conexión al cluster establecida" $Green "SUCCESS"
    return $true
  }
  catch {
    Write-Status "No se puede conectar al cluster Kubernetes" $Red "ERROR"
    Write-Status "Asegúrate de que Docker Desktop esté ejecutándose con Kubernetes habilitado" $Yellow "WARNING"
    return $false
  }
}

# Función para verificar Docker
function Test-Docker {
  try {
    $null = docker version
    Write-Status "Docker disponible" $Green "SUCCESS"
    return $true
  }
  catch {
    Write-Status "Docker no está instalado o no está ejecutándose" $Red "ERROR"
    Write-Status "Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" $Yellow "WARNING"
    return $false
  }
}

# Función para descargar imagen desde Docker Hub
function Get-DockerImage {
  if ($SkipImagePull) {
    Write-Status "Saltando descarga de imagen (--SkipImagePull)" $Yellow "WARNING"
    return $true
  }

  Write-Status "Descargando imagen desde Docker Hub..." $Yellow "INFO"
  Write-Status "Imagen: $DockerHubRegistry/$ImageName" $Cyan "INFO"

  try {
    docker pull "$DockerHubRegistry/$ImageName"
    Write-Status "Imagen descargada exitosamente desde Docker Hub" $Green "SUCCESS"
    return $true
  }
  catch {
    Write-Status "Error al descargar la imagen desde Docker Hub" $Red "ERROR"
    Write-Status "Verifica que la imagen $ImageName existe en Docker Hub" $Yellow "WARNING"
    return $false
  }
}

# Función para crear namespace si no existe
function New-NamespaceIfNotExists {
  try {
    $null = kubectl get namespace $Namespace 2>$null
    Write-Status "Namespace $Namespace ya existe" $Green "SUCCESS"
  }
  catch {
    Write-Status "Creando namespace: $Namespace" $Yellow "INFO"
    kubectl create namespace $Namespace
    Write-Status "Namespace $Namespace creado" $Green "SUCCESS"
  }
}

# Función para limpiar despliegues anteriores
function Remove-PreviousDeployment {
  if (-not $Force) {
    Write-Status "¿Deseas eliminar el despliegue anterior? (y/N)" $Yellow "WARNING"
    $response = Read-Host
    if ($response -ne "y" -and $response -ne "Y") {
      Write-Status "Saltando limpieza de despliegue anterior" $Yellow "WARNING"
      return
    }
  }

  Write-Status "Eliminando despliegue anterior..." $Yellow "INFO"

  try {
    # Eliminar recursos existentes
    kubectl delete deployment $AppName -n $Namespace --ignore-not-found=true
    kubectl delete service "$AppName-service" -n $Namespace --ignore-not-found=true
    kubectl delete hpa "$AppName-hpa" -n $Namespace --ignore-not-found=true
    kubectl delete networkpolicy "$AppName-network-policy" -n $Namespace --ignore-not-found=true

    Write-Status "Despliegue anterior eliminado" $Green "SUCCESS"
  }
  catch {
    Write-Status "Error al eliminar despliegue anterior" $Red "ERROR"
  }
}

# Función para aplicar manifiestos
function Apply-Manifests {
    Write-Status "Aplicando secretos de la aplicación..." $Yellow "INFO"
    kubectl apply -f "porfolio-secrets.yaml" --validate=false

    Write-Status "Aplicando configuración para Windows..." $Yellow "INFO"
    kubectl apply -f "porfolio-windows.yaml" --validate=false

    Write-Status "Aplicando configuraciones de seguridad..." $Yellow "INFO"
    kubectl apply -f "porfolio-security.yaml" --validate=false

    Write-Status "Manifiestos aplicados correctamente" $Green "SUCCESS"
}

# Función para verificar el despliegue
function Test-Deployment {
  Write-Status "Verificando despliegue..." $Yellow "INFO"

  # Esperar a que el deployment esté listo
  try {
    kubectl rollout status deployment/$AppName -n $Namespace --timeout=300s
    Write-Status "Deployment listo" $Green "SUCCESS"
  }
  catch {
    Write-Status "Error en el deployment" $Red "ERROR"
    return $false
  }

  # Verificar pods
  Write-Status "Estado de los pods:" $Yellow "INFO"
  kubectl get pods -l app=$AppName -n $Namespace

  # Verificar servicios
  Write-Status "Estado de los servicios:" $Yellow "INFO"
  kubectl get services -l app=$AppName -n $Namespace

  # Verificar HPA si existe
  try {
    $null = kubectl get hpa -l app=$AppName -n $Namespace 2>$null
    Write-Status "Estado del HPA:" $Yellow "INFO"
    kubectl get hpa -l app=$AppName -n $Namespace
  }
  catch {
    Write-Status "HPA no encontrado (normal)" $Yellow "WARNING"
  }

  return $true
}

# Función para mostrar información de acceso
function Show-AccessInfo {
  Write-Host ""
  Write-Host "🎯 INFORMACIÓN DE ACCESO WINDOWS" -ForegroundColor $Blue
  Write-Host "=================================" -ForegroundColor $Blue

  # Obtener ClusterIP del servicio
  try {
    $ClusterIP = kubectl get service "$AppName-service" -n $Namespace -o jsonpath='{.spec.clusterIP}' 2>$null
    $ServicePort = kubectl get service "$AppName-service" -n $Namespace -o jsonpath='{.spec.ports[0].port}' 2>$null

    if ($ClusterIP -and $ServicePort) {
      Write-Host "🌐 Servicio ClusterIP: $ClusterIP`:$ServicePort" -ForegroundColor $Green
    }
    else {
      Write-Host "🌐 Servicio: Verificando..." -ForegroundColor $Yellow
    }
  }
  catch {
    Write-Host "🌐 Servicio: No disponible" -ForegroundColor $Red
  }

  Write-Host "🔒 Configuración: Cloudflare Zero Trust" -ForegroundColor $Green
  Write-Host "📊 Namespace: $Namespace" -ForegroundColor $Green
  Write-Host "🎯 Cluster: Docker Desktop Kubernetes" -ForegroundColor $Green
  Write-Host "📦 Fuente: Docker Hub" -ForegroundColor $Green
  Write-Host "🖥️  Entorno: Windows" -ForegroundColor $Green

  Write-Host ""
  Write-Host "📋 CONFIGURACIÓN CLOUDFLARE ZERO TRUST:" -ForegroundColor $Yellow
  Write-Host "=========================================" -ForegroundColor $Yellow
  Write-Host "• Tipo de servicio: ClusterIP (no expuesto directamente)" -ForegroundColor $Cyan
  Write-Host "• Proxy: Cloudflare Zero Trust" -ForegroundColor $Cyan
  Write-Host "• Seguridad: Manejada por Cloudflare" -ForegroundColor $Cyan
  Write-Host "• TLS/HTTPS: Manejado por Cloudflare" -ForegroundColor $Cyan
  Write-Host "• Acceso: Controlado por políticas Zero Trust" -ForegroundColor $Cyan
}

# Función para mostrar logs
function Show-Logs {
  Write-Host ""
  Write-Status "Últimos logs de la aplicación:" $Yellow "INFO"
  try {
    kubectl logs -l app=$AppName -n $Namespace --tail=10
  }
  catch {
    Write-Status "No se pudieron obtener logs" $Red "ERROR"
  }
}

# Función para mostrar comandos útiles
function Show-UsefulCommands {
  Write-Host ""
  Write-Host "🔧 COMANDOS ÚTILES PARA WINDOWS:" -ForegroundColor $Blue
  Write-Host "=================================" -ForegroundColor $Blue
  Write-Host "  - Ver pods: kubectl get pods -l app=$AppName -n $Namespace" -ForegroundColor $Cyan
  Write-Host "  - Ver logs: kubectl logs -l app=$AppName -n $Namespace -f" -ForegroundColor $Cyan
  Write-Host "  - Ver servicio: kubectl get service $AppName-service -n $Namespace" -ForegroundColor $Cyan
  Write-Host "  - Escalar: kubectl scale deployment $AppName --replicas=3 -n $Namespace" -ForegroundColor $Cyan
  Write-Host "  - Eliminar: kubectl delete -f porfolio-cloudflare.yaml" -ForegroundColor $Cyan
  Write-Host "  - Ver imágenes: docker images | findstr porfolio" -ForegroundColor $Cyan
  Write-Host "  - Actualizar: docker pull $DockerHubRegistry/$ImageName" -ForegroundColor $Cyan
  Write-Host ""
  Write-Host "🖥️  COMANDOS ESPECÍFICOS DE WINDOWS:" -ForegroundColor $Blue
  Write-Host "=====================================" -ForegroundColor $Blue
  Write-Host "  - Abrir Docker Desktop: start 'C:\Program Files\Docker\Docker\Docker Desktop.exe'" -ForegroundColor $Cyan
  Write-Host "  - Verificar Docker: docker version" -ForegroundColor $Cyan
  Write-Host "  - Verificar Kubernetes: kubectl cluster-info" -ForegroundColor $Cyan
  Write-Host "  - Limpiar Docker: docker system prune -f" -ForegroundColor $Cyan
}

# Función principal
function Main {
  Write-Status "1. Verificando prerrequisitos..." $Yellow "INFO"
  if (-not (Test-Kubectl)) { exit 1 }
  if (-not (Test-KubernetesCluster)) { exit 1 }
  if (-not (Test-Docker)) { exit 1 }

  Write-Status "2. Descargando imagen desde Docker Hub..." $Yellow "INFO"
  if (-not (Get-DockerImage)) { exit 1 }

  Write-Status "3. Preparando namespace..." $Yellow "INFO"
  New-NamespaceIfNotExists

  Write-Status "4. Limpiando despliegue anterior..." $Yellow "INFO"
  Remove-PreviousDeployment

  Write-Status "5. Desplegando aplicación..." $Yellow "INFO"
  Apply-Manifests

  Write-Status "6. Verificando despliegue..." $Yellow "INFO"
  if (-not (Test-Deployment)) { exit 1 }

  Write-Status "7. Mostrando información de acceso..." $Yellow "INFO"
  Show-AccessInfo

  Write-Status "8. Mostrando logs..." $Yellow "INFO"
  Show-Logs

  Write-Status "9. Mostrando comandos útiles..." $Yellow "INFO"
  Show-UsefulCommands

  Write-Host ""
  Write-Host "🎉 DESPLIEGUE EN WINDOWS COMPLETADO EXITOSAMENTE" -ForegroundColor $Green
  Write-Host "=================================================" -ForegroundColor $Green
  Write-Host ""
  Write-Host "🔒 PRÓXIMOS PASOS PARA CLOUDFLARE ZERO TRUST:" -ForegroundColor $Yellow
  Write-Host "==============================================" -ForegroundColor $Yellow
  Write-Host "1. Configurar aplicación en Cloudflare Zero Trust Dashboard" -ForegroundColor $Cyan
  Write-Host "2. Configurar políticas de acceso y autenticación" -ForegroundColor $Cyan
  Write-Host "3. Configurar reglas de firewall y WAF" -ForegroundColor $Cyan
  Write-Host "4. Configurar DNS y certificados SSL" -ForegroundColor $Cyan
  Write-Host "5. Probar acceso a través de Cloudflare" -ForegroundColor $Cyan
}

# Ejecutar función principal
try {
  Main
}
catch {
  Write-Status "Error durante el despliegue: $($_.Exception.Message)" $Red "ERROR"
  exit 1
}
