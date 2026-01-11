<?php
// Prevent any output before JSON
ob_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../db_connect.php';

// Clear any output that might have occurred
ob_clean();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Only POST method allowed"]);
    exit();
}

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields
    if (empty($data['title']) || empty($data['message']) || empty($data['type'])) {
        ob_clean();
        echo json_encode([
            "success" => false,
            "message" => "Title, message, and type are required"
        ]);
        exit();
    }
    
    $title = $conn->real_escape_string($data['title']);
    $message = $conn->real_escape_string($data['message']);
    $type = $conn->real_escape_string($data['type']);
    $user_id = isset($data['user_id']) ? intval($data['user_id']) : null;
    $ward_id = isset($data['ward_id']) ? intval($data['ward_id']) : null;
    $source_province = isset($data['source_province']) ? $conn->real_escape_string($data['source_province']) : null;
    $source_district = isset($data['source_district']) ? $conn->real_escape_string($data['source_district']) : null;
    $source_municipality = isset($data['source_municipality']) ? $conn->real_escape_string($data['source_municipality']) : null;
    $source_ward = isset($data['source_ward']) ? intval($data['source_ward']) : null;
    
    // Insert notification
    $sql = "INSERT INTO notifications 
            (user_id, ward_id, title, message, type, source_province, source_district, source_municipality, source_ward, is_read, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iissssssi", $user_id, $ward_id, $title, $message, $type, $source_province, $source_district, $source_municipality, $source_ward);
    
    if ($stmt->execute()) {
        ob_clean();
        echo json_encode([
            "success" => true,
            "message" => "Notification created successfully",
            "notification_id" => $stmt->insert_id
        ]);
    } else {
        ob_clean();
        echo json_encode([
            "success" => false,
            "message" => "Failed to create notification: " . $stmt->error
        ]);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}

$conn->close();
ob_end_flush();
?>
