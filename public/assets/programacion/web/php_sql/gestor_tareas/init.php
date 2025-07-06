<?php
/**
 * Archivo de inicialización de la aplicación
 * Este archivo debe ser incluido al principio de cada script PHP
 */

// Iniciar la sesión si no está ya iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Cargar configuración
require_once __DIR__ . '/config/config.php';

// Configurar el manejo de errores
if (APP_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Función para cargar automáticamente las clases
spl_autoload_register(function ($class) {
    // Directorios donde buscar las clases
    $directories = [
        __DIR__ . '/control/',
        __DIR__ . '/model/',
        __DIR__ . '/util/',
    ];

    // Convertir el nombre de la clase a la ruta del archivo
    $classFile = str_replace('\\', '/', $class) . '.php';
    
    // Buscar el archivo en los directorios
    foreach ($directories as $directory) {
        $file = $directory . $classFile;
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Función para obtener la URL base de la aplicación
function base_url($path = '') {
    $baseUrl = rtrim(APP_URL, '/');
    $path = ltrim($path, '/');
    return $path ? "$baseUrl/$path" : $baseUrl;
}

// Función para redirigir a una URL
function redirect($url) {
    header("Location: $url");
    exit();
}

// Función para verificar si el usuario está autenticado
function is_authenticated() {
    return isset($_SESSION['user_id']);
}

// Función para requerir autenticación
function require_auth() {
    if (!is_authenticated()) {
        $_SESSION['redirect_after_login'] = $_SERVER['REQUEST_URI'];
        redirect(base_url('index.php?formulario=login'));
    }
}

// Función para generar un token CSRF
function generate_csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// Función para validar un token CSRF
function validate_csrf_token($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Inicializar el token CSRF si no existe
if (empty($_SESSION['csrf_token'])) {
    generate_csrf_token();
}

// Incluir funciones de utilidad
require_once __DIR__ . '/control/json_response.php';

// Manejo de errores personalizado
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) {
        // Este código de error no está incluido en error_reporting
        return false;
    }

    $errorTypes = [
        E_ERROR             => 'Error',
        E_WARNING           => 'Warning',
        E_PARSE             => 'Parsing Error',
        E_NOTICE            => 'Notice',
        E_CORE_ERROR        => 'Core Error',
        E_CORE_WARNING      => 'Core Warning',
        E_COMPILE_ERROR     => 'Compile Error',
        E_COMPILE_WARNING   => 'Compile Warning',
        E_USER_ERROR        => 'User Error',
        E_USER_WARNING      => 'User Warning',
        E_USER_NOTICE       => 'User Notice',
        E_STRICT            => 'Runtime Notice',
        E_RECOVERABLE_ERROR => 'Catchable Fatal Error',
        E_DEPRECATED        => 'Deprecated',
        E_USER_DEPRECATED   => 'User Deprecated',
    ];

    $errorType = $errorTypes[$errno] ?? 'Unknown Error';
    $errorMessage = "$errorType: $errstr in $errfile on line $errline";

    // Registrar el error
    error_log($errorMessage);

    // Mostrar el error si estamos en modo depuración
    if (APP_DEBUG) {
        echo "<div style='background-color: #f8d7da; color: #721c24; padding: 10px; margin: 10px 0; border: 1px solid #f5c6cb; border-radius: 4px;'>";
        echo "<strong>$errorType</strong>: $errstr<br>";
        echo "<small>File: $errfile (Line: $errline)</small>";
        echo "</div>";
    }

    // No ejecutar el gestor de errores interno de PHP
    return true;
});

// Manejo de excepciones no capturadas
set_exception_handler(function($exception) {
    $errorMessage = "Uncaught Exception: " . $exception->getMessage() . " in " . $exception->getFile() . ":" . $exception->getLine();
    error_log($errorMessage);
    
    if (APP_DEBUG) {
        echo "<div style='background-color: #f8d7da; color: #721c24; padding: 10px; margin: 10px 0; border: 1px solid #f5c6cb; border-radius: 4px;'>";
        echo "<strong>Uncaught Exception</strong>: " . $exception->getMessage() . "<br>";
        echo "<small>File: " . $exception->getFile() . " (Line: " . $exception->getLine() . ")</small><br>";
        echo "<pre>" . $exception->getTraceAsString() . "</pre>";
        echo "</div>";
    } else {
        // En producción, mostrar un mensaje genérico
        echo "<div style='text-align: center; margin: 50px;'>";
        echo "<h1>¡Ups! Algo salió mal</h1>";
        echo "<p>Lo sentimos, ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.</p>";
        echo "<p><a href='" . base_url() . "'>Volver a la página de inicio</a></p>";
        echo "</div>";
    }
});

// Configuración de zona horaria
date_default_timezone_set('Europe/Madrid');

// Incluir conexión a la base de datos
require_once __DIR__ . '/control/connection.php';
