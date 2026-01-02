<?php
require_once 'db_connect.php';

// Check if municipality column exists in wards table
$check = $conn->query("SHOW COLUMNS FROM wards LIKE 'municipality'");

if ($check->num_rows == 0) {
    // Add the column
    $sql = "ALTER TABLE wards ADD COLUMN municipality VARCHAR(255) DEFAULT NULL AFTER district_id";
    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Column 'municipality' added to 'wards' table."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error adding column: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => true, "message" => "Column 'municipality' already exists."]);
}
?>
