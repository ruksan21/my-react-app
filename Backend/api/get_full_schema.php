<?php
require_once 'db_connect.php';
$tables = $conn->query("SHOW TABLES");
echo "FULL DATABASE SCHEMA\n";
echo "====================\n\n";
while($trow = $tables->fetch_array()) {
    $table = $trow[0];
    echo "--- Table: $table ---\n";
    $res = $conn->query("SHOW CREATE TABLE $table");
    $row = $res->fetch_array();
    echo $row[1] . ";\n\n";
}
?>
