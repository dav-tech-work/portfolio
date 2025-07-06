<?php
require_once 'controlador/connection.php';
// Token que recibimos con la respuesta del usuario y es igual al token de la tabla temporal
$token_url = $_GET['registro'];

// Comparacion con el token de la tabla temporal
// 1. Definir la sentencia (query)
$select = "SELECT * FROM temporal WHERE token_registro = ?;";

$select_pre = $conn->prepare($select);
// 3. Ejecución
$select_pre->execute(array($token_url));
// 4. Obtención de los valores
$array_filas = $select_pre->fetch();
if (!$array_filas){
    header('location:index.php');
}

$insert = "INSERT INTO usuarios (nombre_usuario, password_usuario, email, idioma) VALUES (:nombre, :pass, :email, :idioma);";
// 2. Preparación
$prep = $conn->prepare($insert);
// 3. Parametrizar los valores
$prep -> bindParam(':nombre', $array_filas['nombre_usuario'], PDO::PARAM_STR);
$prep -> bindParam(':pass', $array_filas['password_usuario'], PDO::PARAM_STR);
$prep -> bindParam(':email', $array_filas['email'], PDO::PARAM_STR);
$prep -> bindParam(':idioma', $array_filas['idioma'], PDO::PARAM_STR);
$prep->execute();

// 1. Definir la sentencia preparada
$delete = "DELETE FROM temporal WHERE token_registro = ?;";
// 2. Preparación
$delete_pre = $conn->prepare($delete);
// 3. Ejecución
$delete_pre->execute([$token_url]);

$delete_pre = null;
$conn = null;

// Volver a casa -> index.php
header('location: colores.php');


