<?php
session_start();
// Llamar a la conexión una vez
require_once 'connection.php';

$verificarNombre = isset($_POST['nombre']) && $_POST['nombre'];
$verificarPassword = isset($_POST['password']) && $_POST['password'];

if (!$verificarNombre || !$verificarPassword) {
    echo "Error en los valores";
    die();
}

// Quitar los espacios
$nombre = trim($_POST['nombre']);
$password = trim($_POST['password']);

// Comprobar que no estén vacíos
if (empty($nombre) || empty($password)) {
    echo "Error en los valores";
    die();
}

$nombre = htmlspecialchars($nombre, ENT_QUOTES, "UTF-8");
$password = htmlspecialchars($password, ENT_QUOTES, "UTF-8"); 

// Comprobar si existe el usuario
$select = "SELECT * FROM usuarios WHERE nombre_usuario = :nombre";
$prep = $conn->prepare($select);
$prep->bindParam(":nombre", $nombre, PDO::PARAM_STR);
$prep->execute();

$UsuarioExistente = $prep->fetch(PDO::FETCH_ASSOC);

if (!$UsuarioExistente) {
    echo "UsuarioInexistente";
    die();
}
if (!password_verify($password, $UsuarioExistente['password_usuario'])) {
    echo "PasswordIncorrecto";
    die();
}

$_SESSION['usuario'] = $UsuarioExistente['nombre_usuario'];
$_SESSION['id_usuario'] = $UsuarioExistente['id_usuario'];
// echo "Usuario identificado";

