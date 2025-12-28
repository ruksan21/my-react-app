-- Chairperson Personal Assets Table
-- यो वार्ड अध्यक्षको निजी सम्पत्ति विवरण (Property Declaration) को लागि हो
CREATE TABLE IF NOT EXISTS `chairperson_personal_assets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ward_id` INT NOT NULL,
    `asset_type` ENUM(
        'land',
        'building',
        'vehicle',
        'bank_account',
        'gold_silver',
        'investment',
        'other'
    ) NOT NULL,
    `asset_name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `location` VARCHAR(255),
    `value` DECIMAL(15, 2),
    `acquired_date` DATE,
    `ownership_type` ENUM('self', 'spouse', 'family') DEFAULT 'self',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`ward_id`) REFERENCES `wards`(`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- Sample Personal Assets Data
INSERT INTO `chairperson_personal_assets` (
        `ward_id`,
        `asset_type`,
        `asset_name`,
        `description`,
        `location`,
        `value`,
        `acquired_date`,
        `ownership_type`
    )
VALUES (
        1,
        'land',
        'Residential Land',
        '5 Aana land in Kathmandu',
        'Thamel, Kathmandu',
        25000000.00,
        '2015-06-15',
        'self'
    ),
    (
        1,
        'building',
        'House',
        '2-storey residential building',
        'Thamel, Kathmandu',
        35000000.00,
        '2017-03-20',
        'self'
    );