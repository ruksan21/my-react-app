<?php
require_once 'db_connect.php';
echo "--- Officers ---\n";
$res = $conn->query("SELECT id, full_name, status, work_province, work_district, work_municipality, work_ward FROM users WHERE role = 'officer'");
while($row = $res->fetch_assoc()) {
    print_r($row);
}
echo "--- Wards ---\n";
$res = $conn->query("SELECT id, ward_number, municipality, district_id FROM wards");
while($row = $res->fetch_assoc()) {
    print_r($row);
}
echo "--- Districts ---\n";
$res = $conn->query("SELECT * FROM districts");
while($row = $res->fetch_assoc()) {
    print_r($row);
}
?>
