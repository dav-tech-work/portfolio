<?php
/**
 * Archivo de configuración de la aplicación
 */

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'tu_base_de_datos');
define('DB_USER', 'tu_usuario');
define('DB_PASS', 'tu_contraseña');

// Configuración de correo electrónico
define('MAIL_HOST', 'smtp.gmail.com');
define('MAIL_PORT', 587);
define('MAIL_USERNAME', 'gestordetareas2024@gmail.com');
define('MAIL_PASSWORD', 'vxmf xmkc kzby xqpq');
define('MAIL_FROM_EMAIL', 'gestordetareas2024@gmail.com');
define('MAIL_FROM_NAME', 'GESTOR DE TAREAS');

// Configuración de la aplicación
define('APP_NAME', 'Gestor de Tareas');
define('APP_URL', 'http://' . $_SERVER['HTTP_HOST'] . str_replace('index.php', '', $_SERVER['SCRIPT_NAME']));
define('APP_DEBUG', true);

// Tiempo de expiración del token de restablecimiento (en horas)
define('RESET_TOKEN_EXPIRY', 1);

// Configuración de seguridad
define('MIN_PASSWORD_LENGTH', 8);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_TIME', 900); // 15 minutos en segundos

// Rutas de la aplicación
define('TEMPLATES_PATH', __DIR__ . '/../templates/');
define('UPLOADS_PATH', __DIR__ . '/../uploads/');

// Configuración de sesión
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));
session_set_cookie_params([
    'lifetime' => 86400, // 24 horas
    'path' => '/',
    'domain' => $_SERVER['HTTP_HOST'],
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Strict'
]);

// Configuración de zona horaria
date_default_timezone_set('Europe/Madrid');

// Mostrar errores solo en desarrollo
if (APP_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Incluir funciones de utilidad
require_once __DIR__ . '/../control/json_response.php';

// Incluir autoloader si existe
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}
