<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->action)) {
    echo json_encode(array("success" => false, "message" => "Action required."));
    exit();
}

if ($data->action === 'create') {
    $type = $conn->real_escape_string($data->type);
    $title = $conn->real_escape_string($data->title);
    $message = $conn->real_escape_string($data->message);
    
    $query = "INSERT INTO system_alerts (type, title, message, status) VALUES ('$type', '$title', '$message', 'unread')";
    if ($conn->query($query)) {
        echo json_encode(array("success" => true, "message" => "Alert created."));
    } else {
        echo json_encode(array("success" => false, "message" => "Error: " . $conn->error));
    }

} elseif ($data->action === 'mark_read') {
    $id = intval($data->id);
    $query = "UPDATE system_alerts SET status = 'read' WHERE id = $id";
    if ($conn->query($query)) {
        echo json_encode(array("success" => true));
    } else {
        echo json_encode(array("success" => false));
    }

} elseif ($data->action === 'delete') {
    $id = intval($data->id);
    $query = "DELETE FROM system_alerts WHERE id = $id";
    if ($conn->query($query)) {
        echo json_encode(array("success" => true));
    } else {
        echo json_encode(array("success" => false));
    }

} elseif ($data->action === 'clear_all') {
    $query = "DELETE FROM system_alerts"; // Or UPDATE status = 'read'
    if ($conn->query($query)) {
        echo json_encode(array("success" => true));
    } else {
        echo json_encode(array("success" => false));
    }
}
?>
