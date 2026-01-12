<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: text/plain');

echo "Starting mail test...\n";

// Path check
$autoload = __DIR__ . '/../../vendor/autoload.php';
$loader = __DIR__ . '/../../phpmailer_loader.php';

echo "Checking autoload: $autoload\n";
if (file_exists($autoload)) {
    echo "Found autoload.php\n";
    require $autoload;
} elseif (file_exists($loader)) {
    echo "Found phpmailer_loader.php\n";
    require $loader;
} else {
    die("No mailer loader found!\n");
}

// These must be in global scope but after require is fine for class loading usually,
// but let's keep them clean. The previous issue was inside a function/conditional scope improperly?
// Actually in test_mail.php they were at top level, but let's be safe.
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    // SMTP configuration
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'rukshankark80@gmail.com';
    $mail->Password = 'qkxhaqlesnezhurh'; 
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->Debugoutput = 'html';
    $mail->SMTPDebug = 2; // Enable verbose debug output

    echo "Configured SMTP settings.\n";

    // Recipients
    $mail->setFrom('rukshankark80@gmail.com', 'Test Sender');
    $mail->addAddress('rukshankark80@gmail.com', 'Test Recipient'); // Send to self

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'Test Email from WMS';
    $mail->Body    = 'This is a test email.';

    echo "Attempting search to send...\n";
    $mail->send();
    echo "Message has been sent successfully\n";
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}\n";
}
?>
