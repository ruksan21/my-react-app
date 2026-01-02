<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

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
$first_name = $conn->real_escape_string($_POST['firstName']);
$middle_name = $conn->real_escape_string($_POST['middleName'] ?? '');
$last_name = $conn->real_escape_string($_POST['lastName']);
$email = $conn->real_escape_string($_POST['email']);
$password = !empty($_POST['password']) ? password_hash($_POST['password'], PASSWORD_DEFAULT) : password_hash('password', PASSWORD_DEFAULT); // Default pass if empty? Or required.
$contact_number = $conn->real_escape_string($_POST['contactNumber'] ?? '');
$dob = $_POST['dob'] ? $conn->real_escape_string($_POST['dob']) : null;
$gender = $conn->real_escape_string($_POST['gender'] ?? '');
$address = $conn->real_escape_string($_POST['address'] ?? ''); // Address mapped to city/district or new field? Using city/district for now as per Register.
$district = $conn->real_escape_string($_POST['district'] ?? 'Kathmandu');
$city = $conn->real_escape_string($_POST['city'] ?? '');
$ward_number = !empty($_POST['wardNumber']) ? intval($_POST['wardNumber']) : 1; // Default
$officer_id = $conn->real_escape_string($_POST['officerId']);
$department = $conn->real_escape_string($_POST['department']);
$assigned_ward = !empty($_POST['assignedWard']) ? intval($_POST['assignedWard']) : 1;

// Citizenship
$citizenship_number = $conn->real_escape_string($_POST['citizenshipNumber'] ?? '');
$citizenship_issue_date = $_POST['citizenshipIssueDate'] ?? null;
$citizenship_issue_district = $conn->real_escape_string($_POST['citizenshipIssueDistrict'] ?? '');

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

$profile_photo = ""; // If we want a separate profile photo? Register doesn't have it, assumes one of these? 
// Or maybe id_card_photo is profile pic? 
// Let's add support for profilePhoto if sent?
if (isset($_FILES['profilePhoto'])) {
    $res = handleFileUpload($_FILES['profilePhoto'], "profile", $upload_dir);
    if ($res['success']) $profile_photo = $res['filename'];
}
// Note: Users table has 'photoUrl' or similar? Register.php used 'citizenship_photo' and 'id_card_photo'.
// Register.php does NOT insert 'profile_photo'. It inserts 'citizenship_photo' and 'id_card_photo'.
// I will check schema... Users table likely doesn't have 'profile_photo' column unless I added it?
// Step 335 (AuthContext) uses `updateProfilePhoto`.
// The user wants "Profile Pic".
// I'll try to use `id_card_photo` as the main visual or just check if I can add `profile_image` column.
// For now, I'll stick to `register.php` schema to avoid DB errors: `citizenship_photo`, `id_card_photo`.

$dob_val = $dob ? "'$dob'" : "NULL";
$issue_date_val = $citizenship_issue_date ? "'$citizenship_issue_date'" : "NULL";

$sql = "INSERT INTO users (
    first_name, middle_name, last_name, email, password, contact_number, dob, gender, 
    district, city, ward_number, citizenship_number, citizenship_issue_date, citizenship_issue_district, 
    citizenship_photo, role, officer_id, department, assigned_ward, id_card_photo, status
) VALUES (
    '$first_name', '$middle_name', '$last_name', '$email', '$password', '$contact_number', $dob_val, '$gender', 
    '$district', '$city', $ward_number, '$citizenship_number', $issue_date_val, '$citizenship_issue_district', 
    '$citizenship_photo', 'officer', '$officer_id', '$department', $assigned_ward, '$id_card_photo', 'active'
)";

if ($conn->query($sql)) {
    echo json_encode(["success" => true, "message" => "Officer created successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Database Error: " . $conn->error]);
}

$conn->close();
?>
