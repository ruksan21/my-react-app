<?php
/**
 * Fix Database Schema API
 * Adds missing columns to the wards table
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db_connect.php';

$results = [];

// Columns to check and add
$columns_to_add = [
    'municipality' => "ALTER TABLE wards ADD COLUMN municipality VARCHAR(255) DEFAULT NULL AFTER district_id",
    'google_map_link' => "ALTER TABLE wards ADD COLUMN google_map_link TEXT DEFAULT NULL AFTER location",
    'telephone' => "ALTER TABLE wards ADD COLUMN telephone VARCHAR(20) DEFAULT NULL AFTER contact_phone",
    'chairperson_education' => "ALTER TABLE wards ADD COLUMN chairperson_education VARCHAR(255) DEFAULT NULL AFTER chairperson_email",
    'chairperson_experience' => "ALTER TABLE wards ADD COLUMN chairperson_experience TEXT DEFAULT NULL AFTER chairperson_education",
    'chairperson_political_party' => "ALTER TABLE wards ADD COLUMN chairperson_political_party VARCHAR(255) DEFAULT NULL AFTER chairperson_experience",
    'chairperson_appointment_date' => "ALTER TABLE wards ADD COLUMN chairperson_appointment_date DATE DEFAULT NULL AFTER chairperson_political_party",
    'chairperson_bio' => "ALTER TABLE wards ADD COLUMN chairperson_bio TEXT DEFAULT NULL AFTER chairperson_appointment_date",
    'chairperson_photo' => "ALTER TABLE wards ADD COLUMN chairperson_photo VARCHAR(255) DEFAULT NULL AFTER chairperson_bio"
];

foreach ($columns_to_add as $column => $sql) {
    $check = $conn->query("SHOW COLUMNS FROM wards LIKE '$column'");
    if ($check->num_rows == 0) {
        if ($conn->query($sql)) {
            $results[] = "Column '$column' added successfully.";
        } else {
            $results[] = "Error adding column '$column': " . $conn->error;
        }
    } else {
        $results[] = "Column '$column' already exists.";
    }
}

echo json_encode([
    "success" => true,
    "messages" => $results
]);
?>
