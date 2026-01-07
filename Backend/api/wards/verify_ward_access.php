<?php
// verify_ward_access.php
// This helper file should be included in any API that modifies ward-specific data.
// It verifies that the logged-in officer is assigned to the ward they are trying to modify.

if (!isset($conn)) {
    require_once '../db_connect.php';
}

function verifyWardAccess($conn, $officer_id, $target_ward_id) {
    if (!$officer_id || !$target_ward_id) {
        return false;
    }

    // Officer is allowed if their work location matches the target ward
    $sql = "SELECT u.id
            FROM users u
            INNER JOIN wards w ON w.id = ?
            INNER JOIN districts d ON w.district_id = d.id
            WHERE u.id = ?
              AND u.role = 'officer'
              AND u.work_province = d.province
              AND u.work_district = d.name
              AND u.work_municipality = w.municipality
              AND u.work_ward = w.ward_number";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $target_ward_id, $officer_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $has_access = $result && $result->num_rows > 0;

    $stmt->close();
    return $has_access;
}

// Helper to send unauthorized response and exit
function sendUnauthorizedResponse() {
    echo json_encode([
        "success" => false, 
        "message" => "Unauthorized: You do not have permission to modify data for this ward."
    ]);
    exit();
}
?>
