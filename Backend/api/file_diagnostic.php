<?php
ob_start();
require_once 'db_connect.php';

echo "--- TABLES ---\n";
$tables_res = $conn->query("SHOW TABLES");
if ($tables_res) {
    while ($row = $tables_res->fetch_array()) {
        $table = $row[0];
        echo "TABLE: $table\n";
    }
}

echo "\n--- USERS SCAN ---\n";
$users_res = $conn->query("SELECT id, email, role, status FROM users");
if ($users_res) {
    while ($row = $users_res->fetch_assoc()) {
        echo "ID: {$row['id']} | Email: {$row['email']} | Role: {$row['role']} | Status: {$row['status']}\n";
    }
}

$output = ob_get_clean();
file_put_contents('diagnostic_output.txt', $output);
echo "Diagnostic complete. Check diagnostic_output.txt\n";
?>
