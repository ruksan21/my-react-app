<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

$review_id = isset($data->review_id) ? intval($data->review_id) : 0;
// Support both officer_id (legacy) and user_id inputs
$user_id = isset($data->user_id) ? intval($data->user_id) : (isset($data->officer_id) ? intval($data->officer_id) : 0);
$reply_text = isset($data->reply_text) ? $conn->real_escape_string($data->reply_text) : '';

if ($review_id === 0 || $user_id === 0 || empty($reply_text)) {
    echo json_encode(["success" => false, "message" => "Incomplete data. Review ID, User ID and Reply Text required."]);
    exit();
}

// Verify user exists
$user_check = $conn->prepare("SELECT id, first_name, last_name FROM users WHERE id = ?");
$user_check->bind_param("i", $user_id);
$user_check->execute();
$user_result = $user_check->get_result();

if ($user_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found."]);
    exit();
}
$user_row = $user_result->fetch_assoc();
$user_name = $user_row['first_name'] . ' ' . $user_row['last_name'];
$user_check->close();

// Check table structure and migrate if needed
// We need to ensure 'feedback_replies' has 'review_id' column
$check_table = $conn->query("SHOW TABLES LIKE 'feedback_replies'");
if ($check_table->num_rows === 0) {
    // Create new if doesn't exist (with review_id)
    $create_table = "CREATE TABLE `feedback_replies` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `feedback_id` INT DEFAULT NULL,
        `review_id` INT DEFAULT NULL,
        `user_id` INT NOT NULL,
        `user_name` VARCHAR(255) NOT NULL,
        `reply_text` LONGTEXT NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY `idx_feedback_id` (`feedback_id`),
        KEY `idx_review_id` (`review_id`),
        KEY `idx_user_id` (`user_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    $conn->query($create_table);
} else {
    // Check if review_id column exists
    $check_col = $conn->query("SHOW COLUMNS FROM `feedback_replies` LIKE 'review_id'");
    if ($check_col->num_rows === 0) {
         $conn->query("ALTER TABLE `feedback_replies` ADD COLUMN `review_id` INT DEFAULT NULL AFTER `feedback_id`");
         $conn->query("ALTER TABLE `feedback_replies` ADD INDEX `idx_review_id` (`review_id`)");
         // Also ensure feedback_id is nullable if it wasn't
         $conn->query("ALTER TABLE `feedback_replies` MODIFY COLUMN `feedback_id` INT DEFAULT NULL");
    }
}

// Insert reply
$sql = "INSERT INTO `feedback_replies` (review_id, user_id, user_name, reply_text) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iiss", $review_id, $user_id, $user_name, $reply_text);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Reply added successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Error adding reply: " . $conn->error]);
}

$conn->close();
?>
