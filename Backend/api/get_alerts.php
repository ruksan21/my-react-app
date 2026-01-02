<?php
// Disable error reporting to prevent HTML warnings breaking JSON
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once 'db_connect.php';

// Check connection
if ($conn->connect_error) {
    echo json_encode([]);
    exit();
}

// Check if table exists
$tableCheck = $conn->query("SHOW TABLES LIKE 'system_alerts'");
if ($tableCheck->num_rows == 0) {
    // Table missing, return empty array (frontend will show 0 alerts, no error)
    echo json_encode([]);
    exit();
}

$query = "SELECT * FROM system_alerts ORDER BY created_at DESC";
$result = $conn->query($query);

if (!$result) {
    echo json_encode([]);
    exit();
}

$alerts = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $row['timestamp'] = date("Y-m-d H:i", strtotime($row['created_at']));
        $alerts[] = $row;
    }
}

echo json_encode($alerts);
?>
