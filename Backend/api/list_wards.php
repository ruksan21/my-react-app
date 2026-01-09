<?php
require_once 'db_connect.php';
$res = $conn->query("SELECT id, ward_number, municipality FROM wards");
while($row = $res->fetch_assoc()) {
    echo "ID: " . $row['id'] . " | Ward: " . $row['ward_number'] . " | Municipality: " . $row['municipality'] . "\n";
}
$conn->close();
?>
