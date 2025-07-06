
<form name="formReset">
<fieldset>
<h2>Introduce tus datos</h2>
<div>
    <label for="email">Introduce tu email:</label>
    <!-- Acuerdate de poner el required  -->
    <input type="email" name="email" id="email" >
    <p id="errorEmail"></p>
    <?php if(isset($_GET['error'])) : ?>
        <p>Error: email no registrado</p>
    <?php endif; ?>
</div>
<div>
    <a href="index.php?formulario=login">Ya tengo cuenta</a>
<a href="index.php?formulario=crear_cuenta">Crear cuenta</a>
</div>
<div>
    <button type="submit">Acceder</button>
    
</div>

</fieldset>

</form>