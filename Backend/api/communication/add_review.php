<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->ward_id) && 
    !empty($data->user_id) && 
    !empty($data->rating)
) {
    $ward_id = intval($data->ward_id);
    $user_id = intval($data->user_id);
    $rating = intval($data->rating);
    $comment = isset($data->comment) ? $conn->real_escape_string($data->comment) : "";

    // Check if user already reviewed this ward? (Optional: allow multiple or update)
    // For now, let's allow adding new ones.

    $sql = "INSERT INTO reviews (ward_id, user_id, rating, comment) VALUES ($ward_id, $user_id, $rating, '$comment')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Review added successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error adding review: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data. Rating and Ward ID required."]);
}

$conn->close();
?>
