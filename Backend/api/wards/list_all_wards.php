<?php
/**
 * Get Wards API
 * Fetches all wards with optional district filtering
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

try {
    require_once '../db_connect.php';

    // Get optional district filter from query parameter
    $district_id = isset($_GET['district_id']) ? intval($_GET['district_id']) : null;

    // Build query
    $query = "SELECT 
        w.id,
        w.ward_number,
        w.location,
        w.contact_phone,
        w.contact_email,
        w.google_map_link,
        w.telephone,
        w.chairperson_name,
        w.chairperson_phone,
        w.chairperson_email,
        w.chairperson_photo,
        w.chairperson_education,
        w.chairperson_experience,
        w.chairperson_political_party,
        w.chairperson_appointment_date,
        w.chairperson_bio,
        w.municipality,
        d.id as district_id,
        d.name as district_name,
        d.province,
        (SELECT COUNT(*) FROM ward_assets WHERE ward_id = w.id AND status = 'active') as total_assets
    FROM wards w
    LEFT JOIN districts d ON w.district_id = d.id";

    if ($district_id) {
        $query .= " WHERE w.district_id = $district_id";
    }

    $query .= " ORDER BY d.name, w.ward_number";

    $result = $conn->query($query);

    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }

    $wards = array();
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $wards[] = $row;
        }
    }

    echo json_encode(array(
        "success" => true,
        "data" => $wards
    ));

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false, 
        "message" => "Server Error: " . $e->getMessage()
    ));
}
?>
