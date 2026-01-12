<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$user_id = intval($data['user_id']);
$subject = $conn->real_escape_string($data['subject']);
$message = $conn->real_escape_string($data['message']);

// Insert complaint
$stmt = $conn->prepare("INSERT INTO complaints (user_id, subject, message) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $user_id, $subject, $message);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Complaint sent successfully!', 'complaint_id' => $conn->insert_id]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to send complaint']);
}

$stmt->close();
$conn->close();
?>
