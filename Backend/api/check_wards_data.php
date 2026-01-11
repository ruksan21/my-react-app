<?php
require_once 'db_connect.php';
$res = $conn->query("SELECT id, province, district_name, municipality, ward_number, chairperson_name FROM wards");
$out = "ID | Province | District | Municipality | Ward | Chairperson\n";
$out .= "---|----------|----------|--------------|------|------------\n";
while($row = $res->fetch_assoc()) {
    $out .= "{$row['id']} | {$row['province']} | {$row['district_name']} | {$row['municipality']} | {$row['ward_number']} | {$row['chairperson_name']}\n";
}
file_put_contents('wards_output.txt', $out);
echo "Done";
