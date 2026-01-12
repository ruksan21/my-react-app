<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../db_connect.php';

$complaint_id = isset($_GET['complaint_id']) ? intval($_GET['complaint_id']) : 0;

if ($complaint_id === 0) {
    echo json_encode(['success' => false, 'message' => 'Complaint ID required']);
    exit;
}

// Get all replies for a complaint
$stmt = $conn->prepare("SELECT cr.*, u.full_name as replied_by_name, u.role 
                        FROM complaint_replies cr 
                        LEFT JOIN users u ON cr.replied_by = u.id 
                        WHERE cr.complaint_id = ? 
                        ORDER BY cr.created_at ASC");
$stmt->bind_param("i", $complaint_id);
$stmt->execute();
$result = $stmt->get_result();

$replies = [];
while ($row = $result->fetch_assoc()) {
    $replies[] = $row;
}

echo json_encode(['success' => true, 'replies' => $replies]);

$stmt->close();
$conn->close();
?>
