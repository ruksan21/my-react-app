<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../db_connect.php';

$work_id = isset($_GET['work_id']) ? intval($_GET['work_id']) : 0;

if ($work_id === 0) {
    echo json_encode(["success" => false, "message" => "Work ID is required."]);
    exit();
}

// Fetch comments with user details
$sql = "SELECT 
    wf.*,
    COALESCE(u.full_name, wf.user_name, 'Anonymous') as user_name,
    COALESCE(u.profile_photo, '/default-avatar.png') as user_photo,
    u.email as user_email
FROM `work_feedback` wf
LEFT JOIN users u ON wf.user_id = u.id
WHERE wf.work_id = ? 
ORDER BY wf.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $work_id);
$stmt->execute();
$result = $stmt->get_result();

$comments = [];
$total_rating = 0;
$count = 0;

while ($row = $result->fetch_assoc()) {
    $comments[] = [
        'id' => $row['id'],
        'work_id' => $row['work_id'],
        'user_id' => $row['user_id'],
        'user_name' => $row['user_name'],
        'user_photo' => $row['user_photo'],
        'user_email' => $row['user_email'],
        'rating' => (int)$row['rating'],
        'comment' => $row['comment'],
        'created_at' => $row['created_at']
    ];
    $total_rating += $row['rating'];
    $count++;
}

$average_rating = ($count > 0) ? round($total_rating / $count, 1) : 0;

echo json_encode([
    "success" => true,
    "comments" => $comments,
    "average_rating" => $average_rating,
    "total_reviews" => $count
]);

$stmt->close();
$conn->close();
?>
