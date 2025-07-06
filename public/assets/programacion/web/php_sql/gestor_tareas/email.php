<?php
/**
 * Clase para el envío de correos electrónicos
 */

// Incluir archivo de inicialización
require_once __DIR__ . '/init.php';

// Importar clases de PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailSender {
    /**
     * Envía un correo electrónico
     * 
     * @param string $toEmail Dirección de correo del destinatario
     * @param string $toName Nombre del destinatario
     * @param string $subject Asunto del correo
     * @param string $htmlBody Cuerpo del correo en formato HTML
     * @param string $altBody Cuerpo alternativo en texto plano (opcional)
     * @param array $attachments Array de archivos adjuntos (opcional)
     * @return array Array con el resultado de la operación
     */
    public static function send(
        string $toEmail, 
        string $toName, 
        string $subject, 
        string $htmlBody, 
        string $altBody = '',
        array $attachments = []
    ): array {
        // Validar parámetros requeridos
        $requiredParams = [
            'toEmail' => $toEmail,
            'toName' => $toName,
            'subject' => $subject,
            'htmlBody' => $htmlBody
        ];
        
        $missingParams = [];
        foreach ($requiredParams as $param => $value) {
            if (empty(trim($value))) {
                $missingParams[] = $param;
            }
        }
        
        if (!empty($missingParams)) {
            error_log('Error en EmailSender::send - Parámetros faltantes: ' . implode(', ', $missingParams));
            return [
                'success' => false,
                'message' => 'Faltan parámetros requeridos: ' . implode(', ', $missingParams)
            ];
        }
        
        // Crear instancia de PHPMailer
        $mail = new PHPMailer(true);
        
        try {
            // Configuración del servidor SMTP
            $mail->isSMTP();
            $mail->Host = MAIL_HOST;
            $mail->SMTPAuth = true;
            $mail->Username = MAIL_USERNAME;
            $mail->Password = MAIL_PASSWORD;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = MAIL_PORT;
            $mail->CharSet = 'UTF-8';
            
            // Configuración de depuración
            if (APP_DEBUG) {
                $mail->SMTPDebug = 2; // SMTP::DEBUG_SERVER
                $mail->Debugoutput = function($str, $level) {
                    error_log("PHPMailer: $str");
                };
            } else {
                $mail->SMTPDebug = 0;
            }
            
            // Remitente
            $mail->setFrom(MAIL_FROM_EMAIL, MAIL_FROM_NAME);
            
            // Destinatario
            $mail->addAddress($toEmail, $toName);
            
            // Responder a
            $mail->addReplyTo(MAIL_FROM_EMAIL, MAIL_FROM_NAME);
            
            // Archivos adjuntos
            if (!empty($attachments)) {
                foreach ($attachments as $attachment) {
                    if (is_array($attachment)) {
                        $mail->addAttachment($attachment['path'], $attachment['name'] ?? '');
                    } else {
                        $mail->addAttachment($attachment);
                    }
                }
            }
            
            // Contenido del correo
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            $mail->AltBody = !empty($altBody) ? $altBody : strip_tags($htmlBody);
            
            // Enviar el correo
            $mail->send();
            
            return [
                'success' => true,
                'message' => 'Correo enviado correctamente',
                'to' => $toEmail,
                'subject' => $subject
            ];
            
        } catch (Exception $e) {
            $errorMsg = "Error al enviar el correo: {$mail->ErrorInfo}";
            error_log($errorMsg);
            
            return [
                'success' => false,
                'message' => 'Error al enviar el correo electrónico',
                'error' => APP_DEBUG ? $mail->ErrorInfo : 'Por favor, inténtelo de nuevo más tarde.',
                'error_code' => $e->getCode(),
                'to' => $toEmail,
                'subject' => $subject
            ];
        }
    }
    
    /**
     * Envía un correo de restablecimiento de contraseña
     * 
     * @param string $email Correo electrónico del destinatario
     * @param string $nombre Nombre del destinatario
     * @param string $token Token de restablecimiento
     * @return array Resultado de la operación
     */
    public static function sendPasswordReset(string $email, string $nombre, string $token): array {
        $resetUrl = base_url("restablecer.php?token=" . urlencode($token));
        $asunto = "Restablecer contraseña - " . APP_NAME;
        
        // Cargar la plantilla de correo
        $templatePath = TEMPLATES_PATH . 'email_reset_password.html';
        if (!file_exists($templatePath)) {
            return [
                'success' => false,
                'message' => 'No se pudo cargar la plantilla de correo'
            ];
        }
        
        $cuerpo = file_get_contents($templatePath);
        
        // Reemplazar marcadores de posición
        $replacements = [
            '{{usuario}}' => htmlspecialchars($nombre),
            '{{enlace_recuperacion}}' => $resetUrl,
            '{{anio_actual}}' => date('Y')
        ];
        
        foreach ($replacements as $key => $value) {
            $cuerpo = str_replace($key, $value, $cuerpo);
        }
        
        // Texto alternativo
        $altBody = "Hola $nombre,\n\n";
        $altBody .= "Has solicitado restablecer tu contraseña en " . APP_NAME . ".\n\n";
        $altBody .= "Para continuar con el proceso, haz clic en el siguiente enlace:\n";
        $altBody .= "$resetUrl\n\n";
        $altBody .= "Si no has solicitado este cambio, puedes ignorar este mensaje.\n\n";
        $altBody .= "Este enlace es válido por 1 hora.\n\n";
        $altBody .= "Saludos,\n";
        $altBody .= "El equipo de " . APP_NAME . "\n";
        
        // Enviar el correo
        return self::send($email, $nombre, $asunto, $cuerpo, $altBody);
    }
}

// Si se ejecuta directamente, devolver error
if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME'])) {
    header('Content-Type: application/json');
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Acceso denegado'
    ]);
    exit();
}
