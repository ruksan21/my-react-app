<?php
// Database connection file lyayeko
require_once 'db_connect.php';

// Admin ko details
$first_name = "Super";
$last_name = "Admin";
$email = "admin@example.com";
$password_plain = "admin123";

// Password lai PHP ko default hashing (Bcrypt) use garera hash gareko
$password_hashed = password_hash($password_plain, PASSWORD_DEFAULT);

// Database ma yo email pahila dekhi xa ki nai check gareko
$check_query = "SELECT id FROM users WHERE email = '$email'";
$result = $conn->query($check_query);

if ($result->num_rows > 0) {
    // Yedi admin pahila dekhi xa bhane password matra update garne
    $update_query = "UPDATE users SET password = '$password_hashed', role = 'admin' WHERE email = '$email'";
    if ($conn->query($update_query)) {
        echo "<h1>✅ Admin account update bhayo!</h1>";
        echo "<p>Email: $email<br>Password: $password_plain</p>";
    } else {
        echo "Error updating admin: " . $conn->error;
    }
} else {
    // Yedi admin xaina bhane naya insert garne
    $insert_query = "INSERT INTO users (first_name, last_name, email, password, role, status) 
                     VALUES ('$first_name', '$last_name', '$email', '$password_hashed', 'admin', 'active')";
    
    if ($conn->query($insert_query)) {
        echo "<h1>✅ Admin account safalata-purwak banayo!</h1>";
        echo "<p>Email: $email<br>Password: $password_plain</p>";
    } else {
        echo "Error creating admin: " . $insert_query . "<br>" . $conn->error;
    }
}

echo "<br><b style='color:red;'>SECURITY TIP: Yo kaam sake paxi yo file (setup_admin.php) delete garnuhos!</b>";
?>
