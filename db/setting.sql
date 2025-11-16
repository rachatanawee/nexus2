
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only" ON app_settings FOR ALL USING (public.is_admin());

CREATE TRIGGER app_settings_updated_at BEFORE UPDATE ON app_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO app_settings (key, value, category, type, description) VALUES
  ('app_title', 'Nexus Admin', 'general', 'text', 'Application title shown in browser tab'),
  ('app_description', 'Admin Dashboard', 'general', 'text', 'Application description for SEO'),
  ('company_name', 'Your Company', 'general', 'text', 'Company or organization name'),
  ('support_email', 'support@example.com', 'general', 'email', 'Support contact email'),
  
  ('theme_mode', 'light', 'appearance', 'select', 'Theme mode (light/dark/system)'),
  ('theme_primary_color', '#3b82f6', 'appearance', 'color', 'Primary brand color'),
  ('logo_url', '', 'appearance', 'url', 'Application logo URL'),
  ('favicon_url', '', 'appearance', 'url', 'Favicon URL'),
  
  ('items_per_page', '10', 'preferences', 'number', 'Default items per page in tables'),
  ('date_format', 'MM/DD/YYYY', 'preferences', 'text', 'Date format (MM/DD/YYYY, DD/MM/YYYY)'),
  ('timezone', 'Asia/Bangkok', 'preferences', 'text', 'Default timezone');
