-- Complete Database Setup for Nexus Admin
-- Run this script to set up all tables and default data

-- 1. Create _app_settings table
CREATE TABLE IF NOT EXISTS _app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for _app_settings
ALTER TABLE _app_settings ENABLE ROW LEVEL SECURITY;

-- Create admin-only policy (requires is_admin function)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    DROP POLICY IF EXISTS "Admin only" ON _app_settings;
    CREATE POLICY "Admin only" ON _app_settings FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- 2. Create _user_preferences table
CREATE TABLE IF NOT EXISTS _user_preferences (
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

-- Enable RLS for _user_preferences
ALTER TABLE _user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own preferences
DROP POLICY IF EXISTS "Users can manage own preferences" ON _user_preferences;
CREATE POLICY "Users can manage own preferences" ON _user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- 3. Insert _app_settings data
INSERT INTO _app_settings (key, value, category, type, description) VALUES
-- General Settings
('app_title', 'Nexus Admin', 'general', 'text', 'Application title shown in browser tab'),
('app_description', 'Admin Dashboard', 'general', 'text', 'Application description for SEO'),
('company_name', 'Your Company', 'general', 'text', 'Company or organization name'),
('support_email', 'support@example.com', 'general', 'email', 'Support contact email'),
('max_file_size', '10', 'general', 'number', 'Maximum file upload size in MB'),
('session_duration', '60', 'general', 'number', 'Session duration in minutes'),

-- Appearance Settings
('theme_mode', 'light', 'appearance', 'select', 'Theme mode (light/dark/system)'),
('theme_primary_color', '#3b82f6', 'appearance', 'color', 'Primary brand color'),
('logo_url', '', 'appearance', 'url', 'Application logo URL'),
('favicon_url', '', 'appearance', 'url', 'Favicon URL'),
('sidebar_width', '280', 'appearance', 'number', 'Sidebar width in pixels'),
('font_size', '14', 'appearance', 'number', 'Base font size in pixels'),

-- Preferences Settings
('items_per_page', '25', 'preferences', 'number', 'Default items per page'),
('notification_timeout', '5', 'preferences', 'number', 'Notification timeout in seconds'),
('number_format_locale', 'en-US', 'preferences', 'select', 'Number format locale (en-US, th-TH, de-DE)'),
('number_decimal_places', '2', 'preferences', 'number', 'Default decimal places for numbers'),
('number_thousands_separator', 'true', 'preferences', 'select', 'Use thousands separator (true/false)'),
('currency_format', 'USD', 'preferences', 'select', 'Default currency format (USD, THB, EUR)'),
('date_format', 'dd-MM-yyyy', 'preferences', 'select', 'Date format (dd-MM-yyyy, dd/MM/yyyy, yyyy-MM-dd)'),
('timezone', 'Asia/Bangkok', 'preferences', 'text', 'Default timezone')

ON CONFLICT (key) DO NOTHING;

-- 4. Insert default _user_preferences for existing users
INSERT INTO _user_preferences (user_id, key, value, category, type, description)
SELECT 
  id as user_id,
  unnest(ARRAY[
    'language', 'timezone', 'email_notifications', 'push_notifications', 
    'profile_visibility', 'data_sharing', 'theme_mode', 'theme_name',
    'sidebar_collapsed', 'session_timeout', 'items_per_page', 'notification_delay'
  ]) as key,
  unnest(ARRAY[
    'en', 'UTC', 'true', 'true', 
    'public', 'false', 'system', 'tangerine',
    'false', '30', '10', '5'
  ]) as value,
  unnest(ARRAY[
    'profile', 'profile', 'notifications', 'notifications',
    'privacy', 'privacy', 'appearance', 'appearance', 
    'appearance', 'profile', 'profile', 'notifications'
  ]) as category,
  unnest(ARRAY[
    'select', 'select', 'boolean', 'boolean',
    'select', 'boolean', 'select', 'select',
    'boolean', 'number', 'number', 'number'
  ]) as type,
  unnest(ARRAY[
    'Preferred language for the interface',
    'Your timezone for date/time display',
    'Receive email notifications',
    'Receive push notifications',
    'Who can see your profile',
    'Allow data sharing for analytics',
    'Theme mode preference (light, dark, system)',
    'Theme color scheme',
    'Keep sidebar collapsed by default',
    'Session timeout in minutes',
    'Number of items to display per page',
    'Notification delay in seconds'
  ]) as description
FROM auth.users
ON CONFLICT (user_id, key) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE 'Tables created: _app_settings, _user_preferences';
  RAISE NOTICE 'Default data inserted for % users', (SELECT COUNT(*) FROM auth.users);
END $$;