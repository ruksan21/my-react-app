<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db_connect.php';

$input = file_get_contents("php://input");
$data = json_decode($input);

// Log for debugging (optional, can be removed later)
// file_put_contents('debug_follow.log', "Time: " . date('Y-m-d H:i:s') . " Input: " . $input . "\n", FILE_APPEND);

if (isset($data->follower_id) && (isset($data->officer_id) || isset($data->ward_id))) {
    $follower_id = intval($data->follower_id);
    $officer_id = (!empty($data->officer_id) && $data->officer_id !== "null") ? intval($data->officer_id) : null;
    $ward_id = (!empty($data->ward_id) && $data->ward_id !== "null") ? intval($data->ward_id) : null;

    if (!$follower_id || (!$officer_id && !$ward_id)) {
         echo json_encode([
             "success" => false, 
             "message" => "V3-ERROR: Missing actual values. Follower=$follower_id, Officer=$officer_id, Ward=$ward_id"
         ]);
         exit();
    }

    // Build check query using prepared statements
    if ($officer_id !== null) {
        $check_sql = "SELECT id FROM followers WHERE follower_id = ? AND officer_id = ?";
        $stmt_check = $conn->prepare($check_sql);
        $stmt_check->bind_param("ii", $follower_id, $officer_id);
    } else {
        $check_sql = "SELECT id FROM followers WHERE follower_id = ? AND ward_id = ?";
        $stmt_check = $conn->prepare($check_sql);
        $stmt_check->bind_param("ii", $follower_id, $ward_id);
    }
    
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();

    if ($result_check && $result_check->num_rows > 0) {
        // Unfollow
        if ($officer_id !== null) {
            $unfollow_sql = "DELETE FROM followers WHERE follower_id = ? AND officer_id = ?";
            $stmt_unfollow = $conn->prepare($unfollow_sql);
            $stmt_unfollow->bind_param("ii", $follower_id, $officer_id);
        } else {
            $unfollow_sql = "DELETE FROM followers WHERE follower_id = ? AND ward_id = ?";
            $stmt_unfollow = $conn->prepare($unfollow_sql);
            $stmt_unfollow->bind_param("ii", $follower_id, $ward_id);
        }
        
        if ($stmt_unfollow->execute()) {
            echo json_encode(["success" => true, "isFollowing" => false, "message" => "Unfollowed successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error unfollowing: " . $conn->error]);
        }
        $stmt_unfollow->close();
    } else {
        // Follow - use prepared statement with proper NULL handling
        $follow_sql = "INSERT INTO followers (officer_id, ward_id, follower_id) VALUES (?, ?, ?)";
        $stmt_follow = $conn->prepare($follow_sql);
        $stmt_follow->bind_param("iii", $officer_id, $ward_id, $follower_id);
        
        if ($stmt_follow->execute()) {
            echo json_encode(["success" => true, "isFollowing" => true, "message" => "Followed successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error following: " . $conn->error]);
        }
        $stmt_follow->close();
    }
    $stmt_check->close();
} else {
    echo json_encode([
        "success" => false, 
        "message" => "V3-ERROR: Missing keys in payload. Received: " . $input
    ]);
}

$conn->close();
?>
