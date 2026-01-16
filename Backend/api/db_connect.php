<?php
// Database variables (XAMPP default)
$host = "localhost";
$db_name = "ward_management";
$username = "root";
$password = "";

// MySQLi Object-Oriented style ma connection gareko
$conn = new mysqli($host, $username, $password, $db_name);



// Connection check gareko: error xabhane JSON response return garxa
if ($conn->connect_error) {
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $conn->connect_error
    ]);
    exit();
}

// Nepali text support garna ko lagi char-set set gareko
$conn->set_charset("utf8mb4");
?>
