<?php
// Disable error reporting to prevent HTML warnings breaking JSON
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once '../db_connect.php';

// Check connection
if ($conn->connect_error) {
    echo json_encode([]);
    exit();
}

// Check if table exists
$tableCheck = $conn->query("SHOW TABLES LIKE 'system_alerts'");
if ($tableCheck->num_rows == 0) {
    // Table missing, return empty array (frontend will show 0 alerts, no error)
    echo json_encode([]);
    exit();
}

$ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : null;

// Officer work location filters
$work_province = isset($_GET['work_province']) ? $conn->real_escape_string($_GET['work_province']) : null;
$work_district = isset($_GET['work_district']) ? $conn->real_escape_string($_GET['work_district']) : null;
$work_municipality = isset($_GET['work_municipality']) ? $conn->real_escape_string($_GET['work_municipality']) : null;
$work_ward = isset($_GET['work_ward']) ? intval($_GET['work_ward']) : null;

$role = isset($_GET['role']) ? $_GET['role'] : 'user'; // Default to user if not specified

// Role filter condition
$roleCondition = " AND (target_role = 'all'";
if ($role === 'officer') {
    $roleCondition .= " OR target_role = 'officer')";
} else if ($role === 'admin') {
    $roleCondition .= " OR target_role = 'admin' OR target_role = 'officer' OR target_role = 'user')";
} else {
    // Default user
    $roleCondition .= " OR target_role = 'user')";
}

if ($ward_id) {
    $query = "SELECT * FROM system_alerts WHERE (ward_id = $ward_id OR ward_id IS NULL) $roleCondition ORDER BY created_at DESC";
} elseif ($work_province || $work_district || $work_municipality || $work_ward) {
    // Filter by work location
    $query = "SELECT sa.* FROM system_alerts sa
              LEFT JOIN wards w ON sa.ward_id = w.id
              LEFT JOIN districts d ON w.district_id = d.id
              WHERE (sa.ward_id IS NULL OR (1=1";
    
    if ($work_province) {
        $query .= " AND d.province = '$work_province'";
    }
    if ($work_district) {
        $query .= " AND d.name = '$work_district'";
    }
    if ($work_municipality) {
        $query .= " AND w.municipality = '$work_municipality'";
    }
    if ($work_ward) {
        $query .= " AND w.ward_number = $work_ward";
    }
    
    $query .= ")) $roleCondition ORDER BY sa.created_at DESC";
} else {
    $query = "SELECT * FROM system_alerts WHERE 1=1 $roleCondition ORDER BY created_at DESC";
}

$result = $conn->query($query);

if (!$result) {
    echo json_encode([]);
    exit();
}

$alerts = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $row['timestamp'] = date("Y-m-d H:i", strtotime($row['created_at']));
        $alerts[] = $row;
    }
}

echo json_encode($alerts);
?>
