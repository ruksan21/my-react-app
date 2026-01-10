<?php
/**
 * Setup and verify feedback_replies table with proper relationships
 * Run this once to ensure the table is created correctly
 */

header("Content-Type: application/json");
require_once '../db_connect.php';

// Function to check if column exists
function columnExists($conn, $table, $column) {
    $result = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
    return $result && $result->num_rows > 0;
}

// Function to check if table exists
function tableExists($conn, $table) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    return $result && $result->num_rows > 0;
}

$response = [
    "success" => true,
    "messages" => []
];

try {
    // Step 1: Check if feedback_replies table exists
    if (!tableExists($conn, 'feedback_replies')) {
        $response["messages"][] = "Creating feedback_replies table...";
        
        $create_sql = "CREATE TABLE IF NOT EXISTS `feedback_replies` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `feedback_id` INT NOT NULL,
            `officer_id` INT NOT NULL,
            `officer_name` VARCHAR(255) NOT NULL,
            `reply_text` LONGTEXT NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY `idx_feedback_id` (`feedback_id`),
            KEY `idx_officer_id` (`officer_id`),
            KEY `idx_created_at` (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        if ($conn->query($create_sql)) {
            $response["messages"][] = "✅ feedback_replies table created successfully";
        } else {
            throw new Exception("Error creating feedback_replies table: " . $conn->error);
        }
    } else {
        $response["messages"][] = "✅ feedback_replies table already exists";
    }
    
    // Step 2: Verify all columns exist
    $required_columns = [
        'id' => 'INT',
        'feedback_id' => 'INT',
        'officer_id' => 'INT',
        'officer_name' => 'VARCHAR(255)',
        'reply_text' => 'LONGTEXT',
        'created_at' => 'TIMESTAMP',
        'updated_at' => 'TIMESTAMP'
    ];
    
    foreach ($required_columns as $col => $type) {
        if (columnExists($conn, 'feedback_replies', $col)) {
            $response["messages"][] = "✅ Column '$col' exists";
        } else {
            $response["messages"][] = "⚠️ Column '$col' missing - but table exists";
        }
    }
    
    // Step 3: Verify work_feedback table exists
    if (tableExists($conn, 'work_feedback')) {
        $response["messages"][] = "✅ work_feedback table exists";
    } else {
        $response["messages"][] = "❌ work_feedback table NOT found";
        $response["success"] = false;
    }
    
    // Step 4: Verify users table exists
    if (tableExists($conn, 'users')) {
        $response["messages"][] = "✅ users table exists";
    } else {
        $response["messages"][] = "❌ users table NOT found";
        $response["success"] = false;
    }
    
    // Step 5: Test connection - try a sample query
    $test_query = "SELECT COUNT(*) as total FROM `feedback_replies`";
    $test_result = $conn->query($test_query);
    if ($test_result) {
        $row = $test_result->fetch_assoc();
        $response["messages"][] = "✅ Query test successful - " . $row['total'] . " replies in database";
    } else {
        throw new Exception("Query test failed: " . $conn->error);
    }
    
    $response["messages"][] = "✅ All setup checks passed!";
    
} catch (Exception $e) {
    $response["success"] = false;
    $response["messages"][] = "❌ Error: " . $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
$conn->close();
?>
