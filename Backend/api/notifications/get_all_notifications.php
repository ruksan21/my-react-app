<?php
// Prevent any output before JSON
ob_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../db_connect.php';

// Clear any output that might have occurred
ob_clean();

try {
    // Get query parameters
    $type = isset($_GET['type']) ? $_GET['type'] : 'all';
    $status = isset($_GET['status']) ? $_GET['status'] : 'all';
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 100;
    
    // Build query
    $query = "SELECT n.*, 
                     u.full_name as user_name,
                     w.municipality, w.ward_number
              FROM notifications n
              LEFT JOIN users u ON n.user_id = u.id
              LEFT JOIN wards w ON n.ward_id = w.id
              WHERE 1=1";
    
    $params = [];
    $types = "";
    
    if ($type !== 'all') {
        $query .= " AND n.type = ?";
        $params[] = $type;
        $types .= "s";
    }
    
    if ($status === 'read') {
        $query .= " AND n.is_read = 1";
    } elseif ($status === 'unread') {
        $query .= " AND n.is_read = 0";
    }
    
    $query .= " ORDER BY n.created_at DESC LIMIT ?";
    $params[] = $limit;
    $types .= "i";
    
    $stmt = $conn->prepare($query);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $notifications = [];
    while ($row = $result->fetch_assoc()) {
        $notifications[] = $row;
    }
    
    ob_clean();
    echo json_encode([
        "success" => true,
        "notifications" => $notifications,
        "total" => count($notifications)
    ]);
    
} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}

$conn->close();
ob_end_flush();
?>
