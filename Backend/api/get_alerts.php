<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once 'db_connect.php';

$query = "SELECT * FROM system_alerts ORDER BY timestamp DESC";
$result = $conn->query($query);

$alerts = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $alerts[] = $row;
    }
}

echo json_encode($alerts);
?>
