<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once 'db_connect.php';

if (isset($_GET['officer_id'])) {
    $officer_id = intval($_GET['officer_id']);
    
    // Get followers with their details (Name, Ward, District, Photo)
    // Assuming 'users' table has these fields.
    // Joining with 'users' table as 'u' (the follower)
    $sql = "SELECT 
                u.id, 
                u.first_name, 
                u.last_name, 
                u.email, 
                u.ward_number, 
                u.district, 
                u.citizenship_photo 
            FROM followers f
            JOIN users u ON f.follower_id = u.id
            WHERE f.officer_id = $officer_id
            ORDER BY f.created_at DESC";

    $result = $conn->query($sql);

    $followers = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $followers[] = $row;
        }
    }
    
    echo json_encode(["success" => true, "data" => $followers]);
} else {
    echo json_encode(["success" => false, "message" => "Officer ID required"]);
}

$conn->close();
?>
