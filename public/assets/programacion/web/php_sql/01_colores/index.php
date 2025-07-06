<?php
session_start(); // -> $_SESSION
$_SESSION['token'] = bin2hex(random_bytes(64));
$num_ramdom = random_int(0,9);
$imagenes = [
    ['src'=>'colores.webp','alt'=> 'colores'],
    ['src'=>'color1.webp','alt'=> 'color1'],
    ['src'=>'color2.jpg','alt'=> 'color2'],
    ['src'=>'color3.jpg','alt'=> 'color3'],
    ['src'=>'color4.jpeg','alt'=> 'color4'],
    ['src'=>'color5.jpg','alt'=> 'color5'],
    ['src'=>'color6.jfif','alt'=> 'color6'],
    ['src'=>'color7.webp','alt'=> 'color7'],
    ['src'=>'color8.jfif','alt'=> 'color8'],
    ['src'=>'color9.jpg','alt'=> 'color9']
];

// include 'connection.php';
// require 'connection.php';
// include_once 'connection.php';

// Llamar a la conexión una vez
require_once 'controlador/connection.php';


?>

<!DOCTYPE html>
<html lang="es">

<head>
<?php include_once 'modulos/meta.php';?>
    <title>Colores</title>
      
</head>

<body>
<?php include_once 'modulos/header.php';?>
    <main class="main-index">
        <section>
            <img src="img/<?=$imagenes[$num_ramdom]['src']?>" alt="<?=$imagenes[$num_ramdom]['alt']?>">
        </section>
        <section >
<?php
$formulario = $_GET['formulario'] ?? 'login';

switch ($formulario) {
    case "login":
        include_once 'formularios/form_login.php';
        break;
    case "crear_cuenta":
        include_once 'formularios/form_crear_usuario.php';
        break;
    case "reset":
        include_once 'formularios/form_reset_password.php';
        break;
    case "restablecer":
        include_once 'formularios/form_restablecer.php';
        break;
    case "revisar":
        include_once 'formularios/revisar_correo.php';
        break;
}

?>
           
        </section>
    </main>

    <script src="js/index.js"></script>
</body>

</html>
<?php
