-- ============================================================
-- FIX: Ward Location Mismatch Issue
-- ============================================================
-- The error "Ward not found" occurs because:
-- 1. Ward 1 may not exist in the database, OR
-- 2. Officer's work_location doesn't match any ward's location

-- ============================================================
-- STEP 1: Check if Ward 1 exists
-- ============================================================

-- Run this query to see if Ward 1 is in the database:
SELECT id, ward_number, municipality, district, province FROM wards WHERE ward_number = 1;

-- If no results, proceed to STEP 2

-- ============================================================
-- STEP 2: Create Ward 1 (if missing)
-- ============================================================

-- Insert Ward 1 with correct location details
INSERT INTO wards (ward_number, municipality, district, province, contact_phone, contact_email) 
VALUES (
    1,                                      -- ward_number
    'Itahari Sub-Metropolitan City',       -- municipality
    'Kathmandu',                            -- district
    'Bagmati Province',                     -- province
    '01-1234567',                           -- contact_phone (optional)
    'ward1@itahari.gov.np'                  -- contact_email (optional)
) ON DUPLICATE KEY UPDATE 
    municipality = 'Itahari Sub-Metropolitan City',
    district = 'Kathmandu',
    province = 'Bagmati Province';

-- ============================================================
-- STEP 3: Verify officer's work location matches Ward 1
-- ============================================================

-- Check officer's current location:
SELECT id, full_name, work_province, work_district, work_municipality, work_ward 
FROM users 
WHERE role = 'officer' 
LIMIT 5;

-- ============================================================
-- STEP 4: Update officer's work location to match Ward 1
-- ============================================================

-- Update ALL officers' work location to match Ward 1:
UPDATE users 
SET 
    work_province = 'Bagmati Province',
    work_district = 'Kathmandu',
    work_municipality = 'Itahari Sub-Metropolitan City',
    work_ward = 1
WHERE role = 'officer' 
  AND (
    work_ward IS NULL 
    OR work_ward = 0 
    OR work_province != 'Bagmati Province'
    OR work_district != 'Kathmandu'
    OR work_municipality != 'Itahari Sub-Metropolitan City'
  );

-- ============================================================
-- STEP 5: Verify the fix
-- ============================================================

-- Check if Ward 1 now exists:
SELECT id, ward_number, municipality, district, province FROM wards WHERE ward_number = 1;

-- Check if officers' locations match:
SELECT id, full_name, work_province, work_district, work_municipality, work_ward 
FROM users 
WHERE role = 'officer';

-- Test the location match:
SELECT w.id AS ward_id, w.ward_number, u.id AS officer_id, u.full_name
FROM wards w
JOIN users u ON (
    w.province = u.work_province 
    AND w.district = u.work_district
    AND w.municipality = u.work_municipality
    AND w.ward_number = u.work_ward
)
WHERE w.ward_number = 1
  AND u.role = 'officer';

-- ============================================================
-- STEP 6: Test API calls
-- ============================================================

-- After running the above SQL, the following should work:
-- 
-- Development Works:    GET /api/works/get_works.php
-- Budget Management:    GET /api/assets/manage_budgets.php
-- Ward Assets:          GET /api/assets/manage_ward_assets.php
-- Activities:           GET /api/activities/get_activities.php
-- Notices:              GET /api/alerts/manage_notices.php
-- Departments:          GET /api/alerts/manage_departments.php

-- ============================================================
-- TROUBLESHOOTING
-- ============================================================

/*
If you still see "Ward not found" errors:

1. Check exact spelling/spacing of location names:
   SELECT DISTINCT municipality, district, province FROM wards;
   
2. Check officer data:
   SELECT id, work_province, work_district, work_municipality, work_ward FROM users WHERE role = 'officer';
   
3. Check for NULL or empty values:
   SELECT * FROM users WHERE role = 'officer' AND (work_ward IS NULL OR work_province = '' OR work_district = '');
   
4. Look for hidden spaces or special characters:
   SELECT CONCAT('[', work_province, ']') AS prov FROM users WHERE role = 'officer';
*/
