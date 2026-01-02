<?php
require_once 'db_connect.php';

$sql = "CREATE TABLE IF NOT EXISTS system_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20),
    title VARCHAR(100),
    message TEXT,
    status ENUM('unread', 'read') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql)) {
    echo "SUCCESS: system_alerts table verified/created.";
} else {
    echo "FAILURE: " . $conn->error;
}
?>
