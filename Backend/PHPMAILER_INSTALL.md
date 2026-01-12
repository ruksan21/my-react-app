# PHPMailer Installation Instructions

Since Composer is not installed on your system, you have two options:

## Option 1: Install Composer (Recommended)
1. Download Composer from: https://getcomposer.org/download/
2. Install it on your system
3. Run this command in Backend folder:
   ```
   composer install
   ```

## Option 2: Manual PHPMailer Installation (Quick Method)
1. Download PHPMailer from: https://github.com/PHPMailer/PHPMailer/archive/refs/tags/v6.8.1.zip
2. Extract the ZIP file
3. Copy the `src` folder from PHPMailer to `Backend/vendor/phpmailer/phpmailer/src/`
4. Create the folder structure if it doesn't exist

## Alternative: Use without Composer (Direct Download)
I can create a manual include version that doesn't require Composer. Let me know if you want this option.

## Current Implementation
The current code expects PHPMailer to be installed via Composer at:
- `Backend/vendor/autoload.php`

## What to do next?
Please choose one option above, or let me know if you want me to create a version without Composer dependency.
