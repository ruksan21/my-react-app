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

if (!empty($data->id) && !empty($data->status)) {
    $id = intval($data->id);
    $status = $conn->real_escape_string($data->status); // 'active' for approve, 'rejected' for reject

    $query = "UPDATE users SET status = '$status' WHERE id = $id AND role = 'officer'";

    if ($conn->query($query)) {
        echo json_encode(array("success" => true, "message" => "Officer status updated to $status"));
    } else {
        echo json_encode(array("success" => false, "message" => "Error: " . $conn->error));
    }
} else {
    echo json_encode(array("success" => false, "message" => "Incomplete data."));
}
?>
