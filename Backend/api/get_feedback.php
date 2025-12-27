<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once 'db_connect.php';

$work_id = isset($_GET['work_id']) ? intval($_GET['work_id']) : 0;

if ($work_id === 0) {
    echo json_encode(["success" => false, "message" => "Work ID is required."]);
    exit();
}

// Fetch comments
$sql = "SELECT * FROM `work_feedback` WHERE work_id = ? ORDER BY created_at DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $work_id);
$stmt->execute();
$result = $stmt->get_result();

$comments = [];
$total_rating = 0;
$count = 0;

while ($row = $result->fetch_assoc()) {
    $comments[] = $row;
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
