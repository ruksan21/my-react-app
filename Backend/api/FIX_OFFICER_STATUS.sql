-- Fix officer status inconsistency
UPDATE users
SET status = 'active'
WHERE status = 'approved'
    AND role = 'officer';