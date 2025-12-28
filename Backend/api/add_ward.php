<?php
/**
 * Add Ward API
 * Creates a new ward in the system
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (!isset($data->ward_number) || !isset($data->district_id)) {
    echo json_encode(array("success" => false, "message" => "Ward number and district are required."));
    exit();
}

$ward_number = intval($data->ward_number);
$district_id = intval($data->district_id);

// Check if ward already exists for this district
$check_query = "SELECT id FROM wards WHERE ward_number = $ward_number AND district_id = $district_id";
$check_result = $conn->query($check_query);

if ($check_result->num_rows > 0) {
    echo json_encode(array("success" => false, "message" => "This ward number already exists in the selected district."));
    exit();
}

// Build insert query
$location = isset($data->location) ? $conn->real_escape_string($data->location) : '';
$contact_phone = isset($data->contact_phone) ? $conn->real_escape_string($data->contact_phone) : '';
$contact_email = isset($data->contact_email) ? $conn->real_escape_string($data->contact_email) : '';
$chairperson_name = isset($data->chairperson_name) ? $conn->real_escape_string($data->chairperson_name) : '';
$chairperson_phone = isset($data->chairperson_phone) ? $conn->real_escape_string($data->chairperson_phone) : '';
$chairperson_email = isset($data->chairperson_email) ? $conn->real_escape_string($data->chairperson_email) : '';
$chairperson_education = isset($data->chairperson_education) ? $conn->real_escape_string($data->chairperson_education) : '';
$chairperson_experience = isset($data->chairperson_experience) ? $conn->real_escape_string($data->chairperson_experience) : '';
$chairperson_political_party = isset($data->chairperson_political_party) ? $conn->real_escape_string($data->chairperson_political_party) : '';
$chairperson_appointment_date = isset($data->chairperson_appointment_date) ? $conn->real_escape_string($data->chairperson_appointment_date) : NULL;
$chairperson_bio = isset($data->chairperson_bio) ? $conn->real_escape_string($data->chairperson_bio) : '';

$query = "INSERT INTO wards (
    ward_number, district_id, location, contact_phone, contact_email,
    chairperson_name, chairperson_phone, chairperson_email,
    chairperson_education, chairperson_experience, chairperson_political_party,
    chairperson_appointment_date, chairperson_bio
) VALUES (
    $ward_number, $district_id, '$location', '$contact_phone', '$contact_email',
    '$chairperson_name', '$chairperson_phone', '$chairperson_email',
    '$chairperson_education', '$chairperson_experience', '$chairperson_political_party',
    " . ($chairperson_appointment_date ? "'$chairperson_appointment_date'" : "NULL") . ", '$chairperson_bio'
)";

if ($conn->query($query)) {
    echo json_encode(array(
        "success" => true,
        "message" => "Ward added successfully.",
        "id" => $conn->insert_id
    ));
} else {
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $conn->error
    ));
}
?>
