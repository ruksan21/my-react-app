<?php
/**
 * Get Chairperson Profile API
 * Fetches chairperson profile data based on user ID or ward
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once '../db_connect.php';

// In a real scenario, you'd get this from session/auth
// For now, we'll fetch Ram Bahadur's ward (Ward 1, Kathmandu)
$ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : 1;

$query = "SELECT 
    w.id as ward_id,
    w.ward_number,
    w.municipality,
    w.location,
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
    d.name as district_name,
    (SELECT u.id 
     FROM users u 
     WHERE u.work_ward = w.ward_number 
     AND u.work_municipality = w.municipality
     AND u.role = 'officer' 
     AND u.status = 'approved'
     LIMIT 1) as officer_user_id
FROM wards w
INNER JOIN districts d ON w.district_id = d.id
WHERE w.id = $ward_id";

$result = $conn->query($query);

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
