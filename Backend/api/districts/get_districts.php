<?php
/**
 * Get Districts API
 * Fetches all districts for dropdown filtering
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once '../db_connect.php';

$query = "SELECT id, name, province FROM districts ORDER BY name";
$result = $conn->query($query);

$districts = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $districts[] = $row;
    }
}

echo json_encode(array(
    "success" => true,
    "data" => $districts
));
?>
