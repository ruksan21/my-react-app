-- COMPLETE MASTER DATABASE SCHEMA
-- Ward Management System
-- Generated: 2026-01-10
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+05:45";
-- --------------------------------------------------------
-- 1. Districts Table
CREATE TABLE IF NOT EXISTS `districts` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `province` varchar(100) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 2. Wards Table
CREATE TABLE IF NOT EXISTS `wards` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `ward_number` int(11) NOT NULL,
    `municipality` varchar(100) NOT NULL,
    `district_id` int(11) DEFAULT NULL,
    `district_name` varchar(100) DEFAULT NULL,
    -- Denormalized for flexibility
    `province` varchar(100) DEFAULT NULL,
    `location` varchar(255) DEFAULT NULL,
    `contact_phone` varchar(20) DEFAULT NULL,
    `contact_email` varchar(100) DEFAULT NULL,
    `chairperson_name` varchar(100) DEFAULT NULL,
    `chairperson_phone` varchar(20) DEFAULT NULL,
    `chairperson_email` varchar(100) DEFAULT NULL,
    `chairperson_bio` text DEFAULT NULL,
    `chairperson_photo` varchar(255) DEFAULT NULL,
    `chairperson_education` varchar(255) DEFAULT NULL,
    `chairperson_experience` varchar(255) DEFAULT NULL,
    `chairperson_political_party` varchar(100) DEFAULT NULL,
    `chairperson_appointment_date` date DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE
    SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 3. Users Table (Officers, Citizens, Admins)
CREATE TABLE IF NOT EXISTS `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `full_name` varchar(100) NOT NULL,
    `email` varchar(100) NOT NULL UNIQUE,
    `password` varchar(255) NOT NULL,
    `role` enum('admin', 'officer', 'citizen') NOT NULL DEFAULT 'citizen',
    `status` enum('active', 'pending', 'rejected') NOT NULL DEFAULT 'active',
    -- STATUS FIX
    `phone` varchar(20) DEFAULT NULL,
    `address` varchar(255) DEFAULT NULL,
    `province` varchar(100) DEFAULT NULL,
    `district` varchar(100) DEFAULT NULL,
    `city` varchar(100) DEFAULT NULL,
    `ward_number` int(11) DEFAULT NULL,
    -- Officer Specific Fields
    `officer_id` varchar(50) DEFAULT NULL,
    `department` varchar(100) DEFAULT NULL,
    `work_province` varchar(100) DEFAULT NULL,
    `work_district` varchar(100) DEFAULT NULL,
    `work_municipality` varchar(100) DEFAULT NULL,
    `work_ward` int(11) DEFAULT NULL,
    `work_office_location` varchar(255) DEFAULT NULL,
    `assigned_ward_id` int(11) DEFAULT NULL,
    -- Link to wards table
    `profile_image` varchar(255) DEFAULT NULL,
    `id_card_photo` varchar(255) DEFAULT NULL,
    `citizenship_photo` varchar(255) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`assigned_ward_id`) REFERENCES `wards` (`id`) ON DELETE
    SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 4. Ward Activities
CREATE TABLE IF NOT EXISTS `ward_activities` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `ward_id` int(11) NOT NULL,
    `title` varchar(255) NOT NULL,
    `subtitle` varchar(255) DEFAULT NULL,
    `description` text DEFAULT NULL,
    `activity_date` date DEFAULT NULL,
    `activity_time` time DEFAULT NULL,
    `icon` varchar(50) DEFAULT '📅',
    `icon_bg` varchar(20) DEFAULT '#E8F5E9',
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 5. Ward Budgets
CREATE TABLE IF NOT EXISTS `ward_budgets` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `ward_id` int(11) NOT NULL,
    `officer_id` int(11) NOT NULL,
    `total_allocated` decimal(15, 2) DEFAULT 0.00,
    `total_spent` decimal(15, 2) DEFAULT 0.00,
    `remaining_balance` decimal(15, 2) DEFAULT 0.00,
    `total_beneficiaries` int(11) DEFAULT 0,
    `direct_beneficiaries` int(11) DEFAULT 0,
    `indirect_beneficiaries` int(11) DEFAULT 0,
    `fiscal_year` varchar(20) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`officer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 6. Development Works / Projects
CREATE TABLE IF NOT EXISTS `development_works` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `ward_id` int(11) NOT NULL,
    `officer_id` int(11) NOT NULL,
    `title` varchar(255) NOT NULL,
    `description` text DEFAULT NULL,
    `budget` decimal(15, 2) DEFAULT 0.00,
    `location` varchar(255) DEFAULT NULL,
    `start_date` date DEFAULT NULL,
    `end_date` date DEFAULT NULL,
    `beneficiaries` varchar(255) DEFAULT NULL,
    `status` enum('pending', 'on-going', 'completed') DEFAULT 'pending',
    `image` varchar(255) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`officer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 7. Ward Assets
CREATE TABLE IF NOT EXISTS `ward_assets` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `ward_id` int(11) NOT NULL,
    `asset_type` varchar(100) NOT NULL,
    `asset_name` varchar(255) NOT NULL,
    `description` text DEFAULT NULL,
    `value` decimal(15, 2) DEFAULT 0.00,
    `acquisition_date` date DEFAULT NULL,
    `status` varchar(50) DEFAULT 'active',
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 8. Chairperson Personal Assets
CREATE TABLE IF NOT EXISTS `chairperson_personal_assets` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `ward_id` int(11) NOT NULL,
    `officer_id` int(11) DEFAULT NULL,
    -- Chairperson's user ID
    `asset_type` varchar(100) NOT NULL,
    `asset_name` varchar(255) NOT NULL,
    `description` text DEFAULT NULL,
    `location` varchar(255) DEFAULT NULL,
    `value` decimal(15, 2) DEFAULT 0.00,
    `acquired_date` date DEFAULT NULL,
    `ownership_type` varchar(100) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`officer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 9. Ward Departments / Employees
CREATE TABLE IF NOT EXISTS `ward_departments` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `ward_id` int(11) NOT NULL,
    `officer_id` int(11) NOT NULL,
    -- Created by officer
    `name` varchar(100) NOT NULL,
    `head_name` varchar(100) DEFAULT NULL,
    `phone` varchar(20) DEFAULT NULL,
    `email` varchar(100) DEFAULT NULL,
    `icon` varchar(50) DEFAULT '🏢',
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 10. Ward Notices
CREATE TABLE IF NOT EXISTS `ward_notices` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `ward_id` int(11) NOT NULL,
    `officer_id` int(11) NOT NULL,
    `title` varchar(255) NOT NULL,
    `content` text NOT NULL,
    `published_date` date DEFAULT NULL,
    `expiry_date` date DEFAULT NULL,
    `attachment` varchar(255) DEFAULT NULL,
    `document` varchar(255) DEFAULT NULL,
    `images` text DEFAULT NULL,
    -- JSON array of image paths
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`officer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 11. Complaints
CREATE TABLE IF NOT EXISTS `complaints` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `ward_id` int(11) NOT NULL,
    `complainant_user_id` int(11) DEFAULT NULL,
    -- If registered user
    `complainant` varchar(100) DEFAULT NULL,
    -- Guest name
    `subject` varchar(255) NOT NULL,
    `message` text NOT NULL,
    `priority` enum('Low', 'Medium', 'High') DEFAULT 'Medium',
    `status` enum('pending', 'resolved', 'dismissed') DEFAULT 'pending',
    `image_url` varchar(255) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`complainant_user_id`) REFERENCES `users` (`id`) ON DELETE
    SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 12. System Alerts
CREATE TABLE IF NOT EXISTS `system_alerts` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `ward_id` int(11) DEFAULT NULL,
    `target_role` enum('admin', 'officer', 'user', 'all') DEFAULT 'all',
    `type` enum('info', 'warning', 'success', 'error') NOT NULL,
    `title` varchar(255) NOT NULL,
    `message` text NOT NULL,
    `status` enum('unread', 'read') DEFAULT 'unread',
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 13. Notifications
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) DEFAULT NULL,
    `ward_id` int(11) DEFAULT NULL,
    `related_notice_id` int(11) DEFAULT NULL,
    `title` varchar(255) NOT NULL,
    `message` text NOT NULL,
    `type` enum(
        'notice',
        'complaint',
        'work',
        'budget',
        'activity',
        'meeting',
        'alert',
        'system'
    ) DEFAULT 'system',
    `source_province` varchar(100) DEFAULT NULL,
    `source_district` varchar(100) DEFAULT NULL,
    `source_municipality` varchar(100) DEFAULT NULL,
    `source_ward` int(11) DEFAULT NULL,
    `is_read` tinyint(1) DEFAULT 0,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`related_notice_id`) REFERENCES `ward_notices` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 14. Work Feedback
CREATE TABLE IF NOT EXISTS `work_feedback` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `work_id` int(11) NOT NULL,
    `user_id` int(11) NOT NULL,
    `user_name` varchar(100) DEFAULT NULL,
    `rating` int(1) DEFAULT 5,
    `comment` text DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`work_id`) REFERENCES `development_works` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 15. Feedback Replies
CREATE TABLE IF NOT EXISTS `feedback_replies` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `feedback_id` int(11) NOT NULL,
    `officer_id` int(11) NOT NULL,
    `officer_name` varchar(100) NOT NULL,
    `reply_text` text NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`feedback_id`) REFERENCES `work_feedback` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`officer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 16. Followers (Citizens following Officers/Wards)
CREATE TABLE IF NOT EXISTS `followers` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `ward_id` int(11) NOT NULL,
    `officer_id` int(11) DEFAULT NULL,
    `follower_id` int(11) NOT NULL,
    -- Citizen ID
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`officer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 17. Reviews (Ward Reviews)
CREATE TABLE IF NOT EXISTS `reviews` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `ward_id` int(11) NOT NULL,
    `user_id` int(11) NOT NULL,
    `rating` decimal(2, 1) NOT NULL,
    `comment` text DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- --------------------------------------------------------
-- 18. Default User (Optional - Remove if not needed)
-- INSERT INTO `users` (`full_name`, `email`, `password`, `role`, `status`) VALUES
-- ('Admin User', 'admin@example.com', '$2y$10$YourHashedPasswordHere', 'admin', 'active');
COMMIT;