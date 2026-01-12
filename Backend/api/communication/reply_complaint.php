<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Try Composer autoload first, then manual loader
if (file_exists(__DIR__ . '/../../vendor/autoload.php')) {
    require __DIR__ . '/../../vendor/autoload.php';
} else {
    require __DIR__ . '/../../phpmailer_loader.php';
}

require_once __DIR__ . '/../../db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$complaint_id = intval($data['complaint_id']);
$reply_text = $conn->real_escape_string($data['reply_text']);
$replied_by = intval($data['replied_by']);

// Get complaint and user info
$stmt = $conn->prepare("SELECT c.*, u.gmail, u.full_name, u2.full_name as officer_name, u2.assigned_ward_id 
                        FROM complaints c 
                        JOIN users u ON c.user_id = u.id 
                        LEFT JOIN users u2 ON u2.id = ?
                        WHERE c.id = ?");
$stmt->bind_param("ii", $replied_by, $complaint_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    echo json_encode(['success' => false, 'message' => 'Complaint not found!']);
    exit;
}

$complaint = $result->fetch_assoc();
$citizen_gmail = $complaint['gmail'];
$citizen_name = $complaint['full_name'];
$officer_name = $complaint['officer_name'];
$ward_id = $complaint['assigned_ward_id'];

// Save reply to database
$stmt2 = $conn->prepare("INSERT INTO complaint_replies (complaint_id, reply_text, replied_by) VALUES (?, ?, ?)");
$stmt2->bind_param("isi", $complaint_id, $reply_text, $replied_by);
$stmt2->execute();

// Update complaint status
$conn->query("UPDATE complaints SET status = 'replied' WHERE id = $complaint_id");

// Send email to citizen using PHPMailer
$mail = new PHPMailer(true);

try {
    // SMTP configuration
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'rukshankark80@gmail.com';
    $mail->Password = 'qkxhaqlesnezhurh'; // Remove spaces from app password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // Recipients
    $mail->setFrom('rukshankark80@gmail.com', 'Ward Management System');
    $mail->addAddress($citizen_gmail, $citizen_name);

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'Reply to Your Complaint - Ward ' . ($ward_id ?? 'Office');
    $date = date('Y-m-d H:i:s');
    
    $mail->Body = "
        <html>
        <body>
            <h2>Reply to Your Complaint</h2>
            <p>Hello {$citizen_name},</p>
            <p>You have received a reply from Ward Office:</p>
            <hr>
            <p><strong>Your Complaint:</strong></p>
            <p>{$complaint['subject']}</p>
            <p>{$complaint['message']}</p>
            <hr>
            <p><strong>Reply from {$officer_name} (Ward " . ($ward_id ?? 'Office') . "):</strong></p>
            <p style='background-color: #f0f0f0; padding: 15px; border-radius: 5px;'>{$reply_text}</p>
            <hr>
            <p><small>Replied on: {$date}</small></p>
            <br>
            <p>Best regards,<br>Ward Management Team</p>
        </body>
        </html>
    ";

    $mail->AltBody = "Hello {$citizen_name},\n\nYour complaint reply:\n\n{$reply_text}\n\nReplied by: {$officer_name}\nDate: {$date}";

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Reply sent successfully to citizen email!']);
    
} catch (Exception $e) {
    echo json_encode(['success' => true, 'message' => 'Reply saved but email failed: ' . $mail->ErrorInfo]);
}

$stmt->close();
$stmt2->close();
$conn->close();
?>
