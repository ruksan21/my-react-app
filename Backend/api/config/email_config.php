<?php
/**
 * Email Configuration for Complaint Reply System
 * 
 * IMPORTANT: Update these credentials with your actual email service details
 */

// Email Service Configuration
define('SMTP_HOST', 'smtp.gmail.com');  // Change to your SMTP host
define('SMTP_PORT', 587);                // Usually 587 for TLS or 465 for SSL
define('SMTP_USERNAME', 'as3816222@gmail.com');
define('SMTP_PASSWORD', 'rgtiabjotkrvggjm');
define('SMTP_ENCRYPTION', 'tls');        // 'tls' or 'ssl'

// Sender Information
define('EMAIL_FROM_ADDRESS', 'noreply@wardoffice.gov.np');
define('EMAIL_FROM_NAME', 'Ward Office - Complaint Management');

// Email Settings
define('EMAIL_CHARSET', 'UTF-8');
define('EMAIL_DEBUG', 0);  // 0 = off, 1 = client messages, 2 = client and server messages

return [
    'smtp_host' => SMTP_HOST,
    'smtp_port' => SMTP_PORT,
    'smtp_username' => SMTP_USERNAME,
    'smtp_password' => SMTP_PASSWORD,
    'smtp_encryption' => SMTP_ENCRYPTION,
    'from_address' => EMAIL_FROM_ADDRESS,
    'from_name' => EMAIL_FROM_NAME,
    'charset' => EMAIL_CHARSET,
    'debug' => EMAIL_DEBUG
];
?>
