-- Create user_teams table for Manager to oversee multiple teams
CREATE TABLE IF NOT EXISTS user_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate assignments
  UNIQUE(user_id, team_id)
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_teams_user_id ON user_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_user_teams_team_id ON user_teams(team_id);

-- Add comment
COMMENT ON TABLE user_teams IS 'Many-to-many relationship table for users overseeing multiple teams (primarily for Managers)';
