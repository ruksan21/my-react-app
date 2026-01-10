<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../db_connect.php';

$feedback_id = isset($_GET['feedback_id']) ? intval($_GET['feedback_id']) : 0;

if ($feedback_id === 0) {
    echo json_encode(["success" => false, "message" => "Feedback ID is required."]);
    exit();
}

// Check if reply table exists
$check_table = $conn->query("SHOW TABLES LIKE 'feedback_replies'");
if ($check_table->num_rows === 0) {
    echo json_encode(["success" => true, "replies" => []]);
    exit();
}

// Fetch replies with officer details
$sql = "SELECT 
    fr.*,
    u.profile_photo
FROM `feedback_replies` fr
LEFT JOIN users u ON fr.officer_id = u.id
WHERE fr.feedback_id = ? 
ORDER BY fr.created_at ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $feedback_id);
$stmt->execute();
$result = $stmt->get_result();

$replies = [];

while ($row = $result->fetch_assoc()) {
    $replies[] = [
        'id' => $row['id'],
        'feedback_id' => $row['feedback_id'],
        'officer_id' => $row['officer_id'],
        'officer_name' => $row['officer_name'],
        'officer_photo' => $row['profile_photo'] ?: '/default-avatar.png',
        'reply_text' => $row['reply_text'],
        'created_at' => $row['created_at']
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
