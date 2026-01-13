<?php
require_once '../db_connect.php';

// Add reset_token column
$check = $conn->query("SHOW COLUMNS FROM users LIKE 'reset_token'");
if ($check->num_rows == 0) {
    $sql = "ALTER TABLE users ADD COLUMN reset_token VARCHAR(64) DEFAULT NULL";
    $conn->query($sql);
}

// Add token_expiry column
$check2 = $conn->query("SHOW COLUMNS FROM users LIKE 'token_expiry'");
if ($check2->num_rows == 0) {
    $sql2 = "ALTER TABLE users ADD COLUMN token_expiry TIMESTAMP NULL DEFAULT NULL";
    $conn->query($sql2);
}
?>
