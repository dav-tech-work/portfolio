<?php
/**
 * Página para restablecer la contraseña
 */

// Incluir archivo de inicialización
require_once __DIR__ . '/init.php';

// Verificar si el token existe en la URL
$token = trim($_GET['token'] ?? '');
if (empty($token)) {
    $_SESSION['flash_messages'][] = [
        'type' => 'error',
        'text' => 'Token de restablecimiento no proporcionado.'
    ];
    header('Location: index.php');
    exit();
}

try {
    // Iniciar transacción para asegurar la integridad de los datos
    $conn->beginTransaction();
    
    // Consulta preparada para verificar el token
    $select = "SELECT pr.*, u.email_user, u.name_user, u.id_user 
               FROM passreset pr 
               JOIN usuarios u ON pr.id_usuario = u.id_user 
               WHERE pr.token = :token
               LIMIT 1";
    
    $select_pre = $conn->prepare($select);
    $select_pre->bindParam(':token', $token, PDO::PARAM_STR);
    $select_pre->execute();
    $tokenExistente = $select_pre->fetch(PDO::FETCH_ASSOC);

    // Verificar si se encontró el token
    if (!$tokenExistente) {
        $conn->rollBack();
        
        $_SESSION['flash_messages'][] = [
            'type' => 'error',
            'text' => 'El enlace de restablecimiento no es válido o ha expirado.'
        ];
        header('Location: index.php');
        exit();
    }

    // Verificar si el token ha caducado
    $caducidad = new DateTime($tokenExistente['caducidad']);
    $ahora = new DateTime();
    
    if ($caducidad < $ahora) {
        // Eliminar el token caducado
        $delete = "DELETE FROM passreset WHERE token = :token";
        $delete_prep = $conn->prepare($delete);
        $delete_prep->execute([':token' => $token]);
        $conn->commit();
        
        $_SESSION['flash_messages'][] = [
            'type' => 'error',
            'text' => 'El enlace de restablecimiento ha expirado. Por favor, solicita uno nuevo.'
        ];
        header('Location: index.php?formulario=login');
        exit();
    }
    
    // Confirmar la transacción ya que todo está bien
    $conn->commit();
    
    // Token válido, guardar información en sesión
    $_SESSION['reset_token'] = $token;
    $_SESSION['reset_user_id'] = $tokenExistente['id_usuario'];
    $_SESSION['reset_email'] = $tokenExistente['email_user'];
    
    // Redirigir al formulario de restablecimiento con el token en la URL
    $redirectUrl = 'index.php?formulario=nueva_contraseña&token=' . urlencode($token);
    header('Location: ' . $redirectUrl);
    exit();
    
} catch (PDOException $e) {
    // Revertir la transacción en caso de error
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    
    // Registrar el error en el log
    error_log("Error en restablecer.php (PDO): " . $e->getMessage());
    
    // Preparar mensaje de error
    $errorMessage = 'Ocurrió un error al procesar su solicitud. Por favor, inténtelo de nuevo más tarde.';
    
    // Si estamos en modo depuración, mostrar más detalles
    if (defined('APP_DEBUG') && APP_DEBUG) {
        $errorMessage .= ' Detalles: ' . $e->getMessage();
    }
    
    // Si es una solicitud AJAX, devolver un JSON con el error
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $errorMessage
        ]);
        exit();
    }
    
    // Para solicitudes normales, redirigir con mensaje de error
    $_SESSION['flash_messages'][] = [
        'type' => 'error',
        'text' => $errorMessage
    ];
    header('Location: index.php?formulario=login');
    exit();
    
} catch (Exception $e) {
    // Revertir la transacción en caso de error
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    
    // Registrar el error en el log
    error_log("Error en restablecer.php: " . $e->getMessage());
    
    // Preparar mensaje de error
    $errorMessage = 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.';
    
    // Si estamos en modo depuración, mostrar más detalles
    if (defined('APP_DEBUG') && APP_DEBUG) {
        $errorMessage .= ' Detalles: ' . $e->getMessage();
    }
    
    // Si es una solicitud AJAX, devolver un JSON con el error
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $errorMessage
        ]);
        exit();
    }
    
    // Para solicitudes normales, redirigir con mensaje de error
    $_SESSION['flash_messages'][] = [
        'type' => 'error',
        'text' => $errorMessage
    ];
    header('Location: index.php?formulario=login');
    exit();
} finally {
    // Cerrar conexión
    try {
        if (isset($conn) && $conn) {
            $conn = null;
        }
    } catch (Exception $e) {
        error_log("Error al cerrar la conexión en restablecer.php: " . $e->getMessage());
    }
}
?>