<?php
require_once 'control/connection.php';

// Función para mostrar la estructura de una tabla
function showTableStructure($conn, $tableName) {
    echo "<h2>Estructura de la tabla: $tableName</h2>";
    try {
        $stmt = $conn->query("SHOW COLUMNS FROM $tableName");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($columns)) {
            echo "<p>La tabla $tableName está vacía o no existe.</p>";
            return;
        }
        
        echo "<table border='1'>";
        echo "<tr><th>Campo</th><th>Tipo</th><th>Nulo</th><th>Clave</th><th>Valor por defecto</th><th>Extra</th></tr>";
        
        foreach ($columns as $column) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($column['Field']) . "</td>";
            echo "<td>" . htmlspecialchars($column['Type']) . "</td>";
            echo "<td>" . htmlspecialchars($column['Null']) . "</td>";
            echo "<td>" . htmlspecialchars($column['Key']) . "</td>";
            echo "<td>" . htmlspecialchars($column['Default'] ?? 'NULL') . "</td>";
            echo "<td>" . htmlspecialchars($column['Extra']) . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        
        // Mostrar datos de ejemplo
        $stmt = $conn->query("SELECT * FROM $tableName LIMIT 5");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (!empty($data)) {
            echo "<h3>Datos de ejemplo:</h3>";
            echo "<pre>";
            print_r($data);
            echo "</pre>";
        }
        
    } catch (PDOException $e) {
        echo "<p style='color:red;'>Error al obtener la estructura de la tabla $tableName: " . $e->getMessage() . "</p>";
    }
    echo "<hr>";
}

// Mostrar estructura de las tablas
showTableStructure($conn, 'temporal');
showTableStructure($conn, 'usuarios');

// Cerrar conexión
$conn = null;
?>
