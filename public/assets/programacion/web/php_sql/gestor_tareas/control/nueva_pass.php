<?php
// Iniciar la sesión
session_start();

// Incluir archivos necesarios
require_once 'connection.php';
require_once 'json_response.php';

// Verificar que la petición sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error('Método no permitido', 405);
}

// Verificar que se recibieron los datos necesarios
$requiredFields = ['nueva_password', 'confirmar_password'];
$errors = validate_required_fields($requiredFields, $_POST);

if (!empty($errors)) {
    send_error(implode(' ', $errors), 400);
}

// Obtener y limpiar las contraseñas
$nueva_password = trim($_POST['nueva_password']);
$confirmar_password = trim($_POST['confirmar_password']);

// Validar que las contraseñas coincidan
if ($nueva_password !== $confirmar_password) {
    send_error('Las contraseñas no coinciden', 400);
}

// Validar la fortaleza de la contraseña
$passwordValidation = validate_password_strength($nueva_password);
if (!$passwordValidation['valid']) {
    send_error($passwordValidation['message'], 400);
}

try {
    // Verificar que el token existe y es válido
    if (!isset($_SESSION['reset_token']) || !isset($_SESSION['reset_user_id'])) {
        send_error(
            'Sesión inválida o expirada. Por favor, solicita un nuevo enlace de restablecimiento.',
            401
        );
    }
    
    $select = "SELECT pr.* FROM passreset pr 
               WHERE pr.id_usuario = :id_usuario 
               AND pr.token = :token 
               AND pr.caducidad > NOW()";
    
    $stmt = $conn->prepare($select);
    $stmt->bindParam(':id_usuario', $_SESSION['reset_user_id'], PDO::PARAM_INT);
    $stmt->bindParam(':token', $_SESSION['reset_token'], PDO::PARAM_STR);
    $stmt->execute();
    $token_valido = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$token_valido) {
        // Limpiar la sesión
        unset($_SESSION['reset_token']);
        unset($_SESSION['reset_user_id']);
        unset($_SESSION['reset_email']);
        
        send_error(
            'El enlace ha expirado o no es válido. Por favor, solicita uno nuevo.',
            401
        );
    }

    // Iniciar transacción
    $conn->beginTransaction();

    try {
        // Actualizar la contraseña del usuario
        $hashed_password = password_hash($nueva_password, PASSWORD_DEFAULT);
        $sql_update = "UPDATE usuarios SET password_user = :password WHERE id_user = :id";
        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->bindParam(':password', $hashed_password, PDO::PARAM_STR);
        $stmt_update->bindParam(':id', $_SESSION['reset_user_id'], PDO::PARAM_INT);
        $stmt_update->execute();

        // Eliminar el token de restablecimiento
        $sql_delete = "DELETE FROM passreset WHERE id_usuario = :id";
        $stmt_delete = $conn->prepare($sql_delete);
        $stmt_delete->bindParam(':id', $_SESSION['reset_user_id'], PDO::PARAM_INT);
        $stmt_delete->execute();

        // Confirmar la transacción
        $conn->commit();

        // Limpiar la sesión
        unset($_SESSION['reset_token']);
        unset($_SESSION['reset_user_id']);
        unset($_SESSION['reset_email']);
        session_destroy();

        // Enviar respuesta de éxito
        send_success(
            'Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...',
            ['redirect' => 'index.php?formulario=login']
        );
        
    } catch (Exception $e) {
        // Revertir la transacción en caso de error
        $conn->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    // Registrar el error
    error_log("Error en nueva_pass.php: " . $e->getMessage());
    
    // Enviar respuesta de error
    send_error(
        'Ocurrió un error al actualizar la contraseña. Por favor, inténtalo de nuevo más tarde.',
        500
    );
}
?>