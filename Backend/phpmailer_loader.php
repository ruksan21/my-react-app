<?php
/**
 * PHPMailer Manual Loader
 * Use this if you don't have Composer installed
 * Download PHPMailer from: https://github.com/PHPMailer/PHPMailer
 * Place files in: Backend/vendor/phpmailer/phpmailer/src/
 */

// PHPMailer class path
$phpmailer_path = __DIR__ . '/vendor/phpmailer/phpmailer/src';

// Check if PHPMailer exists
if (!file_exists($phpmailer_path . '/PHPMailer.php')) {
    die('PHPMailer not found! Please install PHPMailer first. See PHPMAILER_INSTALL.md for instructions.');
}

// Manual require (if Composer is not available)
require_once $phpmailer_path . '/Exception.php';
require_once $phpmailer_path . '/PHPMailer.php';
require_once $phpmailer_path . '/SMTP.php';
?>
