<?php
require_once 'db_connect.php';
$res = $conn->query("SHOW TABLES");
$tables = [];
if ($res) {
    while ($row = $res->fetch_array()) {
        $tables[] = $row[0];
    }
    echo json_encode($tables, JSON_PRETTY_PRINT);
} else {
    echo json_encode(["error" => $conn->error]);
}
?>
