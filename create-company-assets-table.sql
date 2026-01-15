-- Create company_assets table in Supabase
-- Run this SQL in Supabase SQL Editor

-- Create the table
CREATE TABLE IF NOT EXISTS company_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE company_assets ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for share page)
CREATE POLICY "Allow public read access" ON company_assets
  FOR SELECT USING (true);

-- Create policies for authenticated users to manage
CREATE POLICY "Allow authenticated insert" ON company_assets
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON company_assets
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON company_assets
  FOR DELETE TO authenticated USING (true);

-- Insert default assets
INSERT INTO company_assets (name, description) VALUES
  ('คอมพิวเตอร์โน้ตบุ๊ค', 'Laptop computer'),
  ('เครื่องโทรศัพท์', 'Mobile phone device'),
  ('เบอร์โทรศัพท์', 'Phone number'),
  ('ค่าโทรศัพท์', 'Phone allowance'),
  ('รถยนต์', 'Company car'),
  ('Fleet Card', 'Fleet card for fuel'),
  ('บัตรรองรถ', 'Parking card'),
  ('บัตร Easy Pass', 'Easy Pass card'),
  ('เครื่อง Ipad', 'iPad device')
ON CONFLICT (name) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_assets_updated_at
  BEFORE UPDATE ON company_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
