-- Complete Database Setup for JD Management System
-- Run this entire script in Supabase SQL Editor

-- ========================================
-- 1. CREATE TABLES (Database Schema)
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Departments table (create first - no dependencies)
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table (depends on departments)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table (no dependencies)
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competencies table (no dependencies)
CREATE TABLE IF NOT EXISTS competencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (depends on teams - create after teams)
CREATE TABLE IF NOT EXISTS users (
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

-- Job Descriptions table
CREATE TABLE IF NOT EXISTS job_descriptions (
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

-- JD Responsibilities table
CREATE TABLE IF NOT EXISTS jd_responsibilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jd_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('key', 'strategic', 'team_management', 'general', 'culture', 'efficiency', 'other')),
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- JD Risks table
CREATE TABLE IF NOT EXISTS jd_risks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jd_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('external', 'internal')),
  description TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- JD Competencies (scores) table
CREATE TABLE IF NOT EXISTS jd_competencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jd_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
  competency_id UUID REFERENCES competencies(id),
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(jd_id, competency_id)
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  target_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL CHECK (action IN ('password_change', 'role_change', 'team_assign', 'team_remove', 'user_delete')),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. CREATE INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_teams_department ON teams(department_id);
CREATE INDEX IF NOT EXISTS idx_jd_location ON job_descriptions(location_id);
CREATE INDEX IF NOT EXISTS idx_jd_department ON job_descriptions(department_id);
CREATE INDEX IF NOT EXISTS idx_jd_team ON job_descriptions(team_id);
CREATE INDEX IF NOT EXISTS idx_jd_status ON job_descriptions(status);
CREATE INDEX IF NOT EXISTS idx_jd_created_by ON job_descriptions(created_by);
CREATE INDEX IF NOT EXISTS idx_jd_responsibilities_jd ON jd_responsibilities(jd_id);
CREATE INDEX IF NOT EXISTS idx_jd_risks_jd ON jd_risks(jd_id);
CREATE INDEX IF NOT EXISTS idx_jd_competencies_jd ON jd_competencies(jd_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target ON activity_logs(target_user_id);

-- ========================================
-- 3. DISABLE RLS FOR TESTING
-- ========================================

ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE competencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE jd_responsibilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE jd_risks DISABLE ROW LEVEL SECURITY;
ALTER TABLE jd_competencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. INSERT SAMPLE DATA
-- ========================================

-- Insert default locations
INSERT INTO locations (name, order_index) VALUES
  ('Bangkok', 1),
  ('Nakhon Pathom', 2)
ON CONFLICT DO NOTHING;

-- Insert default competencies
INSERT INTO competencies (name, order_index) VALUES
  ('Execution', 1),
  ('Communication', 2),
  ('Self Awareness', 3),
  ('Leadership', 4),
  ('Business Mind', 5),
  ('Long-term Thinking', 6)
ON CONFLICT DO NOTHING;

-- Insert Departments
INSERT INTO departments (name, order_index) VALUES
  ('Engineering', 1),
  ('Marketing', 2),
  ('Operations', 3),
  ('Human Resources', 4),
  ('Finance', 5)
ON CONFLICT DO NOTHING;

-- Insert Teams (need to get department IDs first)
DO $$
DECLARE
    eng_dept_id UUID;
    mkt_dept_id UUID;
    ops_dept_id UUID;
    hr_dept_id UUID;
    fin_dept_id UUID;
BEGIN
    -- Get department IDs
    SELECT id INTO eng_dept_id FROM departments WHERE name = 'Engineering';
    SELECT id INTO mkt_dept_id FROM departments WHERE name = 'Marketing';
    SELECT id INTO ops_dept_id FROM departments WHERE name = 'Operations';
    SELECT id INTO hr_dept_id FROM departments WHERE name = 'Human Resources';
    SELECT id INTO fin_dept_id FROM departments WHERE name = 'Finance';

    -- Insert Teams
    INSERT INTO teams (name, department_id, order_index) VALUES
      ('Frontend Development', eng_dept_id, 1),
      ('Backend Development', eng_dept_id, 2),
      ('DevOps', eng_dept_id, 3),
      ('Digital Marketing', mkt_dept_id, 1),
      ('Content Marketing', mkt_dept_id, 2),
      ('Business Operations', ops_dept_id, 1),
      ('Customer Success', ops_dept_id, 2),
      ('Talent Acquisition', hr_dept_id, 1),
      ('People Development', hr_dept_id, 2),
      ('Financial Planning', fin_dept_id, 1),
      ('Accounting', fin_dept_id, 2)
    ON CONFLICT DO NOTHING;
END $$;

-- Insert a test user
INSERT INTO users (id, email, full_name, role, is_active, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'Test User', 'admin', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 5. CREATE TRIGGERS FOR UPDATED_AT
-- ========================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_competencies_updated_at ON competencies;
CREATE TRIGGER update_competencies_updated_at BEFORE UPDATE ON competencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_descriptions_updated_at ON job_descriptions;
CREATE TRIGGER update_job_descriptions_updated_at BEFORE UPDATE ON job_descriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SETUP COMPLETE!
-- ========================================

SELECT 'Database setup completed successfully!' as message;