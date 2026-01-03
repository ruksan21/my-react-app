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

if (!isset($data->name)) {
    echo json_encode(array("success" => false, "message" => "District name is required."));
    exit();
}

$name = $conn->real_escape_string($data->name);
$province = isset($data->province) ? $conn->real_escape_string($data->province) : 'Bagmati Province'; 

// Check if exists
$check = $conn->query("SELECT id FROM districts WHERE name = '$name'");
if ($check->num_rows > 0) {
    echo json_encode(array("success" => false, "message" => "District already exists."));
    exit();
}

$query = "INSERT INTO districts (name, province) VALUES ('$name', '$province')";

if ($conn->query($query)) {
    echo json_encode(array("success" => true, "message" => "District added successfully.", "id" => $conn->insert_id));
} else {
    echo json_encode(array("success" => false, "message" => "Error: " . $conn->error));
}
?>
