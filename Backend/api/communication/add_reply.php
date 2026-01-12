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

$feedback_id = isset($data['feedback_id']) ? intval($data['feedback_id']) : 0;
$officer_id = isset($data['officer_id']) ? intval($data['officer_id']) : 0;
$reply_text = isset($data['reply_text']) ? $conn->real_escape_string($data['reply_text']) : '';

// Validation
if ($feedback_id === 0 || $officer_id === 0 || empty($reply_text)) {
    echo json_encode(["success" => false, "message" => "Invalid input data."]);
    exit();
}

// Verify officer exists and has proper role
$officer_check = $conn->prepare("SELECT id, first_name, last_name FROM users WHERE id = ? AND role = 'officer'");
$officer_check->bind_param("i", $officer_id);
$officer_check->execute();
$officer_result = $officer_check->get_result();

if ($officer_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Only officers can reply to comments."]);
    $officer_check->close();
    exit();
}

$officer_row = $officer_result->fetch_assoc();
$officer_name = $officer_row['first_name'] . ' ' . $officer_row['last_name'];
$officer_check->close();

// Check if feedback exists
$feedback_check = $conn->prepare("SELECT id FROM work_feedback WHERE id = ?");
$feedback_check->bind_param("i", $feedback_id);
$feedback_check->execute();
$feedback_result = $feedback_check->get_result();

if ($feedback_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Feedback not found."]);
    $feedback_check->close();
    exit();
}
$feedback_check->close();

// Check if reply table exists, if not create it
$check_table = $conn->query("SHOW TABLES LIKE 'feedback_replies'");
if ($check_table->num_rows === 0) {
    $create_table = "CREATE TABLE `feedback_replies` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `feedback_id` INT NOT NULL,
        `officer_id` INT NOT NULL,
        `officer_name` VARCHAR(255) NOT NULL,
        `reply_text` LONGTEXT NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY `idx_feedback_id` (`feedback_id`),
        KEY `idx_officer_id` (`officer_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if (!$conn->query($create_table)) {
        echo json_encode(["success" => false, "message" => "Error creating replies table: " . $conn->error]);
        exit();
    }
}

// Insert reply
$sql = "INSERT INTO `feedback_replies` (feedback_id, officer_id, officer_name, reply_text) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iiss", $feedback_id, $officer_id, $officer_name, $reply_text);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Reply posted successfully!"]);
} else {
    echo json_encode(["success" => false, "message" => "Error posting reply: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>
