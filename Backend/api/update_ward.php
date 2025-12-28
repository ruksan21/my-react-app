<?php
/**
 * Update Ward API
 * Updates ward information including chairperson details and profile photo
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

// Check if this is a photo upload request
if (isset($_FILES['chairperson_photo'])) {
    $ward_id = intval($_POST['id']);
    $file = $_FILES['chairperson_photo'];
    
    // Validate file
    $allowed_types = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!in_array($file['type'], $allowed_types)) {
        echo json_encode(array("success" => false, "message" => "Invalid file type. Only JPG and PNG allowed."));
        exit();
    }
    
    // Create uploads directory if it doesn't exist
    $upload_dir = "uploads/";
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    // Generate unique filename
    $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $new_filename = "chairperson_" . $ward_id . "_" . time() . "." . $file_extension;
    $upload_path = $upload_dir . $new_filename;
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $upload_path)) {
        // Update database
        $query = "UPDATE wards SET chairperson_photo = '$new_filename' WHERE id = $ward_id";
        if ($conn->query($query)) {
            echo json_encode(array(
                "success" => true,
                "message" => "Photo uploaded successfully.",
                "filename" => $new_filename
            ));
        } else {
            echo json_encode(array("success" => false, "message" => "Database error: " . $conn->error));
        }
    } else {
        echo json_encode(array("success" => false, "message" => "Failed to upload file."));
    }
    exit();
}

// Regular ward update (JSON data)
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id)) {
    echo json_encode(array("success" => false, "message" => "Ward ID required."));
    exit();
}

$ward_id = intval($data->id);

// Build update query dynamically based on provided fields
$updates = array();

if (isset($data->location)) $updates[] = "location = '" . $conn->real_escape_string($data->location) . "'";
if (isset($data->contact_phone)) $updates[] = "contact_phone = '" . $conn->real_escape_string($data->contact_phone) . "'";
if (isset($data->contact_email)) $updates[] = "contact_email = '" . $conn->real_escape_string($data->contact_email) . "'";

// Chairperson fields
if (isset($data->chairperson_name)) $updates[] = "chairperson_name = '" . $conn->real_escape_string($data->chairperson_name) . "'";
if (isset($data->chairperson_phone)) $updates[] = "chairperson_phone = '" . $conn->real_escape_string($data->chairperson_phone) . "'";
if (isset($data->chairperson_email)) $updates[] = "chairperson_email = '" . $conn->real_escape_string($data->chairperson_email) . "'";
if (isset($data->chairperson_education)) $updates[] = "chairperson_education = '" . $conn->real_escape_string($data->chairperson_education) . "'";
if (isset($data->chairperson_experience)) $updates[] = "chairperson_experience = '" . $conn->real_escape_string($data->chairperson_experience) . "'";
if (isset($data->chairperson_political_party)) $updates[] = "chairperson_political_party = '" . $conn->real_escape_string($data->chairperson_political_party) . "'";
if (isset($data->chairperson_appointment_date)) $updates[] = "chairperson_appointment_date = '" . $conn->real_escape_string($data->chairperson_appointment_date) . "'";
if (isset($data->chairperson_bio)) $updates[] = "chairperson_bio = '" . $conn->real_escape_string($data->chairperson_bio) . "'";

if (empty($updates)) {
    echo json_encode(array("success" => false, "message" => "No fields to update."));
    exit();
}

$query = "UPDATE wards SET " . implode(", ", $updates) . " WHERE id = $ward_id";

if ($conn->query($query)) {
    echo json_encode(array(
        "success" => true,
        "message" => "Ward updated successfully."
    ));
} else {
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $conn->error
    ));
}
?>
