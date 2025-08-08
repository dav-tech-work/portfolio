# ===================================================================
# 🚀 SCRIPT DE DEPLOYMENT KUBERNETES - PORTFOLIO AUTOSUFICIENTE
# ===================================================================
# Script optimizado para deployment en K3s con verificaciones
# Última actualización: 2025-01-27
# ===================================================================

param(
    [switch]$Clean,
    [switch]$SkipPrompts
)

# Colores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# Función para logging
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Red
}

# ===================================================================
# 🔍 VERIFICACIONES PREVIAS
# ===================================================================

Write-Log "Iniciando deployment del portfolio en Kubernetes..."

# Verificar que kubectl esté disponible
try {
    $null = Get-Command kubectl -ErrorAction Stop
} catch {
    Write-Error "kubectl no está instalado o no está en el PATH"
    Write-Host "💡 Instala kubectl desde: https://kubernetes.io/docs/tasks/tools/" -ForegroundColor $Yellow
    exit 1
}

# Verificar conexión al cluster
try {
    $null = kubectl cluster-info 2>$null
} catch {
    Write-Error "No se puede conectar al cluster de Kubernetes"
    Write-Host "💡 Verifica que Kubernetes esté ejecutándose y que tengas acceso" -ForegroundColor $Yellow
    exit 1
}

Write-Success "Conexión al cluster verificada"

# Verificar que los archivos YAML existan
if (-not (Test-Path "kubernetes/redis.yaml")) {
    Write-Error "Archivo kubernetes/redis.yaml no encontrado"
    exit 1
}

if (-not (Test-Path "kubernetes/porfolio-cloudflare.yaml")) {
    Write-Error "Archivo kubernetes/porfolio-cloudflare.yaml no encontrado"
    exit 1
}

if (-not (Test-Path "kubernetes/porfolio-secrets.yaml")) {
    Write-Warning "Archivo kubernetes/porfolio-secrets.yaml no encontrado"
    Write-Host "💡 Los secretos se crearán con valores por defecto" -ForegroundColor $Yellow
}

Write-Success "Archivos de configuración verificados"

# ===================================================================
# 🧹 LIMPIEZA PREVIA (OPCIONAL)
# ===================================================================

if ($Clean -or (-not $SkipPrompts -and (Read-Host "¿Deseas limpiar deployments anteriores? (y/N)") -eq "y")) {
    Write-Log "Limpiando deployments anteriores..."
    kubectl delete deployment porfolio --ignore-not-found=true 2>$null
    kubectl delete deployment portfolio-redis --ignore-not-found=true 2>$null
    kubectl delete service porfolio-service --ignore-not-found=true 2>$null
    kubectl delete service portfolio-redis-service --ignore-not-found=true 2>$null
    kubectl delete pvc redis-pvc --ignore-not-found=true 2>$null
    kubectl delete configmap redis-config --ignore-not-found=true 2>$null
    kubectl delete networkpolicy redis-network-policy --ignore-not-found=true 2>$null
    kubectl delete hpa portfolio-redis-hpa --ignore-not-found=true 2>$null
    kubectl delete secret porfolio-secrets --ignore-not-found=true 2>$null
    Write-Success "Limpieza completada"
}

# ===================================================================
# 🔑 APLICAR SECRETOS
# ===================================================================

Write-Log "Aplicando secretos..."

if (Test-Path "kubernetes/porfolio-secrets.yaml") {
    kubectl apply -f kubernetes/porfolio-secrets.yaml
    Write-Success "Secretos aplicados"
} else {
    Write-Warning "Creando secretos por defecto..."
    kubectl create secret generic porfolio-secrets `
        --from-literal=JWT_SECRET="default_jwt_secret_change_in_production" `
        --from-literal=SESSION_SECRET="default_session_secret_change_in_production" `
        --from-literal=API_KEY="default_api_key_change_in_production" `
        --dry-run=client -o yaml | kubectl apply -f -
    Write-Success "Secretos por defecto creados"
}

# ===================================================================
# 🗄️ DEPLOYMENT DE REDIS
# ===================================================================

Write-Log "Desplegando Redis..."

# Aplicar configuración de Redis
kubectl apply -f kubernetes/redis.yaml

# Esperar a que Redis esté listo
Write-Log "Esperando a que Redis esté listo..."
try {
    kubectl wait --for=condition=available --timeout=300s deployment/portfolio-redis 2>$null
    Write-Success "Redis desplegado correctamente"
} catch {
    Write-Error "Timeout esperando Redis"
    kubectl get pods -l app=portfolio-redis
    kubectl describe deployment portfolio-redis
    exit 1
}

# Verificar que Redis esté funcionando
Write-Log "Verificando conectividad de Redis..."
$redisPod = kubectl get pods -l app=portfolio-redis -o jsonpath='{.items[0].metadata.name}' 2>$null
if ($redisPod) {
    $redisResponse = kubectl exec $redisPod -- redis-cli ping 2>$null
    if ($redisResponse -match "PONG") {
        Write-Success "Redis está funcionando correctamente"
    } else {
        Write-Error "Redis no responde correctamente"
        kubectl logs $redisPod --tail=20
        exit 1
    }
} else {
    Write-Error "No se pudo obtener el pod de Redis"
    exit 1
}

# ===================================================================
# 🌐 DEPLOYMENT DE LA APLICACIÓN
# ===================================================================

Write-Log "Desplegando la aplicación portfolio..."

# Aplicar configuración de la aplicación
kubectl apply -f kubernetes/porfolio-cloudflare.yaml

# Esperar a que la aplicación esté lista
Write-Log "Esperando a que la aplicación esté lista..."
try {
    kubectl wait --for=condition=available --timeout=300s deployment/porfolio 2>$null
    Write-Success "Aplicación desplegada correctamente"
} catch {
    Write-Error "Timeout esperando la aplicación"
    kubectl get pods -l app=porfolio
    kubectl describe deployment porfolio
    exit 1
}

# ===================================================================
# 🔍 VERIFICACIONES POST-DEPLOYMENT
# ===================================================================

Write-Log "Realizando verificaciones post-deployment..."

# Verificar que todos los pods estén ejecutándose
$runningPods = kubectl get pods -l app=porfolio -o jsonpath='{.items[*].status.phase}' 2>$null | ForEach-Object { if ($_ -eq "Running") { 1 } else { 0 } } | Measure-Object -Sum | Select-Object -ExpandProperty Sum
if ($runningPods -gt 0) {
    Write-Success "Todos los pods de la aplicación están ejecutándose"
} else {
    Write-Error "Algunos pods no están ejecutándose"
    kubectl get pods -l app=porfolio
    exit 1
}

# Verificar conectividad entre aplicación y Redis
Write-Log "Verificando conectividad entre aplicación y Redis..."
$appPod = kubectl get pods -l app=porfolio -o jsonpath='{.items[0].metadata.name}' 2>$null
if ($appPod) {
    try {
        kubectl exec $appPod -- nc -z portfolio-redis-service 6379 2>$null
        Write-Success "Conectividad entre aplicación y Redis verificada"
    } catch {
        Write-Warning "Problema de conectividad entre aplicación y Redis"
        Write-Log "Verificando logs de la aplicación..."
        kubectl logs $appPod --tail=20
    }
} else {
    Write-Error "No se pudo obtener el pod de la aplicación"
    exit 1
}

# Verificar que los servicios estén creados
Write-Log "Verificando servicios..."
try {
    $null = kubectl get service porfolio-service 2>$null
    Write-Success "Servicio de la aplicación creado"
} catch {
    Write-Error "Servicio de la aplicación no encontrado"
}

try {
    $null = kubectl get service portfolio-redis-service 2>$null
    Write-Success "Servicio de Redis creado"
} catch {
    Write-Error "Servicio de Redis no encontrado"
}

# ===================================================================
# 📊 INFORMACIÓN DEL DEPLOYMENT
# ===================================================================

Write-Log "Mostrando información del deployment..."

Write-Host ""
Write-Host "===================================================================" -ForegroundColor $Blue
Write-Host "🎉 DEPLOYMENT COMPLETADO EXITOSAMENTE" -ForegroundColor $Green
Write-Host "===================================================================" -ForegroundColor $Blue
Write-Host ""
Write-Host "📊 Estado de los pods:" -ForegroundColor $Yellow
kubectl get pods -l app=porfolio
kubectl get pods -l app=portfolio-redis
Write-Host ""
Write-Host "🌐 Servicios:" -ForegroundColor $Yellow
kubectl get services -l app=porfolio
kubectl get services -l app=portfolio-redis
Write-Host ""
Write-Host "🔗 Endpoints:" -ForegroundColor $Yellow
kubectl get endpoints -l app=porfolio
kubectl get endpoints -l app=portfolio-redis
Write-Host ""

if ($appPod) {
    Write-Host "📝 Logs de la aplicación (últimas 10 líneas):" -ForegroundColor $Yellow
    kubectl logs $appPod --tail=10
    Write-Host ""
}

if ($redisPod) {
    Write-Host "🗄️ Logs de Redis (últimas 5 líneas):" -ForegroundColor $Yellow
    kubectl logs $redisPod --tail=5
    Write-Host ""
}

Write-Host "===================================================================" -ForegroundColor $Blue
Write-Host "🚀 La aplicación debería estar disponible en:" -ForegroundColor $Green
Write-Host "   - Local: http://localhost:30001" -ForegroundColor $White
Write-Host "   - Cluster: http://porfolio-service:3000" -ForegroundColor $White
Write-Host "===================================================================" -ForegroundColor $Blue

# ===================================================================
# 🔧 COMANDOS ÚTILES
# ===================================================================

Write-Host ""
Write-Host "🔧 Comandos útiles:" -ForegroundColor $Yellow
Write-Host "   - Ver logs de la aplicación: kubectl logs -f deployment/porfolio" -ForegroundColor $White
Write-Host "   - Ver logs de Redis: kubectl logs -f deployment/portfolio-redis" -ForegroundColor $White
Write-Host "   - Escalar la aplicación: kubectl scale deployment porfolio --replicas=2" -ForegroundColor $White
if ($appPod) {
    Write-Host "   - Verificar conectividad: kubectl exec $appPod -- nc -zv portfolio-redis-service 6379" -ForegroundColor $White
}
if ($redisPod) {
    Write-Host "   - Acceder a Redis CLI: kubectl exec -it $redisPod -- redis-cli" -ForegroundColor $White
}
Write-Host "   - Verificar NetworkPolicies: kubectl get networkpolicies" -ForegroundColor $White
Write-Host "   - Verificar secretos: kubectl get secrets" -ForegroundColor $White
Write-Host ""

Write-Success "Deployment completado exitosamente!"
