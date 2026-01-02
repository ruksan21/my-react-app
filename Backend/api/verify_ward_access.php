<?php
// verify_ward_access.php
// This helper file should be included in any API that modifies ward-specific data.
// It verifies that the logged-in officer is assigned to the ward they are trying to modify.

if (!isset($conn)) {
    require_once 'db_connect.php';
}

function verifyWardAccess($conn, $officer_id, $target_ward_id) {
    if (!$officer_id || !$target_ward_id) {
        return false;
    }

    // Check if the officer is actually assigned to this ward
    $sql = "SELECT id FROM users WHERE id = ? AND role = 'officer' AND assigned_ward = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $officer_id, $target_ward_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $has_access = $result->num_rows > 0;
    
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
