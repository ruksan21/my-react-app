<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $id = intval($data->id);
    // Ideally check if the officer belongs to the ward of this activity
    // For now, strict on ID existence
    $sql = "DELETE FROM ward_activities WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Activity deleted."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error deleting activity."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid ID."]);
}
?>
