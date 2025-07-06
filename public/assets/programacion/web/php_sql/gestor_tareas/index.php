<?php
/**
 * Punto de entrada principal de la aplicación
 */

// Incluir el archivo de inicialización
require_once __DIR__ . '/init.php';

// Generar token CSRF si no existe
if (empty($_SESSION['csrf_token'])) {
    generate_csrf_token();
}

// Inicializar la variable de mensajes de sesión si no existe
if (!isset($_SESSION['messages'])) {
    $_SESSION['messages'] = [];
}

// Procesar mensajes flash
$flashMessages = [];
if (isset($_SESSION['flash_messages'])) {
    $flashMessages = $_SESSION['flash_messages'];
    unset($_SESSION['flash_messages']);
}

// Obtener el formulario solicitado
$formulario = $_GET['formulario'] ?? 'login';

// Validar el formulario solicitado
$formulariosPermitidos = [
    'login' => 'form_login.php',
    'registro' => 'form_crear_usuario.php',
    'restablecer' => 'form_reset_password.php',
    'nueva_contraseña' => 'form_nueva_password.php'
];

// Si el formulario no está en los permitidos, redirigir al login
if (!array_key_exists($formulario, $formulariosPermitidos)) {
    $formulario = 'login';
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars(APP_NAME) ?> - <?php echo ucfirst($formulario) ?></title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <?php include_once 'models/head.php'; ?>
</head>
<body>
    <?php include_once 'models/header.php'; ?>
    
    <main class="main-index">
        <section class="login-image">
            <img src="img/login.jpg" alt="Inicio sesión Gestor de tareas, hombre con tareas a sus alrededores" class="img-fluid">
        </section>
        
        <section class="login-form">
            <?php
            // Mostrar mensajes flash si existen
            if (!empty($flashMessages)) {
                echo '<div class="flash-messages">';
                foreach ($flashMessages as $message) {
                    echo '<div class="alert ' . htmlspecialchars($message['type'] ?? '') . '">';
                    echo htmlspecialchars($message['text'] ?? '');
                    echo '</div>';
                }
                echo '</div>';
            }

            // Incluir el formulario correspondiente
            $formFile = 'forms/' . $formulariosPermitidos[$formulario];
            if (file_exists($formFile)) {
                include_once $formFile;
            } else {
                echo '<div class="alert alert-danger">El formulario solicitado no existe.</div>';
                include_once 'forms/form_login.php'; // Mostrar formulario de login por defecto
            }
            ?>
        </section>
    </main>
    
    <?php include_once 'models/footer.php'; ?>
    <script src="./js/main.js"></script>
</body>
</html>
