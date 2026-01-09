<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once '../db_connect.php';

$ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : 0;

if ($ward_id > 0) {
    $sql = "SELECT r.id, r.rating, r.comment, r.created_at, u.first_name, u.last_name 
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.ward_id = $ward_id
            ORDER BY r.created_at DESC";
    
    $result = $conn->query($sql);
    
    $reviews = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $reviews[] = $row;
        }
    }
    
    // Calculate average
    $avgSql = "SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE ward_id = $ward_id";
    $avgResult = $conn->query($avgSql);
    $stats = $avgResult->fetch_assoc();
    
    echo json_encode([
        "success" => true, 
        "data" => $reviews,
        "stats" => [
            "rating" => round($stats['avg_rating'], 1) ?? 0,
            "count" => $stats['total_reviews'] ?? 0
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Ward ID required"]);
}

$conn->close();
?>
