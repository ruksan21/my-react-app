<?php
// Prevent any garbage output (HTML errors causes 'Network Error' in frontend)
ob_start();

// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
// Corrected header name repetition
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Fatal Error Handler (To return JSON even on Crash)
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && ($error['type'] === E_ERROR || $error['type'] === E_PARSE || $error['type'] === E_CORE_ERROR)) {
        ob_clean(); // Clear any HTML garbage
        echo json_encode([
            'success' => false,
            'message' => 'Fatal Server Error: ' . $error['message'] . ' on line ' . $error['line']
        ]);
        exit();
    }
});

require_once '../db_connect.php';

$response = array("success" => false, "message" => "Unknown error occurred.");

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!$data) {
        throw new Exception("Invalid JSON input.");
    }

    // Email + Code based reset (New User Request)
    $input_email = $conn->real_escape_string($data->email ?? '');
    $input_code = $conn->real_escape_string($data->code ?? $data->token ?? '');
    $new_password = $data->newPassword ?? '';
    
    // Legacy method vars
    $citizenship_number = isset($data->citizenshipNumber) ? $conn->real_escape_string($data->citizenshipNumber) : '';

    if (!empty($input_email) && !empty($input_code) && !empty($new_password)) {
        
        $stmt = $conn->prepare("SELECT id, token_expiry FROM users WHERE email = ? AND reset_token = ?");
        if (!$stmt) {
             throw new Exception("Database prepare failed: " . $conn->error);
        }
        $stmt->bind_param("ss", $input_email, $input_code);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows == 0) {
            throw new Exception("Invalid verification code or email!");
        }
        
        $user = $result->fetch_assoc();
        
        // Check if token expired
        if ($user['token_expiry'] && strtotime($user['token_expiry']) < time()) {
            throw new Exception("Verification code has expired!");
        }
        
        // Hash new password
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        
        // Update password and clear token
        $stmt2 = $conn->prepare("UPDATE users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE id = ?");
        $stmt2->bind_param("si", $hashed_password, $user['id']);
        
        if ($stmt2->execute()) {
            $response["success"] = true;
            $response["message"] = "Password reset successful!";
        } else {
            throw new Exception("Failed to update password.");
        }
        
        $stmt->close();
        $stmt2->close();
        
    }
    // Old method with citizenship number (backward compatibility)
    elseif (!empty($input_email) && !empty($citizenship_number) && !empty($new_password)) {
        
        $new_password_hashed = password_hash($new_password, PASSWORD_DEFAULT);
    
        // User check
        $check_query = "SELECT id FROM users WHERE email = '$input_email' AND citizenship_number = '$citizenship_number' LIMIT 1";
        $result = $conn->query($check_query);
    
        if ($result->num_rows > 0) {
            // Update
            $update_query = "UPDATE users SET password = '$new_password_hashed' WHERE email = '$input_email'";
            
            if ($conn->query($update_query)) {
                $response["success"] = true;
                $response["message"] = "Password reset successful! Please login with your new password.";
            } else {
                throw new Exception("Failed to update password. Error: " . $conn->error);
            }
        } else {
            throw new Exception("Verification failed. Email or Citizenship Number is incorrect.");
        }
    } else {
        throw new Exception("Required fields are missing.");
    }

} catch (Exception $e) {
    $response["message"] = $e->getMessage();
} catch (Error $e) {
    $response["message"] = "System Error: " . $e->getMessage();
}

// Final Output
ob_end_clean();
echo json_encode($response);

if (isset($conn) && $conn instanceof mysqli) {
    $conn->close();
}
exit();
?>
