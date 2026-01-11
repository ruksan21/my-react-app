<?php
/**
 * Get Chairperson Profile API
 * Fetches chairperson profile data based on user ID or ward
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once '../db_connect.php';
require_once '../utils/ward_utils.php';

$ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : 0;

// Dynamic Resolution if ward_id not provided
if ($ward_id === 0) {
    if (isset($_GET['municipality']) && isset($_GET['ward_number'])) {
        $mun = $_GET['municipality'];
        $wn = intval($_GET['ward_number']);
        $prov = isset($_GET['province']) ? $_GET['province'] : null;
        $dist = isset($_GET['district']) ? $_GET['district'] : null;
        
        $ward_id = resolveWardIdFlexible($conn, $prov, $dist, $mun, $wn);
    }
}

if ($ward_id === 0) {
    echo json_encode(array(
        "success" => false,
        "message" => "Ward ID or valid Location (Municipality + Ward Number) required."
    ));
    exit();
}

$query = "SELECT 
    w.id as ward_id,
    w.ward_number,
    w.municipality,
    w.location,
    w.province,
    d.name as district_name,
    w.contact_phone as ward_phone,
    w.contact_email as ward_email,
    w.chairperson_name,
    w.chairperson_phone,
    w.chairperson_email,
    w.chairperson_education,
    w.chairperson_experience,
    w.chairperson_political_party,
    w.chairperson_appointment_date,
    w.chairperson_bio,
    w.chairperson_photo,
    (SELECT u.id 
     FROM users u 
     WHERE u.assigned_ward_id = w.id
     AND u.role = 'officer' 
     AND u.status = 'active'
     ORDER BY u.created_at DESC
     LIMIT 1) as officer_user_id
FROM wards w
LEFT JOIN districts d ON w.district_id = d.id
WHERE w.id = ?";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $ward_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(array(
        "success" => false,
        "message" => "Ward not found"
    ));
    exit();
}

$data = $result->fetch_assoc();

echo json_encode(array(
    "success" => true,
    "data" => $data
));
?>
