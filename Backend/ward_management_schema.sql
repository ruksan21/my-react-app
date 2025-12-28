-- Districts Table
CREATE TABLE IF NOT EXISTS `districts` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- Sample Districts
INSERT INTO `districts` (`id`, `name`)
VALUES (1, 'Kathmandu'),
    (2, 'Lalitpur'),
    (3, 'Bhaktapur') ON DUPLICATE KEY
UPDATE name = name;
-- Wards Table
CREATE TABLE IF NOT EXISTS `wards` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `ward_number` int(11) NOT NULL,
    `district_id` int(11) NOT NULL,
    `location` varchar(255) NOT NULL,
    `contact_number` varchar(20) NOT NULL,
    `chairperson_name` varchar(100) NOT NULL,
    `chairperson_phone` varchar(20) DEFAULT NULL,
    `chairperson_email` varchar(100) DEFAULT NULL,
    `chairperson_education` varchar(255) DEFAULT NULL,
    `chairperson_experience` varchar(255) DEFAULT NULL,
    `chairperson_political_party` varchar(100) DEFAULT NULL,
    `chairperson_appointment_date` date DEFAULT NULL,
    `chairperson_photo` varchar(255) DEFAULT NULL,
    `chairperson_message` text,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- Ward Assets (Office Property) Table
CREATE TABLE IF NOT EXISTS `ward_assets` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `ward_id` int(11) NOT NULL,
    `asset_name` varchar(100) NOT NULL,
    `asset_type` enum(
        'electronics',
        'furniture',
        'vehicle',
        'document',
        'other'
    ) NOT NULL,
    `asset_status` enum('good', 'maintenance', 'retired') NOT NULL DEFAULT 'good',
    `purchase_date` date DEFAULT NULL,
    `price` decimal(10, 2) DEFAULT NULL,
    `description` text,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;