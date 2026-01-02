<?php
require_once 'db_connect.php';
$res = $conn->query("DESCRIBE ward_assets");
$columns = [];
while ($row = $res->fetch_assoc()) {
    $columns[] = $row;
}
echo json_encode($columns, JSON_PRETTY_PRINT);
?>
