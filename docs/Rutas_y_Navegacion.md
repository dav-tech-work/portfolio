# 🧭 Rutas, Navegación e Internacionalización

## 🚏 Rutas principales
- `/` (home one-page)
- `/about`, `/formacion`, `/proyectos`, `/homelab`, `/contacto`
- `/formacion/*` (dinámicas): `python/teoria`, `python/practicas`, `javascript/teoria`, `javascript/practicas`, `html`, `php`, `sistemas`, `seguridad`.
- `/auth/*`: login, register, logout (modos simple y completo)
- `/api/contacto`: endpoints de contacto
- `/health`, `/metrics`: salud y métricas

## 🧩 Navegación
- JS de navegación y transiciones en `public/assets/js/navegacion/*` y `data/public/assets/js/*`.
- One-page: anclas con `?lang=es#about` soportadas.

## 🌍 Internacionalización (i18n)
- Middleware `idioma.mjs` gestiona `?lang=xx`.
- Recursos en `data/idiomas/*.json`.
- Enlaces de menú usan `/?lang=<%= idioma %>#section`.

## 🔒 Consideraciones de seguridad
- CSP con nonces para `<script>` en vistas (`views/templates/head.ejs`, etc.).
- Plan: migrar `onclick` a `addEventListener` para retirar `script-src-attr 'unsafe-inline'`.

---
Última actualización: 2025-08-08
