-- Migration: Add 'other' category to jd_responsibilities
-- Date: 2025-12-23
-- Description: Updates CHECK constraint to include 'other' category for responsibilities

-- Drop the existing CHECK constraint
ALTER TABLE jd_responsibilities
DROP CONSTRAINT IF EXISTS jd_responsibilities_category_check;

-- Add new CHECK constraint with 'other' category
ALTER TABLE jd_responsibilities
ADD CONSTRAINT jd_responsibilities_category_check
CHECK (category IN ('key', 'strategic', 'team_management', 'general', 'culture', 'efficiency', 'other'));

-- Add comment for documentation
COMMENT ON CONSTRAINT jd_responsibilities_category_check ON jd_responsibilities IS 'Validates responsibility category including other assigned works';
