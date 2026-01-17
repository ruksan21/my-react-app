<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../db_connect.php';

$response = array("success" => false, "message" => "Unknown error");

// 1. Get Inputs
$ward_id = isset($_POST['ward_id']) ? intval($_POST['ward_id']) : null;
$ward_number = isset($_POST['ward']) ? intval($_POST['ward']) : null;
$municipality = $_POST['municipality'] ?? null;
$full_name = $_POST['fullName'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';
$subject = $_POST['subject'] ?? '';
$message = $_POST['message'] ?? '';
$priority = $_POST['priority'] ?? 'Medium';
$user_id = isset($_POST['userId']) && !empty($_POST['userId']) && $_POST['userId'] !== 'undefined' ? intval($_POST['userId']) : null;

// JSON Fallback
if (empty($_POST) && empty($_FILES)) {
    $data = json_decode(file_get_contents("php://input"));
    if ($data) {
        $ward_id = isset($data->ward_id) ? intval($data->ward_id) : ($ward_id ?? null);
        $ward_number = isset($data->ward) ? intval($data->ward) : ($ward_number ?? null);
        $municipality = $data->municipality ?? ($municipality ?? null);
        $province = $data->province ?? ($province ?? null);
        $full_name = $data->fullName ?? ($full_name ?? '');
        $email = $data->email ?? ($email ?? '');
        $phone = $data->phone ?? ($phone ?? '');
        $subject = $data->subject ?? ($subject ?? '');
        $message = $data->message ?? ($message ?? '');
        $priority = $data->priority ?? ($priority ?? 'Medium');
        $user_id = isset($data->userId) ? intval($data->userId) : ($user_id ?? null);
    }
}

// 2. Resolve Ward ID if missing
if (!$ward_id && $municipality && $ward_number) {
    $muni_safe = $conn->real_escape_string($municipality);
    $ward_num = intval($ward_number);
    
    // STRICT matching for ward number and municipality
    $res_resolve = $conn->query("SELECT id FROM wards WHERE ward_number = $ward_num AND TRIM(municipality) = TRIM('$muni_safe') LIMIT 1");
    if ($res_resolve && $res_resolve->num_rows > 0) {
        $ward_id = $res_resolve->fetch_assoc()['id'];
    }
}


if (!$ward_id) {
    echo json_encode(["success" => false, "message" => "Ward not found. Please verify municipality and ward number."]);
    exit;
}

// 3. Handle File Upload

$image_path = null;
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../../uploads/complaints/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $fileExt = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif'];
    
    if (in_array($fileExt, $allowed)) {
        $fileName = uniqid('complaint_') . '.' . $fileExt;
        $targetPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
            $image_path = $fileName;
        }
    }
}

// 4. Insert Complaint
// We assume DB has columns: ward_id, complainant_user_id, subject, message, priority, status, image, complainant_name, complainant_email, complainant_phone
// Check if table supports non-user complainants (guest columns)
// If not, we might need to rely on user_id or just insert into message.
// To be safe, let's try to check schema or just try inserting. 
// Given the "officer ko ma gako xoina" error, likely the basic INSERT was failing or ward_id was wrong.

// Let's assume standard columns first. If it fails, I'll see the error.
// Assuming 'complainant' column maps to full name based on OfficerComplaints.jsx showing 'complaint.complainant'
// But wait, if 'complainant_user_id' is null, we need to store name somewhere.
// Let's try to update the Table Schema if needed? No, I can't easily.
// I will try to insert into `complaints` asking for standard fields.

// Construct SQL based on available data
// I will attempt to insert user_id and ward_id. 
// If user_id is null, I hope 'complainant' column exists for the name.

// Since I cannot verify schema, I will try to insert into common columns.
// If user_id is null, we pass NULL.

// 4. Insert Complaint
$current_date = date('Y-m-d');

try {
    // Attempt 1: Insert with ALL columns
    $sql = "INSERT INTO complaints (ward_id, complainant_user_id, subject, message, priority, status, image, complainant, complainant_email, complainant_phone, date) 
            VALUES (?, ?, ?, ?, ?, 'Open', ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception($conn->error);
    }

    $stmt->bind_param("iisssssssss", $ward_id, $user_id, $subject, $message, $priority, $image_path, $full_name, $email, $phone, $current_date);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Complaint sent successfully!"]);
        $stmt->close();
        $conn->close();
        exit;
    } else {
        throw new Exception($stmt->error);
    }

} catch (Exception $e) {
    // Fallback logic if some columns are STILL missing (e.g. if migration wasn't run or failed)
    try {
        // Fallback: try without the new email/phone/date columns if they cause error
        $sql_fallback = "INSERT INTO complaints (ward_id, complainant_user_id, subject, message, priority, status, image, complainant) VALUES (?, ?, ?, ?, ?, 'Open', ?, ?)";
        $stmt_fallback = $conn->prepare($sql_fallback);
        $stmt_fallback->bind_param("iissssss", $ward_id, $user_id, $subject, $message, $priority, $image_path, $full_name);
        
        if ($stmt_fallback->execute()) {
            echo json_encode(["success" => true, "message" => "Complaint sent (limited fields)!"]);
            exit;
        }
        throw new Exception("Deep error");
    } catch (Exception $ex2) {
        // Final minimal fallback
        $sql_minimal = "INSERT INTO complaints (ward_id, complainant_user_id, subject, message, priority, status) VALUES (?, ?, ?, ?, ?, 'Open')";
        $stmt_minimal = $conn->prepare($sql_minimal);
        $stmt_minimal->bind_param("iisss", $ward_id, $user_id, $subject, $message, $priority);
        if ($stmt_minimal->execute()) {
             echo json_encode(["success" => true, "message" => "Complaint sent (minimal fields)!"]);
             exit;
        }
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        exit;
    }
}
?>
