<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->userId) && !empty($data->oldPassword) && !empty($data->newPassword)) {
    $userId = intval($data->userId);
    $oldPassword = $data->oldPassword;
    $newPassword = $data->newPassword;

    // Get current password hash
    $query = "SELECT password FROM users WHERE id = $userId LIMIT 1";
    $result = $conn->query($query);

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Verify old password
        if (password_verify($oldPassword, $user['password'])) {
            // Hash new password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            
            // Update password
            $updateQuery = "UPDATE users SET password = ? WHERE id = ?";
            $stmt = $conn->prepare($updateQuery);
            if ($stmt) {
                $stmt->bind_param("si", $hashedPassword, $userId);
                if ($stmt->execute()) {
                    echo json_encode(array("success" => true, "message" => "Password updated successfully."));
                } else {
                    echo json_encode(array("success" => false, "message" => "Error updating password: " . $stmt->error));
                }
                $stmt->close();
            } else {
                echo json_encode(array("success" => false, "message" => "Error preparation: " . $conn->error));
            }
        } else {
            echo json_encode(array("success" => false, "message" => "Incorrect old password."));
        }
    } else {
        echo json_encode(array("success" => false, "message" => "User not found."));
    }
} else {
    echo json_encode(array("success" => false, "message" => "Incomplete data."));
}
?>
