<?php
/**
 * Función para enviar una respuesta JSON consistente
 * 
 * @param bool $success Indica si la operación fue exitosa
 * @param string $message Mensaje descriptivo del resultado
 * @param array $data Datos adicionales a incluir en la respuesta
 * @param int $statusCode Código de estado HTTP
 * @return void
 */
function send_json_response($success, $message = '', $data = [], $statusCode = 200) {
    // Establecer el código de estado HTTP
    http_response_code($statusCode);
    
    // Establecer el encabezado Content-Type
    header('Content-Type: application/json');
    
    // Construir la respuesta
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    // Agregar datos adicionales si los hay
    if (!empty($data)) {
        $response['data'] = $data;
    }
    
    // Enviar la respuesta JSON
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Función para enviar una respuesta de error
 * 
 * @param string $message Mensaje de error
 * @param int $statusCode Código de estado HTTP (por defecto 400)
 * @param array $data Datos adicionales
 * @return void
 */
function send_error($message, $statusCode = 400, $data = []) {
    send_json_response(false, $message, $data, $statusCode);
}

/**
 * Función para enviar una respuesta de éxito
 * 
 * @param string $message Mensaje de éxito
 * @param array $data Datos adicionales
 * @param int $statusCode Código de estado HTTP (por defecto 200)
 * @return void
 */
function send_success($message = 'Operación exitosa', $data = [], $statusCode = 200) {
    send_json_response(true, $message, $data, $statusCode);
}

/**
 * Función para validar campos requeridos en una solicitud
 * 
 * @param array $requiredFields Campos requeridos
 * @param array $requestData Datos de la solicitud
 * @return array|void Array de errores si hay campos faltantes, o nada si todo está bien
 */
function validate_required_fields($requiredFields, $requestData) {
    $errors = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($requestData[$field]) || trim($requestData[$field]) === '') {
            $errors[] = "El campo '$field' es requerido.";
        }
    }
    
    return $errors;
}

/**
 * Función para validar el formato de un correo electrónico
 * 
 * @param string $email Correo electrónico a validar
 * @return bool True si el formato es válido, false en caso contrario
 */
function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Función para validar la fortaleza de una contraseña
 * 
 * @param string $password Contraseña a validar
 * @return array Array con 'valid' (bool) y 'message' (string)
 */
function validate_password_strength($password) {
    if (strlen($password) < 8) {
        return ['valid' => false, 'message' => 'La contraseña debe tener al menos 8 caracteres'];
    }
    
    if (!preg_match('/[A-Z]/', $password)) {
        return ['valid' => false, 'message' => 'La contraseña debe contener al menos una letra mayúscula'];
    }
    
    if (!preg_match('/[0-9]/', $password)) {
        return ['valid' => false, 'message' => 'La contraseña debe contener al menos un número'];
    }
    
    if (!preg_match('/[^A-Za-z0-9]/', $password)) {
        return ['valid' => false, 'message' => 'La contraseña debe contener al menos un carácter especial'];
    }
    
    return ['valid' => true, 'message' => 'Contraseña válida'];
}
?>
