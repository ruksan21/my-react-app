-- Add this to COMPLETE_MASTER_SCHEMA.sql
-- 19. Ward Activities
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