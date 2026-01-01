<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once 'db_connect.php';

// In a real app, you'd pass the officer_id or ward_id.
$officer_id = isset($_GET['officer_id']) ? intval($_GET['officer_id']) : null;
$ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : null;
$follower_id = isset($_GET['follower_id']) ? intval($_GET['follower_id']) : null;

// If neither is provided, default to officer_id 1
if (!$officer_id && !$ward_id) {
    $officer_id = 1;
}

// Get follower count
if ($ward_id) {
    // Count followers for any officer in this ward (or maybe just the chairperson?)
    // For now, let's assume stats are linked to the ward's chairperson
    $sql_followers = "SELECT COUNT(*) as count FROM `followers` f 
                      JOIN `users` u ON f.officer_id = u.id 
                      WHERE u.assigned_ward = ?";
    $stmt_f = $conn->prepare($sql_followers);
    $stmt_f->bind_param("i", $ward_id);
} else {
    $sql_followers = "SELECT COUNT(*) as count FROM `followers` WHERE officer_id = ?";
    $stmt_f = $conn->prepare($sql_followers);
    $stmt_f->bind_param("i", $officer_id);
}
$stmt_f->execute();
$res_f = $stmt_f->get_result()->fetch_assoc();
$follower_count = $res_f['count'];

// Check if current user is following
$isFollowing = false;
if ($follower_id) {
    if ($ward_id) {
        $sql_check = "SELECT f.id FROM `followers` f 
                      JOIN `users` u ON f.officer_id = u.id 
                      WHERE u.assigned_ward = ? AND f.follower_id = ?";
        $stmt_c = $conn->prepare($sql_check);
        $stmt_c->bind_param("ii", $ward_id, $follower_id);
    } else {
        $sql_check = "SELECT id FROM `followers` WHERE officer_id = ? AND follower_id = ?";
        $stmt_c = $conn->prepare($sql_check);
        $stmt_c->bind_param("ii", $officer_id, $follower_id);
    }
    $stmt_c->execute();
    if ($stmt_c->get_result()->num_rows > 0) {
        $isFollowing = true;
    }
}

// Get average rating across all works for this ward/officer
if ($ward_id) {
    $sql_rating = "SELECT AVG(wf.rating) as avg_rating, COUNT(wf.id) as review_count 
                   FROM `work_feedback` wf
                   JOIN `development_works` dw ON wf.work_id = dw.id
                   JOIN `users` u ON dw.officer_id = u.id
                   WHERE u.assigned_ward = $ward_id";
} else {
    $sql_rating = "SELECT AVG(wf.rating) as avg_rating, COUNT(wf.id) as review_count 
                   FROM `work_feedback` wf
                   JOIN `development_works` dw ON wf.work_id = dw.id
                   WHERE dw.officer_id = $officer_id";
}

$res_r = $conn->query($sql_rating)->fetch_assoc();
$avg_rating = $res_r['avg_rating'] ? round($res_r['avg_rating'], 1) : 0;
$review_count = $res_r['review_count'];

// Get work counts
if ($ward_id) {
    $sql_total_works = "SELECT COUNT(*) as count FROM `development_works` dw 
                        JOIN `users` u ON dw.officer_id = u.id 
                        WHERE u.assigned_ward = ?";
    $stmt_tw = $conn->prepare($sql_total_works);
    $stmt_tw->bind_param("i", $ward_id);
} else {
    $sql_total_works = "SELECT COUNT(*) as count FROM `development_works` WHERE officer_id = ?";
    $stmt_tw = $conn->prepare($sql_total_works);
    $stmt_tw->bind_param("i", $officer_id);
}
$stmt_tw->execute();
$total_works = $stmt_tw->get_result()->fetch_assoc()['count'];

if ($ward_id) {
    $sql_completed_works = "SELECT COUNT(*) as count FROM `development_works` dw 
                            JOIN `users` u ON dw.officer_id = u.id 
                            WHERE u.assigned_ward = ? AND (LOWER(dw.status) = 'completed' OR LOWER(dw.status) = 'success')";
    $stmt_cw = $conn->prepare($sql_completed_works);
    $stmt_cw->bind_param("i", $ward_id);
} else {
    $sql_completed_works = "SELECT COUNT(*) as count FROM `development_works` WHERE officer_id = ? AND (LOWER(status) = 'completed' OR LOWER(status) = 'success')";
    $stmt_cw = $conn->prepare($sql_completed_works);
    $stmt_cw->bind_param("i", $officer_id);
}
$stmt_cw->execute();
$completed_works = $stmt_cw->get_result()->fetch_assoc()['count'];

echo json_encode([
    "success" => true,
    "followers" => $follower_count,
    "rating" => $avg_rating,
    "reviews" => $review_count,
    "totalWorks" => $total_works,
    "completedWorks" => $completed_works,
    "isFollowing" => $isFollowing
]);

$stmt_f->close();
$conn->close();
?>
