-- Disable RLS temporarily for testing
-- Run this in Supabase SQL Editor

ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE competencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE jd_responsibilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE jd_risks DISABLE ROW LEVEL SECURITY;
ALTER TABLE jd_competencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insert a test user
INSERT INTO users (id, email, full_name, role, is_active, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'Test User', 'admin', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;