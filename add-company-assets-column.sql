-- Add company_assets column to job_descriptions table
-- This column stores an array of asset IDs (for predefined assets) and asset names (for custom assets)

ALTER TABLE job_descriptions
ADD COLUMN IF NOT EXISTS company_assets TEXT[];

-- Add comment to explain the column
COMMENT ON COLUMN job_descriptions.company_assets IS 'Array of company asset IDs (predefined) and names (custom)';

-- Example data:
-- company_assets = ['1', '2', 'Company Car', 'Parking Space']
-- Where '1' and '2' are predefined asset IDs, and 'Company Car' and 'Parking Space' are custom assets
