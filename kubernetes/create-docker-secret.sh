#!/bin/bash

# ===================================================================
# 🔐 SCRIPT PARA CREAR SECRET DE DOCKER HUB
# ===================================================================
# Este script crea un secret para acceder a repositorios privados
# Última actualización: 2025-01-27
# ===================================================================

echo "🔐 Configurando acceso a Docker Hub privado..."

# Solicitar credenciales
read -p "Usuario de Docker Hub: " DOCKER_USERNAME
read -s -p "Contraseña de Docker Hub: " DOCKER_PASSWORD
echo
read -p "Email de Docker Hub: " DOCKER_EMAIL

# Crear el secret
kubectl create secret docker-registry docker-registry-secret \
  --docker-server=docker.io \
  --docker-username="$DOCKER_USERNAME" \
  --docker-password="$DOCKER_PASSWORD" \
  --docker-email="$DOCKER_EMAIL" \
  --namespace=default

echo "✅ Secret de Docker Hub creado correctamente"
echo "🔍 Verificando secret creado:"
kubectl get secret docker-registry-secret -n default 