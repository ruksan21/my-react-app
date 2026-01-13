<?php
ob_start(); // Buffer output to prevent warnings from leaking into JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../db_connect.php';
require_once '../../config/email_config.php';

// Manual PHPMailer Inclusion (as autoload.php is missing)
$phpmailer_dir = __DIR__ . '/../../../vendor/phpmailer/phpmailer/src/';
if (file_exists($phpmailer_dir . 'PHPMailer.php')) {
    require_once $phpmailer_dir . 'Exception.php';
    require_once $phpmailer_dir . 'PHPMailer.php';
    require_once $phpmailer_dir . 'SMTP.php';
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Get input data (Handling both JSON and FormData)
$complaint_id = isset($_POST['complaint_id']) ? intval($_POST['complaint_id']) : (isset($_POST['id']) ? intval($_POST['id']) : null);
$new_status = $_POST['status'] ?? null;
$officer_message = $_POST['officer_message'] ?? '';

// Fallback for JSON if still used
if (!$complaint_id) {
    $input = json_decode(file_get_contents("php://input"), true);
    if ($input) {
        $complaint_id = isset($input['complaint_id']) ? intval($input['complaint_id']) : (isset($input['id']) ? intval($input['id']) : null);
        $new_status = $input['status'] ?? $new_status;
        $officer_message = $input['officer_message'] ?? $officer_message;
    }
}

if (!$complaint_id) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Complaint ID is missing from request"]);
    exit;
}

// Update status if provided (Do this before email checks so DB is updated regardless)
$status_updated = false;
$update_error = "";
$allowed_statuses = ['Open', 'Resolved', 'Rejected', 'Pending'];
if ($new_status && in_array($new_status, $allowed_statuses)) {
    $update_sql = "UPDATE complaints SET status = ? WHERE id = ?";
    $update_stmt = $conn->prepare($update_sql);
    if ($update_stmt) {
        $update_stmt->bind_param("si", $new_status, $complaint_id);
        if ($update_stmt->execute()) {
            $status_updated = true;
        } else {
            $update_error = $update_stmt->error;
        }
        $update_stmt->close();
    } else {
        $update_error = $conn->error;
    }
}

// If update failed and we have an error, we should probably stop and report it
if ($new_status && !$status_updated) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Database update failed: " . $update_error]);
    exit;
}

// Fetch complaint details for email
$sql = "SELECT c.*, u.first_name, u.last_name, u.email as user_email, 
               w.municipality, w.ward_number, w.province
        FROM complaints c
        LEFT JOIN users u ON c.complainant_user_id = u.id
        LEFT JOIN wards w ON c.ward_id = w.id
        WHERE c.id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $complaint_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    // If we updated status but can't find record to email, still return success for the update
    ob_clean();
    echo json_encode([
        "success" => $status_updated, 
        "message" => "Status updated, but complaint details not found for notification.",
        "status" => $new_status
    ]);
    exit;
}

$complaint = $result->fetch_assoc();
$stmt->close();

// Determine recipient email
$recipient_email = $complaint['complainant_email'] ?? $complaint['user_email'] ?? null;
$recipient_name = $complaint['complainant'] ?? 
                  ($complaint['first_name'] ? "{$complaint['first_name']} {$complaint['last_name']}" : "Valued Citizen");

// If no recipient email OR SMTP not configured, just return success for the update
if (!$recipient_email || !defined('SMTP_USERNAME') || empty(SMTP_USERNAME)) {
    ob_clean();
    echo json_encode([
        "success" => true, 
        "message" => "Status successfully updated to $new_status." . (!$recipient_email ? " (Citizen email not found)" : ""),
        "status" => $new_status,
        "email_sent" => false
    ]);
    exit;
}

// Prepare email content
$final_status = $new_status ?? $complaint['status'];
$muni_name = $complaint['municipality'] ?? 'Municipality';
$ward_no = $complaint['ward_number'] ?? '1';
$subject_line = "[$muni_name, Ward $ward_no] Update on Your Complaint: {$complaint['subject']}";
$sender_display_name = "$muni_name, Ward $ward_no - Office";

// Auto-generate message
if ($final_status === 'Rejected' && empty($officer_message)) {
    $officer_message = "Your complaint has been reviewed and unfortunately could not be processed at this time. Please contact the ward office directly for more information.";
} elseif ($final_status === 'Resolved' && empty($officer_message)) {
    $officer_message = "We are pleased to inform you that your complaint has been successfully addressed and resolved. Thank you for your patience.";
} elseif ($final_status === 'Pending' && empty($officer_message)) {
    $officer_message = "Your complaint is currently under review by the concerned department. We will update you shortly.";
}

// Send email using PHPMailer
try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = SMTP_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = SMTP_USERNAME;
    $mail->Password = SMTP_PASSWORD;
    $mail->SMTPSecure = SMTP_ENCRYPTION;
    $mail->Port = SMTP_PORT;
    $mail->CharSet = EMAIL_CHARSET;
    $mail->setFrom(SMTP_USERNAME, $sender_display_name);
    $mail->addAddress($recipient_email, $recipient_name);
    $mail->SMTPOptions = ['ssl' => ['verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true]];

    // Attachments
    if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
        $mail->addAttachment($_FILES['attachment']['tmp_name'], $_FILES['attachment']['name']);
    }
    
    $mail->isHTML(true);
    $mail->Subject = $subject_line;
    
    // Status Badge Styles
    $status_color = '#64748b'; // Default Grey
    $status_bg = '#f1f5f9';
    if ($final_status === 'Resolved') { $status_color = '#15803d'; $status_bg = '#dcfce7'; }
    elseif ($final_status === 'Rejected') { $status_color = '#b91c1c'; $status_bg = '#fee2e2'; }
    elseif ($final_status === 'Pending') { $status_color = '#1e40af'; $status_bg = '#eff6ff'; }
    elseif ($final_status === 'Open') { $status_color = '#92400e'; $status_bg = '#fef3c7'; }

    // Premium Email Template
    $mail->Body = "
    <!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <style>
            body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 20px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
            .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 20px; }
            .status-container { background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0; }
            .label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 8px; display: block; }
            .subject-text { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 16px; display: block; }
            .status-badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 12px; text-transform: uppercase; color: $status_color; background-color: $status_bg; }
            .message-box { border-left: 4px solid #2563eb; padding: 2px 20px; margin-top: 30px; }
            .message-text { font-size: 15px; color: #334155; line-height: 1.8; font-style: italic; }
            .footer { padding: 30px; text-align: center; border-top: 1px solid #f1f5f9; background-color: #fafafa; }
            .footer p { margin: 0; font-size: 13px; color: #94a3b8; }
            .signature { margin-top: 40px; font-size: 14px; color: #64748b; }
            .signature strong { color: #0f172a; }
        </style>
    </head>
    <body>
        <div class='wrapper'>
            <div class='container'>
                <div class='header'>
                    <h1>Digital Ward Office</h1>
                    <p>{$muni_name}, Ward No. {$ward_no}</p>
                </div>
                <div class='content'>
                    <div class='greeting'>Namaste, {$recipient_name}</div>
                    <p>We have an update regarding the complaint you registered through our digital portal.</p>
                    
                    <div class='status-container'>
                        <span class='label'>Complaint Subject</span>
                        <span class='subject-text'>{$complaint['subject']}</span>
                        
                        <span class='label'>Current Status</span>
                        <span class='status-badge'>{$final_status}</span>
                    </div>
                    
                    <div class='message-box'>
                        <span class='label'>Official Response</span>
                        <div class='message-text'>" . nl2br(htmlspecialchars($officer_message)) . "</div>
                    </div>
                    
                    <div class='signature'>
                        Regards,<br>
                        <strong>Ward Administration Team</strong><br>
                        {$muni_name}, Ward {$ward_no}
                    </div>
                </div>
                <div class='footer'>
                    <p>This is a system-generated notification. Please do not reply directly to this email.</p>
                    <p style='margin-top: 10px;'>&copy; " . date('Y') . " {$muni_name} Municipality. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>";
    
    $mail->send();
    
    ob_clean();
    echo json_encode([
        "success" => true,
        "message" => "Status updated and email sent successfully.",
        "status" => $final_status,
        "email_sent" => true
    ]);
    
} catch (Exception $e) {
    // If email fails, the status change was still a success!
    ob_clean();
    echo json_encode([
        "success" => true,
        "message" => "Status updated to $final_status, but notification email failed to send.",
        "status" => $final_status,
        "email_sent" => false,
        "email_error" => $mail->ErrorInfo
    ]);
}

$conn->close();
