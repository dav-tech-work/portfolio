<?php

require_once 'controlador/connection.php';
$token = $_GET['token'];
// 1. Verificar si el token existe en la URL
if (!$token) {
    header('location: index.php');
    $conn = null;
    exit();
}
// 2. Verificar la conexión a la base de datos
if (!$conn) {
    die("Error de conexión a la base de datos");
}

// 3. Consulta preparada
$select = "SELECT * FROM passreset WHERE token = :token";
$select_pre = $conn->prepare($select);
$select_pre->bindParam(':token', $token, PDO::PARAM_STR);
$select_pre->execute();
$tokenExistente = $select_pre->fetch(PDO::FETCH_ASSOC);

// 4. Verificar si se encontró el token
if (!$tokenExistente) {
    // Token no encontrado o inválido
    header('location: index.php');
    exit();
}

// 5. Verificar si el token ha caducado
// La caducidad se establece en 1 hora desde la creación del token
$caducidad = $tokenExistente['caducidad']; 
$ahora = new DateTime();
$ahora = $ahora->format("Y-m-d H:i:s"); // Formato de la fecha y hora actual
// Se compara la fecha de caducidad con la fecha y hora actual
// Si la fecha de caducidad es menor que la fecha y hora actual 
// significa que el token ha caducado
if ($caducidad < $ahora) {
    // Token caducado
    header('location: index.php');
    exit();
}
$_SESSION['id_reset'] = $tokenExistente['id_usuario'];
// 6. Redirigir al formulario
header('location: index.php?formulario=restablecer');
$conn = null;
exit();
?>