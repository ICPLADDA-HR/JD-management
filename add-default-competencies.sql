-- Migration: Add default competencies
-- Date: 2025-12-23
-- Description: Inserts default core competencies for Job Descriptions

-- Insert default competencies (only if they don't exist)
INSERT INTO competencies (name, order_index)
SELECT * FROM (VALUES
  ('Execution', 1),
  ('Communication', 2),
  ('Self Awareness', 3),
  ('Leadership', 4),
  ('Business Mind', 5),
  ('Long-term Thinking', 6)
) AS v(name, order_index)
WHERE NOT EXISTS (
  SELECT 1 FROM competencies WHERE competencies.name = v.name
);
