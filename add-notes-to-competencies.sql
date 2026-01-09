-- Migration: Add notes column to jd_competencies table
-- Date: 2025-12-23
-- Description: Adds optional notes field for competency scores in Job Descriptions

-- Add notes column to jd_competencies table
ALTER TABLE jd_competencies
ADD COLUMN notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN jd_competencies.notes IS 'Optional notes for each competency score';
