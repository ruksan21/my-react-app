<?php
/**
 * Get Wards API
 * Fetches all wards with optional district filtering
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once 'db_connect.php';

// Get optional district filter from query parameter
$district_id = isset($_GET['district_id']) ? intval($_GET['district_id']) : null;

// Build query
$query = "SELECT 
    w.id,
    w.ward_number,
    w.location,
    w.contact_phone,
    w.contact_email,
    w.google_map_link,
    w.telephone,
    w.chairperson_name,
    w.chairperson_phone,
    w.chairperson_email,
    w.municipality,
    d.id as district_id,
    d.name as district_name,
    d.province,
    (SELECT COUNT(*) FROM ward_assets WHERE ward_id = w.id AND status = 'active') as total_assets
FROM wards w
INNER JOIN districts d ON w.district_id = d.id";

if ($district_id) {
    $query .= " WHERE w.district_id = $district_id";
}

$query .= " ORDER BY d.name, w.ward_number";

$result = $conn->query($query);

$wards = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $wards[] = $row;
    }
}

echo json_encode(array(
    "success" => true,
    "data" => $wards
));
?>
