<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
ini_set('display_errors', 0);
error_reporting(E_ALL);

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
$rating = isset($data['rating']) ? intval($data['rating']) : 0;
$comment = isset($data['comment']) ? $conn->real_escape_string($data['comment']) : '';

// Get user name and role from database if user_id is provided
$user_name = 'Anonymous';
$user_role = 'guest';
if ($user_id) {
    $user_stmt = $conn->prepare("SELECT first_name, last_name, role FROM users WHERE id = ?");
    $user_stmt->bind_param("i", $user_id);
    $user_stmt->execute();
    $user_result = $user_stmt->get_result();
    if ($user_row = $user_result->fetch_assoc()) {
        $user_name = $user_row['first_name'] . ' ' . $user_row['last_name'];
        $user_role = $user_row['role'];
    }
    $user_stmt->close();
}

// Validation
// For officers, rating 0 is allowed (it's a comment). For citizens/guests, rating 1-5 is required.
$is_valid_rating = ($user_role === 'officer') ? true : ($rating >= 1 && $rating <= 5);

if ($work_id === 0 || !$is_valid_rating || ($rating != 0 && ($rating < 1 || $rating > 5)) || empty($comment)) {
    echo json_encode(["success" => false, "message" => "Invalid input data. Rating and comment are required."]);
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
