<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
ini_set('display_errors', 0); // Disable error display to prevent breaking JSON
error_reporting(E_ALL);

// Handle OPTIONS request (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// DB connection file lyayeko
require_once '../db_connect.php';

// Photo save garniko lagi folder banayeko (yedi xaina bhane)
$upload_dir = "uploads/";
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Form bata aayeko common fields
$role = $_POST['role'] ?? 'citizen';
$first_name = $conn->real_escape_string($_POST['firstName'] ?? ''); 
$middle_name = $conn->real_escape_string($_POST['middleName'] ?? '');
$last_name = $conn->real_escape_string($_POST['lastName'] ?? '');
$email = $conn->real_escape_string($_POST['email'] ?? '');
$password_plain = $_POST['password'] ?? '';
$password = $password_plain ? password_hash($password_plain, PASSWORD_DEFAULT) : '';
$contact_number = $conn->real_escape_string($_POST['contactNumber'] ?? '');
$dob = ($_POST['dob'] ?? '') ? $conn->real_escape_string($_POST['dob']) : null;
$gender = $conn->real_escape_string($_POST['gender'] ?? '');
$district = $conn->real_escape_string($_POST['district'] ?? '');
$city = $conn->real_escape_string($_POST['city'] ?? '');
$ward_number = (isset($_POST['wardNumber']) && $_POST['wardNumber'] !== '') ? intval($_POST['wardNumber']) : 'NULL';

// Citizenship details
$citizenship_number = $conn->real_escape_string($_POST['citizenshipNumber'] ?? '');
$citizenship_issue_date = ($_POST['citizenshipIssueDate'] ?? '') ? $conn->real_escape_string($_POST['citizenshipIssueDate']) : null;
$citizenship_issue_district = $conn->real_escape_string($_POST['citizenshipIssueDistrict'] ?? '');

// Officer-specific fields
$officer_id = $conn->real_escape_string($_POST['officerId'] ?? '');
$department = $conn->real_escape_string($_POST['department'] ?? '');
$assigned_ward = (isset($_POST['assignedWard']) && $_POST['assignedWard'] !== '') ? intval($_POST['assignedWard']) : 'NULL';

// Helper function for file upload
function handleFileUpload($file, $prefix, $upload_dir) {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return ["success" => false, "message" => "Upload failed or no file provided."];
    }
    
    // Validate file type
    $allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    $mime_type = "";
    
    if (class_exists('finfo')) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime_type = $finfo->file($file['tmp_name']);
    } else {
        // Fallback if finfo is not enabled
        $mime_type = $file['type'];
    }
    
    if (!in_array($mime_type, $allowed_types)) {
        return ["success" => false, "message" => "Invalid file type ($mime_type). Only images allow."];
    }
    
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $new_filename = $prefix . "_" . time() . "_" . uniqid() . "." . $extension;
    
    if (move_uploaded_file($file['tmp_name'], $upload_dir . $new_filename)) {
        return ["success" => true, "filename" => $new_filename];
    }
    
    return ["success" => false, "message" => "Failed to move uploaded file."];
}

// Photo upload logic for Citizenship
$citizenship_photo = "";
if (isset($_FILES['citizenshipPhoto']) && $_FILES['citizenshipPhoto']['error'] === UPLOAD_ERR_OK) {
    $upload_result = handleFileUpload($_FILES['citizenshipPhoto'], "citizenship", $upload_dir);
    if ($upload_result['success']) {
        $citizenship_photo = $upload_result['filename'];
    } else {
        echo json_encode(["success" => false, "message" => "Citizenship Photo Error: " . $upload_result['message']]);
        exit();
    }
} else {
    // Fail if photo is mandatory but missing (it is marked * in frontend)
    if (!$first_name || !$last_name || !$email || !$password_plain || !$citizenship_number) {
        echo json_encode(["success" => false, "message" => "All mandatory fields are required."]);
        exit();
    }
    echo json_encode(["success" => false, "message" => "Citizenship Photo is required."]);
    exit();
}

// Photo upload logic for Officer ID Card
$id_card_photo = "";
if ($role === 'officer') {
    if (isset($_FILES['idCardPhoto']) && $_FILES['idCardPhoto']['error'] === UPLOAD_ERR_OK) {
        $upload_result = handleFileUpload($_FILES['idCardPhoto'], "id_card", $upload_dir);
        if ($upload_result['success']) {
            $id_card_photo = $upload_result['filename'];
        } else {
            echo json_encode(["success" => false, "message" => "ID Card Photo Error: " . $upload_result['message']]);
            exit();
        }
    } else {
         echo json_encode(["success" => false, "message" => "Officer ID Card Photo is required."]);
         exit();
    }
}

// SQL query ma value rakhda NULL check gareko
$dob_val = $dob ? "'$dob'" : "NULL";
$issue_date_val = $citizenship_issue_date ? "'$citizenship_issue_date'" : "NULL";

// Database ma user ko sabai info insert gareko
$query = "INSERT INTO users (
    first_name, middle_name, last_name, email, password, contact_number, dob, gender, 
    district, city, ward_number, citizenship_number, citizenship_issue_date, citizenship_issue_district, 
    citizenship_photo, role, officer_id, department, assigned_ward, id_card_photo, status
) VALUES (
    '$first_name', '$middle_name', '$last_name', '$email', '$password', '$contact_number', $dob_val, '$gender', 
    '$district', '$city', $ward_number, '$citizenship_number', $issue_date_val, '$citizenship_issue_district', 
    '$citizenship_photo', '$role', '$officer_id', '$department', $assigned_ward, '$id_card_photo', 
    " . ($role === 'officer' ? "'pending'" : "'active'") . "
)";

try {
    if ($conn->query($query)) {
        
        // Create System Alert
        $alert_type = $role === 'officer' ? "info" : "success";
        $alert_title = $role === 'officer' ? "New Officer Application" : "New User Registration";
        $alert_message = "A new " . $role . " (" . $first_name . " " . $last_name . ") has registered.";
        
        $alert_query = "INSERT INTO system_alerts (type, title, message, status) VALUES ('$alert_type', '$alert_title', '$alert_message', 'unread')";
        $conn->query($alert_query); 

        echo json_encode(array("success" => true, "message" => "Registration successful!"));
    } else {
        echo json_encode(array("success" => false, "message" => "Database Error: " . $conn->error));
    }
} catch (Exception $e) {
    echo json_encode(array("success" => false, "message" => "Fatal Error: " . $e->getMessage()));
}
?>
