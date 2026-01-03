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

// Fetch all users ordered by creation date (id)
// We might want to exclude pending officers if they are shown elsewhere, but usually 'User Management' shows active users.
// For now, fetching everything. Frontend can filter.
$query = "SELECT id, first_name, middle_name, last_name, email, contact_number, role, status, 
          ward_number, officer_id, department, assigned_ward, gender, dob, 
          district, city, citizenship_number 
          FROM users 
          ORDER BY id DESC";

$result = $conn->query($query);

if ($result) {
    echo json_encode(array("success" => true, "data" => $result->fetch_all(MYSQLI_ASSOC)));
} else {
    echo json_encode(array("success" => false, "message" => "Database Error: " . $conn->error));
}
?>
