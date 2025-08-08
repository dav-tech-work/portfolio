# 🔎 SEO e Indexación

## 🤖 robots.txt
- Ubicación: `public/robots.txt`
- Enfoque: bloquear directorios sensibles (`/src/`, `/config/`, `/api/`, `/auth/`, `/metrics`, etc.)
- Permitir `Allow: /assets/`
- `Crawl-delay: 1`
- `Sitemap: https://daniel-arribas-velazquez.dav-tech.work/sitemap.xml`

## 🗺️ sitemap.xml
- Ubicación: `public/sitemap.xml`
- Producción: URLs canónicas del dominio
- Dev/staging: usar URLs locales si procede
- Evitar anclas `#` en sitemap (Google las ignora); usar parámetros `?lang=es` si son canónicos

## 🌐 i18n y canónicos
- Usar `?lang=xx` en enlaces cuando corresponda
- (Opcional) Añadir `hreflang` en `<head>` si se definen variantes por idioma

## ✅ Verificaciones
- Workflows `code-quality` y `analysis` verifican robots y sitemap
- Rutas del sitemap deben existir realmente

---
Última actualización: 2025-08-08
