<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['municipality']) || !isset($data['district_id']) || !isset($data['ward_count'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields: municipality, district_id, ward_count"]);
    exit();
}

$municipality = $conn->real_escape_string($data['municipality']);
$district_id = intval($data['district_id']);
$ward_count = intval($data['ward_count']);
$district_name = isset($data['district_name']) ? $conn->real_escape_string($data['district_name']) : '';

$success_count = 0;
$skip_count = 0;
$errors = [];

for ($i = 1; $i <= $ward_count; $i++) {
    // Check if ward already exists for this municipality
    $check_sql = "SELECT id FROM wards WHERE municipality = ? AND ward_number = ?";
    $stmt = $conn->prepare($check_sql);
    $stmt->bind_param("si", $municipality, $i);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $skip_count++;
        $stmt->close();
        continue;
    }
    $stmt->close();

    // Insert new ward
    $insert_sql = "INSERT INTO wards (ward_number, district_id, municipality, district_name) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($insert_sql);
    $stmt->bind_param("iiss", $i, $district_id, $municipality, $district_name);

    if ($stmt->execute()) {
        $success_count++;
    } else {
        $errors[] = "Error at ward $i: " . $conn->error;
    }
    $stmt->close();
}

echo json_encode([
    "success" => true,
    "message" => "Process completed.",
    "data" => [
        "created" => $success_count,
        "skipped" => $skip_count,
        "errors" => $errors
    ]
]);

$conn->close();
?>
