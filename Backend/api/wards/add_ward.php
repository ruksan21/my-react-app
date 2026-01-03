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

require_once '../db_connect.php';

// Use $_POST for FormData, or json_decode for JSON (fallback)
if (!empty($_POST)) {
    $ward_number = intval($_POST['ward_number']);
    $district_id = intval($_POST['district_id']);
    $municipality = isset($_POST['municipality']) ? $conn->real_escape_string($_POST['municipality']) : '';
    $location = isset($_POST['location']) ? $conn->real_escape_string($_POST['location']) : '';
    $google_map_link = isset($_POST['google_map_link']) ? $conn->real_escape_string($_POST['google_map_link']) : '';
    $contact_phone = isset($_POST['contact_phone']) ? $conn->real_escape_string($_POST['contact_phone']) : '';
    $telephone = isset($_POST['telephone']) ? $conn->real_escape_string($_POST['telephone']) : '';
    $contact_email = isset($_POST['contact_email']) ? $conn->real_escape_string($_POST['contact_email']) : '';
    $chairperson_name = isset($_POST['chairperson_name']) ? $conn->real_escape_string($_POST['chairperson_name']) : '';
    $chairperson_phone = isset($_POST['chairperson_phone']) ? $conn->real_escape_string($_POST['chairperson_phone']) : '';
    $chairperson_email = isset($_POST['chairperson_email']) ? $conn->real_escape_string($_POST['chairperson_email']) : '';
    $chairperson_education = isset($_POST['chairperson_education']) ? $conn->real_escape_string($_POST['chairperson_education']) : '';
    $chairperson_experience = isset($_POST['chairperson_experience']) ? $conn->real_escape_string($_POST['chairperson_experience']) : '';
    $chairperson_political_party = isset($_POST['chairperson_political_party']) ? $conn->real_escape_string($_POST['chairperson_political_party']) : '';
    $chairperson_appointment_date = (isset($_POST['chairperson_appointment_date']) && !empty($_POST['chairperson_appointment_date'])) ? $conn->real_escape_string($_POST['chairperson_appointment_date']) : NULL;
    $chairperson_bio = isset($_POST['chairperson_bio']) ? $conn->real_escape_string($_POST['chairperson_bio']) : '';
} else {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data) {
        echo json_encode(array("success" => false, "message" => "No data provided."));
        exit();
    }
    $ward_number = intval($data->ward_number);
    $district_id = intval($data->district_id);
    $municipality = isset($data->municipality) ? $conn->real_escape_string($data->municipality) : '';
    $location = isset($data->location) ? $conn->real_escape_string($data->location) : '';
    $google_map_link = isset($data->google_map_link) ? $conn->real_escape_string($data->google_map_link) : '';
    $contact_phone = isset($data->contact_phone) ? $conn->real_escape_string($data->contact_phone) : '';
    $telephone = isset($data->telephone) ? $conn->real_escape_string($data->telephone) : '';
    $contact_email = isset($data->contact_email) ? $conn->real_escape_string($data->contact_email) : '';
    $chairperson_name = isset($data->chairperson_name) ? $conn->real_escape_string($data->chairperson_name) : '';
    $chairperson_phone = isset($data->chairperson_phone) ? $conn->real_escape_string($data->chairperson_phone) : '';
    $chairperson_email = isset($data->chairperson_email) ? $conn->real_escape_string($data->chairperson_email) : '';
    $chairperson_education = isset($data->chairperson_education) ? $conn->real_escape_string($data->chairperson_education) : '';
    $chairperson_experience = isset($data->chairperson_experience) ? $conn->real_escape_string($data->chairperson_experience) : '';
    $chairperson_political_party = isset($data->chairperson_political_party) ? $conn->real_escape_string($data->chairperson_political_party) : '';
    $chairperson_appointment_date = (isset($data->chairperson_appointment_date) && !empty($data->chairperson_appointment_date)) ? $conn->real_escape_string($data->chairperson_appointment_date) : NULL;
    $chairperson_bio = isset($data->chairperson_bio) ? $conn->real_escape_string($data->chairperson_bio) : '';
}

// Validate required fields
if (!$ward_number || !$district_id) {
    echo json_encode(array("success" => false, "message" => "Ward number and district are required."));
    exit();
}

// Check if ward already exists
if ($municipality) {
    $check_query = "SELECT id FROM wards WHERE ward_number = $ward_number AND district_id = $district_id AND municipality = '$municipality'";
} else {
    $check_query = "SELECT id FROM wards WHERE ward_number = $ward_number AND district_id = $district_id";
}

$check_result = $conn->query($check_query);
if ($check_result->num_rows > 0) {
    echo json_encode(array("success" => false, "message" => "This ward number already exists in the selected location."));
    exit();
}

// Handle Photo Upload if present
$chairperson_photo = '';
if (isset($_FILES['chairperson_photo']) && $_FILES['chairperson_photo']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['chairperson_photo'];
    $upload_dir = "uploads/";
    if (!file_exists($upload_dir)) mkdir($upload_dir, 0777, true);
    
    $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $chairperson_photo = "chairperson_" . time() . "_" . rand(1000, 9999) . "." . $file_extension;
    move_uploaded_file($file['tmp_name'], $upload_dir . $chairperson_photo);
}

$query = "INSERT INTO wards (
    ward_number, district_id, municipality, location, google_map_link, contact_phone, telephone, contact_email,
    chairperson_name, chairperson_phone, chairperson_email,
    chairperson_education, chairperson_experience, chairperson_political_party,
    chairperson_appointment_date, chairperson_bio, chairperson_photo
) VALUES (
    $ward_number, $district_id, '$municipality', '$location', '$google_map_link', '$contact_phone', '$telephone', '$contact_email',
    '$chairperson_name', '$chairperson_phone', '$chairperson_email',
    '$chairperson_education', '$chairperson_experience', '$chairperson_political_party',
    " . ($chairperson_appointment_date ? "'$chairperson_appointment_date'" : "NULL") . ", '$chairperson_bio', '$chairperson_photo'
)";

if ($conn->query($query)) {
    $inserted_id = $conn->insert_id;
    // Create System Alert
    $alert_title = "New Ward Added";
    $alert_message = "Ward number " . $ward_number . " has been added to the system.";
    $alert_query = "INSERT INTO system_alerts (type, title, message, status) VALUES ('success', '$alert_title', '$alert_message', 'unread')";
    $conn->query($alert_query);

    echo json_encode(array(
        "success" => true,
        "message" => "Ward added successfully.",
        "id" => $inserted_id
    ));
} else {
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $conn->error
    ));
}
?>
