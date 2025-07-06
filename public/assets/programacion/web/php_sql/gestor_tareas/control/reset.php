<?php
/**
 * Controlador para el restablecimiento de contraseña
 */

// Incluir archivo de inicialización
require_once __DIR__ . '/../init.php';

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error('Método no permitido', 405);
}

// Verificar si se recibió el correo electrónico
$email = trim($_POST['email'] ?? '');
if (empty($email)) {
    send_error('El correo electrónico es requerido');
}

// Validar formato de correo electrónico
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_error('El formato del correo electrónico no es válido');
}

try {
    // Verificar si el correo existe en la base de datos
    $select = "SELECT id_user, name_user, email_user FROM usuarios WHERE email_user = ? LIMIT 1";
    $select_pre = $conn->prepare($select);
    $select_pre->execute([$email]);
    $usuarioExistente = $select_pre->fetch(PDO::FETCH_ASSOC);

    // Siempre devolver éxito para no revelar si el correo existe o no
    if (!$usuarioExistente) {
        // Simular un retraso para evitar ataques de enumeración
        sleep(2);
        send_success('Si el correo existe, se ha enviado un enlace de recuperación.');
    }

    // Generar token seguro
    $token = bin2hex(random_bytes(64));
    $caducidad = (new DateTime())->add(new DateInterval('PT1H'))->format("Y-m-d H:i:s");

    // Iniciar transacción
    $conn->beginTransaction();

    try {
        // Eliminar cualquier token existente para este usuario
        $delete = "DELETE FROM passreset WHERE id_usuario = ?";
        $delete_prep = $conn->prepare($delete);
        $delete_prep->execute([$usuarioExistente['id_user']]);

        // Insertar el nuevo token
        $insert = "INSERT INTO passreset (id_usuario, token, caducidad) VALUES (:id, :token, :caducidad)";
        $prep = $conn->prepare($insert);
        $prep->execute([
            ':id' => $usuarioExistente['id_user'],
            ':token' => $token,
            ':caducidad' => $caducidad
        ]);

        // Usar la clase EmailSender para enviar el correo
        require_once __DIR__ . '/../email.php';
        
        $result = EmailSender::sendPasswordReset(
            $email,
            $usuarioExistente['name_user'],
            $token
        );

        if (!$result['success']) {
            throw new Exception('Error al enviar el correo de recuperación: ' . ($result['error'] ?? 'Error desconocido'));
        }

        // Confirmar la transacción
        $conn->commit();

        // Registrar el envío exitoso
        error_log(sprintf(
            'Correo de recuperación enviado a %s (Usuario ID: %s)',
            $email,
            $usuarioExistente['id_user']
        ));

        // Responder con éxito
        send_success(
            'Se ha enviado un correo con las instrucciones para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.'
        );

    } catch (Exception $e) {
        // Revertir la transacción en caso de error
        $conn->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    // Registrar el error
    error_log("Error en reset.php: " . $e->getMessage());
    
    // Responder con error
    send_error(
        'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.',
        500
    );
}