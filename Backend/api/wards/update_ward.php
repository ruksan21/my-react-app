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

require_once '../db_connect.php';

// Use $_POST for FormData, or json_decode for JSON (fallback)
if (!empty($_POST)) {
    $ward_id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    $raw_data = $_POST;
} else {
    $data = json_decode(file_get_contents("php://input"));
    $ward_id = isset($data->id) ? intval($data->id) : 0;
    $raw_data = (array)$data;
}

if (!$ward_id) {
    echo json_encode(array("success" => false, "message" => "Ward ID required."));
    exit();
}

$updates = array();

// Define allowed fields for update
$allowed_fields = [
    'location', 'google_map_link', 'municipality', 'contact_phone', 'telephone', 'contact_email',
    'chairperson_name', 'chairperson_phone', 'chairperson_email', 'chairperson_education',
    'chairperson_experience', 'chairperson_political_party', 'chairperson_appointment_date', 'chairperson_bio',
    'province', 'district_name'
];

foreach ($allowed_fields as $field) {
    if (isset($raw_data[$field])) {
        $val = $raw_data[$field];
        
        // Validate phone numbers if field is a phone field
        if (in_array($field, ['contact_phone', 'telephone', 'chairperson_phone'])) {
            if (!empty($val) && !preg_match('/^[0-9+ \-]+$/', $val)) {
                echo json_encode(array("success" => false, "message" => "Phone/Telephone fields must contain only numbers."));
                exit();
            }
        }

        if ($field === 'chairperson_appointment_date' && empty($val)) {
            $updates[] = "$field = NULL";
        } else {
            $updates[] = "$field = '" . $conn->real_escape_string($val) . "'";
        }
    }
}

// Handle Photo Upload if present
if (isset($_FILES['chairperson_photo']) && $_FILES['chairperson_photo']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['chairperson_photo'];
    // Store under api/uploads so frontend URL BASE_URL/uploads can load it
    $upload_dir = __DIR__ . '/../uploads/';
    if (!file_exists($upload_dir)) mkdir($upload_dir, 0777, true);
    
    $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $new_filename = "chairperson_" . $ward_id . "_" . time() . "." . $file_extension;
    
    if (move_uploaded_file($file['tmp_name'], $upload_dir . $new_filename)) {
        $updates[] = "chairperson_photo = '$new_filename'";
    }
}

if (empty($updates)) {
    echo json_encode(array("success" => false, "message" => "No fields to update."));
    exit();
}

$query = "UPDATE wards SET " . implode(", ", $updates) . " WHERE id = $ward_id";

if ($conn->query($query)) {
    // Administrative Tasks (Alerts and Notifications)
    try {
        // Create System Alert
        $alert_title = "Ward Updated";
        $alert_message = "Details for Ward ID " . $ward_id . " have been updated.";
        $alert_query = "INSERT INTO system_alerts (ward_id, type, title, message, status, created_at) VALUES ($ward_id, 'info', '$alert_title', '$alert_message', 'unread', NOW())";
        $conn->query($alert_query);

        // Admin Notification
        $admin_res = $conn->query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        $target_admin_id = ($admin_res && $admin_res->num_rows > 0) ? $admin_res->fetch_assoc()['id'] : 1;
        $conn->query("INSERT INTO notifications (user_id, type, title, message, is_read, created_at) VALUES ($target_admin_id, 'system', '$alert_title', '$alert_message', 0, NOW())");
    } catch (Exception $e) {
        error_log("Non-critical ward tasks failed: " . $e->getMessage());
    }

    echo json_encode(array("success" => true, "message" => "Ward updated successfully."));
} else {
    echo json_encode(array("success" => false, "message" => "Database error: " . $conn->error));
}
?>
