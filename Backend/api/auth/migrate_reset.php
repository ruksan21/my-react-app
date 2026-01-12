<?php
require_once '../db_connect.php';

echo "Checking users table...<br>";

// Add reset_token column
$check = $conn->query("SHOW COLUMNS FROM users LIKE 'reset_token'");
if ($check->num_rows == 0) {
    echo "Adding 'reset_token' column...<br>";
    $sql = "ALTER TABLE users ADD COLUMN reset_token VARCHAR(64) DEFAULT NULL";
    if ($conn->query($sql)) {
        echo "✅ 'reset_token' added successfully.<br>";
    } else {
        echo "❌ Error adding 'reset_token': " . $conn->error . "<br>";
    }
} else {
    echo "✅ 'reset_token' exists.<br>";
}

// Add token_expiry column
$check2 = $conn->query("SHOW COLUMNS FROM users LIKE 'token_expiry'");
if ($check2->num_rows == 0) {
    echo "Adding 'token_expiry' column...<br>";
    $sql2 = "ALTER TABLE users ADD COLUMN token_expiry TIMESTAMP NULL DEFAULT NULL";
    if ($conn->query($sql2)) {
        echo "✅ 'token_expiry' added successfully.<br>";
    } else {
        echo "❌ Error adding 'token_expiry': " . $conn->error . "<br>";
    }
} else {
    echo "✅ 'token_expiry' exists.<br>";
}

echo "Database Update Complete.";
?>
