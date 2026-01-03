<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    // Fallback if JSON decode fails (standard POST)
    $data = $_POST;
}

$work_id = isset($data['work_id']) ? intval($data['work_id']) : 0;
$user_id = isset($data['user_id']) ? intval($data['user_id']) : null;
$user_name = isset($data['user_name']) ? $conn->real_escape_string($data['user_name']) : 'Anonymous';
$rating = isset($data['rating']) ? intval($data['rating']) : 0;
$comment = isset($data['comment']) ? $conn->real_escape_string($data['comment']) : '';

if ($work_id === 0 || $rating < 1 || $rating > 5 || empty($comment)) {
    echo json_encode(["success" => false, "message" => "Invalid input data."]);
    exit();
}

$sql = "INSERT INTO `work_feedback` (work_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iisis", $work_id, $user_id, $user_name, $rating, $comment);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Feedback submitted successfully!"]);
} else {
    echo json_encode(["success" => false, "message" => "Error submitting feedback: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>
