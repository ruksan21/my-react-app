<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

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

// Check if ward_id is provided directly or via location params
$ward_id = 0;

if (isset($_GET['ward_id'])) {
    $ward_id = intval($_GET['ward_id']);
} else if (isset($_GET['work_province'])) {
    $ward_id = resolveWardIdStrict($conn, $_GET['work_province'], $_GET['work_district'], $_GET['work_municipality'], intval($_GET['work_ward']));
}

if ($ward_id === 0) {
    echo json_encode(["success" => false, "message" => "Ward ID not specified or could not be resolved."]);
    exit;
}

$sql = "SELECT * FROM ward_activities WHERE ward_id = ? ORDER BY activity_date DESC, activity_time DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $ward_id);
$stmt->execute();
$result = $stmt->get_result();

$activities = [];
while ($row = $result->fetch_assoc()) {
    $activities[] = $row;
}

echo json_encode(["success" => true, "data" => $activities]);
?>
