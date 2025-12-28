<?php
/**
 * Get Ward Details API
 * Fetches complete information for a specific ward including chairperson details and assets
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once 'db_connect.php';

$ward_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($ward_id === 0) {
    echo json_encode(array("success" => false, "message" => "Ward ID required."));
    exit();
}

// Get ward details
$query = "SELECT 
    w.*,
    d.name as district_name,
    d.province
FROM wards w
INNER JOIN districts d ON w.district_id = d.id
WHERE w.id = $ward_id";

$result = $conn->query($query);

if ($result->num_rows === 0) {
    echo json_encode(array("success" => false, "message" => "Ward not found."));
    exit();
}

$ward = $result->fetch_assoc();

// Get ward assets
$assets_query = "SELECT * FROM ward_assets WHERE ward_id = $ward_id ORDER BY created_at DESC";
$assets_result = $conn->query($assets_query);

$assets = array();
if ($assets_result->num_rows > 0) {
    while($row = $assets_result->fetch_assoc()) {
        $assets[] = $row;
    }
}

$ward['assets'] = $assets;

echo json_encode(array(
    "success" => true,
    "data" => $ward
));
?>
