<?php
/**
 * Profile Stats API v2
 * Calculates followers, ratings, reviews, and works for officers or wards.
 * Supports string-based ward IDs.
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../db_connect.php';

$officer_id = isset($_GET['officer_id']) ? intval($_GET['officer_id']) : 0;
$ward_id = isset($_GET['ward_id']) ? $conn->real_escape_string($_GET['ward_id']) : '';
$follower_id = isset($_GET['follower_id']) ? intval($_GET['follower_id']) : 0;

$follower_count = 0;
$isFollowing = false;
$avg_rating = 0;
$review_count = 0;
$total_works = 0;
$completed_works = 0;

// 1. Follower Count
if ($ward_id && $ward_id !== '0') {
    $res = $conn->query("SELECT COUNT(*) as count FROM followers WHERE ward_id = '$ward_id'");
    $follower_count = $res ? (int)$res->fetch_assoc()['count'] : 0;
} elseif ($officer_id > 0) {
    $res = $conn->query("SELECT COUNT(*) as count FROM followers WHERE officer_id = $officer_id");
    $follower_count = $res ? (int)$res->fetch_assoc()['count'] : 0;
}

// 2. Is Following
if ($follower_id > 0) {
    if ($ward_id && $ward_id !== '0') {
        $res = $conn->query("SELECT id FROM followers WHERE ward_id = '$ward_id' AND follower_id = $follower_id");
        if ($res && $res->num_rows > 0) $isFollowing = true;
    } elseif ($officer_id > 0) {
        $res = $conn->query("SELECT id FROM followers WHERE officer_id = $officer_id AND follower_id = $follower_id");
        if ($res && $res->num_rows > 0) $isFollowing = true;
    }
}

// 3. Rating & Reviews
if ($ward_id && $ward_id !== '0') {
    $check_reviews = $conn->query("SHOW TABLES LIKE 'reviews'");
    if ($check_reviews && $check_reviews->num_rows > 0) {
        $res = $conn->query("SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE ward_id = '$ward_id'");
        if ($res) {
            $row = $res->fetch_assoc();
            $avg_rating = $row['avg_rating'] ? round((float)$row['avg_rating'], 1) : 0;
            $review_count = (int)$row['review_count'];
        }
    }
} elseif ($officer_id > 0) {
    $check_wf = $conn->query("SHOW TABLES LIKE 'work_feedback'");
    if ($check_wf && $check_wf->num_rows > 0) {
        $res = $conn->query("SELECT AVG(wf.rating) as avg_rating, COUNT(wf.id) as review_count 
                             FROM `work_feedback` wf
                             JOIN `development_works` dw ON wf.work_id = dw.id
                             WHERE dw.officer_id = $officer_id");
        if ($res) {
            $row = $res->fetch_assoc();
            $avg_rating = $row['avg_rating'] ? round((float)$row['avg_rating'], 1) : 0;
            $review_count = (int)$row['review_count'];
        }
    }
}

// 4. Works Counts
if ($ward_id && $ward_id !== '0') {
    $ward_res = $conn->query("SELECT ward_number, municipality FROM wards WHERE id = '$ward_id'");
    $ward_data = $ward_res ? $ward_res->fetch_assoc() : null;
    if ($ward_data) {
        $wn = (int)$ward_data['ward_number'];
        $mun = $conn->real_escape_string($ward_data['municipality']);
        
        $res = $conn->query("SELECT COUNT(*) as count FROM `development_works` dw 
                            JOIN `users` u ON dw.officer_id = u.id 
                            WHERE u.work_ward = $wn AND u.work_municipality = '$mun'");
        $total_works = $res ? (int)$res->fetch_assoc()['count'] : 0;
        
        $res = $conn->query("SELECT COUNT(*) as count FROM `development_works` dw 
                            JOIN `users` u ON dw.officer_id = u.id 
                            WHERE u.work_ward = $wn AND u.work_municipality = '$mun' 
                            AND (LOWER(dw.status) = 'completed' OR LOWER(dw.status) = 'success')");
        $completed_works = $res ? (int)$res->fetch_assoc()['count'] : 0;
    }
} elseif ($officer_id > 0) {
    $res = $conn->query("SELECT COUNT(*) as count FROM `development_works` WHERE officer_id = $officer_id");
    $total_works = $res ? (int)$res->fetch_assoc()['count'] : 0;

    $res = $conn->query("SELECT COUNT(*) as count FROM `development_works` WHERE officer_id = $officer_id AND (LOWER(status) = 'completed' OR LOWER(status) = 'success')");
    $completed_works = $res ? (int)$res->fetch_assoc()['count'] : 0;
}

echo json_encode([
    "success" => true,
    "followers" => $follower_count,
    "rating" => $avg_rating,
    "reviews" => $review_count,
    "totalWorks" => $total_works,
    "completedWorks" => $completed_works,
    "isFollowing" => $isFollowing
]);

$conn->close();
?>
