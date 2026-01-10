-- ============================================================
-- WARD MANAGEMENT SYSTEM - Database Setup Guide
-- ============================================================

-- This file contains the complete SQL to set up all tables
-- Run this in phpMyAdmin or MySQL to create the database structure

-- ============================================================
-- 1. FEEDBACK REPLIES TABLE (Officer replies to citizen comments)
-- ============================================================

CREATE TABLE IF NOT EXISTS `feedback_replies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `feedback_id` INT NOT NULL COMMENT 'Reference to work_feedback comment',
  `officer_id` INT NOT NULL COMMENT 'Officer who replied',
  `officer_name` VARCHAR(255) NOT NULL COMMENT 'Officer full name',
  `reply_text` LONGTEXT NOT NULL COMMENT 'Officer reply content',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When reply was posted',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update',
  
  KEY `idx_feedback_id` (`feedback_id`),
  KEY `idx_officer_id` (`officer_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. CONNECTIONS BETWEEN TABLES
-- ============================================================

-- feedback_replies.feedback_id links to: work_feedback.id
-- feedback_replies.officer_id links to: users.id (where role = 'officer')

-- ============================================================
-- 3. TABLE RELATIONSHIPS MAP
-- ============================================================
/*
ward_management Database Structure:

users (Officers, Citizens)
├── id (PK)
├── role (citizen, officer, admin)
├── full_name
├── email
├── profile_photo
└── ward_id / work_location

wards
├── id (PK)
├── ward_number
├── municipality
├── province
└── district

development_works
├── id (PK)
├── ward_id
├── officer_id (FK -> users.id)
├── title
└── images

work_feedback (Citizen comments on works)
├── id (PK)
├── work_id (FK -> development_works.id)
├── user_id (FK -> users.id)  <-- CITIZEN who commented
├── rating (1-5 stars)
├── comment
└── created_at

feedback_replies (Officer responses to comments) ⭐ NEW
├── id (PK)
├── feedback_id (FK -> work_feedback.id) <-- Links comment to reply
├── officer_id (FK -> users.id) <-- Officer who replied
├── officer_name
├── reply_text
└── created_at

How it works:
1. Citizen creates work_feedback (comment with rating)
2. Officer sees comment in UI
3. Officer clicks "Reply" on that comment
4. Officer submits reply → stored in feedback_replies with feedback_id
5. Frontend loads replies via GET /get_replies.php?feedback_id=X
6. Both citizen and officer can see the conversation
*/

-- ============================================================
-- 4. VERIFY EXISTING TABLES
-- ============================================================

-- Run these queries to verify tables exist:
-- SHOW TABLES;
-- DESCRIBE work_feedback;
-- DESCRIBE users;
-- DESCRIBE feedback_replies;

-- ============================================================
-- 5. SAMPLE DATA STRUCTURE
-- ============================================================

/*
Example Flow:

Step 1: Citizen creates comment on Work ID 5
INSERT INTO work_feedback (work_id, user_id, user_name, rating, comment)
VALUES (5, 123, "John Doe", 4, "Great work, but could be faster");

Step 2: Officer (ID 45) replies to feedback ID 12
INSERT INTO feedback_replies (feedback_id, officer_id, officer_name, reply_text)
VALUES (12, 45, "Officer Sharma", "Thank you for the feedback. We'll speed up the process.");

Step 3: Frontend fetches the conversation
SELECT * FROM feedback_replies 
WHERE feedback_id = 12 
ORDER BY created_at ASC;

Response:
[{
  id: 1,
  feedback_id: 12,
  officer_id: 45,
  officer_name: "Officer Sharma",
  reply_text: "Thank you for the feedback...",
  created_at: "2026-01-10 14:30:00"
}]
*/

-- ============================================================
-- 6. QUERY EXAMPLES
-- ============================================================

-- Get all replies for a specific comment
SELECT 
    fr.id,
    fr.feedback_id,
    fr.officer_id,
    fr.officer_name,
    u.profile_photo AS officer_photo,
    fr.reply_text,
    fr.created_at
FROM feedback_replies fr
LEFT JOIN users u ON fr.officer_id = u.id
WHERE fr.feedback_id = 12
ORDER BY fr.created_at ASC;

-- Get comment with all officer replies
SELECT 
    wf.id AS feedback_id,
    wf.user_id,
    wf.user_name AS citizen_name,
    wf.rating,
    wf.comment,
    wf.created_at AS comment_date,
    COUNT(fr.id) AS total_replies
FROM work_feedback wf
LEFT JOIN feedback_replies fr ON wf.id = fr.feedback_id
WHERE wf.id = 12
GROUP BY wf.id;

-- Get all comments with replies count
SELECT 
    wf.id,
    wf.user_name,
    wf.rating,
    wf.comment,
    COUNT(fr.id) AS reply_count
FROM work_feedback wf
LEFT JOIN feedback_replies fr ON wf.id = fr.feedback_id
WHERE wf.work_id = 5
GROUP BY wf.id
ORDER BY wf.created_at DESC;

-- ============================================================
-- 7. API ENDPOINTS
-- ============================================================

/*
POST /communication/add_reply.php
Body: {
  feedback_id: 12,
  officer_id: 45,
  reply_text: "Thank you for the feedback..."
}

GET /communication/get_replies.php?feedback_id=12
Returns: {
  success: true,
  replies: [array of replies],
  total_replies: 3
}
*/
