<?php
require_once 'db_connect.php';
$output = "DATABASE DIAGNOSTIC REPORT\n";
$output .= "==========================\n\n";

$output .= "--- Officers Status ---\n";
$res = $conn->query("SELECT id, full_name, email, role, status, work_province, work_district, work_municipality, work_ward, assigned_ward_id FROM users WHERE role = 'officer'");
while($row = $res->fetch_assoc()) {
    $output .= json_encode($row) . "\n";
}

$output .= "\n--- Wards Table ---\n";
$res = $conn->query("SELECT id, ward_number, municipality, province, district FROM wards");
while($row = $res->fetch_assoc()) {
    $output .= json_encode($row) . "\n";
}

$output .= "\n--- Districts Table ---\n";
$res = $conn->query("SELECT * FROM districts");
while($row = $res->fetch_assoc()) {
    $output .= json_encode($row) . "\n";
}

file_put_contents('db_report.txt', $output);
echo "Report generated in db_report.txt\n";
?>
