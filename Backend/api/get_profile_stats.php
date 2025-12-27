<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once 'db_connect.php';

// In a real app, you'd pass the officer_id. 
// For now, we'll calculate stats for the entire ward or a default officer.
$officer_id = isset($_GET['officer_id']) ? intval($_GET['officer_id']) : 1;

// Get follower count
$sql_followers = "SELECT COUNT(*) as count FROM `followers` WHERE officer_id = ?";
$stmt_f = $conn->prepare($sql_followers);
$stmt_f->bind_param("i", $officer_id);
$stmt_f->execute();
$res_f = $stmt_f->get_result()->fetch_assoc();
$follower_count = $res_f['count'];

// Get average rating across all works for this officer (or just overall reviews)
$sql_rating = "SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM `work_feedback` wf
               JOIN `development_works` dw ON wf.work_id = dw.id";
// Add WHERE dw.officer_id = ? if multiple officers exist

$res_r = $conn->query($sql_rating)->fetch_assoc();
$avg_rating = $res_r['avg_rating'] ? round($res_r['avg_rating'], 1) : 0;
$review_count = $res_r['review_count'];

echo json_encode([
    "success" => true,
    "followers" => $follower_count,
    "rating" => $avg_rating,
    "reviews" => $review_count
]);

$stmt_f->close();
$conn->close();
?>
