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
    
    if (empty($data['action'])) {
        ob_clean();
        echo json_encode(["success" => false, "message" => "Action is required"]);
        exit();
    }
    
    $action = $data['action'];
    
    switch ($action) {
        case 'mark_read':
            if (empty($data['id'])) {
                ob_clean();
                echo json_encode(["success" => false, "message" => "Notification ID is required"]);
                exit();
            }
            
            $id = intval($data['id']);
            $sql = "UPDATE notifications SET is_read = 1 WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                ob_clean();
                echo json_encode(["success" => true, "message" => "Notification marked as read"]);
            } else {
                ob_clean();
                echo json_encode(["success" => false, "message" => "Failed to update notification"]);
            }
            $stmt->close();
            break;
            
        case 'mark_unread':
            if (empty($data['id'])) {
                ob_clean();
                echo json_encode(["success" => false, "message" => "Notification ID is required"]);
                exit();
            }
            
            $id = intval($data['id']);
            $sql = "UPDATE notifications SET is_read = 0 WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                ob_clean();
                echo json_encode(["success" => true, "message" => "Notification marked as unread"]);
            } else {
                ob_clean();
                echo json_encode(["success" => false, "message" => "Failed to update notification"]);
            }
            $stmt->close();
            break;
            
        case 'delete':
            if (empty($data['id'])) {
                ob_clean();
                echo json_encode(["success" => false, "message" => "Notification ID is required"]);
                exit();
            }
            
            $id = intval($data['id']);
            $sql = "DELETE FROM notifications WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                ob_clean();
                echo json_encode(["success" => true, "message" => "Notification deleted"]);
            } else {
                ob_clean();
                echo json_encode(["success" => false, "message" => "Failed to delete notification"]);
            }
            $stmt->close();
            break;
            
        case 'mark_all_read':
            $sql = "UPDATE notifications SET is_read = 1";
            if ($conn->query($sql)) {
                ob_clean();
                echo json_encode(["success" => true, "message" => "All notifications marked as read"]);
            } else {
                ob_clean();
                echo json_encode(["success" => false, "message" => "Failed to update notifications"]);
            }
            break;
            
        case 'delete_all':
            $sql = "DELETE FROM notifications";
            if ($conn->query($sql)) {
                ob_clean();
                echo json_encode(["success" => true, "message" => "All notifications deleted"]);
            } else {
                ob_clean();
                echo json_encode(["success" => false, "message" => "Failed to delete notifications"]);
            }
            break;
            
        default:
            ob_clean();
            echo json_encode(["success" => false, "message" => "Invalid action"]);
    }
    
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
