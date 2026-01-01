<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once 'db_connect.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$id = isset($input['id']) ? intval($input['id']) : 0;
$status = isset($input['status']) ? $input['status'] : '';

if ($id === 0 || empty($status)) {
    echo json_encode(["success" => false, "message" => "ID and status are required."]);
    exit();
}

// Update complaint status
$sql = "UPDATE `complaints` SET `status` = ? WHERE `id` = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Complaint status updated successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Error updating status: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>
