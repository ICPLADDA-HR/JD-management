-- Insert sample data for JD Management System

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

-- Sample user (you'll need to create this through Supabase Auth first)
-- This is just a placeholder - you need to sign up through the app first
-- INSERT INTO users (id, email, full_name, role, created_at, updated_at) VALUES
--   ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'System Admin', 'admin', NOW(), NOW())
-- ON CONFLICT DO NOTHING;