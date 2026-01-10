<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db_connect.php';

// Helper function to resolve ward ID
function resolveWardIdStrict($conn, $province, $district, $municipality, $ward_number) {
    $stmt = $conn->prepare("SELECT id FROM wards WHERE province = ? AND district = ? AND municipality = ? AND ward_number = ? LIMIT 1");
    $stmt->bind_param("sssi", $province, $district, $municipality, $ward_number);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result && $row = $result->fetch_assoc()) {
        $ward_id = $row['id'];
    } else {
        $ward_id = 0;
    }
    $stmt->close();
    return $ward_id;
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if it's FormData (with file upload) or JSON
    $content_type = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    
    if (stripos($content_type, 'multipart/form-data') !== false) {
        // FormData request (with file upload)
        $data = $_POST;
    } else {
        // JSON request
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            echo json_encode(["success" => false, "message" => "Invalid JSON input."]);
            exit();
        }
    }

    $title = $data['title'] ?? '';
    $description = $data['description'] ?? '';
    $budget = $data['budget'] ?? 0;
    $location = $data['location'] ?? '';
    $start_date = $data['start_date'] ?? null;
    $end_date = $data['end_date'] ?? null;
    $beneficiaries = $data['beneficiaries'] ?? '';
    $status_input = $data['status'] ?? 'Upcoming';
    // Map frontend status to backend enum if necessary
    $status_map = [
        'Upcoming' => 'pending',
        'Ongoing' => 'on-going',
        'Completed' => 'completed',
        'pending' => 'pending',
        'on-going' => 'on-going',
        'completed' => 'completed'
    ];
    $status = $status_map[$status_input] ?? 'pending';

    $officer_id = $data['officer_id'] ?? 0;

    if ($officer_id == 0) {
         echo json_encode(["success" => false, "message" => "Officer ID required."]);
         exit();
    }

    // Resolve ward_id from officer's work location strictly
    $officer_query = "SELECT work_province, work_district, work_municipality, work_ward FROM users WHERE id = ? AND role = 'officer'";
    $stmt_officer = $conn->prepare($officer_query);
    $stmt_officer->bind_param("i", $officer_id);
    $stmt_officer->execute();
    $officer_result = $stmt_officer->get_result();

    if ($officer_result->num_rows === 0) {
         echo json_encode(["success" => false, "message" => "Officer not found or work location missing."]);
         $stmt_officer->close();
         exit();
    }

    $officer_data = $officer_result->fetch_assoc();
    $stmt_officer->close();

    $ward_id = 0;
    if (!empty($officer_data['work_province']) && !empty($officer_data['work_district']) && !empty($officer_data['work_municipality']) && !empty($officer_data['work_ward'])) {
        $ward_id = resolveWardIdStrict($conn, $officer_data['work_province'], $officer_data['work_district'], $officer_data['work_municipality'], intval($officer_data['work_ward']));
    }

    if ($ward_id === 0) {
        http_response_code(422);
        echo json_encode([
            "success" => false,
            "message" => "Ward not found for officer's work location. Ask admin to create this ward."
        ]);
        exit();
    }

    // Verify access for this ward
    if (!verifyWardAccess($conn, $officer_id, $ward_id)) {
    // Verify access for this ward
    if (!verifyWardAccess($conn, $officer_id, $ward_id)) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Unauthorized access to this ward."]);
        exit();
    }

    $image_path = '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $target_dir = "../uploads/works/";
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0777, true);
        }
        $file_extension = pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION);
        $file_name = time() . "_" . uniqid() . "." . $file_extension;
        $target_file = $target_dir . $file_name;

        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
            // Store relative path from api directory
            $image_path = "uploads/works/" . $file_name;
        }
    }

    $stmt = $conn->prepare("INSERT INTO development_works (title, description, budget, location, start_date, end_date, beneficiaries, status, image, officer_id, ward_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssssii", $title, $description, $budget, $location, $start_date, $end_date, $beneficiaries, $status, $image_path, $officer_id, $ward_id);

    if ($stmt->execute()) {
        // Create ward-level notification
        $notif_title = "🏗️ Work Update";
        $notif_msg = "New work added: " . $title;
        $notif_sql = "INSERT INTO notifications (ward_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, 'work', 0, NOW())";
        if ($notif_stmt = $conn->prepare($notif_sql)) {
            $notif_stmt->bind_param("iss", $ward_id, $notif_title, $notif_msg);
            $notif_stmt->execute();
            $notif_stmt->close();
        }

        echo json_encode(["success" => true, "message" => "Work added successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to add work: " . $stmt->error]);
    }

    $stmt->close();

} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}

$conn->close();
}
?>
