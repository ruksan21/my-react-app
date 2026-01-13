<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once "../db_connect.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $userId = $_GET['user_id'] ?? null;
    $wardId = $_GET['ward_id'] ?? null;
    
    // Define expiry clause to hide expired related notices
    $expiryClause = "(wn.expiry_date IS NULL OR wn.expiry_date >= CURDATE())";
    
    if (!$userId) {
        echo json_encode([
            "success" => false,
            "message" => "User ID is required"
        ]);
        exit();
    }

    // Build query with LEFT JOIN to ward_notices to hide expired notices
    $baseQuery = "SELECT n.id, n.title, n.message, n.type, n.is_read, 
              n.source_province, n.source_district, n.source_municipality, n.source_ward,
              CASE 
                  WHEN TIMESTAMPDIFF(MINUTE, n.created_at, NOW()) < 60 
                      THEN CONCAT(TIMESTAMPDIFF(MINUTE, n.created_at, NOW()), ' minutes ago')
                  WHEN TIMESTAMPDIFF(HOUR, n.created_at, NOW()) < 24 
                      THEN CONCAT(TIMESTAMPDIFF(HOUR, n.created_at, NOW()), ' hours ago')
                  ELSE CONCAT(TIMESTAMPDIFF(DAY, n.created_at, NOW()), ' days ago')
              END as time
              FROM notifications n
              LEFT JOIN ward_notices wn ON n.related_notice_id = wn.id
              WHERE ";
    
// If ward_id is provided, strict filtering for that ward
    // This handles the user's request: "jun wada ko notification officer la create garxa tai wada ma dakhinu paro"
    
    if ($wardId) {
        // Strict filtering for the selected ward only. This ensures the user only sees
        // notifications specifically tagged to this ward.
        $query = $baseQuery . "n.ward_id = ? AND (n.user_id = ? OR n.user_id IS NULL) AND " . $expiryClause . " ORDER BY n.created_at DESC LIMIT 50";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ii", $wardId, $userId);
    } else {
        // For user-specific notifications (dashboard feed)
        // Ensure we only show notifications for the user's ward or global ones
        // Also fetch the source location details if available
        $query = "SELECT n.id, n.title, n.message, n.type, n.is_read, n.ward_id,
              n.source_province, n.source_district, n.source_municipality, n.source_ward,
              w.municipality, w.ward_number, w.district_name, w.province,
              CASE 
                  WHEN TIMESTAMPDIFF(MINUTE, n.created_at, NOW()) < 60 
                      THEN CONCAT(TIMESTAMPDIFF(MINUTE, n.created_at, NOW()), ' minutes ago')
                  WHEN TIMESTAMPDIFF(HOUR, n.created_at, NOW()) < 24 
                      THEN CONCAT(TIMESTAMPDIFF(HOUR, n.created_at, NOW()) , ' hours ago')
                  ELSE CONCAT(TIMESTAMPDIFF(DAY, n.created_at, NOW()), ' days ago')
              END as time
              FROM notifications n
              LEFT JOIN ward_notices wn ON n.related_notice_id = wn.id
              LEFT JOIN wards w ON n.ward_id = w.id
              WHERE n.user_id = ? 
              AND " . $expiryClause . " 
              ORDER BY n.created_at DESC LIMIT 50";
              
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $userId);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $notifications = [];
    while ($row = $result->fetch_assoc()) {
        // Construct source string if data available
        // Prefer DB columns (denormalized) if present, else fallback to JOINed values
        $p = $row['source_province'] ?? $row['province'];
        $d = $row['source_district'] ?? $row['district_name'];
        $m = $row['source_municipality'] ?? $row['municipality'];
        $w = $row['source_ward'] ?? $row['ward_number'];
        
        $source = '';
        if (!empty($m) && !empty($w)) {
             $source = $m . '-' . $w . ', ' . $d;
        }
        
        $notifications[] = [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'message' => $row['message'],
            'type' => $row['type'],
            'read' => (bool)$row['is_read'],
            'time' => $row['time'],
            'source' => $source
        ];
    }
    
    echo json_encode([
        "success" => true,
        "data" => $notifications,
        "unread_count" => count(array_filter($notifications, fn($n) => !$n['read']))
    ]);
    
    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}

$conn->close();
?>
