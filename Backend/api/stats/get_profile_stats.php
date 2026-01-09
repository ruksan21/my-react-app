<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../db_connect.php';

$officer_id = isset($_GET['officer_id']) ? intval($_GET['officer_id']) : null;
$ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : null;
$follower_id = isset($_GET['follower_id']) ? intval($_GET['follower_id']) : null;

if (!$officer_id && !$ward_id) {
    if ($ward_id === 0) { 
        // Allow ward_id 0? No.
        $officer_id = 1; 
    }
}

// 1. Follower Count
if ($ward_id) {
    // Count followers linked to this ward ID explicitly + those linked to officer of this ward?
    // Simplified: Just count where ward_id matches or indirectly linked?
    // Let's count direct ward follows for now which covers the new feature.
    // If we want to combine: SELECT COUNT(*) FROM followers WHERE ward_id = $ward_id OR officer_id IN (SELECT id FROM users WHERE work_ward = ...)
    // Given the user's request, let's stick to the new direct follow capability.
    
    // Check if we should also include old officer-based follows? 
    // The previous code did: JOIN users ... WHERE work_ward = ward_id.
    // Let's do a UNION or OR logic to be safe/complete.
    // SQL: Count unique follower_id's for this ward (either direct ward connection or via officer)
    $sql_followers = "SELECT COUNT(DISTINCT follower_id) as count FROM followers f 
                      LEFT JOIN users u ON f.officer_id = u.id
                      WHERE f.ward_id = ? OR (u.work_ward = (SELECT ward_number FROM wards WHERE id = ?) AND u.work_municipality = (SELECT municipality FROM wards WHERE id = ?))";
    // This supports both. But might be slow.
    // Let's try simpler: distinct count of followers.
    
    // Actually, for this specific request "No officer account", we mainly care about `ward_id`.
    $sql_followers = "SELECT COUNT(*) as count FROM followers WHERE ward_id = ?";
    $stmt_f = $conn->prepare($sql_followers);
    $stmt_f->bind_param("i", $ward_id);
} else {
    $sql_followers = "SELECT COUNT(*) as count FROM followers WHERE officer_id = ?";
    $stmt_f = $conn->prepare($sql_followers);
    $stmt_f->bind_param("i", $officer_id);
}
$stmt_f->execute();
$res_f = $stmt_f->get_result()->fetch_assoc();
$follower_count = $res_f['count'];

// 2. Is Following
$isFollowing = false;
if ($follower_id) {
    if ($ward_id) {
        $sql_check = "SELECT id FROM followers WHERE ward_id = ? AND follower_id = ?";
        $stmt_c = $conn->prepare($sql_check);
        $stmt_c->bind_param("ii", $ward_id, $follower_id);
    } else {
        $sql_check = "SELECT id FROM followers WHERE officer_id = ? AND follower_id = ?";
        $stmt_c = $conn->prepare($sql_check);
        $stmt_c->bind_param("ii", $officer_id, $follower_id);
    }
    $stmt_c->execute();
    if ($stmt_c->get_result()->num_rows > 0) {
        $isFollowing = true;
    }
}

// 3. Rating & Reviews
// If ward_id is present, use the new `reviews` table.
if ($ward_id) {
    $sql_rating = "SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE ward_id = $ward_id";
} else {
    // Fallback to old work_feedback
    $sql_rating = "SELECT AVG(wf.rating) as avg_rating, COUNT(wf.id) as review_count 
                   FROM `work_feedback` wf
                   JOIN `development_works` dw ON wf.work_id = dw.id
                   WHERE dw.officer_id = $officer_id";
}
$res_r = $conn->query($sql_rating)->fetch_assoc();
$avg_rating = $res_r['avg_rating'] ? round($res_r['avg_rating'], 1) : 0;
$review_count = $res_r['review_count'] ?? 0;


// 4. Works Counts (Existing logic relying on Officer presence is fine for Works)
// If no officer, 0 works is accurate.
$total_works = 0;
$completed_works = 0;

if ($ward_id) {
    // Try to find works linked to this ward (via users working in this ward)
    // Finding ward_number first
    $ward_lookup = $conn->query("SELECT ward_number, municipality FROM wards WHERE id = $ward_id")->fetch_assoc();
    if ($ward_lookup) {
        $w_num = $ward_lookup['ward_number'];
        $w_mun = $ward_lookup['municipality'];
        
        // Find works by officers in this ward
        $sql_total_works = "SELECT COUNT(*) as count FROM `development_works` dw 
                            JOIN `users` u ON dw.officer_id = u.id 
                            WHERE u.work_ward = $w_num AND u.work_municipality = '$w_mun'";
        
        $res_tw = $conn->query($sql_total_works)->fetch_assoc();
        $total_works = $res_tw['count'];
        
        $sql_completed_works = "SELECT COUNT(*) as count FROM `development_works` dw 
                                JOIN `users` u ON dw.officer_id = u.id 
                                WHERE u.work_ward = $w_num AND u.work_municipality = '$w_mun' 
                                AND (LOWER(dw.status) = 'completed' OR LOWER(dw.status) = 'success')";
        $res_cw = $conn->query($sql_completed_works)->fetch_assoc();
        $completed_works = $res_cw['count'];
    }
} else {
    $sql_total_works = "SELECT COUNT(*) as count FROM `development_works` WHERE officer_id = $officer_id";
    $res_tw = $conn->query($sql_total_works)->fetch_assoc();
    $total_works = $res_tw['count'];

    $sql_completed_works = "SELECT COUNT(*) as count FROM `development_works` WHERE officer_id = $officer_id AND (LOWER(status) = 'completed' OR LOWER(status) = 'success')";
    $res_cw = $conn->query($sql_completed_works)->fetch_assoc();
    $completed_works = $res_cw['count'];
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

$stmt_f->close();
$conn->close();
?>
