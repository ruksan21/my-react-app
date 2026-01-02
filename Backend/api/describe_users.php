<?php
require_once 'db_connect.php';
$res = $conn->query("DESCRIBE users");
$columns = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $columns[] = $row;
    }
    echo json_encode($columns, JSON_PRETTY_PRINT);
} else {
    echo json_encode(["error" => $conn->error]);
}
?>
