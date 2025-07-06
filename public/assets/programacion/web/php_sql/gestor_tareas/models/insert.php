<?php
/**
 * Task Insert Controller
 *
 * Este archivo maneja la inserción de nuevas tareas en la base de datos.
 * Recibe datos del formulario y los procesa de manera segura.
 */

session_start();
// Llamar a la conexión una vez
require_once 'control/connection.php';

// Verificar si el usuario está autenticado
if (!isset($_SESSION['id_usuario'])) {
    $_SESSION['error'] = true;
    header('location: index.php');
    exit();
}

// Sanitizar y validar entrada de datos
$name_task = $_POST['name_task'] ?? '';
$description_task = $_POST['description_task'] ?? '';
$start_task = $_POST['start_task'] ?? '';
$end_task = $_POST['end_task'] ?? '';
$priority_task = $_POST['priority_task'] ?? 'Media';
$status_task = $_POST['status_task'] ?? 'Pendiente';

// Aplicar sanitización a los campos de texto
$name_task = htmlspecialchars(trim($name_task), ENT_QUOTES, "UTF-8");
$description_task = htmlspecialchars(trim($description_task), ENT_QUOTES, "UTF-8");

// Vigila si un bot intenta acceder
if (!empty($_POST['web'])) {
    $_SESSION['error'] = true;
    header('location: index.php');
    exit();
}

// Para impedir el acceso directo a insert.php
if (!isset($_SESSION['token']) || !isset($_POST['token']) || !hash_equals($_SESSION['token'], $_POST['token'])) {
    $_SESSION['error'] = true;
    header('location: index.php');
    exit();
}

// Verificar que los campos obligatorios estén completos
if (empty($name_task) || empty($start_task) || empty($end_task)) {
    $_SESSION['error'] = true;
    header('location: index.php');
    exit();
}

// Validar fechas
$start_date = new DateTime($start_task);
$end_date = new DateTime($end_task);

if ($start_date > $end_date) {
    $_SESSION['error'] = true;
    $_SESSION['error_message'] = "La fecha de inicio debe ser anterior o igual a la fecha de fin";
    header('location: index.php');
    exit();
}

// Validar estado
$valid_status = ['Pendiente', 'En Proceso', 'Completa'];
if (!in_array($status_task, $valid_status)) {
    $status_task = 'Pendiente'; // Establecer valor predeterminado si no es válido
}

// Validar prioridad
$valid_priority = ['Baja', 'Media', 'Alta'];
if (!in_array($priority_task, $valid_priority)) {
    $priority_task = 'Media'; // Establecer valor predeterminado si no es válido
}

try {
    // 1. Definir la sentencia preparada
    $insert = "INSERT INTO tareas (
        name_task,
        description_task,
        start_task,
        end_task,
        priority_task,
        status_task,
        id_user
    ) VALUES (?, ?, ?, ?, ?, ?, ?);";

    // 2. Preparación
    $insert_pre = $conn->prepare($insert);

    // 3. Ejecución
    $result = $insert_pre->execute([
        $name_task,
        $description_task,
        $start_task,
        $end_task,
        $priority_task,
        $status_task,
        $_SESSION['id_usuario']
    ]);

    if (!$result) {
        throw new PDOException("Error al insertar la tarea");
    }

    // Limpiar recursos
    $insert_pre = null;
    $conn = null;

    // Mensaje de éxito
    $_SESSION['success'] = true;
    $_SESSION['success_message'] = "Tarea guardada correctamente";

    // Redireccionar a la página principal de tareas
    header('location: models/tareas.php');
    exit();
} catch (PDOException $e) {
    // Registrar el error (podría ser en un archivo de log)
    error_log("Error al insertar tarea: " . $e->getMessage());

    // Establecer mensaje de error
    $_SESSION['error'] = true;
    $_SESSION['error_message'] = "Error al guardar la tarea. Por favor, inténtalo de nuevo.";

    // Limpiar recursos
    if (isset($insert_pre)) $insert_pre = null;
    if (isset($conn)) $conn = null;

    // Redirigir a la página principal
    header('location: index.php');
    exit();
}
