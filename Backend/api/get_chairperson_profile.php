<?php
/**
 * Get Chairperson Profile API
 * Fetches chairperson profile data based on user ID or ward
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once 'db_connect.php';

// In a real scenario, you'd get this from session/auth
// For now, we'll fetch Ram Bahadur's ward (Ward 1, Kathmandu)
$ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : 1;

$query = "SELECT 
    w.ward_number,
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
    d.name as district_name
FROM wards w
INNER JOIN districts d ON w.district_id = d.id
WHERE w.id = $ward_id";

$result = $conn->query($query);

if ($result->num_rows === 0) {
    // Return default data if ward not found in database
    echo json_encode(array(
        "success" => false,
        "message" => "Ward not found, using default data",
        "data" => array(
            "ward_number" => 1,
            "district_name" => "Kathmandu",
            "location" => "Ward No. 1, Kathmandu",
            "ward_phone" => "01-4433221",
            "ward_email" => "ward1@ktm.gov.np",
            "chairperson_name" => "Ram Bahadur Shrestha",
            "chairperson_phone" => "9841234567",
            "chairperson_email" => "ram.shrestha@ktm.gov.np",
            "chairperson_education" => "Master's Degree (Political Science)",
            "chairperson_experience" => "15 years in local politics",
            "chairperson_political_party" => "Nepali Congress",
            "chairperson_appointment_date" => "2022-08-31",
            "chairperson_bio" => "Dedicated to serving the community"
        )
    ));
    exit();
}

$data = $result->fetch_assoc();

echo json_encode(array(
    "success" => true,
    "data" => $data
));
?>
