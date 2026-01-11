-- Add Social Media Columns to Wards Table
-- This adds social media URL fields to support ward social media integration
-- Run this SQL in your database to add the missing columns

ALTER TABLE `wards` 
ADD COLUMN IF NOT EXISTS `facebook_url` VARCHAR(255) DEFAULT NULL AFTER `chairperson_appointment_date`,
ADD COLUMN IF NOT EXISTS `instagram_url` VARCHAR(255) DEFAULT NULL AFTER `facebook_url`,
ADD COLUMN IF NOT EXISTS `twitter_url` VARCHAR(255) DEFAULT NULL AFTER `instagram_url`,
ADD COLUMN IF NOT EXISTS `whatsapp_url` VARCHAR(255) DEFAULT NULL AFTER `twitter_url`,
ADD COLUMN IF NOT EXISTS `google_map_link` VARCHAR(500) DEFAULT NULL AFTER `whatsapp_url`,
ADD COLUMN IF NOT EXISTS `telephone` VARCHAR(20) DEFAULT NULL AFTER `google_map_link`;

-- Verify the columns were added
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'wards' 
AND COLUMN_NAME IN ('facebook_url', 'instagram_url', 'twitter_url', 'whatsapp_url', 'google_map_link', 'telephone')
ORDER BY ORDINAL_POSITION;
