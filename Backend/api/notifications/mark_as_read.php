<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once "../db_connect.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "success" => false,
        "message" => "Only POST method is allowed"
    ]);
    exit();
}

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $notificationId = $data['notification_id'] ?? null;
    $userId = $data['user_id'] ?? null;
    
    if (!$notificationId || !$userId) {
        echo json_encode([
            "success" => false,
            "message" => "Notification ID and User ID are required"
        ]);
        exit();
    }

    // Mark as read
    $query = "UPDATE notifications 
              SET is_read = TRUE 
              WHERE id = ? AND user_id = ?";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ii", $notificationId, $userId);
    
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Notification marked as read"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to update notification"
        ]);
    }
    
    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}

$conn->close();
?>
