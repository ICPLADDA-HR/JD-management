-- Test Database Connection and Basic Setup
-- Run this first to test if database is working

-- 1. Test basic table creation
CREATE TABLE IF NOT EXISTS test_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Test insert
INSERT INTO test_table (name) VALUES ('Test Entry') ON CONFLICT DO NOTHING;

-- 3. Test select
SELECT * FROM test_table;

-- 4. Check if our main tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('departments', 'teams', 'locations', 'competencies', 'job_descriptions');

-- 5. Check if we have sample data
SELECT 'departments' as table_name, count(*) as count FROM departments
UNION ALL
SELECT 'teams', count(*) FROM teams  
UNION ALL
SELECT 'locations', count(*) FROM locations
UNION ALL
SELECT 'competencies', count(*) FROM competencies;

-- 6. Clean up test
DROP TABLE IF EXISTS test_table;