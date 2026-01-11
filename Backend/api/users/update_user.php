<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $id = intval($data->id);
    
    // Construct update query dynamically based on provided fields
    $fields = [];
    $types = "";
    $values = [];

    // List of allowable fields to update
    $allowed_fields = [
        'first_name' => 's', 'middle_name' => 's', 'last_name' => 's',
        'email' => 's', 'contact_number' => 's', 'role' => 's', 'status' => 's',
        'ward_number' => 'i', 'department' => 's', 'assigned_ward_id' => 'i',
        'gender' => 's', 'dob' => 's', 'province' => 's', 'district' => 's',
        'city' => 's', 'citizenship_number' => 's', 'officer_id' => 's',
        'work_province' => 's', 'work_district' => 's', 'work_municipality' => 's',
        'work_ward' => 'i', 'work_office_location' => 's'
    ];

    foreach ($data as $key => $value) {
        if (array_key_exists($key, $allowed_fields) && $key !== 'id') {
            $fields[] = "$key = ?";
            $types .= $allowed_fields[$key];
            
            // Handle empty strings for nullable fields if needed, or just pass as is
            $values[] = $value;
        }
    }

    if (empty($fields)) {
        echo json_encode(array("success" => false, "message" => "No valid fields to update."));
        exit();
    }

    $query = "UPDATE users SET " . implode(", ", $fields) . " WHERE id = ?";
    $types .= "i";
    $values[] = $id;

    $stmt = $conn->prepare($query);
    if ($stmt) {
        $stmt->bind_param($types, ...$values);
        if ($stmt->execute()) {
             echo json_encode(array("success" => true, "message" => "User updated successfully."));
        } else {
             echo json_encode(array("success" => false, "message" => "Error execution: " . $stmt->error));
        }
        $stmt->close();
    } else {
        echo json_encode(array("success" => false, "message" => "Error preparation: " . $conn->error));
    }

} else {
    echo json_encode(array("success" => false, "message" => "User ID is required."));
}
?>
