-- Migration: Add missing columns to users table
-- Date: 2025-12-23
-- Description: Adds location_id, department_id, and is_active columns to users table

-- Add location_id column (nullable initially, can be updated later)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- Add department_id column (nullable initially, can be updated later)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id);

-- Add is_active column with default value true
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Add comments for documentation
COMMENT ON COLUMN users.location_id IS 'User work location';
COMMENT ON COLUMN users.department_id IS 'User department';
COMMENT ON COLUMN users.is_active IS 'Whether user account is active';
