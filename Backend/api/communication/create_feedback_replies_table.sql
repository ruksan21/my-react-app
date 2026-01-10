-- Create feedback_replies table for officer replies to citizen comments
CREATE TABLE IF NOT EXISTS `feedback_replies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `feedback_id` INT NOT NULL,
  `officer_id` INT NOT NULL,
  `officer_name` VARCHAR(255) NOT NULL,
  `reply_text` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for better query performance
  KEY `idx_feedback_id` (`feedback_id`),
  KEY `idx_officer_id` (`officer_id`),
  KEY `idx_created_at` (`created_at`),
  
  -- Foreign key constraints (optional - uncomment if needed)
  -- CONSTRAINT `fk_feedback_id` FOREIGN KEY (`feedback_id`) REFERENCES `work_feedback` (`id`) ON DELETE CASCADE,
  -- CONSTRAINT `fk_officer_id` FOREIGN KEY (`officer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment to table
ALTER TABLE `feedback_replies` COMMENT='Stores officer replies/responses to citizen feedback on development works';

-- If you want to add foreign keys after table creation, use these:
-- ALTER TABLE `feedback_replies` ADD CONSTRAINT `fk_feedback_id` FOREIGN KEY (`feedback_id`) REFERENCES `work_feedback` (`id`) ON DELETE CASCADE;
-- ALTER TABLE `feedback_replies` ADD CONSTRAINT `fk_officer_id` FOREIGN KEY (`officer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
