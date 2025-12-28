<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->action)) {
    echo json_encode(array("success" => false, "message" => "Action required."));
    exit();
}

$action = $data->action;

if ($action === 'mark_read') {
    $id = intval($data->id);
    $query = "UPDATE system_alerts SET status = 'read' WHERE id = $id";
} elseif ($action === 'delete') {
    $id = intval($data->id);
    $query = "DELETE FROM system_alerts WHERE id = $id";
} elseif ($action === 'clear_all') {
    $query = "DELETE FROM system_alerts";
} else {
    echo json_encode(array("success" => false, "message" => "Invalid action."));
    exit();
}

if ($conn->query($query)) {
    echo json_encode(array("success" => true, "message" => "Operation successful."));
} else {
    echo json_encode(array("success" => false, "message" => "Database error: " . $conn->error));
}
?>
