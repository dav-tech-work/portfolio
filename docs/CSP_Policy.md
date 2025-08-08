# 🔒 Política de Content Security Policy (CSP)

## 🎯 Objetivo
Definir una CSP de “deny by default” para evitar carga de recursos no autorizados, manteniendo la funcionalidad del proyecto mediante excepciones mínimas y nonces por request.

## 🛠 Implementación
- Middleware: `src/middleware/csp.mjs`
- Estrategia: `default-src 'none'` + whitelists por directiva
- Nonce por request para `<script>` y estilos inline controlados

## 📐 Directivas activas (producción)
- `default-src 'none'`
- `script-src 'self' 'nonce-<nonce>' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://*.dav-tech.work https://*.cloudflare.com`
- `script-src-elem 'self' 'nonce-<nonce>' 'strict-dynamic'` + CDNs listados arriba
- `script-src-attr 'unsafe-inline'` (excepción temporal; ver plan de migración)
- `style-src 'self' 'nonce-<nonce>' https://fonts.googleapis.com https://cdnjs.cloudflare.com`
- `img-src 'self' data: https: blob:`
- `font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com`
- `connect-src 'self'`
- `media-src 'self'`
- `object-src 'none'`
- `base-uri 'self'`
- `form-action 'self' https://formspree.io https://api.emailjs.com`
- `frame-ancestors 'none'`
- `upgrade-insecure-requests` (solo en producción)

En desarrollo se añaden: `'unsafe-inline'` y `'unsafe-eval'` en `script-src` y `'unsafe-inline'` en `style-src` para facilitar debugging.

## 🔁 Nonces en vistas
- Nonce disponible como `nonce` en EJS.
- Ejemplos:
```ejs
<script src="/assets/js/index.min.js" nonce="<%= nonce %>" defer></script>
```

## ⚠️ Excepción temporal
- `script-src-attr 'unsafe-inline'` está habilitado para soportar `onclick` existentes en:
  - `views/pages/contacto.ejs`
  - `views/pages/proyectos.ejs`

### Plan de migración (recomendado)
1) Reemplazar `onclick="funcion()"` por `addEventListener` en JS con módulos/minificados ya servidos con nonce.
2) Eliminar `script-src-attr 'unsafe-inline'` del middleware.

## ➕ Añadir una nueva excepción de origen
- Agrega el dominio a la directiva correspondiente en `csp.mjs` (p.ej. `img-src`, `connect-src`).
- Evitar comodines amplios (p.ej. `*`) y `data:` salvo necesidad.

## ✅ Verificación
- Los headers CSP se validan en tests y en el workflow de seguridad.
- Si un recurso es bloqueado, revisa la consola del navegador y ajusta CSP de forma mínima.

---

Última actualización: 2025-08-08
