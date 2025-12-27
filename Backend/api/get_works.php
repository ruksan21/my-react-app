<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

$sql = "SELECT * FROM development_works ORDER BY created_at DESC";
$result = $conn->query($sql);

$works = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $works[] = $row;
    }
}

echo json_encode($works);

$conn->close();
?>
