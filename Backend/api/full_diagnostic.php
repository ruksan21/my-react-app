<?php
header("Content-Type: text/plain");
require_once 'db_connect.php';

echo "--- TABLES ---\n";
$tables_res = $conn->query("SHOW TABLES");
$tables = [];
while ($row = $tables_res->fetch_array()) {
    $tables[] = $row[0];
}

foreach ($tables as $table) {
    echo "\nTABLE: $table\n";
    $desc_res = $conn->query("DESCRIBE `$table` ");
    if ($desc_res) {
        while ($row = $desc_res->fetch_assoc()) {
            echo "  {$row['Field']} | {$row['Type']} | {$row['Null']} | {$row['Key']} | {$row['Default']}\n";
        }
    } else {
        echo "  Error: " . $conn->error . "\n";
    }
}

echo "\n--- OFFICER DATA ---\n";
$users_res = $conn->query("SELECT id, full_name, role, status, assigned_ward_id FROM users WHERE role = 'officer'");
while ($row = $users_res->fetch_assoc()) {
    echo "ID: {$row['id']} | Name: {$row['full_name']} | Status: {$row['status']} | Ward_ID: {$row['assigned_ward_id']}\n";
}
?>
