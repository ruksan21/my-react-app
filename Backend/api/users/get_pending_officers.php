<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db_connect.php';

// Pending officer haru matra select gareko
$query = "SELECT id, first_name, middle_name, last_name, email, officer_id, department, assigned_ward as ward, status 
          FROM users 
          WHERE role = 'officer' AND status = 'pending'
          ORDER BY created_at DESC";

$result = $conn->query($query);

$officers = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Name concat gareko frontend matching ko lagi
        $row['name'] = $row['first_name'] . ($row['middle_name'] ? " " . $row['middle_name'] : "") . " " . $row['last_name'];
        $officers[] = $row;
    }
}

echo json_encode(array("success" => true, "data" => $officers));
?>
