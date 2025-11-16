-- Create user_preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'email', 'url', 'color', 'number', 'select', 'boolean')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own preferences
CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Insert default preferences for existing users
INSERT INTO user_preferences (user_id, key, value, category, type, description)
SELECT 
  id as user_id,
  unnest(ARRAY['language', 'timezone', 'email_notifications', 'push_notifications', 'profile_visibility', 'data_sharing', 'theme_preference', 'sidebar_collapsed']) as key,
  unnest(ARRAY['en', 'UTC', 'true', 'true', 'public', 'false', 'system', 'false']) as value,
  unnest(ARRAY['profile', 'profile', 'notifications', 'notifications', 'privacy', 'privacy', 'appearance', 'appearance']) as category,
  unnest(ARRAY['select', 'select', 'boolean', 'boolean', 'select', 'boolean', 'select', 'boolean']) as type,
  unnest(ARRAY[
    'Preferred language for the interface',
    'Your timezone for date/time display',
    'Receive email notifications',
    'Receive push notifications',
    'Who can see your profile',
    'Allow data sharing for analytics',
    'Theme preference',
    'Keep sidebar collapsed by default'
  ]) as description
FROM auth.users
ON CONFLICT (user_id, key) DO NOTHING;