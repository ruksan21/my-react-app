<?php
require_once 'db_connect.php';

// Check if table exists
$checkTable = $conn->query("SHOW TABLES LIKE 'system_alerts'");

if ($checkTable->num_rows == 0) {
    // Table doesn't exist, create it
    $sql = "CREATE TABLE system_alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('error', 'warning', 'info', 'success') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('unread', 'read') DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    if ($conn->query($sql) === TRUE) {
        echo "Table 'system_alerts' created successfully.";
    } else {
        echo "Error creating table: " . $conn->error;
    }
} else {
    echo "Table 'system_alerts' already exists.";
}

$conn->close();
?>
