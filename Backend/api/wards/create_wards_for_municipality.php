<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db_connect.php';

// Params:
// municipality (string) - required
// district (string) - optional
// province (string) - optional
// count (int) - number of wards to create (default 9)
// start (int) - starting ward number (default 1)
// simulate (bool) - if true, will attempt actual inserts; otherwise returns planned list

$municipality = isset($_REQUEST['municipality']) ? $conn->real_escape_string($_REQUEST['municipality']) : '';
$district = isset($_REQUEST['district']) ? $conn->real_escape_string($_REQUEST['district']) : '';
$province = isset($_REQUEST['province']) ? $conn->real_escape_string($_REQUEST['province']) : '';
$count = isset($_REQUEST['count']) ? intval($_REQUEST['count']) : 9;
$start = isset($_REQUEST['start']) ? intval($_REQUEST['start']) : 1;
$simulate = (isset($_REQUEST['simulate']) && in_array(strtolower($_REQUEST['simulate']), ['1', 'true', 'yes'], true));

if (empty($municipality)) {
    echo json_encode(["success" => false, "message" => "Parameter 'municipality' is required."]);
    exit();
}

if ($count <= 0) $count = 9;
if ($start <= 0) $start = 1;

$planned = [];
$created = [];
$errors = [];

for ($i = 0; $i < $count; $i++) {
    $ward_no = $start + $i;
    $planned[] = ["ward_number" => $ward_no, "municipality" => $municipality];

    if ($simulate) {
        // Check existence
        $check_q = "SELECT id FROM wards WHERE ward_number = " . intval($ward_no) . " AND TRIM(municipality) LIKE '" . $conn->real_escape_string($municipality) . "' LIMIT 1";
        $res = $conn->query($check_q);
        if ($res && $res->num_rows > 0) {
            $row = $res->fetch_assoc();
            $created[] = ["ward_number" => $ward_no, "id" => $row['id'], "status" => "exists"];
            continue;
        }

        // Insert minimal record; use safe defaults for fields that may be required
        $location = $conn->real_escape_string("Auto-generated ward $ward_no - $municipality");
        $province_safe = $conn->real_escape_string($province);
        $district_safe = $conn->real_escape_string($district);

        $insert_q = "INSERT INTO wards (ward_number, district_name, province, municipality, location) VALUES (" . intval($ward_no) . ", '" . $district_safe . "', '" . $province_safe . "', '" . $conn->real_escape_string($municipality) . "', '" . $location . "')";
        if ($conn->query($insert_q)) {
            $created[] = ["ward_number" => $ward_no, "id" => $conn->insert_id, "status" => "created"];
        } else {
            $errors[] = ["ward_number" => $ward_no, "error" => $conn->error];
        }
    }
}

if ($simulate) {
    echo json_encode(["success" => empty($errors), "planned" => $planned, "created" => $created, "errors" => $errors]);
} else {
    echo json_encode(["success" => true, "message" => "Endpoint ready. To actually create wards, set simulate=true in request.", "planned" => $planned]);
}

$conn->close();
?>