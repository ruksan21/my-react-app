<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once "../db_connect.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $userId = $_GET['user_id'] ?? null;
    
    if (!$userId) {
        echo json_encode([
            "success" => false,
            "message" => "User ID is required"
        ]);
        exit();
    }

    // Get notifications for user
    $query = "SELECT id, title, message, type, is_read, 
              CASE 
                  WHEN TIMESTAMPDIFF(MINUTE, created_at, NOW()) < 60 
                      THEN CONCAT(TIMESTAMPDIFF(MINUTE, created_at, NOW()), ' minutes ago')
                  WHEN TIMESTAMPDIFF(HOUR, created_at, NOW()) < 24 
                      THEN CONCAT(TIMESTAMPDIFF(HOUR, created_at, NOW()), ' hours ago')
                  ELSE CONCAT(TIMESTAMPDIFF(DAY, created_at, NOW()), ' days ago')
              END as time
              FROM notifications 
              WHERE user_id = ? 
              ORDER BY created_at DESC 
              LIMIT 50";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $notifications = [];
    while ($row = $result->fetch_assoc()) {
        $notifications[] = [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'message' => $row['message'],
            'type' => $row['type'],
            'read' => (bool)$row['is_read'],
            'time' => $row['time']
        ];
    }
    
    echo json_encode([
        "success" => true,
        "data" => $notifications,
        "unread_count" => count(array_filter($notifications, fn($n) => !$n['read']))
    ]);
    
    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}

$conn->close();
?>
