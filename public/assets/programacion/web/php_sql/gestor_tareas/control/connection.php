<?php

// Datos de acceso a la Base de Datos
// $host = "localhost";
$host = $_ENV['DB_HOST'];
$database = $_ENV['DB_DATABASE'];
$port = $_ENV['DB_PORT'];
$user = $_ENV['DB_USER'];
$password = $_ENV['DB_PASSWORD'];


try {
    $conn = new PDO ("mysql:host=$host;port=$port;dbname=$database;", $user, $password );
    
} catch (PDOException $e) {
    echo $e->getMessage();
}
