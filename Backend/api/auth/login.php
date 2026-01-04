<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle OPTIONS request (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection file lyayeko
require_once '../db_connect.php';

// Frontend (React) bata aayeko data read gareko
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    // Data sanitize gareko (SQL Injection bata bachna)
    $email = $conn->real_escape_string($data->email);
    $password = $data->password;

    // Database ma email registered xa ki nai check gareko
    $query = "SELECT * FROM users WHERE email = '$email' LIMIT 1";
    $result = $conn->query($query);

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            // Check user status before allowing login
            if (isset($user['status']) && $user['status'] !== 'active') {
                http_response_code(403);
                if ($user['status'] === 'pending') {
                    echo json_encode(array(
                        "success" => false, 
                        "message" => "Your account is pending approval. Please wait for admin approval."
                    ));
                } else if ($user['status'] === 'rejected') {
                    echo json_encode(array(
                        "success" => false, 
                        "message" => "Your account has been rejected. Please contact the administrator."
                    ));
                } else {
                    echo json_encode(array(
                        "success" => false, 
                        "message" => "Your account is not active. Please contact the administrator."
                    ));
                }
                exit();
            }
            
            unset($user['password']); 
            echo json_encode(array(
                "success" => true,
                "message" => "Login successful!",
                "data" => array(
                    "user" => $user, // Role is included here (admin, officer, citizen)
                    "token" => bin2hex(random_bytes(16))
                )
            ));
        } else {
            http_response_code(401);
            echo json_encode(array("success" => false, "message" => "Invalid password."));
        }
    } else {
        http_response_code(404);
        echo json_encode(array("success" => false, "message" => "User not found."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Incomplete data."));
}
?>
