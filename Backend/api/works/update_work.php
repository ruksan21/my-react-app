<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db_connect.php';
require_once '../utils/ward_utils.php';

// Local verifyWardAccess removed, using version from ward_utils.php instead

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

    $work_id = $data['id'] ?? 0;
    $title = $data['title'] ?? '';
    $description = $data['description'] ?? '';
    $budget = $data['budget'] ?? 0;
    $location = $data['location'] ?? '';
    $start_date = $data['start_date'] ?? null;
    $end_date = $data['end_date'] ?? null;
    $beneficiaries = $data['beneficiaries'] ?? '';
    $status_input = $data['status'] ?? 'Upcoming';
    
    // Map frontend status to backend enum
    $status_map = [
        'Upcoming' => 'pending',
        'Pending' => 'pending',
        'Ongoing' => 'on-going',
        'Completed' => 'completed',
        'pending' => 'pending',
        'on-going' => 'on-going',
        'completed' => 'completed'
    ];
    $status = $status_map[$status_input] ?? 'pending';

    $officer_id = $data['officer_id'] ?? 0;

    if ($work_id == 0) {
        echo json_encode(["success" => false, "message" => "Work ID required."]);
        exit();
    }

    if ($officer_id == 0) {
        echo json_encode(["success" => false, "message" => "Officer ID required."]);
        exit();
    }

    // Verify the work belongs to this officer
    $check_query = "SELECT ward_id FROM development_works WHERE id = ? AND officer_id = ?";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bind_param("ii", $work_id, $officer_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();

    if ($check_result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Work not found or unauthorized."]);
        $check_stmt->close();
        exit();
    }

    $work_data = $check_result->fetch_assoc();
    $ward_id = $work_data['ward_id'];
    $check_stmt->close();

    // Verify access for this ward
    if (!verifyWardAccess($conn, $officer_id, $ward_id)) {
        echo json_encode(["success" => false, "message" => "Unauthorized access to this ward."]);
        exit();
    }

    // Handle image upload if new image is provided
    $image_path = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $target_dir = "../uploads/works/";
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0777, true);
        }
        $file_extension = pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION);
        $file_name = time() . "_" . uniqid() . "." . $file_extension;
        $target_file = $target_dir . $file_name;

        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
            $image_path = "uploads/works/" . $file_name;
        }
    }

    // Update query - only update image if new one is uploaded
    if ($image_path) {
        $stmt = $conn->prepare("UPDATE development_works SET title = ?, description = ?, budget = ?, location = ?, start_date = ?, end_date = ?, beneficiaries = ?, status = ?, image = ? WHERE id = ? AND officer_id = ?");
        $stmt->bind_param("sssssssssii", $title, $description, $budget, $location, $start_date, $end_date, $beneficiaries, $status, $image_path, $work_id, $officer_id);
    } else {
        $stmt = $conn->prepare("UPDATE development_works SET title = ?, description = ?, budget = ?, location = ?, start_date = ?, end_date = ?, beneficiaries = ?, status = ? WHERE id = ? AND officer_id = ?");
        $stmt->bind_param("ssssssssii", $title, $description, $budget, $location, $start_date, $end_date, $beneficiaries, $status, $work_id, $officer_id);
    }

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Work updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to update work: " . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}

$conn->close();
?>
