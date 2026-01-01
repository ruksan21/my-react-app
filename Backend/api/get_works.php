<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

$ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : null;

if ($ward_id) {
    // Join with users, wards, and districts to get descriptive info
    $sql = "SELECT dw.*, w.ward_number, d.name as district_name 
            FROM development_works dw 
            JOIN users u ON dw.officer_id = u.id 
            JOIN wards w ON u.assigned_ward = w.id
            JOIN districts d ON w.district_id = d.id
            WHERE u.assigned_ward = $ward_id 
            ORDER BY dw.created_at DESC";
} else {
    $sql = "SELECT dw.*, w.ward_number, d.name as district_name 
            FROM development_works dw 
            JOIN users u ON dw.officer_id = u.id 
            JOIN wards w ON u.assigned_ward = w.id
            JOIN districts d ON w.district_id = d.id
            ORDER BY dw.created_at DESC";
}

$result = $conn->query($sql);

$works = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Add a formatted location if not present
        if (empty($row['location'])) {
            $row['location'] = "Ward No. " . $row['ward_number'] . ", " . $row['district_name'];
        }
        $works[] = $row;
    }
}

echo json_encode($works);

$conn->close();
?>
