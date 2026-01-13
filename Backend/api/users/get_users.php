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
// Check if a specific ID is requested
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT id, first_name, middle_name, last_name, email, contact_number, role, status, 
          ward_number, officer_id, department, work_province, work_district, work_municipality, work_ward, work_ward_id, work_office_location, gender, dob, 
          province, district, city, citizenship_number, created_at, photo 
          FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    // Fetch all users ordered by creation date (id)
    $query = "SELECT id, first_name, middle_name, last_name, email, contact_number, role, status, 
          ward_number, officer_id, department, work_province, work_district, work_municipality, work_ward, work_ward_id, work_office_location, gender, dob, 
          province, district, city, citizenship_number, created_at, photo 
          FROM users 
          ORDER BY id DESC";
    $result = $conn->query($query);
}

if ($result) {
    echo json_encode(array("success" => true, "data" => $result->fetch_all(MYSQLI_ASSOC)));
} else {
    echo json_encode(array("success" => false, "message" => "Database Error: " . $conn->error));
}
?>
