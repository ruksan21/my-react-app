<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Cache-Control: no-cache, must-revalidate");
header("Content-Type: application/json");
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once '../db_connect.php';
require_once '../utils/ward_utils.php';

$feedback_id = isset($_GET['feedback_id']) ? intval($_GET['feedback_id']) : 0;
$review_id = isset($_GET['review_id']) ? intval($_GET['review_id']) : 0;
$user_id_param = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($feedback_id === 0 && $review_id === 0) {
    echo json_encode(["success" => false, "message" => "Feedback ID or Review ID is required."]);
    exit();
}

// Check if reply table exists
$check_table = $conn->query("SHOW TABLES LIKE 'feedback_replies'");
if ($check_table->num_rows === 0) {
    echo json_encode(["success" => true, "replies" => []]);
    exit();
}

// Check if user_id column exists (backward compatibility)
$check_col = $conn->query("SHOW COLUMNS FROM `feedback_replies` LIKE 'user_id'");
$has_user_id = ($check_col->num_rows > 0);

// Table existence verified by manual SQL setup

// Fetch replies with officer details and location
// We join users table to get role, photo, etc.
$where_msg = ($review_id > 0) ? "fr.review_id = ?" : "fr.feedback_id = ?";
$param_id = ($review_id > 0) ? $review_id : $feedback_id;

$sql = "SELECT 
    fr.id,
    fr.feedback_id,
    fr.review_id,
    " . ($has_user_id ? "fr.user_id" : "fr.officer_id as user_id") . ",
    " . ($has_user_id ? "fr.user_name" : "fr.officer_name as user_name") . ",
    fr.reply_text,
    fr.created_at,
    u.photo AS user_photo,
    u.role AS user_role, 
    u.work_province,
    u.work_district,
    u.work_municipality,
    u.work_ward,
    (SELECT COUNT(*) FROM feedback_votes fv WHERE fv.reply_id = fr.id AND fv.vote_type = 1) AS likes,
    (SELECT COUNT(*) FROM feedback_votes fv WHERE fv.reply_id = fr.id AND fv.vote_type = -1) AS dislikes,
    (SELECT vote_type FROM feedback_votes fv WHERE fv.reply_id = fr.id AND fv.user_id = ?) AS user_vote
FROM `feedback_replies` fr
LEFT JOIN users u ON " . ($has_user_id ? "fr.user_id" : "fr.officer_id") . " = u.id
WHERE $where_msg
ORDER BY fr.created_at ASC";

$stmt = $conn->prepare($sql);
if ($review_id > 0) {
    $stmt->bind_param("ii", $user_id_param, $review_id);
} else {
    $stmt->bind_param("ii", $user_id_param, $feedback_id);
}
$stmt->execute();
$result = $stmt->get_result();

$replies = [];

while ($row = $result->fetch_assoc()) {
    // Build a readable location string from officer's work location (only if officer)
    $officer_location = null;
    if ($row['user_role'] === 'officer') {
        $locWard = isset($row['work_ward']) && $row['work_ward'] ? intval($row['work_ward']) : null;
        $locMuni = !empty($row['work_municipality']) ? $row['work_municipality'] : null;
        $locDist = !empty($row['work_district']) ? $row['work_district'] : null;
        
        $parts = [];
        if ($locWard) { $parts[] = 'Ward ' . $locWard; }
        if ($locMuni) { $parts[] = $locMuni; }
        // if ($locDist) { $parts[] = $locDist; } // Too long ?
        $officer_location = implode(', ', $parts);
    }

    $replies[] = [
        'id' => $row['id'],
        'feedback_id' => $row['feedback_id'],
        'user_id' => $row['user_id'],
        'user_name' => $row['user_name'],
        'user_role' => $row['user_role'],
        'user_photo' => $row['user_photo'] ?: null,
        'officer_location' => $officer_location,
        'reply_text' => $row['reply_text'],
        'created_at' => $row['created_at'],
        'likes' => intval($row['likes']),
        'dislikes' => intval($row['dislikes']),
        'user_vote' => intval($row['user_vote'] ?? 0)
    ];
}

echo json_encode([
    "success" => true,
    "replies" => $replies,
    "total_replies" => count($replies)
]);

$stmt->close();
$conn->close();
?>
