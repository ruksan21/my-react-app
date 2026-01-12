<?php
// Prevent any garbage output
ob_start();

// Enable Error Logging
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error_log.txt');

// Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Handle Options
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

$response = [];

try {
    // 1. Load Database
    $db_path = __DIR__ . '/../../db_connect.php'; // Backend/api/db_connect.php -> Backend/api/auth/../../db_connect.php? NO.
    // Fixed Path Logic:
    // File is in: Backend/api/auth/send_reset_link.php
    // DB is in:   Backend/api/db_connect.php
    
    // Correct Relative Path: ../db_connect.php
    if (file_exists(__DIR__ . '/../db_connect.php')) {
        require_once __DIR__ . '/../db_connect.php';
    } else {
         // Fallback usually not needed if structure is standard
         require_once __DIR__ . '/../../db_connect.php';
    }

    // 2. Manual PHPMailer Loading (Bypassing autoloader issues)
    // Path to src: Backend/vendor/phpmailer/phpmailer/src
    // Relative from auth: ../../vendor/phpmailer/phpmailer/src
    
    $base_path = __DIR__ . '/../../vendor/phpmailer/phpmailer/src';
    
    if (!file_exists($base_path . '/PHPMailer.php')) {
        throw new Exception("PHPMailer source files not found at: $base_path");
    }

    require_once $base_path . '/Exception.php';
    require_once $base_path . '/PHPMailer.php';
    require_once $base_path . '/SMTP.php';

    // 3. Process Request
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON received");
    }

    $user_email = $conn->real_escape_string($data['gmail'] ?? $data['email'] ?? '');

    if (empty($user_email)) {
        throw new Exception('Email is required.');
    }

    // Check User
    $stmt = $conn->prepare("SELECT id, first_name, last_name FROM users WHERE email = ?");
    $stmt->bind_param("s", $user_email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 0) {
        throw new Exception('User not found with this email.');
    }

    $user = $result->fetch_assoc();
    $full_name = $user['first_name'] . ' ' . $user['last_name'];

    // --- AUTO-FIX: Ensure Database Columns Exist ---
    try {
        $colCheck = $conn->query("SHOW COLUMNS FROM users LIKE 'reset_token'");
        if ($colCheck && $colCheck->num_rows == 0) {
            $conn->query("ALTER TABLE users ADD COLUMN reset_token VARCHAR(64) DEFAULT NULL");
            $conn->query("ALTER TABLE users ADD COLUMN token_expiry TIMESTAMP NULL DEFAULT NULL");
        }
    } catch (Exception $e) {
        // Ignore
    }
    // -----------------------------------------------

    // Generate 6-Digit OTP Code
    $token = (string) rand(100000, 999999);

    $stmt2 = $conn->prepare("UPDATE users SET reset_token = ?, token_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE email = ?");
    $stmt2->bind_param("ss", $token, $user_email);
    if (!$stmt2->execute()) {
        throw new Exception('DB Error: Unable to save token');
    }

    // Send Mail
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'as3816222@gmail.com';
    $mail->Password = 'rgtiabjotkrvggjm';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    // SSL Bypass for Localhost
    $mail->SMTPOptions = array(
        'ssl' => array(
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        )
    );

    $mail->setFrom('as3816222@gmail.com', 'Ward Management System');
    $mail->addAddress($user_email, $full_name);
    
    $mail->isHTML(true);
    $mail->Subject = 'Password Reset Code';
    
    $mail->Body = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>
            <h2 style='color: #4f46e5; text-align: center;'>Password Reset Code</h2>
            <p>Hello <strong>{$full_name}</strong>,</p>
            <p>Your password reset code is:</p>
            <div style='text-align: center; margin: 30px 0;'>
                <span style='background-color: #f3f4f6; color: #111827; padding: 12px 24px; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 5px; border: 1px dashed #4f46e5;'>{$token}</span>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p style='color: #666;'>If you didn't ask for this, ignore this email.</p>
        </div>
    ";
    
    $mail->send();

    $response['success'] = true;
    $response['message'] = 'Verification code sent to your email!';

} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
} catch (Error $e) {
    $response['success'] = false;
    $response['message'] = 'System Error: ' . $e->getMessage();
}

// Final Output
ob_end_clean();
echo json_encode($response);

if (isset($conn) && $conn instanceof mysqli) {
    $conn->close();
}
?>
