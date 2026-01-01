<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

$upload_dir = "uploads/";
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Check if file is uploaded
$photo_name = null;
if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['photo'];
    $allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime_type = $finfo->file($file['tmp_name']);
    
    if (in_array($mime_type, $allowed_types)) {
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $new_filename = "chairperson_" . time() . "_" . uniqid() . "." . $extension;
        if (move_uploaded_file($file['tmp_name'], $upload_dir . $new_filename)) {
            $photo_name = $new_filename;
        }
    }
}

// Get other POST data
$ward_id = $_POST['ward_id'] ?? null;
$name = $_POST['name'] ?? null;
$phone = $_POST['phone'] ?? null;
$email = $_POST['email'] ?? null;
$bio = $_POST['bio'] ?? null;

if (!$ward_id) {
    echo json_encode(["success" => false, "message" => "Ward ID is required"]);
    exit();
}

// Construct SQL
$sql = "UPDATE wards SET ";
$params = [];
$types = "";

if ($name) { $sql .= "chairperson_name = ?, "; $params[] = $name; $types .= "s"; }
if ($phone) { $sql .= "chairperson_phone = ?, "; $params[] = $phone; $types .= "s"; }
if ($email) { $sql .= "chairperson_email = ?, "; $params[] = $email; $types .= "s"; }
if ($bio) { $sql .= "chairperson_bio = ?, "; $params[] = $bio; $types .= "s"; }
if ($photo_name) { $sql .= "chairperson_photo = ?, "; $params[] = $photo_name; $types .= "s"; }

// Remove trailing comma
$sql = rtrim($sql, ", ");
$sql .= " WHERE id = ?";
$params[] = $ward_id;
$types .= "i";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Profile updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error updating profile: " . $conn->error]);
}

$conn->close();
?>
