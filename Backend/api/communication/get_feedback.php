<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once '../db_connect.php';

$work_id = isset($_GET['work_id']) ? intval($_GET['work_id']) : 0;

if ($work_id === 0) {
    echo json_encode(["success" => false, "message" => "Work ID is required."]);
    exit();
}

// Fetch comments with user details
$sql = "SELECT 
    wf.*,
    u.first_name, u.last_name, u.role as user_role,
    u.photo as user_photo,
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
    $full_name = 'Anonymous';
    if ($row['first_name']) {
        $full_name = $row['first_name'] . ' ' . $row['last_name'];
    } elseif ($row['user_name']) {
        $full_name = $row['user_name'];
    }
    
    $comments[] = [
        'id' => $row['id'],
        'work_id' => $row['work_id'],
        'user_id' => $row['user_id'],
        'user_role' => $row['user_role'] ?? 'guest',
        'user_name' => $full_name,
        'user_photo' => $row['user_photo'] ?: '/default-avatar.png',
        'user_email' => $row['user_email'],
        'rating' => (int)$row['rating'],
        'comment' => $row['comment'],
        'created_at' => $row['created_at']
    ];
    if ($row['rating'] > 0) {
        $total_rating += $row['rating'];
        $count++;
    }
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
