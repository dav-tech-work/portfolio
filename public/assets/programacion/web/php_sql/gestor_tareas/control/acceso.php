<?php

session_start();
require_once 'connection.php';

$token = bin2hex(random_bytes(64)); // Token seguro

// Sanitizar entrada
foreach ($_POST as $clave => $valor) {
    $_POST[$clave] = trim(htmlspecialchars($valor, ENT_QUOTES, "UTF-8"));
}

/*
// Anti-bot y anti-CSRF
if (!empty($_POST['web']) || !hash_equals($_SESSION['token'], $_POST['token'])) {
    $_SESSION['error'] = true;
    header('location: index.php');
    exit();
}
*/

$hash = password_hash($_POST['password'], PASSWORD_DEFAULT);

// Insertar en tabla temporal
$insert = "INSERT INTO temporal (nombre_usuario, password_usuario, email, idioma, token_registro) 
           VALUES (:nombre, :pass, :email, :idioma, :token)";
$prep = $conn->prepare($insert);
$prep->bindParam(':nombre', $_POST['nombre'], PDO::PARAM_STR);
$prep->bindParam(':pass', $hash, PDO::PARAM_STR);
$prep->bindParam(':email', $_POST['email'], PDO::PARAM_STR);
$prep->bindParam(':idioma', $_POST['idioma'], PDO::PARAM_STR);
$prep->bindParam(':token', $token, PDO::PARAM_STR);
$prep->execute();

// Configurar variables para el correo
$email = $_POST['email'];
$usuario = $_POST['nombre'];
$asunto = "Creación de cuenta en APP COLORES";
$enlaceRegistro = "http://localhost:99/registro.php?registro=$token";

// Construir el cuerpo del correo
$body = "
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
        <h2 style='color: #2c3e50;'>¡Bienvenido/a a APP COLORES!</h2>
        <p>Hola $usuario,</p>
        <p>Gracias por registrarte en nuestra aplicación. Para activar tu cuenta, por favor haz clic en el siguiente enlace:</p>
        <p style='text-align: center; margin: 30px 0;'>
            <a href='$enlaceRegistro' style='background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
                Activar mi cuenta
            </a>
        </p>
        <p>O copia y pega esta URL en tu navegador:</p>
        <p style='word-break: break-all; color: #3498db;'>$enlaceRegistro</p>
        <p>Si no has solicitado este registro, por favor ignora este mensaje.</p>
        <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
        <p style='font-size: 12px; color: #7f8c8d;'>
            Este es un correo automático, por favor no respondas a este mensaje.
        </p>
    </div>";

// Incluir el script de envío de correo
require_once '../email.php';

// Opcional: mostrar mensaje o redirigir
// echo "Usuario creado correctamente";
