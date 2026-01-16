<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);
$officer_id = isset($data['officer_id']) ? intval($data['officer_id']) : 0;

if ($officer_id === 0) {
    echo json_encode(['success' => false, 'message' => 'Officer ID required.']);
    exit;
}

// Check if officer exists and is pending
$stmt = $conn->prepare("SELECT id, status FROM users WHERE id = ? AND role = 'officer'");
$stmt->bind_param('i', $officer_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Officer not found.']);
    exit;
}
$row = $result->fetch_assoc();
if ($row['status'] !== 'pending') {
    echo json_encode(['success' => false, 'message' => 'Officer is not pending approval.']);
    exit;
}

// Approve officer
$stmt2 = $conn->prepare("UPDATE users SET status = 'active' WHERE id = ?");
$stmt2->bind_param('i', $officer_id);
if ($stmt2->execute()) {
    echo json_encode(['success' => true, 'message' => 'Officer approved and activated!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to approve officer.']);
}

$stmt->close();
$stmt2->close();
$conn->close();
?>
