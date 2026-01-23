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

// Accept either ward_id OR (municipality + ward_number) OR (work_municipality + work_ward)
$ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : (isset($_POST['ward_id']) ? intval($_POST['ward_id']) : 0);
$municipality = isset($_GET['municipality']) ? $conn->real_escape_string($_GET['municipality']) : (isset($_POST['municipality']) ? $conn->real_escape_string($_POST['municipality']) : '');
$ward_number_raw = isset($_GET['ward_number']) ? $_GET['ward_number'] : (isset($_POST['ward_number']) ? $_POST['ward_number'] : '');
$ward_number = intval(preg_replace('/[^0-9]/', '', $ward_number_raw));

// If ward_id provided, fetch ward details from wards table
if ($ward_id && (!$municipality || !$ward_number)) {
    $res = $conn->query("SELECT ward_number, municipality, district_name, province FROM wards WHERE id = " . intval($ward_id) . " LIMIT 1");
    if ($res && $res->num_rows > 0) {
        $wardRow = $res->fetch_assoc();
        $municipality = $wardRow['municipality'];
        $ward_number = intval($wardRow['ward_number']);
    }
}

if (!$ward_number) {
    echo json_encode(["success" => false, "message" => "Provide either ward_id or ward_number (and municipality where applicable)."]);
    exit();
}

$where = "role = 'officer' AND work_ward = " . $ward_number;
if (!empty($municipality)) {
    $municipality_safe = $conn->real_escape_string($municipality);
    $where .= " AND (work_municipality = '$municipality_safe' OR TRIM(work_municipality) LIKE CONCAT('%', TRIM('$municipality_safe'), '%'))";
}

$query = "SELECT id, first_name, middle_name, last_name, email, officer_id, department, work_province, work_district, work_municipality, work_ward, photo, status FROM users WHERE $where";
$result = $conn->query($query);

$officers = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $officers[] = $row;
    }
}

echo json_encode(["success" => true, "count" => count($officers), "data" => $officers]);

$conn->close();
?>