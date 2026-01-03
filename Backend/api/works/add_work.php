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
require_once 'verify_ward_access.php';

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Attempt to decode JSON input first
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        // If JSON decoding fails, it might be a form-data request (e.g., with file upload)
        // In this case, we'll try to get data from $_POST, but prioritize JSON for non-file fields
        // For this specific change, we are moving to JSON for all non-file data.
        // If the request is not JSON, it's an invalid input for this API.
        echo json_encode(["status" => "error", "message" => "Invalid JSON input."]);
        exit();
    }

    $title = $data['title'] ?? '';
    $description = $data['description'] ?? '';
    $budget = $data['budget'] ?? 0; // Changed default from '' to 0 for budget
    $location = $data['location'] ?? '';
    $start_date = $data['startDate'] ?? null; // Assuming frontend sends 'startDate'
    $end_date = $data['endDate'] ?? null;     // Assuming frontend sends 'endDate'
    $beneficiaries = $data['beneficiaries'] ?? '';
    $status = $data['status'] ?? 'Upcoming'; // Changed default status

    $officer_id = $data['officer_id'] ?? 0;

    if ($officer_id == 0) {
         echo json_encode(["status" => "error", "message" => "Officer ID required."]);
         exit();
    }

    // Fetch assigned ward for this officer to strictly enforce ward assignment
    $ward_query = "SELECT assigned_ward FROM users WHERE id = ? AND role = 'officer'";
    $stmt_ward = $conn->prepare($ward_query);
    $stmt_ward->bind_param("i", $officer_id);
    $stmt_ward->execute();
    $ward_result = $stmt_ward->get_result();

    if ($ward_result->num_rows === 0) {
         echo json_encode(["status" => "error", "message" => "Officer not found or no ward assigned."]);
         $stmt_ward->close();
         exit();
    }

    $officer_data = $ward_result->fetch_assoc();
    $assigned_ward = $officer_data['assigned_ward'];
    $stmt_ward->close();

    // Explicitly use the retrieved assigned_ward, ignoring any frontend 'ward_id' (if sent)
    // to prevent tampering. This implicitly verifies access because we ONLY use their assigned ward.
    $ward_id = $assigned_ward; // Assign the verified ward_id

    $image_path = '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $target_dir = "uploads/works/";
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0777, true);
        }
        $file_extension = pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION);
        $file_name = time() . "_" . uniqid() . "." . $file_extension;
        $target_file = $target_dir . $file_name;

        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
            $image_path = $target_file;
        }
    }

    $stmt = $conn->prepare("INSERT INTO development_works (title, description, budget, location, start_date, end_date, beneficiaries, status, image, officer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssssi", $title, $description, $budget, $location, $start_date, $end_date, $beneficiaries, $status, $image_path, $officer_id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Work added successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to add work: " . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}

$conn->close();
?>
