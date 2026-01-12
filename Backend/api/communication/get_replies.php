<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once '../db_connect.php';
require_once '../utils/ward_utils.php';

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

// Fetch replies with officer details and location
$sql = "SELECT 
    fr.*, 
    u.photo AS officer_photo,
    u.work_province,
    u.work_district,
    u.work_municipality,
    u.work_ward
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
    // Build a readable location string from officer's work location
    $locWard = isset($row['work_ward']) && $row['work_ward'] ? intval($row['work_ward']) : null;
    $locMuni = !empty($row['work_municipality']) ? $row['work_municipality'] : null;
    $locDist = !empty($row['work_district']) ? $row['work_district'] : null;
    $locProv = !empty($row['work_province']) ? $row['work_province'] : null;

    $officer_location = null;
    if ($locWard || $locMuni || $locDist || $locProv) {
        $parts = [];
        if ($locWard) { $parts[] = 'Ward ' . $locWard; }
        if ($locMuni) { $parts[] = $locMuni; }
        if ($locDist) { $parts[] = $locDist; }
        if ($locProv) { $parts[] = 'Province ' . $locProv; }
        $officer_location = implode(', ', $parts);
    }

    $replies[] = [
        'id' => $row['id'],
        'feedback_id' => $row['feedback_id'],
        'officer_id' => $row['officer_id'],
        'officer_name' => $row['officer_name'],
        'officer_photo' => $row['officer_photo'] ?: '/default-avatar.png',
        'officer_location' => $officer_location,
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
