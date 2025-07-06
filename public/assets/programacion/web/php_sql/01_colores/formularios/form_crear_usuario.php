
<form name="formNewUser">
<fieldset>
<h2>Creación de cuenta</h2>
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
</div>
<div>
    <label for="password2">Repite la contraseña:</label>
    <!-- Acuerdate de poner el required  -->
    <input type="password" name="password2" id="password2" maxlength="12">
    <p id="errorPassword"></p>
</div>
<div>
    <label for="email">Email:</label>
    <!-- Acuerdate de poner el required  -->
    <input type="email" name="email" id="email" maxlength="100">
    <p id="errorEmail"></p>
</div>
<div>
    <label for="idioma">Idioma:</label>
    <!-- Acuerdate de poner el required  -->
     <select name="idioma" id="idioma">
        <option value="ESP" selected>ESP</option>
        <option value="CAT">CAT</option>
        <option value="ENG">ENG</option>
     </select>
</div>
<div>
    <a href="index.php?formulario=login">Ya tengo cuenta</a>
</div>
<div>
    <button type="submit">Crear Cuenta</button>
  
</div>

</fieldset>

</form>
        </section>