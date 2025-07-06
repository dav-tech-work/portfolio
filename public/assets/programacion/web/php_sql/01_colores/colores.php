<?php

error_reporting(0);
session_start(); // -> $_SESSION
$_SESSION['token'] = bin2hex(random_bytes(64));
// print_r($_SESSION);
if (!isset($_SESSION['id_usuario'])) {
    header('location: index.php');
}


// include 'connection.php';
// require 'connection.php';
// include_once 'connection.php';

// Llamar a la conexión una vez
require_once 'controlador/connection.php';

$array_fondo_claro = [
    "white",
    "yellow",
    "pink",
    "darksalmon",
    "orange"
];

// 1. Definir la sentencia (query)
$select = "SELECT * FROM colores WHERE id_usuario = ?;";
// 2. Preparación
$select_pre = $conn->prepare($select);
// 3. Ejecución
$select_pre->execute(array($_SESSION['id_usuario']));
// 4. Obtención de los valores
$array_filas = $select_pre->fetchAll();

// foreach ($array_filas as $fila) {
//     echo "<pre>";
//     print_r ($fila);
//     echo "</pre>";
// }

?>

<!DOCTYPE html>
<html lang="es">

<head>
<?php include_once 'modulos/meta.php';?>
    <title>Colores</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="css/style.css">
</head>

<body>
<?php include_once 'modulos/header.php';?>
    <main>
        <section>
            <h2>Nuestros amigos</h2>

            <?php foreach ($array_filas as $fila) : ?>
                <?php $color = "white";
                if (in_array($fila['color_en'], $array_fondo_claro)) {
                    $color = "black";
                }
                ?>
                <div style="background-color: <?= $fila['color_en'] ?>;color:<?= $color ?>;">
                    <p> <?= htmlspecialchars($fila['usuario'], ENT_QUOTES, "UTF-8")   ?> </p>
                    <span class="icons">
                        <a href="colores.php?id=<?= $fila['id_color'] ?>&usuario=<?= $fila['usuario'] ?>&color=<?= $fila['color_es'] ?>" title="Modificar valores">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </a>
                        <form action="delete.php" method="$_POST">
                            <input type="hidden" name="quitar" id="quitar" value="<?= $fila['id_color'] ?>">
                            <button><i class="fa-solid fa-trash-can"></i></button>
                        <!-- <a href="delete.php?id=<?= $fila['id_color'] ?>" title="Eliminar elemento"> -->
                            
                        </a>
                        </form>
                    </span>
                </div>

            <?php endforeach ?>
        </section>
        <section >

            <?php if ($_GET) : ?>
                <!-- Formulario para actualizar los datos -->
                <h2>Modifica tus datos</h2>
                <form action="update.php" method="post" class="formColores">
                    <input type="hidden" name="id_color" value="<?= $_GET['id'] ?>">
                    <fieldset>
                        <div>
                            <label for="usuario">Nombre del usuario</label>
                            <input type="text" id="usuario" name="usuario" value="<?= $_GET['usuario'] ?>" maxlength="50">
                        </div>
                        <div>
                            <label for="color">Nombre del color:</label>
                            <input type="text" id="color" name="color" value="<?= $_GET['color'] ?>" maxlength="25">
                        </div>
                        <div>
                            <button type="submit">Enviar datos</button>
                            <button type="reset">Borrar formulario</button> 
                        </div>
                    </fieldset>

                </form>

            <?php else : ?>
                <!-- Formulario para insertar los datos -->

                <h2>Pon aquí tus datos</h2>
                <!-- Linea comentada para que los datos no vayan directamente a insert.php  -->
                <!-- <form action="insert.php" method="post"> -->
                    <form name="formInsert" class="formColores">
<input type="hidden" name="id_usuario" value="<?= $_SESSION['id_usuario'] ?>">
                    <input type="hidden" name="token" value="<?= $_SESSION['token'] ?>">
                    <input type="text" name="web" style="display:none">
                    <fieldset>
                        <div>
                            <label for="usuario">Nombre del usuario</label>
                            <input type="text" id="usuario" name="usuario">
                            <p id="errorUsuario"></p>
                        </div>
                        <div>
                            <label for="color">Nombre del color:</label>
                            <input type="text" id="color" name="color">
                            <p id="errorColor"></p>
                        </div>
                        <div>
                            <button type="submit">Enviar datos</button>
                            <button type="reset">Limpiar formulario</button>
                        </div>
                    </fieldset>

                </form>

            <?php endif ?>



                <?php if ($_SESSION['error']) : ?>
                    <p>Se ha producido un error</p>
                <?php endif; ?>

        </section>
    </main>

    <script src="js/colores.js"></script>
</body>

</html>
<?php
$_SESSION['error'] = false;