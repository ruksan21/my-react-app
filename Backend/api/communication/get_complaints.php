<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../db_connect.php';

// Fetch all complaints
$sql = "SELECT * FROM `complaints` ORDER BY created_at DESC";
$result = $conn->query($sql);

$complaints = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $complaints[] = $row;
    }
}

echo json_encode($complaints);

$conn->close();
?>
