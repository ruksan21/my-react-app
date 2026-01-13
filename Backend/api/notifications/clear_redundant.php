<?php
require_once "../db_connect.php";
// Precise types used in the backend for redundant system updates
$types = ['activity', 'budget', 'work'];
$placeholders = implode(',', array_fill(0, count($types), '?'));
$sql = "DELETE FROM notifications WHERE type IN ($placeholders)";
$stmt = $conn->prepare($sql);
$stmt->bind_param(str_repeat('s', count($types)), ...$types);
if ($stmt->execute()) {
    echo "Deleted " . $stmt->affected_rows . " redundant notifications (Types: activity, budget, work).\n";
} else {
    echo "Error: " . $conn->error . "\n";
}
?>
