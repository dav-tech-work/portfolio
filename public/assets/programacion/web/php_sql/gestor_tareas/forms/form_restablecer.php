<?php
session_start();
$id = $_SESSION['id_reset'];
if (!$id) {
    header('location: index.php');
    exit();
}
?>
<form name="formRestablecer">
<fieldset>
<h2>Introduce nueva contraseña</h2>
<div>
    <label for="pass1">Nueva Contraseña:</label>
    <!-- Acuerdate de poner el required  -->
    <input type="password" name="pass1" id="pass1" maxlength="12" require>
    <p id="errorPassword1"></p>
</div>
<div>
    <label for="pass2">Repetir Contraseña:</label>
    <!-- Acuerdate de poner el required  -->
    <input type="password" name="pass2" id="pass2" maxlength="12" require>
    <p id="errorPassword2"></p>
</div>

<div>
    <button type="submit">Acceder</button>
    <button type="reset">Borrar Formulario</button>
</div>
</fieldset>
</form>