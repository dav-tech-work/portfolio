<?php
// Verificar si se está mostrando el formulario de restablecimiento o el de nueva contraseña
if (isset($_GET['token'])) {
    // Mostrar formulario para establecer nueva contraseña
    ?>
    <div class="reset-password-container">
        <h2>Restablecer Contraseña</h2>
        <form id="formNewPassword" class="form-container">
            <input type="hidden" name="token" value="<?php echo htmlspecialchars($_GET['token']); ?>">
            
            <div class="form-group">
                <label for="nueva_password">Nueva Contraseña:</label>
                <div class="password-input">
                    <input type="password" name="nueva_password" id="nueva_password" required
                           pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                           title="La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial">
                    <button type="button" class="toggle-password" onclick="togglePassword('nueva_password')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <small>Mínimo 8 caracteres, una mayúscula, un número y un carácter especial</small>
            </div>
            
            <div class="form-group">
                <label for="confirmar_password">Confirmar Contraseña:</label>
                <div class="password-input">
                    <input type="password" name="confirmar_password" id="confirmar_password" required>
                    <button type="button" class="toggle-password" onclick="togglePassword('confirmar_password')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <div id="password-match" class="validation-message"></div>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Guardar Nueva Contraseña</button>
            </div>
            
            <div id="form-message" class="mt-3"></div>
        </form>
    </div>
    
    <script>
    // Validar que las contraseñas coincidan
    document.getElementById('confirmar_password').addEventListener('input', function() {
        const password = document.getElementById('nueva_password').value;
        const confirmPassword = this.value;
        const matchDiv = document.getElementById('password-match');
        
        if (password && confirmPassword) {
            if (password !== confirmPassword) {
                matchDiv.textContent = 'Las contraseñas no coinciden';
                matchDiv.className = 'validation-message text-danger';
            } else {
                matchDiv.textContent = 'Las contraseñas coinciden';
                matchDiv.className = 'validation-message text-success';
            }
        } else {
            matchDiv.textContent = '';
        }
    });
    
    // Enviar formulario de nueva contraseña
    document.getElementById('formNewPassword').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const nuevaPassword = formData.get('nueva_password');
        const confirmarPassword = formData.get('confirmar_password');
        
        // Validar que las contraseñas coincidan
        if (nuevaPassword !== confirmarPassword) {
            showMessage('Las contraseñas no coinciden', 'error');
            return;
        }
        
        // Validar fortaleza de la contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(nuevaPassword)) {
            showMessage('La contraseña no cumple con los requisitos de seguridad', 'error');
            return;
        }
        
        // Enviar datos al servidor
        fetch('control/nueva_pass.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage('Contraseña actualizada correctamente. Redirigiendo...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.php?formulario=login';
                }, 2000);
            } else {
                showMessage(data.message || 'Error al actualizar la contraseña', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error al procesar la solicitud', 'error');
        });
    });
    
    function togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const icon = input.nextElementSibling.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
    
    function showMessage(message, type) {
        const messageDiv = document.getElementById('form-message');
        messageDiv.textContent = message;
        messageDiv.className = `alert alert-${type} mt-3`;
    }
    </script>
    <?php
} else {
    // Mostrar formulario para solicitar restablecimiento
    ?>
    <div class="reset-password-container">
        <h2>Restablecer Contraseña</h2>
        <p>Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
        
        <form id="formReset" class="form-container">
            <div class="form-group">
                <label for="email">Correo Electrónico:</label>
                <input type="email" name="email" id="email" required>
                <div id="email-error" class="validation-message"></div>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Enviar Enlace</button>
            </div>
            
            <div class="mt-3 text-center">
                <a href="index.php?formulario=login" class="btn btn-link">Volver al Inicio de Sesión</a>
            </div>
            
            <div id="form-message" class="mt-3"></div>
        </form>
    </div>
    
    <script>
    // Enviar formulario de solicitud de restablecimiento
    document.getElementById('formReset').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const emailError = document.getElementById('email-error');
        
        // Validar formato de correo electrónico
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailError.textContent = 'Por favor, ingresa un correo electrónico válido';
            emailError.className = 'validation-message text-danger';
            return;
        }
        
        emailError.textContent = '';
        emailError.className = 'validation-message';
        
        // Mostrar indicador de carga
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        // Enviar solicitud al servidor
        fetch('control/reset.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `email=${encodeURIComponent(email)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage('Se ha enviado un correo con las instrucciones para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.', 'success');
                document.getElementById('formReset').reset();
            } else {
                showMessage(data.message || 'Error al procesar la solicitud', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error al procesar la solicitud', 'error');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        });
    });
    
    function showMessage(message, type) {
        const messageDiv = document.getElementById('form-message');
        messageDiv.textContent = message;
        messageDiv.className = `alert alert-${type} mt-3`;
    }
    </script>
    <?php
}
?>