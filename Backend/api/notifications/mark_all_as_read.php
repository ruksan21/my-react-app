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
    
    $userId = $data['user_id'] ?? null;
    $scope = $data['scope'] ?? 'user';

    if ($scope === 'global') {
        // GLOBAL UPDATE (For Admin)
        // 1. Update standard notifications
        $query1 = "UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE";
        $stmt1 = $conn->prepare($query1);
        $stmt1->execute();
        $updatedNotifications = $stmt1->affected_rows;
        $stmt1->close();

        // 2. Update system alerts (status = 'unread' -> 'read')
        $query2 = "UPDATE system_alerts SET status = 'read' WHERE status = 'unread'";
        $stmt2 = $conn->prepare($query2);
        $stmt2->execute();
        $updatedAlerts = $stmt2->affected_rows;
        $stmt2->close();
        
        echo json_encode([
            "success" => true,
            "message" => "All notifications and alerts marked as read",
            "updated_count" => $updatedNotifications + $updatedAlerts
        ]);
        $conn->close();
        exit();

    } else {
        // USER SPECIFIC UPDATE
        if (!$userId) {
            echo json_encode([
                "success" => false,
                "message" => "User ID is required"
            ]);
            exit();
        }

        $query = "UPDATE notifications 
                  SET is_read = TRUE 
                  WHERE user_id = ? AND is_read = FALSE";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $userId);
        
        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "All notifications marked as read",
                "updated_count" => $stmt->affected_rows
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Failed to update notifications"
            ]);
        }
        $stmt->close();
    }
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}

$conn->close();
?>
