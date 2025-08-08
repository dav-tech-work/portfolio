# 🛡️ Middlewares de Seguridad y Flujo

## 🧱 Capas principales
- `protecciones.mjs`: Aplica headers y protecciones base.
- `csp.mjs`: Política CSP con nonces y deny-by-default.
- `sanitizer-advanced.mjs`: Limpieza de input (XSS/SQLi/NoSQLi).
- `rateLimiters.mjs` + `limiter.mjs` + `intelligent-rate-limiter.mjs`: Limitadores por contexto.
- `csrf-modern.mjs`: Protección CSRF moderna (cuando se habilita).
- `errorHandler.mjs`: Manejo y reporte de errores seguro.
- `privacy.mjs`: Headers y políticas de privacidad básicas.
- `sri.mjs`: Subresource Integrity (cuando corresponde).

## 🔄 Orden de aplicación (via `express-factory`)
1. Compresión (opcional por entorno)
2. Sesiones y flash (si aplica)
3. Idioma (`idioma.mjs`)
4. Protecciones base (`protecciones.mjs`)
5. CSP (`csp.mjs`)
6. Rate limiters
7. Sanitizer avanzado
8. CSRF (si se activa)
9. Logger
10. Rutas
11. NotFound + ErrorHandler

## ⚙️ Configuración por entorno
- `NODE_ENV=production`: CSP estricta, cookies secure, compresión nivel 6, cache estático 1 año.
- `NODE_ENV=development`: CSP relajada para dev, logging verboso, compresión leve.

## ✅ Buenas prácticas
- Validar inputs en rutas y esquemas (`validation/schemas.mjs`).
- Evitar `eval`, `new Function`, `innerHTML` sin sanitizar.
- Usar `nonce` en scripts y evitar inline handlers.

---
Última actualización: 2025-08-08
