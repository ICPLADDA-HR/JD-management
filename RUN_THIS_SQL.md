# 🚀 Quick Setup: Run This SQL Script

## ⚠️ IMPORTANT: You must run this SQL script to make Job Positions work!

### Steps to Run:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `smwqkrpkwhbkvdatebsi`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query" button

3. **Copy and Paste**
   - Open the file: `create-job-positions-table.sql`
   - Copy ALL the content
   - Paste it into the SQL Editor

4. **Run the Script**
   - Click the "Run" button (or press Ctrl+Enter)
   - Wait for success message

5. **Verify**
   - Go to "Table Editor" in Supabase
   - You should see a new table called `job_positions`
   - It should have 10 default positions

6. **Refresh Your App**
   - Go back to your app
   - Navigate to Settings → Job Positions
   - You should now see the positions!

---

## Alternative: Copy-Paste This SQL Directly

```sql
-- Create job_positions table
CREATE TABLE IF NOT EXISTS job_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE job_positions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to all authenticated users" ON job_positions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert for authenticated users" ON job_positions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON job_positions
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow delete for authenticated users" ON job_positions
  FOR DELETE TO authenticated USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_job_positions_name ON job_positions(name);

-- Insert some default positions
INSERT INTO job_positions (name, description) VALUES
  ('Manager', 'Management position'),
  ('Senior Developer', 'Senior level developer'),
  ('Developer', 'Mid-level developer'),
  ('Junior Developer', 'Entry level developer'),
  ('Team Lead', 'Team leadership position'),
  ('Director', 'Director level position'),
  ('VP', 'Vice President position'),
  ('Analyst', 'Analysis position'),
  ('Specialist', 'Specialist position'),
  ('Coordinator', 'Coordination position')
ON CONFLICT (name) DO NOTHING;
```

---

## ✅ After Running the SQL:

The Job Positions page will work and you can:
- ✅ View all positions
- ✅ Add new positions
- ✅ Edit positions
- ✅ Delete positions
- ✅ Import from CSV
- ✅ All data will be saved to the database

## 🎯 Your Supabase Project:
- URL: https://smwqkrpkwhbkvdatebsi.supabase.co
- Dashboard: https://supabase.com/dashboard/project/smwqkrpkwhbkvdatebsi
