<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->officer_id) && !empty($data->follower_id)) {
    $officer_id = intval($data->officer_id);
    $follower_id = intval($data->follower_id);

    // Check if following
    $check_sql = "SELECT id FROM followers WHERE officer_id = ? AND follower_id = ?";
    $stmt_check = $conn->prepare($check_sql);
    $stmt_check->bind_param("ii", $officer_id, $follower_id);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();

    if ($result_check->num_rows > 0) {
        // Unfollow
        $unfollow_sql = "DELETE FROM followers WHERE officer_id = ? AND follower_id = ?";
        $stmt_unfollow = $conn->prepare($unfollow_sql);
        $stmt_unfollow->bind_param("ii", $officer_id, $follower_id);
        if ($stmt_unfollow->execute()) {
            echo json_encode(["success" => true, "isFollowing" => false, "message" => "Unfollowed successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error unfollowing: " . $conn->error]);
        }
    } else {
        // Follow
        $follow_sql = "INSERT INTO followers (officer_id, follower_id) VALUES (?, ?)";
        $stmt_follow = $conn->prepare($follow_sql);
        $stmt_follow->bind_param("ii", $officer_id, $follower_id);
        if ($stmt_follow->execute()) {
            echo json_encode(["success" => true, "isFollowing" => true, "message" => "Followed successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error following: " . $conn->error]);
        }
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data"]);
}

$conn->close();
?>
