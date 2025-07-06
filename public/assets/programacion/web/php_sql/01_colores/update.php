<?php

// Llamar a la conexión una vez
require_once 'controlador/connection.php';
require_once 'traduccion_colores.php';


print_r($_POST);
$usuario = $_POST['usuario'];
$color_es = strtolower($_POST['color']);
$color_en = $array_colores_es_en[$color_es] ?? $color_es;
$id_color = $_POST['id_color'];


// 1. Definir la sentencia preparada
$update = "update colores set usuario = ?, color_es = ?, color_en = ? WHERE id_color = ?;";
// 2. Preparación
$update_pre = $conn->prepare($update);
// 3. Ejecución
$update_pre->execute([$usuario, $color_es, $color_en, $id_color]);

$update_pre = null;
$conn = null;

// Volver a casa -> index.php
header('location: colores.php');

