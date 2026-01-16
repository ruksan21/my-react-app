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
$user_id = isset($data['user_id']) ? intval($data['user_id']) : (isset($data['officer_id']) ? intval($data['officer_id']) : 0);
$reply_text = isset($data['reply_text']) ? $conn->real_escape_string($data['reply_text']) : '';

// Validation
if ($feedback_id === 0 || $user_id === 0 || empty($reply_text)) {
    echo json_encode(["success" => false, "message" => "Invalid input data."]);
    exit();
}

// Verify user exists and get details
$user_check = $conn->prepare("SELECT id, first_name, last_name, role FROM users WHERE id = ?");
$user_check->bind_param("i", $user_id);
$user_check->execute();
$user_result = $user_check->get_result();

if ($user_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found."]);
    $user_check->close();
    exit();
}

$user_row = $user_result->fetch_assoc();
$user_name = $user_row['first_name'] . ' ' . $user_row['last_name'];
$user_role = $user_row['role'];
$user_check->close();

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

// Check table & Migrate if necessary
// We are transitioning from 'officer_id' to 'user_id' conceptually.
// If table exists but has 'officer_id', we will ALTER it or just use 'officer_id' column to store user_id to avoid data loss.
// For simplicity in this environment: We will check if 'user_id' column exists, if not add it.

$check_table = $conn->query("SHOW TABLES LIKE 'feedback_replies'");
if ($check_table->num_rows === 0) {
    $create_table = "CREATE TABLE `feedback_replies` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `feedback_id` INT NOT NULL,
        `user_id` INT NOT NULL,
        `user_name` VARCHAR(255) NOT NULL,
        `reply_text` LONGTEXT NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY `idx_feedback_id` (`feedback_id`),
        KEY `idx_user_id` (`user_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if (!$conn->query($create_table)) {
        echo json_encode(["success" => false, "message" => "Error creating replies table: " . $conn->error]);
        exit();
    }
} else {
    // Check if user_id column exists
    $check_col = $conn->query("SHOW COLUMNS FROM `feedback_replies` LIKE 'user_id'");
    if ($check_col->num_rows === 0) {
        // Migration: Add user_id and copy officer_id to it (if officer_id exists)
         $conn->query("ALTER TABLE `feedback_replies` ADD COLUMN `user_id` INT NOT NULL AFTER `feedback_id`");
         $conn->query("UPDATE `feedback_replies` SET `user_id` = `officer_id`");
         // Also add user_name if missing
         $check_col_name = $conn->query("SHOW COLUMNS FROM `feedback_replies` LIKE 'user_name'");
         if ($check_col_name->num_rows === 0) {
             $conn->query("ALTER TABLE `feedback_replies` ADD COLUMN `user_name` VARCHAR(255) NOT NULL AFTER `user_id`");
             $conn->query("UPDATE `feedback_replies` SET `user_name` = `officer_name`");
         }
    }
}

// Insert reply
$sql = "INSERT INTO `feedback_replies` (feedback_id, user_id, user_name, reply_text) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iiss", $feedback_id, $user_id, $user_name, $reply_text);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Reply posted successfully!"]);
} else {
    echo json_encode(["success" => false, "message" => "Error posting reply: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>
