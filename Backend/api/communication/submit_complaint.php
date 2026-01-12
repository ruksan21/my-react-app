<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../db_connect.php';

$response = array("success" => false, "message" => "Unknown error");

// Input can come from $_POST (for FormData) or php://input (for JSON)
// Since we are adding file uploads, we expect FormData.

$ward_id = isset($_POST['ward_id']) ? intval($_POST['ward_id']) : null;
$ward = isset($_POST['ward']) ? intval($_POST['ward']) : null;
$full_name = isset($_POST['fullName']) ? $_POST['fullName'] : null;
$subject = isset($_POST['subject']) ? $_POST['subject'] : null;
$message = isset($_POST['message']) ? $_POST['message'] : null;
$priority = isset($_POST['priority']) ? $_POST['priority'] : 'Medium';
$user_id = isset($_POST['userId']) ? intval($_POST['userId']) : null;

$province = $_POST['province'] ?? null;
$municipality = $_POST['municipality'] ?? null;
$ward_number = $_POST['ward'] ?? null;

// JSON fallback
if (empty($_POST) && empty($_FILES)) {
    $data = json_decode(file_get_contents("php://input"));
    if ($data) {
        $ward_id = isset($data->ward_id) ? intval($data->ward_id) : null;
        $province = $data->province ?? null;
        $municipality = $data->municipality ?? null;
        $ward_number = $data->ward ?? null;
        $full_name = $data->fullName ?? null;
        $subject = $data->subject ?? null;
        $message = $data->message ?? null;
        $priority = $data->priority ?? 'Medium';
        $user_id = isset($data->userId) ? intval($data->userId) : null;
    }
}

if (!$ward_id && $province && $municipality && $ward_number) {
    // Resolve ward ID from location details
    $stmt = $conn->prepare("SELECT id FROM wards WHERE province = ? AND municipality = ? AND ward_number = ? LIMIT 1");
    $stmt->bind_param("ssi", $province, $municipality, $ward_number);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res && $res->num_rows > 0) {
        $ward_id = $res->fetch_assoc()['id'];
    }
}

// Validation
if (!$ward_id || !$full_name || !$subject || !$message) {
    echo json_encode(["success" => false, "message" => "Incomplete data. Ward ID, Name, Subject, and Message are required."]);
    exit();
}

// Check if reporter is an officer (Admin Report)
$is_officer_report = false;
if ($user_id) {
    $check_role = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $check_role->bind_param("i", $user_id);
    $check_role->execute();
    $role_res = $check_role->get_result();
    if ($role_res && $role_res->num_rows > 0) {
        if ($role_res->fetch_assoc()['role'] === 'officer') {
            $is_officer_report = true;
        }
    }
}

$officer_id = null;
$officer_name = 'Admin';

if (!$is_officer_report) {
    // Check if officer exists in the ward (for Citizen Complaint)
    // FIX: Using assigned_ward_id and concat name because users table doesn't have full_name or ward_id
    $officer_check = $conn->prepare("SELECT id, CONCAT(first_name, ' ', last_name) as full_name, email FROM users WHERE (assigned_ward_id = ? OR work_ward = ?) AND role = 'officer' AND status = 'active' LIMIT 1");
    // We try both assigned_ward_id and work_ward (for older records)
    $stmt_ward_num = 0;
    if ($ward_number) $stmt_ward_num = intval($ward_number);
    
    $officer_check->bind_param("ii", $ward_id, $stmt_ward_num);
    $officer_check->execute();
    $officer_result = $officer_check->get_result();

    if ($officer_result->num_rows === 0) {
        echo json_encode([
            "success" => false, 
            "message" => "No officer is currently assigned to this ward. Please contact the municipality office directly.",
            "no_officer" => true
        ]);
        exit();
    }

    $officer = $officer_result->fetch_assoc();
    $officer_id = $officer['id'];
    $officer_name = $officer['full_name'];
    $officer_email = $officer['email'];
} else {
    // It's an officer report, find an admin to notify
    $admin_check = $conn->query("SELECT id, CONCAT(first_name, ' ', last_name) as full_name FROM users WHERE role = 'admin' AND status = 'active' LIMIT 1");
    if ($admin_check && $admin_check->num_rows > 0) {
        $admin = $admin_check->fetch_assoc();
        $officer_id = $admin['id']; // We reuse officer_id as recipient_id
        $officer_name = "System Admin";
    } else {
        $officer_id = 1; // Fallback to first user
        $officer_name = "System Admin";
    }
}

// Handle File Upload
$image_url = null;
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = '../../uploads/complaints/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileTmpPath = $_FILES['image']['tmp_name'];
    $fileName = $_FILES['image']['name'];
    $fileSize = $_FILES['image']['size'];
    $fileType = $_FILES['image']['type'];
    $fileNameCmps = explode(".", $fileName);
    $fileExtension = strtolower(end($fileNameCmps));

    $allowedfileExtensions = array('jpg', 'gif', 'png', 'jpeg');
    if (in_array($fileExtension, $allowedfileExtensions)) {
        $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
        $dest_path = $uploadDir . $newFileName;

        if (move_uploaded_file($fileTmpPath, $dest_path)) {
            $image_url = $newFileName;
        } else {
            error_log("Complaint image upload failed: Could not move file to $dest_path");
        }
    } else {
        echo json_encode(["success" => false, "message" => "Invalid file type. Only JPG, PNG, and GIF are allowed."]);
        exit();
    }
}


// Insert into database
$query = "INSERT INTO complaints (ward_id, complainant_user_id, complainant, subject, message, priority, image_url, status, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, 'Open', NOW())";

$stmt = $conn->prepare($query);

if ($user_id) {
    $stmt->bind_param("iisssss", $ward_id, $user_id, $full_name, $subject, $message, $priority, $image_url);
} else {
    $query_no_user = "INSERT INTO complaints (ward_id, complainant, subject, message, priority, image_url, status, created_at) 
                      VALUES (?, ?, ?, ?, ?, ?, 'Open', NOW())";
    $stmt = $conn->prepare($query_no_user);
    $stmt->bind_param("isssss", $ward_id, $full_name, $subject, $message, $priority, $image_url);
}

if ($stmt->execute()) {
    $complaint_id = $conn->insert_id;

    // Create notification for the recipient (Officer or Admin)
    $notif_title = ($is_officer_report ? "Officer Report: " : "New Complaint: ") . $subject;
    $notif_message = $full_name . " has submitted a " . ($is_officer_report ? "report" : "complaint") . ". Subject: " . $subject;
    
    // Fetch location details for the notification source
    $province_val = $province;
    $municipality_val = $municipality;
    $ward_num_val = $ward_number;

    if ($ward_id) {
        $w_sql = "SELECT province, district_name, municipality, ward_number FROM wards WHERE id = ?";
        $w_stmt = $conn->prepare($w_sql);
        $w_stmt->bind_param("i", $ward_id);
        $w_stmt->execute();
        $w_res = $w_stmt->get_result();
        if ($w_res && $w_res->num_rows > 0) {
            $w_data = $w_res->fetch_assoc();
            $province_val = $w_data['province'];
            $municipality_val = $w_data['municipality'];
            $ward_num_val = $w_data['ward_number'];
        }
    }
    
    $notif_type = $is_officer_report ? 'system' : 'complaint';
    $notif_query = "INSERT INTO notifications (user_id, ward_id, title, message, type, source_province, source_municipality, source_ward, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())";
    $notif_stmt = $conn->prepare($notif_query);
    $notif_stmt->bind_param("iissssss", $officer_id, $ward_id, $notif_title, $notif_message, $notif_type, $province_val, $municipality_val, $ward_num_val);
    $notif_stmt->execute();

    // Create System Alert
    $alert_title = $notif_title;
    $alert_snippet = substr($message, 0, 50) . (strlen($message) > 50 ? "..." : "");
    $alert_message = "From $full_name: $alert_snippet";
    
    $alert_query = "INSERT INTO system_alerts (ward_id, type, title, message, status, created_at) VALUES (?, ?, ?, ?, 'unread', NOW())";
    $alert_stmt = $conn->prepare($alert_query);
    $a_type = $is_officer_report ? 'info' : 'warning';
    $alert_stmt->bind_param("isss", $ward_id, $a_type, $alert_title, $alert_message);
    $alert_stmt->execute();

    echo json_encode([
        "success" => true, 
        "message" => "Successfully submitted! Your message has been sent to " . $officer_name . ".", 
        "id" => $complaint_id,
        "officer_name" => $officer_name
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Database error: " . $stmt->error]);
}

$conn->close();
?>
