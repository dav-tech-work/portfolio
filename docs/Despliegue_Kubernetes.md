# ☸️ Despliegue en Kubernetes (k3s/K8s)

## 📂 Estructura
```
kubernetes/
├── deploy-k3s.sh            # Script de despliegue en Linux
├── deploy-k3s.ps1           # Script de despliegue en Windows (PowerShell)
├── deploy-windows.ps1       # Alternativa Windows
├── porfolio-cloudflare.yaml # Configuración de ingress/Cloudflare
├── porfolio-secrets.yaml    # Ejemplo de secretos (no productivos)
├── porfolio-security.yaml   # Políticas de seguridad (NetworkPolicy, etc.)
├── redis.yaml               # Redis opcional
├── audit-config.yaml        # Auditoría de API Server
├── docker-secret.yaml       # Secret de registry
├── create-docker-secret.sh  # Helper para secret de Docker
└── security-check.sh        # Verificaciones básicas del cluster
```

## 🚀 Despliegue rápido (k3s)
```bash
# 1) Crear secret de Docker (si usas registry privado)
./kubernetes/create-docker-secret.sh

# 2) Aplicar manifiestos base
kubectl apply -f kubernetes/porfolio-security.yaml
kubectl apply -f kubernetes/porfolio-secrets.yaml
kubectl apply -f kubernetes/porfolio-cloudflare.yaml

# 3) (Opcional) Redis
kubectl apply -f kubernetes/redis.yaml

# 4) Verificar recursos
kubectl get all -n default
```

## 🔒 Seguridad
- `porfolio-security.yaml`: incluye NetworkPolicies y ajustes de seguridad comunes.
- Ejecutar `kubernetes/security-check.sh` para validar configuraciones clave (HSTS, headers, etc. si aplica a ingress).

## 🌐 Cloudflare
- `porfolio-cloudflare.yaml` contiene reglas/annotations para operar detrás de Cloudflare (TLS/headers).
- Ver documentación complementaria en `config/cloudflare-ssl/`.

## 🔁 Actualizaciones
- Rolling updates por defecto en Deployments.
- Revisa límites de recursos en los manifiestos (`cpu`, `memory`).

## 🧪 Diagnóstico
- `redis-diagnostic.sh` para verificar estado de Redis si se utiliza.
- `kubectl describe` y `kubectl logs` para depuración estándar.

---
Última actualización: 2025-08-08
