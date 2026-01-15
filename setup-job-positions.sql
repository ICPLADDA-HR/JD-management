-- =====================================================
-- SQL สำหรับสร้างตาราง job_positions
-- Run ใน Supabase SQL Editor
-- =====================================================

-- 1. สร้างตาราง job_positions
CREATE TABLE IF NOT EXISTS job_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE job_positions ENABLE ROW LEVEL SECURITY;

-- 3. ลบ policies เก่า (ถ้ามี)
DROP POLICY IF EXISTS "Allow all operations on job_positions" ON job_positions;
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON job_positions;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON job_positions;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON job_positions;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON job_positions;

-- 4. สร้าง policy ใหม่ที่อนุญาตทุกการกระทำ
CREATE POLICY "Allow all operations on job_positions" ON job_positions
  FOR ALL USING (true) WITH CHECK (true);

-- 5. สร้าง index
CREATE INDEX IF NOT EXISTS idx_job_positions_name ON job_positions(name);
CREATE INDEX IF NOT EXISTS idx_job_positions_order ON job_positions(order_index);

-- 6. เพิ่มตำแหน่งงานตัวอย่าง (ถ้าต้องการ)
-- INSERT INTO job_positions (name, description, order_index) VALUES
--   ('Manager', 'ผู้จัดการ', 1),
--   ('Senior Developer', 'นักพัฒนาอาวุโส', 2),
--   ('Developer', 'นักพัฒนา', 3),
--   ('Analyst', 'นักวิเคราะห์', 4),
--   ('Specialist', 'ผู้เชี่ยวชาญ', 5)
-- ON CONFLICT DO NOTHING;

-- =====================================================
-- เสร็จแล้ว! ตอนนี้สามารถเพิ่ม/แก้ไข/ลบตำแหน่งงานได้
-- =====================================================
