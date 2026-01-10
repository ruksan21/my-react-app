<?php
/**
 * Diagnostic: Check if Ward 1 exists and resolve officer location issue
 */

header("Content-Type: application/json");
require_once '../db_connect.php';

$diagnosis = [
    "timestamp" => date("Y-m-d H:i:s"),
    "checks" => [],
    "recommendations" => []
];

// 1. Check if Ward 1 exists
$diagnosis["checks"]["ward_1_exists"] = [];
$ward_check = $conn->query("SELECT * FROM wards WHERE ward_number = 1");
if ($ward_check && $ward_check->num_rows > 0) {
    $ward = $ward_check->fetch_assoc();
    $diagnosis["checks"]["ward_1_exists"]["found"] = true;
    $diagnosis["checks"]["ward_1_exists"]["data"] = $ward;
} else {
    $diagnosis["checks"]["ward_1_exists"]["found"] = false;
    $diagnosis["recommendations"][] = "⚠️ Ward 1 does not exist! Create it with exact location: Province: 'Bagmati Province', District: 'Kathmandu', Municipality: 'Itahari Sub-Metropolitan City', Ward: 1";
}

// 2. Check officer's work location
$diagnosis["checks"]["officer_location"] = [];
$officer_check = $conn->query("SELECT id, full_name, work_province, work_district, work_municipality, work_ward FROM users WHERE role = 'officer' LIMIT 1");
if ($officer_check && $officer_check->num_rows > 0) {
    $officer = $officer_check->fetch_assoc();
    $diagnosis["checks"]["officer_location"]["officer"] = $officer;
    
    // Try to match with ward
    $match_query = $conn->prepare("SELECT id FROM wards WHERE province = ? AND district = ? AND municipality = ? AND ward_number = ?");
    $match_query->bind_param("sssi", $officer['work_province'], $officer['work_district'], $officer['work_municipality'], $officer['work_ward']);
    $match_query->execute();
    $match_result = $match_query->get_result();
    
    if ($match_result && $match_result->num_rows > 0) {
        $diagnosis["checks"]["officer_location"]["matches_ward"] = true;
    } else {
        $diagnosis["checks"]["officer_location"]["matches_ward"] = false;
        $diagnosis["recommendations"][] = "⚠️ Officer's location doesn't match any ward! Officer location: {$officer['work_province']} / {$officer['work_district']} / {$officer['work_municipality']} / Ward {$officer['work_ward']}";
    }
    $match_query->close();
} else {
    $diagnosis["recommendations"][] = "❌ No officer found in database!";
}

// 3. List all wards in database
$diagnosis["checks"]["all_wards"] = [];
$all_wards = $conn->query("SELECT id, ward_number, municipality, district, province FROM wards");
$wards_list = [];
if ($all_wards) {
    while ($w = $all_wards->fetch_assoc()) {
        $wards_list[] = $w;
    }
}
$diagnosis["checks"]["all_wards"]["count"] = count($wards_list);
$diagnosis["checks"]["all_wards"]["wards"] = $wards_list;

// 4. SQL to create Ward 1 if missing
if (!($ward_check && $ward_check->num_rows > 0)) {
    $diagnosis["sql_to_fix"] = "
-- Create Ward 1 (Itahari Sub-Metropolitan City, Ward 1)
INSERT INTO wards (ward_number, municipality, district, province) 
VALUES (1, 'Itahari Sub-Metropolitan City', 'Kathmandu', 'Bagmati Province');

-- Then update officer's location to match
UPDATE users SET 
  work_province = 'Bagmati Province',
  work_district = 'Kathmandu', 
  work_municipality = 'Itahari Sub-Metropolitan City',
  work_ward = 1
WHERE role = 'officer';
    ";
}

echo json_encode($diagnosis, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
$conn->close();
?>
