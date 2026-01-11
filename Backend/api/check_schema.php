<?php
require_once 'db_connect.php';
$tables = ['users', 'wards', 'districts', 'ward_notices', 'ward_activities', 'ward_budgets'];
foreach($tables as $table) {
    echo "--- Table: $table ---\n";
    $res = $conn->query("DESCRIBE $table");
    if($res) {
        while($row = $res->fetch_assoc()) {
            echo "{$row['Field']} - {$row['Type']} - {$row['Null']} - {$row['Key']}\n";
        }
    } else {
        echo "Error: " . $conn->error . "\n";
    }
}
?>
