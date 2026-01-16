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
$review_id = isset($data['review_id']) ? intval($data['review_id']) : 0;
$reply_id = isset($data['reply_id']) ? intval($data['reply_id']) : 0;
$user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
$vote_type = isset($data['vote_type']) ? intval($data['vote_type']) : 0; // 1 for Like, -1 for Dislike

if (($feedback_id === 0 && $review_id === 0 && $reply_id === 0) || $user_id === 0 || !in_array($vote_type, [1, -1])) {
    echo json_encode(["success" => false, "message" => "Invalid input."]);
    exit();
}

// Determine target
if ($reply_id > 0) {
    $target_col = "reply_id";
    $target_id = $reply_id;
} else if ($review_id > 0) {
    $target_col = "review_id";
    $target_id = $review_id;
} else {
    $target_col = "feedback_id";
    $target_id = $feedback_id;
}

// Check existing vote
$stmt = $conn->prepare("SELECT id, vote_type FROM feedback_votes WHERE user_id = ? AND $target_col = ?");
$stmt->bind_param("ii", $user_id, $target_id);
$stmt->execute();
$result = $stmt->get_result();

$action = '';

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if ($row['vote_type'] == $vote_type) {
        // Same vote: Remove it (Toggle off)
        $del = $conn->prepare("DELETE FROM feedback_votes WHERE id = ?");
        $del->bind_param("i", $row['id']);
        $del->execute();
        $action = 'removed';
    } else {
        // Different vote: Update it (Change Like to Dislike or vice versa)
        $upd = $conn->prepare("UPDATE feedback_votes SET vote_type = ? WHERE id = ?");
        $upd->bind_param("ii", $vote_type, $row['id']);
        $upd->execute();
        $action = 'updated';
    }
} else {
    // New vote
    $ins = $conn->prepare("INSERT INTO feedback_votes ($target_col, user_id, vote_type) VALUES (?, ?, ?)");
    $ins->bind_param("iii", $target_id, $user_id, $vote_type);
    $ins->execute();
    $action = 'inserted';
}

// Get updated counts
$count_query = "SELECT 
    SUM(CASE WHEN vote_type = 1 THEN 1 ELSE 0 END) as likes,
    SUM(CASE WHEN vote_type = -1 THEN 1 ELSE 0 END) as dislikes
FROM feedback_votes WHERE $target_col = $target_id";
$count_res = $conn->query($count_query);
$counts = $count_res->fetch_assoc();

echo json_encode([
    "success" => true,
    "action" => $action,
    "likes" => intval($counts['likes']),
    "dislikes" => intval($counts['dislikes']),
    "user_vote" => ($action === 'removed') ? 0 : $vote_type
]);

$conn->close();
?>
