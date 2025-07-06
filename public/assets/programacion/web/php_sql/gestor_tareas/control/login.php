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
$select = "SELECT * FROM usuarios WHERE name_user = :nombre";
$prep = $conn->prepare($select);
$prep->bindParam(":nombre", $nombre, PDO::PARAM_STR);
$prep->execute();

$UsuarioExistente = $prep->fetch(PDO::FETCH_ASSOC);

if (!$UsuarioExistente) {
    echo "UsuarioInexistente";
    die();
}
if (!password_verify($password, $UsuarioExistente['password_user'])) {
    echo "PasswordIncorrecto";
    die();
}

// Iniciar sesión
$_SESSION['usuario'] = $UsuarioExistente['name_user'];
$_SESSION['id_user'] = $UsuarioExistente['id_user'];
$_SESSION['idioma'] = $UsuarioExistente['lenguage_user'] ?? 'ESP';
// echo "Usuario identificado";

