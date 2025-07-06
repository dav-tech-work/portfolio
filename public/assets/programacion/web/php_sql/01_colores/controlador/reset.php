<?php
session_start();
require_once 'connection.php';
$token = bin2hex(random_bytes(64));
$email = $_POST['email'];

$select = "SELECT * FROM usuarios WHERE email = ?;";
$select_pre = $conn->prepare($select);
$select_pre->execute(array($email));
$usuarioExistente = $select_pre->fetch();

if (!$usuarioExistente){
    echo "error_1";
    // header('location:index.php');
    exit();
}
$caducidad = new DateTime();
$caducidad->add(new DateInterval('PT1H'));
$caducidad = $caducidad ->format("Y-m-d H:i:s");
$insert = "INSERT INTO passreset (id_usuario, token, caducidad) 
           VALUES (:id, :token, :caducidad)";
$prep = $conn->prepare($insert);
$prep->bindParam(':id', $usuarioExistente['id_usuario'], PDO::PARAM_INT);
$prep->bindParam(':token', $token, PDO::PARAM_STR);
$prep->bindParam(':caducidad', $caducidad, PDO::PARAM_STR);
$prep->execute();

// Datos para el email
// $_SESSION['nombre_usuario'] = $usuarioExistente['nombre'];
// $_SESSION['email'] = $usuarioExistente['email'];
// $_SESSION['ruta'] = "http://localhost:99/restablecer.php?token=$token"; // Aquí genera tu token real
// $_SESSION['tipo_envio'] = 'reset';
$usuario = $usuarioExistente['nombre_usuario'];
$asunto = "Recuperación de contraseña - APP COLORES";
$body = "<p> Apreciad@". $usuario .": </p><br>";
$body .= "<p> Este enlace es necesario para restablecer la contraseña </p><br>";
$body .= "<p> <a href='http://localhost:99/restablecer.php?token=$token'>Restablecimiento de Contraseña</a></p><br>";
$body .= "<p> En caso de no haber solidicitado el restablecimiento de contraseña, ignore este correo. </p><br>";

// Llamada al script de correo
// require_once 'email.php';  
include '../email.php';
