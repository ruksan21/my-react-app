<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

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
        echo json_encode(["success" => true, "message" => "Ward deleted successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error deleting ward: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid Ward ID."]);
}

$conn->close();
?>
