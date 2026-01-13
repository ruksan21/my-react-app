<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../db_connect.php';
require_once '../utils/ward_utils.php';

// Check if ward_id is provided directly or via location params
$ward_id = 0;

if (isset($_GET['ward_id'])) {
    $ward_id = intval($_GET['ward_id']);
} else if (isset($_GET['work_province'])) {
    $ward_id = resolveWardIdFlexible($conn, $_GET['work_province'], $_GET['work_district'], $_GET['work_municipality'], intval($_GET['work_ward']));
}

if ($ward_id === 0) {
    echo json_encode(["success" => false, "message" => "Ward ID not specified or could not be resolved."]);
    exit;
}

$sql = "SELECT a.*, w.municipality, w.ward_number, w.district_name, w.province 
        FROM ward_activities a
        LEFT JOIN wards w ON a.ward_id = w.id
        WHERE a.ward_id = ? 
        ORDER BY a.activity_date DESC, a.activity_time DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $ward_id);
$stmt->execute();
$result = $stmt->get_result();

$activities = [];
while ($row = $result->fetch_assoc()) {
    // Construct source string if data available
    $source = '';
    if (!empty($row['province']) && !empty($row['municipality'])) {
            $source = $row['municipality'] . '-' . $row['ward_number'] . ', ' . $row['district_name'];
    }
    $row['source'] = $source;
    $activities[] = $row;
}

echo json_encode(["success" => true, "data" => $activities]);
?>
