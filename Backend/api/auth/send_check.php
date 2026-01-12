<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Starting Check...<br>";

$start_dir = __DIR__;
echo "Current Dir: $start_dir<br>";

// Check DB Connect
$db_path = __DIR__ . '/../db_connect.php';
echo "Checking DB at: $db_path<br>";
if (file_exists($db_path)) {
    echo "DB File Found. Including...<br>";
    require_once $db_path;
    echo "DB Connected. Host: $host<br>";
} else {
    echo "DB File NOT Found!<br>";
}

// Check PHPMailer
echo "Checking PHPMailer...<br>";
if (file_exists(__DIR__ . '/../../vendor/autoload.php')) {
    echo "Using Composer Autoload<br>";
    require_once __DIR__ . '/../../vendor/autoload.php';
} elseif (file_exists(__DIR__ . '/../../phpmailer_loader.php')) {
    echo "Using Manual Loader<br>";
    require_once __DIR__ . '/../../phpmailer_loader.php';
} else {
    echo "No Mailer Loader found!<br>";
}

use PHPMailer\PHPMailer\PHPMailer;
if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    echo "PHPMailer Class Exists!<br>";
    $m = new PHPMailer(true);
    echo "PHPMailer Object Created!<br>";
} else {
    echo "PHPMailer Class NOT Found!<br>";
}

echo "Check Complete.";
?>
