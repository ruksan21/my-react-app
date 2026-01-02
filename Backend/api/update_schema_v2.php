<?php
require_once 'db_connect.php';

// Add google_map_link and telephone to wards table
$sql1 = "ALTER TABLE wards ADD COLUMN IF NOT EXISTS google_map_link TEXT DEFAULT NULL";
$sql2 = "ALTER TABLE wards ADD COLUMN IF NOT EXISTS telephone VARCHAR(20) DEFAULT NULL";

$conn->query($sql1);
$conn->query($sql2);

echo "Schema updated with google_map_link and telephone columns.";
?>
