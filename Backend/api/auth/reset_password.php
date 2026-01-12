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

// Email + Code based reset (New User Request)
$input_email = $conn->real_escape_string($data->email ?? '');
$input_code = $conn->real_escape_string($data->code ?? $data->token ?? ''); // accept 'code' or 'token' as otp
$new_password = $data->newPassword ?? '';

if (!empty($input_email) && !empty($input_code) && !empty($new_password)) {
    
    // Validate Code
    $stmt = $conn->prepare("SELECT id, full_name, token_expiry FROM users WHERE email = ? AND reset_token = ?");
    $stmt->bind_param("ss", $input_email, $input_code);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows == 0) {
        echo json_encode(array("success" => false, "message" => "Invalid verification code or email!"));
        exit;
    }
    
    $user = $result->fetch_assoc();
    
    // Check if token expired
    if ($user['token_expiry'] && strtotime($user['token_expiry']) < time()) {
        echo json_encode(array("success" => false, "message" => "Verification code has expired!"));
        exit;
    }
    
    // Hash new password
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
    
    // Update password and clear token
    $stmt2 = $conn->prepare("UPDATE users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE id = ?");
    $stmt2->bind_param("si", $hashed_password, $user['id']);
    
    if ($stmt2->execute()) {
        echo json_encode(array("success" => true, "message" => "Password reset successful!"));
    } else {
        echo json_encode(array("success" => false, "message" => "Failed to update password."));
    }
    
    $stmt->close();
    $stmt2->close();
    exit();
}
// Old method with citizenship number (backward compatibility)
elseif (!empty($data->email) && !empty($data->citizenshipNumber) && !empty($data->newPassword)) {
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
    echo json_encode(array("success" => false, "message" => "Required fields are missing."));
}
?>
