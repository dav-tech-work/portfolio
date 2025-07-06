<?php
session_start();
// Llamar a la conexión una vez
require_once 'controlador/connection.php';
require_once 'traduccion_colores.php';

// $_POST
    // echo "<pre>";
    // print_r ($_POST);
    // echo "</pre>";

$usuario = $_POST['usuario'];
$usuario = htmlspecialchars($usuario, ENT_QUOTES, "UTF-8");
$color = htmlspecialchars($_POST['color']);


$usuario = trim($usuario);
$color = trim($color);

// Vigila si un bot intenta acceder
if ( !empty($_POST['web'])  ) {
    $_SESSION['error'] = true;
    header('location: index.php');
    exit();
}

// Par impedir el acceso directo a isert.php
if (!hash_equals($_SESSION['token'], $_POST['token'])) {
    $_SESSION['error'] = true;
    header('location: index.php');
    exit();
}

if ( empty($usuario) || empty($color)) {
    $_SESSION['error'] = true;
    header('location: index.php');
    exit();
}

// Para convertir el color a minúsculas
$color_es = strtolower($color);
$color_en = $array_colores_es_en[$color_es] ?? $color_es;
// Traducir el color a inglés
$encontrado = false;
foreach ($array_colores_es_en as $clave => $valor) {
    if ($clave == $color_es) {
        $encontrado = true;
        break;
    }
}
if (!$encontrado) {
    $color_es = "blanco";
}


// 1. Definir la sentencia preparada
$insert = "INSERT INTO colores(usuario, color_es, color_en, id_usuario) VALUES (?, ?, ?, ?);";
// 2. Preparación
$insert_pre = $conn->prepare($insert);
// 3. Ejecución
$insert_pre->execute([$usuario, $color_es, $color_en, $_POST['id_usuario']]);

$insert_pre = null;
$conn = null;

echo "Preferencias grabadas";
// Volver a casa -> index.php
header('location: index.php');

