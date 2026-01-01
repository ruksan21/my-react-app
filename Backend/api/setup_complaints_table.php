<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once 'db_connect.php';

// Create complaints table
$sql = "CREATE TABLE IF NOT EXISTS `complaints` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `complainant` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(500) NOT NULL,
    `date` DATE NOT NULL,
    `status` ENUM('Open', 'Resolved') DEFAULT 'Open',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);";

if ($conn->query($sql) === TRUE) {
    // Insert sample data
    $insertSql = "INSERT INTO `complaints` (`complainant`, `subject`, `date`, `status`) VALUES
        ('Krishna Thapa', 'Road Repair Needed', '2023-11-18', 'Open'),
        ('Maya Gurung', 'Street Light Not Working', '2023-11-17', 'Open'),
        ('Bikash Rai', 'Garbage Collection Issue', '2023-11-16', 'Resolved'),
        ('Anita Shrestha', 'Water Supply Problem', '2023-11-15', 'Open')
    ON DUPLICATE KEY UPDATE id=id;";
    
    if ($conn->query($insertSql) === TRUE) {
        echo json_encode(["success" => true, "message" => "✅ Complaints table created and sample data inserted successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Table created but error inserting data: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Error creating complaints table: " . $conn->error]);
}

$conn->close();
?>
