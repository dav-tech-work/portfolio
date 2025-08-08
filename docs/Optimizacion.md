# 🚀 Optimización del Proyecto

## 🎯 Objetivo
Reducir el peso de assets, asegurar formato/lint y generar un reporte de optimización en cada ejecución.

## 🛠 Script principal
- Archivo: `scripts/Optimizacion/optimizacion-complete.mjs`
- Comando: `npm run optimizacion-completo`

## 🔧 ¿Qué hace?
1) Lint & Format
- Ejecuta `eslint --fix` y `prettier --write` en `src/` y `app.mjs`.

2) Minificación de assets
- Reutiliza `npm run minify-assets` (sin npx):
  - CSS: `postcss + cssnano`
  - JS: `terser` (API)
  - HTML: `html-minifier-terser` (en public/)

3) Análisis de tamaños
- Calcula tamaño total de JS+CSS en `public/assets`
- Muestra Top 10 archivos más pesados

4) Reporte
- Guarda `results/optimization-results/optimizacion-complete-report.json`

## ▶️ Ejecución
```bash
npm run optimizacion-completo
```

## 📄 Salida esperada (resumen)
```
🧹 Lint OK: ✅
🗜️  Minificado assets: ✅
🗺️  HTML minificado: X/Y
📦 Total JS+CSS: NNN.NKB
📄 Reporte: results/optimization-results/optimizacion-complete-report.json
```

## 🧩 Notas
- No usa `npx`, evita cuelgues en CI.
- Respeta estructura `data/public/assets` → `public/assets`.
- Compatible con Windows/Linux.

---
Última actualización: 2025-08-08
