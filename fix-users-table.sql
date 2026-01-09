-- Fix Users Table Foreign Key Issue
-- Run this in Supabase SQL Editor

-- 1. Drop the existing users table if it exists
DROP TABLE IF EXISTS users CASCADE;

-- 2. Recreate users table without auth.users foreign key constraint
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')),
  team_id UUID REFERENCES teams(id),
  location_id UUID REFERENCES locations(id),
  department_id UUID REFERENCES departments(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insert test user with the ID we're using in the app
INSERT INTO users (id, email, full_name, role, is_active, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'Test User', 'admin', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Recreate the job_descriptions table to reference the new users table
-- First drop existing job_descriptions table
DROP TABLE IF EXISTS job_descriptions CASCADE;
DROP TABLE IF EXISTS jd_responsibilities CASCADE;
DROP TABLE IF EXISTS jd_risks CASCADE;
DROP TABLE IF EXISTS jd_competencies CASCADE;

-- Recreate job_descriptions table
CREATE TABLE job_descriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position TEXT NOT NULL,
  job_band TEXT NOT NULL CHECK (job_band IN ('JB 1', 'JB 2', 'JB 3', 'JB 4', 'JB 5')),
  job_grade TEXT NOT NULL,
  location_id UUID REFERENCES locations(id),
  department_id UUID REFERENCES departments(id),
  team_id UUID REFERENCES teams(id),
  direct_supervisor TEXT NOT NULL,
  job_purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  version INTEGER NOT NULL DEFAULT 1,
  parent_version_id UUID REFERENCES job_descriptions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate related tables
CREATE TABLE jd_responsibilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jd_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('key', 'strategic', 'team_management', 'general', 'culture', 'efficiency', 'other')),
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE jd_risks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jd_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('external', 'internal')),
  description TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE jd_competencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jd_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
  competency_id UUID REFERENCES competencies(id),
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(jd_id, competency_id)
);

-- Recreate indexes
CREATE INDEX idx_jd_location ON job_descriptions(location_id);
CREATE INDEX idx_jd_department ON job_descriptions(department_id);
CREATE INDEX idx_jd_team ON job_descriptions(team_id);
CREATE INDEX idx_jd_status ON job_descriptions(status);
CREATE INDEX idx_jd_created_by ON job_descriptions(created_by);
CREATE INDEX idx_jd_responsibilities_jd ON jd_responsibilities(jd_id);
CREATE INDEX idx_jd_risks_jd ON jd_risks(jd_id);
CREATE INDEX idx_jd_competencies_jd ON jd_competencies(jd_id);

-- Disable RLS for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE jd_responsibilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE jd_risks DISABLE ROW LEVEL SECURITY;
ALTER TABLE jd_competencies DISABLE ROW LEVEL SECURITY;

-- Recreate triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_descriptions_updated_at ON job_descriptions;
CREATE TRIGGER update_job_descriptions_updated_at BEFORE UPDATE ON job_descriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the fix
SELECT 'Users table fixed successfully!' as message;
SELECT * FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000';