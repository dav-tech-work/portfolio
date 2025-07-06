<?php
require_once __DIR__ . '/vendor/autoload.php';

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

// Guardar datos en sesión para enviar el correo
$usuario = $_POST['nombre'];
$asunto = "Creacion cuenta en la aplicación - APP COLORES";
$body = "<p> Apreciad@ ". $usuario .": </p><br>";
$body .= "<p> Este enlace es necesario para finalizar la creacion de su usuario en la APP COLORES </p><br>";
$body .= "<p> <a href='http://localhost:99/registro.php?registro=$token'>Creacion Usuario</a></p><br>";
$body .= "<p> En caso de no haber solicitado la creación, ignore este correo. </p><br>";

// Llamar al script de envío de email
require_once __DIR__ . '/../email.php';

// Opcional: mostrar mensaje o redirigir
// echo "Usuario creado correctamente";
