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

if (!empty($data->email) && !empty($data->citizenshipNumber) && !empty($data->newPassword)) {
    $email = $conn->real_escape_string($data->email);
    $citizenship_number = $conn->real_escape_string($data->citizenshipNumber);
    $new_password_hashed = password_hash($data->newPassword, PASSWORD_DEFAULT);

    // User check gareko (Email ra Citizenship Number dubai milnu parxa)
    $check_query = "SELECT id FROM users WHERE email = '$email' AND citizenship_number = '$citizenship_number' LIMIT 1";
    $result = $conn->query($check_query);

    if ($result->num_rows > 0) {
        // Password update gareko
        $update_query = "UPDATE users SET password = '$new_password_hashed' WHERE email = '$email'";
        
        if ($conn->query($update_query)) {
            echo json_encode(array("success" => true, "message" => "Password reset successful! Please login with your new password."));
        } else {
            echo json_encode(array("success" => false, "message" => "Failed to update password. Error: " . $conn->error));
        }
    } else {
        echo json_encode(array("success" => false, "message" => "Verification failed. Email or Citizenship Number is incorrect."));
    }
} else {
    echo json_encode(array("success" => false, "message" => "All fields (Email, Citizenship Number, New Password) are required."));
}
?>
