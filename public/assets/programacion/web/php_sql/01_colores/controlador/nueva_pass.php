<?php
session_start();
require_once "connection.php";
// Verificar que la petición sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die("Método no permitido");
}

// Verificar que el token de sesión existe
if (!isset($_SESSION['reset_token']) || !isset($_SESSION['reset_user_id'])) {
    die("Sesión inválida o expirada");
}

// Obtener la nueva contraseña
$nueva_password = $_POST['nueva_password'] ?? '';

// Validar que la contraseña no esté vacía
if (empty($nueva_password)) {
    die("La contraseña no puede estar vacía");
}

// Validar formato de contraseña (ejemplo: mínimo 8 caracteres)
if (strlen($nueva_password) < 8) {
    die("La contraseña debe tener al menos 8 caracteres");
}

// Incluir archivo de conexión
require_once '../config/database.php';

try {
    // 1. Obtener el token de la base de datos para verificar
    $sql_verificar = "SELECT * FROM tmp_reset 
                     WHERE id_usuario = ? 
                     AND token_reset = ? 
                     AND fecha_restablecer > NOW()";
    
    $stmt_verificar = $conn->prepare($sql_verificar);
    $stmt_verificar->execute([$_SESSION['reset_user_id'], $_SESSION['reset_token']]);
    $token_valido = $stmt_verificar->fetch(PDO::FETCH_ASSOC);

    if (!$token_valido) {
        die("El enlace ha expirado o no es válido");
    }

    // 2. Actualizar la contraseña del usuario en la tabla de usuarios
    $hashed_password = password_hash($nueva_password, PASSWORD_DEFAULT);
    $sql_update = "UPDATE usuarios SET password = ? WHERE id = ?";
    $stmt_update = $conn->prepare($sql_update);
    $stmt_update->execute([$hashed_password, $_SESSION['reset_user_id']]);

    // 3. Eliminar el token de restablecimiento
    $sql_delete = "DELETE FROM tmp_reset WHERE id_usuario = ?";
    $stmt_delete = $conn->prepare($sql_delete);
    $stmt_delete->execute([$_SESSION['reset_user_id']]);

    // 4. Limpiar la sesión
    unset($_SESSION['reset_token']);
    unset($_SESSION['reset_user_id']);
    session_destroy();

    // 5. Enviar respuesta de éxito
    echo "exito";
    
} catch (PDOException $e) {
    // En caso de error, devolver el mensaje de error
    error_log("Error al actualizar la contraseña: " . $e->getMessage());
    echo "Error al actualizar la contraseña. Por favor, inténtalo de nuevo.";
    exit();
}
?>