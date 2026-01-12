<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $id = intval($data->id);
    
    // Check if ward exists
    $check_sql = "SELECT id FROM wards WHERE id = $id";
    if ($conn->query($check_sql)->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Ward not found."]);
        exit();
    }

    // Delete ward
    // Note: This might fail if there are foreign key constraints (like assets, users, works).
    // For a robust system, we should delete related data first or rely on ON DELETE CASCADE.
    // Assuming works/assets utilize ON DELETE CASCADE or simple deletion is desired.
    
    $sql = "DELETE FROM wards WHERE id = $id";

    if ($conn->query($sql)) {
        // Administrative Tasks (Notifications)
        try {
            // Admin Notification
            $admin_res = $conn->query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
            $target_admin_id = ($admin_res && $admin_res->num_rows > 0) ? $admin_res->fetch_assoc()['id'] : 1;
            $conn->query("INSERT INTO notifications (user_id, type, title, message, is_read, created_at) VALUES ($target_admin_id, 'alert', 'Ward Deleted', 'Ward ID $id has been deleted from the system.', 0, NOW())");
        } catch (Exception $e) {
            error_log("Non-critical ward tasks failed: " . $e->getMessage());
        }

        echo json_encode(["success" => true, "message" => "Ward deleted successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error deleting ward: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid Ward ID."]);
}

$conn->close();
?>
