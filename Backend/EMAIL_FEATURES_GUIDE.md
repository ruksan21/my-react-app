# Email Features Implementation Guide

## Features Implemented

### 1. Forgot Password (Email-based Reset)
- **API Endpoint**: `Backend/api/auth/send_reset_link.php`
- **Method**: POST
- **Input**: `{ "gmail": "user@example.com" }`
- **Output**: Sends password reset link to user's Gmail
- **Reset Link Format**: `http://localhost:5173/reset-password?token=TOKEN`

### 2. Reset Password (Token-based)
- **API Endpoint**: `Backend/api/auth/reset_password.php` (updated)
- **Method**: POST
- **Input**: `{ "token": "RESET_TOKEN", "newPassword": "newpass123" }`
- **Output**: Resets password and clears token
- **Note**: Old citizenship-based reset still works for backward compatibility

### 3. Send Complaint/Message
- **API Endpoint**: `Backend/api/communication/send_complaint.php`
- **Method**: POST
- **Input**: `{ "user_id": 1, "subject": "Issue", "message": "Details..." }`
- **Output**: Saves complaint to database

### 4. Get All Complaints (Officer/Admin)
- **API Endpoint**: `Backend/api/communication/get_all_complaints.php`
- **Method**: GET
- **Output**: Returns all complaints with user info

### 5. Get User's Complaints (Citizen)
- **API Endpoint**: `Backend/api/communication/get_user_complaints.php?user_id=1`
- **Method**: GET
- **Output**: Returns user's own complaints

### 6. Reply to Complaint (sends email to citizen)
- **API Endpoint**: `Backend/api/communication/reply_complaint.php`
- **Method**: POST
- **Input**: `{ "complaint_id": 1, "reply_text": "Reply...", "replied_by": 2 }`
- **Output**: Saves reply AND sends email to citizen's Gmail
- **Email includes**: Original complaint, reply text, officer name, ward number

### 7. Get Complaint Replies
- **API Endpoint**: `Backend/api/communication/get_complaint_replies.php?complaint_id=1`
- **Method**: GET
- **Output**: Returns all replies for a complaint

## Database Setup

Run this SQL file to create required tables:
```
Backend/api/setup_email_features.sql
```

This will:
1. Add `reset_token` and `token_expiry` columns to `users` table
2. Create `complaints` table
3. Create `complaint_replies` table

## Email Configuration

**Gmail Account**: rukshankark80@gmail.com
**App Password**: qkxhaqlesnezhurh
**SMTP Server**: smtp.gmail.com:587 (TLS)

## PHPMailer Installation

### Option 1: Install Composer
```bash
# Download and install Composer from https://getcomposer.org
cd Backend
composer install
```

### Option 2: Manual Installation
1. Download PHPMailer: https://github.com/PHPMailer/PHPMailer/releases
2. Extract to: `Backend/vendor/phpmailer/phpmailer/`
3. The code will automatically use manual loader

## Testing

### Test Forgot Password:
```bash
curl -X POST http://localhost/my-react-app/Backend/api/auth/send_reset_link.php \
  -H "Content-Type: application/json" \
  -d '{"gmail":"test@example.com"}'
```

### Test Reply with Email:
```bash
curl -X POST http://localhost/my-react-app/Backend/api/communication/reply_complaint.php \
  -H "Content-Type: application/json" \
  -d '{"complaint_id":1,"reply_text":"Thank you for your complaint","replied_by":2}'
```

## Files Created/Modified

### New Files:
- `Backend/api/setup_email_features.sql` - Database schema
- `Backend/api/auth/send_reset_link.php` - Send password reset email
- `Backend/api/communication/send_complaint.php` - Submit complaint
- `Backend/api/communication/get_all_complaints.php` - Get all complaints
- `Backend/api/communication/get_user_complaints.php` - Get user complaints
- `Backend/api/communication/reply_complaint.php` - Reply & email citizen
- `Backend/api/communication/get_complaint_replies.php` - Get replies
- `Backend/phpmailer_loader.php` - Manual PHPMailer loader
- `Backend/composer.json` - Composer config
- `Backend/PHPMAILER_INSTALL.md` - Installation guide

### Modified Files:
- `Backend/api/auth/reset_password.php` - Added token-based reset

## Important Notes

1. **Email Sending**: Emails are sent via Gmail SMTP using the provided credentials
2. **Token Expiry**: Reset tokens expire after 1 hour
3. **Error Handling**: All APIs have proper error handling and validation
4. **CORS**: All APIs support CORS for frontend access
5. **Security**: Passwords are hashed, SQL injection prevented with prepared statements

## Next Steps for Frontend

1. Create "Forgot Password" page with email input
2. Create "Reset Password" page that reads token from URL
3. Add complaint submission form
4. Create officer/admin panel to view and reply to complaints
5. Display sent/received messages for users

## Troubleshooting

- **Composer not found**: Use manual PHPMailer installation (Option 2)
- **Email not sending**: Check Gmail app password and 2FA settings
- **Token expired**: User needs to request new reset link
- **Database errors**: Run setup_email_features.sql first
