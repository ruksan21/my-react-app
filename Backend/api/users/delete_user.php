<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $id = intval($data->id);
    
    // Prevent deleting the main admin if needed? (Optional safety)
    
    $query = "DELETE FROM users WHERE id = $id";

    if ($conn->query($query)) {
        echo json_encode(array("success" => true, "message" => "User deleted successfully."));
    } else {
        echo json_encode(array("success" => false, "message" => "Error: " . $conn->error));
    }
} else {
    echo json_encode(array("success" => false, "message" => "User ID is required."));
}
?>
