<?php
/**
 * Debug: Check feedback_replies table and connections
 */

header("Content-Type: application/json");
require_once '../db_connect.php';

$debug = [
    "database_connected" => $conn->ping() ? true : false,
    "database_name" => "ward_management",
    "tables" => []
];

// Get all tables in database
$tables_result = $conn->query("SHOW TABLES");
while ($row = $tables_result->fetch_array()) {
    $table_name = $row[0];
    
    // Get column info for important tables
    if (in_array($table_name, ['feedback_replies', 'work_feedback', 'users'])) {
        $cols_result = $conn->query("SHOW COLUMNS FROM `$table_name`");
        $columns = [];
        while ($col = $cols_result->fetch_assoc()) {
            $columns[] = $col['Field'] . ' (' . $col['Type'] . ')';
        }
        
        $debug["tables"][$table_name] = [
            "exists" => true,
            "columns" => $columns
        ];
    }
}

// Check if feedback_replies has any data
if (isset($debug["tables"]["feedback_replies"])) {
    $count_result = $conn->query("SELECT COUNT(*) as cnt FROM feedback_replies");
    $count_row = $count_result->fetch_assoc();
    $debug["tables"]["feedback_replies"]["total_records"] = $count_row['cnt'];
    
    // Get sample data if exists
    if ($count_row['cnt'] > 0) {
        $sample = $conn->query("SELECT * FROM feedback_replies LIMIT 1");
        if ($sample) {
            $debug["tables"]["feedback_replies"]["sample_record"] = $sample->fetch_assoc();
        }
    }
}

echo json_encode($debug, JSON_PRETTY_PRINT);
$conn->close();
?>
