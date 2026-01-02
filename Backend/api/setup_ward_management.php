<?php
/**
 * Master Setup Script for Ward Management
 * Ensures all tables and columns exist with the correct schema.
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db_connect.php';

$results = [];

// 1. Create Districts Table
$sql_districts = "CREATE TABLE IF NOT EXISTS districts (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    province VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($sql_districts)) {
    $results[] = "Table 'districts' verified/created.";
} else {
    $results[] = "Error creating 'districts': " . $conn->error;
}

// 2. Create Wards Table
$sql_wards = "CREATE TABLE IF NOT EXISTS wards (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    ward_number INT(11) NOT NULL,
    district_id INT(11) NOT NULL,
    municipality VARCHAR(255) DEFAULT NULL,
    location VARCHAR(255) DEFAULT NULL,
    contact_phone VARCHAR(20) DEFAULT NULL,
    contact_email VARCHAR(100) DEFAULT NULL,
    chairperson_name VARCHAR(255) DEFAULT NULL,
    chairperson_phone VARCHAR(20) DEFAULT NULL,
    chairperson_email VARCHAR(100) DEFAULT NULL,
    chairperson_photo VARCHAR(255) DEFAULT NULL,
    chairperson_education VARCHAR(255) DEFAULT NULL,
    chairperson_experience TEXT DEFAULT NULL,
    chairperson_political_party VARCHAR(255) DEFAULT NULL,
    chairperson_appointment_date DATE DEFAULT NULL,
    chairperson_bio TEXT DEFAULT NULL,
    google_map_link TEXT DEFAULT NULL,
    telephone VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id)
)";
if ($conn->query($sql_wards)) {
    $results[] = "Table 'wards' verified/created.";
} else {
    $results[] = "Error creating 'wards': " . $conn->error;
}

// 3. Ensure all columns in wards (for existing tables)
$columns_to_check = [
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

foreach ($columns_to_check as $column => $alter_sql) {
    if ($conn->query("SHOW COLUMNS FROM wards LIKE '$column'")->num_rows == 0) {
        if ($conn->query($alter_sql)) {
            $results[] = "Column '$column' added to 'wards'.";
        }
    }
}

// 4. Create Ward Assets Table
$sql_assets = "CREATE TABLE IF NOT EXISTS ward_assets (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    ward_id INT(11) NOT NULL,
    asset_type ENUM('building','vehicle','equipment','land','other') NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    value DECIMAL(15,2) DEFAULT NULL,
    acquisition_date DATE DEFAULT NULL,
    status ENUM('active','maintenance','disposed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE
)";
if ($conn->query($sql_assets)) {
    $results[] = "Table 'ward_assets' verified/created.";
} else {
    $results[] = "Error creating 'ward_assets': " . $conn->error;
}

// 5. Seed default districts if empty
$check_districts = $conn->query("SELECT id FROM districts LIMIT 1");
if ($check_districts->num_rows == 0) {
    $seed_sql = "INSERT INTO districts (name, province) VALUES 
        ('Kathmandu', 'Bagmati'),
        ('Lalitpur', 'Bagmati'),
        ('Bhaktapur', 'Bagmati')";
    $conn->query($seed_sql);
    $results[] = "Default districts seeded.";
}

echo json_encode([
    "success" => true,
    "messages" => $results
]);
?>
