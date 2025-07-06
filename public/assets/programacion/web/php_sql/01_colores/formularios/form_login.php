
<form name="formLogin">
<fieldset>
<h2>Introduce tus datos</h2>
<div>
    <label for="nombre">Nombre:</label>
    <!-- Acuerdate de poner el required  -->
    <input type="text" name="nombre" id="nombre" >
    <p id="errorUsuario"></p>
</div>
<div>
    <label for="password">Contraseña:</label>
    <!-- Acuerdate de poner el required  -->
    <input type="password" name="password" id="password" maxlength="12">
    <p id="errorPassword"></p>
</div>
<div>
       
<a href="index.php?formulario=crear_cuenta">Crear cuenta</a>
 <a href="index.php?formulario=reset">No recuerdo la contraseña</a>
</div>

<div>
    <button type="submit">Acceder</button>
   
</div>

</fieldset>

</form>