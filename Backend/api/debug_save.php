<?php
header("Content-Type: text/plain");
require_once 'db_connect.php';

echo "--- 1. Database Connection Check ---\n";
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully to: " . DB_NAME . "\n\n";

echo "--- 2. Officer Status Check ---\n";
$sql = "SELECT id, full_name, email, role, status, assigned_ward_id FROM users WHERE role = 'officer'";
$res = $conn->query($sql);
if ($res) {
    while ($row = $res->fetch_assoc()) {
        echo "ID: {$row['id']} | Name: {$row['full_name']} | Status: {$row['status']} | Ward: {$row['assigned_ward_id']}\n";
    }
} else {
    echo "Error querying users: " . $conn->error . "\n";
}
echo "\n";

echo "--- 3. Table Column Check (ward_budgets) ---\n";
$res = $conn->query("DESCRIBE ward_budgets");
if ($res) {
    while ($row = $res->fetch_assoc()) {
        echo "{$row['Field']} - {$row['Type']} - {$row['Null']}\n";
    }
} else {
    echo "Error describing ward_budgets: " . $conn->error . "\n";
}
echo "\n";

echo "--- 4. Table Column Check (ward_activities) ---\n";
$res = $conn->query("DESCRIBE ward_activities");
if ($res) {
    while ($row = $res->fetch_assoc()) {
        echo "{$row['Field']} - {$row['Type']} - {$row['Null']}\n";
    }
} else {
    echo "Error describing ward_activities: " . $conn->error . "\n";
}
echo "\n";

echo "--- 5. Table Column Check (development_works) ---\n";
$res = $conn->query("DESCRIBE development_works");
if ($res) {
    while ($row = $res->fetch_assoc()) {
        echo "{$row['Field']} - {$row['Type']} - {$row['Null']}\n";
    }
} else {
    echo "Error describing development_works: " . $conn->error . "\n";
}
?>
