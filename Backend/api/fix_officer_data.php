<?php
require_once 'db_connect.php';
header("Content-Type: text/plain");

echo "PROJECT FINAL STRETCH - DATA INTEGRITY FIX\n";
echo "========================================\n\n";

// 1. Fix status inconsistency
$sql1 = "UPDATE users SET status = 'active' WHERE status = 'approved' AND role = 'officer'";
if ($conn->query($sql1)) {
    echo "[1] Status Normalization: Updated " . $conn->affected_rows . " officers from 'approved' to 'active'.\n";
} else {
    echo "[1] Error updating status: " . $conn->error . "\n";
}

// 2. Assign Ward IDs based on work location
// This uses a robust JOIN to match officers to existing wards
$sql2 = "UPDATE users u 
         JOIN wards w ON (
             u.work_ward = w.ward_number 
             AND (
                 TRIM(u.work_municipality) LIKE TRIM(w.municipality)
                 OR TRIM(u.work_municipality) LIKE CONCAT('%', TRIM(w.municipality), '%')
                 OR TRIM(w.municipality) LIKE CONCAT('%', TRIM(u.work_municipality), '%')
             )
         )
         SET u.assigned_ward_id = w.id 
         WHERE u.role = 'officer' AND (u.assigned_ward_id IS NULL OR u.assigned_ward_id = 0)";

if ($conn->query($sql2)) {
    echo "[2] Ward Assignment: Linked " . $conn->affected_rows . " officers to their respective ward IDs.\n";
} else {
    echo "[2] Error linking wards: " . $conn->error . "\n";
}

// 3. Ensure "Ward 1" exists if it's the default (common issue)
$check_w1 = "SELECT id FROM wards WHERE ward_number = 1 LIMIT 1";
$res_w1 = $conn->query($check_w1);
if ($res_w1 && $res_w1->num_rows === 0) {
    echo "[3] Notice: Ward 1 is missing in the database. Creating it now...\n";
    $create_w1 = "INSERT INTO wards (ward_number, municipality, province, district) VALUES (1, 'Itahari Sub-Metropolitan City', 'Bagmati Province', 'Kathmandu')";
    if ($conn->query($create_w1)) {
        echo "    Ward 1 created successfully.\n";
    }
} else {
    echo "[3] Integrity Check: Ward 1 exists.\n";
}

echo "\nFIX COMPLETE. Please try saving your data again.\n";
?>
