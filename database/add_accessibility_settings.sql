-- Add accessibility columns to user_preferences
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS large_text BOOLEAN DEFAULT FALSE;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS high_contrast BOOLEAN DEFAULT FALSE;
