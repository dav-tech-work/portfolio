# 🚀 Despliegue y Operaciones

## 🐳 Docker
- Multi-stage builds (ver `docker/Dockerfile`)
- Usuario no-root en producción
- Healthcheck en `/health`

### Comandos
```bash
docker compose up -d
docker compose logs -f
```

## ☸️ Kubernetes (k3s)
- Manifiestos en `kubernetes/`
- SecurityContext: `runAsNonRoot`, `runAsUser`
- Autoescalado: HPA ejemplo
- NetworkPolicies de aislamiento

### Despliegue
```bash
./kubernetes/deploy-k3s.sh
kubectl get all -l app=portfolio
kubectl logs -f -l app=portfolio
```

## 🧪 Operaciones
- Health: `GET /health`
- Metrics (dev/test): `GET /metrics`
- Logs: `logs/` con rotación

## 🔐 Seguridad en operación
- Revisar CSP headers y reports
- Rotar secretos periódicamente
- Actualizar dependencias (`npm audit fix` bajo criterio)

---
Última actualización: 2025-08-08
