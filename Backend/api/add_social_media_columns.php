<?php
/**
 * Add Social Media Columns to Wards Table
 * Run this file once to add the missing social media columns
 */

header("Content-Type: application/json");
require_once 'db_connect.php';

try {
    // Check if columns already exist
    $checkQuery = "SELECT COLUMN_NAME 
                   FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() 
                   AND TABLE_NAME = 'wards' 
                   AND COLUMN_NAME IN ('facebook_url', 'instagram_url', 'twitter_url', 'whatsapp_url', 'google_map_link', 'telephone')";
    
    $result = $conn->query($checkQuery);
    $existingColumns = [];
    
    while ($row = $result->fetch_assoc()) {
        $existingColumns[] = $row['COLUMN_NAME'];
    }
    
    $columnsToAdd = [];
    $columnsAdded = [];
    
    // Add facebook_url if not exists
    if (!in_array('facebook_url', $existingColumns)) {
        $conn->query("ALTER TABLE `wards` ADD COLUMN `facebook_url` VARCHAR(255) DEFAULT NULL");
        $columnsAdded[] = 'facebook_url';
    }
    
    // Add instagram_url if not exists
    if (!in_array('instagram_url', $existingColumns)) {
        $conn->query("ALTER TABLE `wards` ADD COLUMN `instagram_url` VARCHAR(255) DEFAULT NULL");
        $columnsAdded[] = 'instagram_url';
    }
    
    // Add twitter_url if not exists
    if (!in_array('twitter_url', $existingColumns)) {
        $conn->query("ALTER TABLE `wards` ADD COLUMN `twitter_url` VARCHAR(255) DEFAULT NULL");
        $columnsAdded[] = 'twitter_url';
    }
    
    // Add whatsapp_url if not exists
    if (!in_array('whatsapp_url', $existingColumns)) {
        $conn->query("ALTER TABLE `wards` ADD COLUMN `whatsapp_url` VARCHAR(255) DEFAULT NULL");
        $columnsAdded[] = 'whatsapp_url';
    }
    
    // Add google_map_link if not exists
    if (!in_array('google_map_link', $existingColumns)) {
        $conn->query("ALTER TABLE `wards` ADD COLUMN `google_map_link` VARCHAR(500) DEFAULT NULL");
        $columnsAdded[] = 'google_map_link';
    }
    
    // Add telephone if not exists
    if (!in_array('telephone', $existingColumns)) {
        $conn->query("ALTER TABLE `wards` ADD COLUMN `telephone` VARCHAR(20) DEFAULT NULL");
        $columnsAdded[] = 'telephone';
    }
    
    if (count($columnsAdded) > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Social media columns added successfully!",
            "columns_added" => $columnsAdded,
            "total_added" => count($columnsAdded)
        ], JSON_PRETTY_PRINT);
    } else {
        echo json_encode([
            "success" => true,
            "message" => "All social media columns already exist!",
            "existing_columns" => $existingColumns
        ], JSON_PRETTY_PRINT);
    }
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ], JSON_PRETTY_PRINT);
}

$conn->close();
?>
