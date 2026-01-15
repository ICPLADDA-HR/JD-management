-- Add responsibility_percentages column to job_descriptions table
-- Run this SQL in Supabase SQL Editor

ALTER TABLE job_descriptions 
ADD COLUMN IF NOT EXISTS responsibility_percentages JSONB DEFAULT '{}';

-- Example data structure:
-- {
--   "strategic": 20,
--   "team_management": 25,
--   "general": 20,
--   "culture": 15,
--   "efficiency": 15,
--   "other": 5
-- }
