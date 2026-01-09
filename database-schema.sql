-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Departments table (create first - no dependencies)
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table (depends on departments)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table (no dependencies)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competencies table (no dependencies)
CREATE TABLE competencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (depends on teams - create after teams)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
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

-- JD Responsibilities table
CREATE TABLE jd_responsibilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jd_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('key', 'strategic', 'team_management', 'general', 'culture', 'efficiency', 'other')),
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- JD Risks table
CREATE TABLE jd_risks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jd_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('external', 'internal')),
  description TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- JD Competencies (scores) table
CREATE TABLE jd_competencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jd_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
  competency_id UUID REFERENCES competencies(id),
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(jd_id, competency_id)
);

-- Activity Logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  target_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL CHECK (action IN ('password_change', 'role_change', 'team_assign', 'team_remove', 'user_delete')),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_teams_department ON teams(department_id);
CREATE INDEX idx_jd_location ON job_descriptions(location_id);
CREATE INDEX idx_jd_department ON job_descriptions(department_id);
CREATE INDEX idx_jd_team ON job_descriptions(team_id);
CREATE INDEX idx_jd_status ON job_descriptions(status);
CREATE INDEX idx_jd_created_by ON job_descriptions(created_by);
CREATE INDEX idx_jd_responsibilities_jd ON jd_responsibilities(jd_id);
CREATE INDEX idx_jd_risks_jd ON jd_risks(jd_id);
CREATE INDEX idx_jd_competencies_jd ON jd_competencies(jd_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_target ON activity_logs(target_user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jd_responsibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE jd_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE jd_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Master data policies (Departments, Teams, Locations, Competencies)
CREATE POLICY "Everyone can view departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Admins can manage departments" ON departments FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Everyone can view teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Admins can manage teams" ON teams FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Everyone can view locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Admins can manage locations" ON locations FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Everyone can view competencies" ON competencies FOR SELECT USING (true);
CREATE POLICY "Admins can manage competencies" ON competencies FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Job Descriptions policies
CREATE POLICY "Everyone can view published JDs" ON job_descriptions
  FOR SELECT USING (status = 'published' OR auth.uid() = created_by);

CREATE POLICY "Managers can view team JDs" ON job_descriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (role IN ('admin', 'manager'))
      AND (role = 'admin' OR team_id = job_descriptions.team_id)
    )
  );

CREATE POLICY "Admins and Managers can create JDs" ON job_descriptions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and Managers can update JDs" ON job_descriptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (
        role = 'admin'
        OR (role = 'manager' AND team_id = job_descriptions.team_id)
      )
    )
  );

CREATE POLICY "Admins can delete JDs" ON job_descriptions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- JD related tables policies (inherit from job_descriptions)
CREATE POLICY "JD responsibilities viewable" ON jd_responsibilities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_descriptions
      WHERE id = jd_responsibilities.jd_id
      AND (status = 'published' OR created_by = auth.uid())
    )
  );

CREATE POLICY "JD responsibilities manageable" ON jd_responsibilities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM job_descriptions jd
      JOIN users u ON u.id = auth.uid()
      WHERE jd.id = jd_responsibilities.jd_id
      AND (u.role = 'admin' OR (u.role = 'manager' AND u.team_id = jd.team_id))
    )
  );

CREATE POLICY "JD risks viewable" ON jd_risks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_descriptions
      WHERE id = jd_risks.jd_id
      AND (status = 'published' OR created_by = auth.uid())
    )
  );

CREATE POLICY "JD risks manageable" ON jd_risks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM job_descriptions jd
      JOIN users u ON u.id = auth.uid()
      WHERE jd.id = jd_risks.jd_id
      AND (u.role = 'admin' OR (u.role = 'manager' AND u.team_id = jd.team_id))
    )
  );

CREATE POLICY "JD competencies viewable" ON jd_competencies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_descriptions
      WHERE id = jd_competencies.jd_id
      AND (status = 'published' OR created_by = auth.uid())
    )
  );

CREATE POLICY "JD competencies manageable" ON jd_competencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM job_descriptions jd
      JOIN users u ON u.id = auth.uid()
      WHERE jd.id = jd_competencies.jd_id
      AND (u.role = 'admin' OR (u.role = 'manager' AND u.team_id = jd.team_id))
    )
  );

-- Activity Logs policies
CREATE POLICY "Admins can view all activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competencies_updated_at BEFORE UPDATE ON competencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_descriptions_updated_at BEFORE UPDATE ON job_descriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default locations
INSERT INTO locations (name, order_index) VALUES
  ('Bangkok', 1),
  ('Nakhon Pathom', 2);

-- Insert default competencies
INSERT INTO competencies (name, order_index) VALUES
  ('Execution', 1),
  ('Communication', 2),
  ('Self Awareness', 3),
  ('Leadership', 4),
  ('Business Mind', 5),
  ('Long-term Thinking', 6);
