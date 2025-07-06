<?php
error_reporting(E_ALL); // En producción cambia a error_reporting(0);
ini_set('display_errors', 1); // En producción elimina esta línea
session_start();
$_SESSION['token'] = bin2hex(random_bytes(64));

// Verificar si el usuario está logueado
if (!isset($_SESSION['id_usuario'])) {
    header('location: ../index.php');
    exit;
}

// Incluir la conexión a la base de datos
require_once '../control/connection.php';

// Verificar que la conexión se estableció correctamente
if (!isset($conn) || !$conn instanceof PDO) {
    die('Error: No se pudo establecer la conexión a la base de datos.');
}

// Obtener el idioma del usuario si está disponible
$userLanguage = 'es'; // Valor predeterminado
if (isset($_SESSION['id_usuario'])) {
    try {
        $stmt = $conn->prepare("SELECT lenguage_user FROM usuarios WHERE id_user = :id");
        $stmt->bindParam(':id', $_SESSION['id_usuario']);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($result) {
            $langMap = [
                'ESP' => 'es',
                'ENG' => 'en',
                'CAT' => 'ca'
            ];
            $userLanguage = $langMap[$result['lenguage_user']] ?? 'es';
        }
    } catch (PDOException $e) {
        // Silenciosamente fallback al idioma predeterminado
    }
}
?>

<?php include_once 'head.php';?>
<link rel="stylesheet" href="../css/styles.css">
   <link rel="stylesheet" href="../css/style.css">
<body>
    
<?php include_once 'header.php';?>

    <main class="centrado">
        <?php if (isset($_SESSION['success']) && $_SESSION['success']) : ?>
            <div class="alert alert-success">
                <?= htmlspecialchars($_SESSION['success_message'] ?? 'Operación realizada con éxito') ?>
            </div>
            <?php unset($_SESSION['success']); unset($_SESSION['success_message']); ?>
        <?php endif; ?>

        <?php if (isset($_SESSION['error']) && $_SESSION['error']) : ?>
            <div class="alert alert-danger">
                <?= htmlspecialchars($_SESSION['error_message'] ?? 'Ha ocurrido un error') ?>
            </div>
            <?php unset($_SESSION['error']); unset($_SESSION['error_message']); ?>
        <?php endif; ?>

        <div class="app-container">
            <div class="tasks-panel">
                <!-- Formulario de Tareas -->
                <section id="taskFormSection">
                    <h2 data-i18n="task.input">Introduce una tarea</h2>
                    <form id="taskForm">
                        <input type="text" id="task" name="name_task" placeholder="Introduce una tarea" required data-i18n="task.input">
                        <div class="date-inputs">
                            <div class="date-field">
                                <label for="startDate" data-i18n="date.start">Fecha inicio:</label>
                                <input type="date" id="startDate" name="start_task" required>
                            </div>
                            <div class="date-field">
                                <label for="endDate" data-i18n="date.end">Fecha fin:</label>
                                <input type="date" id="endDate" name="end_task" required>
                            </div>
                        </div>
                        <select id="state" name="status_task" required>
                            <option value="pending" data-i18n="task.pending">Pendiente</option>
                            <option value="in_progress" data-i18n="task.inProgress">En Ejecución</option>
                            <option value="completed" data-i18n="task.completed">Realizada</option>
                        </select>
                        <input type="hidden" name="token" value="<?= $_SESSION['token'] ?>">
                        <input type="hidden" name="web" value="">
                        <button type="submit" data-i18n="task.add">Añadir tarea</button>
                    </form>
                </section>

                <!-- Secciones de Tareas -->
                <div class="tasks-container">
                    <section class="tasks-section">
                        <h2 data-i18n="task.pending">Pendientes</h2>
                        <ul class="tasks-list" id="pendingTasks">
                            <!-- Las tareas pendientes se cargarán dinámicamente -->
                        </ul>
                    </section>

                    <section class="tasks-section">
                        <h2 data-i18n="task.inProgress">En Ejecución</h2>
                        <ul class="tasks-list" id="inProgressTasks">
                            <!-- Las tareas en progreso se cargarán dinámicamente -->
                        </ul>
                    </section>

                    <section class="tasks-section">
                        <h2 data-i18n="task.completed">Realizadas</h2>
                        <ul class="tasks-list" id="completedTasks">
                            <!-- Las tareas completadas se cargarán dinámicamente -->
                        </ul>
                    </section>
                </div>
            </div>

            <!-- Calendario -->
            <div class="calendar-container">
                <h2 data-i18n="calendar.title">Calendario de Tareas</h2>
                <div id="calendar"></div>
            </div>
        </div>
    </main>

   <?php include_once 'footer.php';?>
   <script src="../js/main.js"></script>
</body>

</html>
<?php
$_SESSION['error'] = false;
?>
