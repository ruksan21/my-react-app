<?php
require_once 'db_connect.php';

echo "=== CHECKING OFFICER FOR WARD 1 ===\n\n";

$ward_id = 1;
$stmt = $conn->prepare("SELECT u.id, u.full_name, u.email, u.role, u.status FROM users u WHERE u.ward_id = ? AND u.role = 'officer' AND u.status = 'approved'");
$stmt->bind_param("i", $ward_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "Officer Found:\n";
        echo "ID: {$row['id']}\n";
        echo "Name: {$row['full_name']}\n";
        echo "Email: {$row['email']}\n";
        echo "Role: {$row['role']}\n";
        echo "Status: {$row['status']}\n\n";
    }
} else {
    echo "No officer found for ward 1\n";
}

echo "\n=== CHECKING ALL OFFICERS ===\n";
$result = $conn->query("SELECT id, full_name, email, ward_id, role, status FROM users WHERE role = 'officer'");
while ($row = $result->fetch_assoc()) {
    echo "ID: {$row['id']} | Ward: {$row['ward_id']} | {$row['full_name']} | Status: {$row['status']}\n";
}

$conn->close();
?>
