<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once 'db_connect.php';

$sql = "CREATE TABLE IF NOT EXISTS `work_feedback` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `work_id` INT NOT NULL,
    `user_id` INT DEFAULT NULL,
    `user_name` VARCHAR(255) DEFAULT 'Anonymous',
    `rating` INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    `comment` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`work_id`) REFERENCES `development_works`(`id`) ON DELETE CASCADE
);";

if ($conn->query($sql) === TRUE) {
    $sql2 = "CREATE TABLE IF NOT EXISTS `followers` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `officer_id` INT NOT NULL,
        `follower_id` INT NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`officer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
        UNIQUE KEY `unique_follow` (`officer_id`, `follower_id`)
    );";
    
    if ($conn->query($sql2) === TRUE) {
        echo json_encode(["success" => true, "message" => "✅ Feedback and Followers tables created successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error creating followers table: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Error creating feedback table: " . $conn->error]);
}

$conn->close();
?>
