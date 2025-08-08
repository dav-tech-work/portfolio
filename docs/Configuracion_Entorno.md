# ⚙️ Configuración de Entorno (config.env)

## 📄 Archivo base
- Plantilla: `config.env.example`
- Copiar a `config.env` en desarrollo/CI: `cp config.env.example config.env`

## 🔐 Secretos y claves
- `SESSION_SECRET`: Mínimo 32 caracteres. Producción: valor aleatorio fuerte.
- `JWT_SECRET`: Mínimo 32 caracteres. Producción: valor aleatorio fuerte.
- `CSRF_SECRET`: Mínimo 32 caracteres. Producción: valor aleatorio fuerte.
- `API_SECRET`: Solo si se usa con APIs internas.

Sugerido: generar con el script de seguridad o `openssl rand -base64 48`.

## 👤 Admin por defecto en desarrollo
- Variable: `DEFAULT_ADMIN_PASSWORD_HASH`
- Uso: Permite iniciar sesión con un usuario `admin` en las rutas de auth simples sin almacenar hashes en el código.
- Valor: un hash bcrypt de la contraseña de desarrollo.
  - Ejemplo (no usar en producción): hash de "admin123" generado localmente.
  - Cómo generar (Node REPL):
    ```js
    // Node >= 18
    import bcrypt from 'bcryptjs';
    const hash = await bcrypt.hash('admin123', 12);
    console.log(hash);
    ```
- Seguridad: No commitear `config.env` con valores reales.

## 🌐 CORS y Orígenes
- `CORS_ORIGIN`, `ALLOWED_ORIGINS`: definir orígenes permitidos (prod: dominio real, dev: `http://localhost:3000`).

## 🔒 Cookies y sesiones
- `COOKIE_SECURE`: `true` en producción (HTTPS), `false` en local.
- `COOKIE_SAME_SITE`: `strict` recomendado.
- `SESSION_MAX_AGE`: milisegundos. Por defecto 24h.

## 📦 Límites de contenido
- `MAX_REQUEST_SIZE`: p.ej. `1mb`.
- `MAX_FILE_SIZE`: para uploads si aplica.

## ✉️ Correo (SMTP)
- `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, `EMAIL_ADMIN`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`
- `EMAIL_ENABLED`: `true/false` para habilitar envío real.

## 🧪 Entornos
- `NODE_ENV`: `development`, `test`, `production`.
- En producción, revisar CSP y variables de seguridad activas.

## ✅ Buenas prácticas
- No commitear `config.env`.
- Usar `.gitignore` y workflows para verificar secretos.
- Rotar secretos periódicamente.

---
Última actualización: 2025-08-08
