<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Cache-Control: no-cache, must-revalidate"); // Prevent stale responses

// Capture errors and return as JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "PHP Error: $errstr",
        "file" => basename($errfile),
        "line" => $errline
    ]);
    exit();
});

require_once '../db_connect.php';

$ward_id = isset($_GET['ward_id']) ? $_GET['ward_id'] : '';

if (!$ward_id || $ward_id === '0') {
    echo json_encode(["success" => false, "message" => "Ward ID required"]);
    exit();
}

// 1. Ensure feedback_replies table exists
$check_replies = $conn->query("SHOW TABLES LIKE 'feedback_replies'");
if ($check_replies->num_rows === 0) {
    $conn->query("CREATE TABLE `feedback_replies` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `feedback_id` INT DEFAULT NULL,
        `review_id` INT DEFAULT NULL,
        `user_id` INT NOT NULL,
        `user_name` VARCHAR(255) NOT NULL,
        `reply_text` LONGTEXT NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY `idx_feedback_id` (`feedback_id`),
        KEY `idx_review_id` (`review_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

// 2. Ensure feedback_votes table exists
$check_votes = $conn->query("SHOW TABLES LIKE 'feedback_votes'");
if ($check_votes->num_rows === 0) {
    $conn->query("CREATE TABLE `feedback_votes` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `feedback_id` INT DEFAULT NULL,
        `review_id` INT DEFAULT NULL,
        `user_id` INT NOT NULL,
        `vote_type` TINYINT NOT NULL COMMENT '1 for like, -1 for dislike',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY `idx_user_feedback` (`user_id`, `feedback_id`),
        UNIQUE KEY `idx_user_review` (`user_id`, `review_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

// 3. Ensure reviews table has required columns for legacy support
$columns_to_check = [
    'reply_text' => "LONGTEXT DEFAULT NULL",
    'replied_at' => "TIMESTAMP NULL DEFAULT NULL",
    'replied_by_officer_id' => "INT DEFAULT NULL"
];

foreach ($columns_to_check as $col => $definition) {
    $check_col = $conn->query("SHOW COLUMNS FROM `reviews` LIKE '$col'");
    if ($check_col->num_rows === 0) {
        $conn->query("ALTER TABLE `reviews` ADD COLUMN `$col` $definition");
    }
}

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

$sql = "SELECT 
            r.id, 
            r.rating, 
            r.comment, 
            r.created_at, 
            r.reply_text,
            r.replied_at,
            r.replied_by_officer_id,
            u.first_name, 
            u.middle_name,
            u.last_name,
            u.photo,
            u.role,
            u.province,
            u.district,
            u.city,
            u.work_province,
            u.work_district,
            u.work_municipality,
            u.work_ward,
            (SELECT COUNT(*) FROM feedback_replies WHERE review_id = r.id) as reply_count,
             (SELECT COUNT(*) FROM feedback_votes WHERE review_id = r.id AND vote_type = 1) as likes,
            (SELECT COUNT(*) FROM feedback_votes WHERE review_id = r.id AND vote_type = -1) as dislikes
            " . ($user_id > 0 ? ", (SELECT vote_type FROM feedback_votes WHERE review_id = r.id AND user_id = ?) as user_vote" : ", 0 as user_vote") . "
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.ward_id = ?
        ORDER BY r.created_at DESC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "SQL prepare failed: " . $conn->error]);
    exit();
}

if ($user_id > 0) {
    $stmt->bind_param("is", $user_id, $ward_id);
} else {
    $stmt->bind_param("s", $ward_id);
}
$stmt->execute();
$result = $stmt->get_result();

$reviews = [];
while ($row = $result->fetch_assoc()) {
    $row['photo'] = !empty($row['photo']) ? $row['photo'] : null;
    $reviews[] = $row;
}

// Calculate average
$avgSql = "SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE ward_id = ?";
$avgStmt = $conn->prepare($avgSql);
$avgStmt->bind_param("s", $ward_id);
$avgStmt->execute();
$avgData = $avgStmt->get_result()->fetch_assoc();

echo json_encode([
    "success" => true,
    "data" => $reviews,
    "stats" => [
        "rating" => $avgData['avg_rating'] ? round($avgData['avg_rating'], 1) : 0,
        "count" => (int)($avgData['total_reviews'] ?? 0)
    ]
]);

$stmt->close();
$avgStmt->close();
$conn->close();
?>
