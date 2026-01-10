<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once "../db_connect.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $userId = $_GET['user_id'] ?? null;
    $wardId = $_GET['ward_id'] ?? null;
    
    if (!$userId) {
        echo json_encode([
            "success" => false,
            "message" => "User ID is required"
        ]);
        exit();
    }

    // Build query with LEFT JOIN to ward_notices to hide expired notices
    $baseQuery = "SELECT n.id, n.title, n.message, n.type, n.is_read,
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
    
    // If ward_id is provided, filter by ward_id only (for ward-specific notifications)
    // Show only notifications for the selected ward
    // Exclude expired notices: keep if type != 'notice' OR expiry_date is NULL OR in future
    $expiryClause = "(n.type <> 'notice' OR wn.expiry_date IS NULL OR wn.expiry_date >= NOW())";
    if ($wardId) {
        $query = $baseQuery . "n.ward_id = ? AND " . $expiryClause . " ORDER BY n.created_at DESC LIMIT 50";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $wardId);
    } else {
        $query = $baseQuery . "n.user_id = ? AND " . $expiryClause . " ORDER BY n.created_at DESC LIMIT 50";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $userId);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $notifications = [];
    while ($row = $result->fetch_assoc()) {
        $notifications[] = [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'message' => $row['message'],
            'type' => $row['type'],
            'read' => (bool)$row['is_read'],
            'time' => $row['time']
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
