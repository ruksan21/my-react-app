<?php
require_once 'db_connect.php';

echo "<h2>Diagnostic Report</h2>";

// 1. Check Wards Table
echo "<h3>Wards Data</h3>";
$sql = "SELECT id, ward_number, district_id, municipality FROM wards";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    echo "<table border='1'><tr><th>ID</th><th>Ward No</th><th>District ID</th><th>Municipality</th></tr>";
    while($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row['id'] . "</td>";
        echo "<td>" . $row['ward_number'] . "</td>";
        echo "<td>" . $row['district_id'] . "</td>";
        echo "<td>[" . ($row['municipality'] ? $row['municipality'] : 'EMPTY/NULL') . "]</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "No wards found.<br>";
}

// 2. Check Users (Officers) Assignment
echo "<h3>Officer Assignments</h3>";
$sql = "SELECT id, username, assigned_ward FROM users WHERE role='officer'";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    echo "<table border='1'><tr><th>Officer ID</th><th>Username</th><th>Assigned Ward ID</th></tr>";
    while($row = $result->fetch_assoc()) {
         echo "<tr><td>{$row['id']}</td><td>{$row['username']}</td><td>{$row['assigned_ward']}</td></tr>";
    }
    echo "</table>";
} else {
    echo "No officers found.<br>";
}

// 3. Check Works
echo "<h3>Development Works</h3>";
$sql = "SELECT dw.id, dw.title, dw.officer_id FROM development_works dw LIMIT 5";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
     echo "<table border='1'><tr><th>Work ID</th><th>Title</th><th>Officer ID</th></tr>";
     while($row = $result->fetch_assoc()) {
         echo "<tr><td>{$row['id']}</td><td>{$row['title']}</td><td>{$row['officer_id']}</td></tr>";
     }
     echo "</table>";
} else {
    echo "No works found.<br>";
}
?>
