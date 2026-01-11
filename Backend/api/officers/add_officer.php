<?php
ini_set('display_errors', 0);
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db_connect.php';

$upload_dir = "uploads/";
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Helper for file upload
function handleFileUpload($file, $prefix, $upload_dir) {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return ["success" => false, "message" => "Upload failed or no file provided."];
    }
    
    $allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime_type = $finfo->file($file['tmp_name']);
    
    if (!in_array($mime_type, $allowed_types)) {
        return ["success" => false, "message" => "Invalid file type. Only JPG, PNG, GIF allowed."];
    }
    
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $new_filename = $prefix . "_" . time() . "_" . uniqid() . "." . $extension;
    
    if (move_uploaded_file($file['tmp_name'], $upload_dir . $new_filename)) {
        return ["success" => true, "filename" => $new_filename];
    }
    return ["success" => false, "message" => "Failed to save file."];
}

// Read POST data (FormData sends fields as $_POST)
$first_name = $conn->real_escape_string($_POST['firstName'] ?? '');
$middle_name = $conn->real_escape_string($_POST['middleName'] ?? '');
$last_name = $conn->real_escape_string($_POST['lastName'] ?? '');
$email = $conn->real_escape_string($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$contact_number = $conn->real_escape_string($_POST['contactNumber'] ?? '');
$dob = $_POST['dob'] ? $conn->real_escape_string($_POST['dob']) : null;
$gender = $conn->real_escape_string($_POST['gender'] ?? '');
$province = $conn->real_escape_string($_POST['province'] ?? '');
$district = $conn->real_escape_string($_POST['district'] ?? 'Kathmandu');
$city = $conn->real_escape_string($_POST['city'] ?? '');
$ward_number = !empty($_POST['wardNumber']) ? intval($_POST['wardNumber']) : 1; 
$officer_id = $conn->real_escape_string($_POST['officerId'] ?? '');
$department = $conn->real_escape_string($_POST['department'] ?? '');

// Work/Office Location
$work_province = $conn->real_escape_string($_POST['workProvince'] ?? '');
$work_district = $conn->real_escape_string($_POST['workDistrict'] ?? '');
$work_municipality = $conn->real_escape_string($_POST['workMunicipality'] ?? '');
$work_ward = !empty($_POST['workWard']) ? intval($_POST['workWard']) : null;
$work_office_location = $conn->real_escape_string($_POST['workOfficeLocation'] ?? '');

// Citizenship
$citizenship_number = $conn->real_escape_string($_POST['citizenshipNumber'] ?? '');
$citizenship_issue_date = $_POST['citizenshipIssueDate'] ?? null;
$citizenship_issue_district = $conn->real_escape_string($_POST['citizenshipIssueDistrict'] ?? '');

// Validation
$errors = [];

if (empty($first_name)) $errors[] = "First name is required";
if (empty($last_name)) $errors[] = "Last name is required";
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Valid email is required";
if (empty($password) || strlen($password) < 8) $errors[] = "Password must be at least 8 characters";
if (empty($contact_number)) $errors[] = "Contact number is required";
if (empty($dob)) $errors[] = "Date of birth is required";
if (empty($gender)) $errors[] = "Gender is required";
if (empty($officer_id)) $errors[] = "Officer ID is required";
if (empty($department)) $errors[] = "Department is required";
if (empty($work_province)) $errors[] = "Work province is required";
if (empty($work_district)) $errors[] = "Work district is required";
if (empty($work_municipality)) $errors[] = "Work municipality is required";
if (empty($work_ward)) $errors[] = "Work ward is required";
if (empty($citizenship_number)) $errors[] = "Citizenship number is required";
if (empty($citizenship_issue_date)) $errors[] = "Citizenship issue date is required";
if (empty($citizenship_issue_district)) $errors[] = "Citizenship issue district is required";

// Check if files are provided
if (!isset($_FILES['citizenshipPhoto']) || $_FILES['citizenshipPhoto']['error'] !== UPLOAD_ERR_OK) {
    $errors[] = "Citizenship photo is required";
}
if (!isset($_FILES['idCardPhoto']) || $_FILES['idCardPhoto']['error'] !== UPLOAD_ERR_OK) {
    $errors[] = "Officer ID card photo is required";
}

if (!empty($errors)) {
    echo json_encode(["success" => false, "message" => implode(", ", $errors)]);
    exit();
}

// Hash password
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Handle Photos
$citizenship_photo = "";
if (isset($_FILES['citizenshipPhoto'])) {
    $res = handleFileUpload($_FILES['citizenshipPhoto'], "citizenship", $upload_dir);
    if ($res['success']) $citizenship_photo = $res['filename'];
}

$id_card_photo = "";
if (isset($_FILES['idCardPhoto'])) {
    $res = handleFileUpload($_FILES['idCardPhoto'], "officer_id", $upload_dir);
    if ($res['success']) $id_card_photo = $res['filename'];
}

$profile_photo = ""; 
if (isset($_FILES['profilePhoto'])) {
    $res = handleFileUpload($_FILES['profilePhoto'], "profile", $upload_dir);
    if ($res['success']) $profile_photo = $res['filename'];
}

$dob_val = $dob ? "'$dob'" : "NULL";
$issue_date_val = $citizenship_issue_date ? "'$citizenship_issue_date'" : "NULL";

$sql = "INSERT INTO users (
    first_name, middle_name, last_name, email, password, contact_number, dob, gender, 
    province, district, city, ward_number, citizenship_number, citizenship_issue_date, citizenship_issue_district, 
    citizenship_photo, role, officer_id, department, work_province, work_district, work_municipality, work_ward, work_office_location, id_card_photo, status, photo
) VALUES (
    '$first_name', '$middle_name', '$last_name', '$email', '$password_hash', '$contact_number', $dob_val, '$gender', 
    '$province', '$district', '$city', $ward_number, '$citizenship_number', $issue_date_val, '$citizenship_issue_district', 
    '$citizenship_photo', 'officer', '$officer_id', '$department', '$work_province', '$work_district', '$work_municipality', $work_ward, '$work_office_location', '$id_card_photo', 'active', '$profile_photo'
)";

if ($conn->query($sql)) {
    echo json_encode(["success" => true, "message" => "Officer created successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Database Error: " . $conn->error]);
}

$conn->close();
?>
