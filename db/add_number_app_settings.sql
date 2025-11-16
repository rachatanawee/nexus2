-- Add number type settings to app_settings table
INSERT INTO app_settings (key, value, category, type, description) VALUES
('max_file_size', '10', 'general', 'number', 'Maximum file upload size in MB'),
('session_duration', '60', 'general', 'number', 'Session duration in minutes'),
('items_per_page', '25', 'preferences', 'number', 'Default items per page'),
('notification_timeout', '5', 'preferences', 'number', 'Notification timeout in seconds'),
('sidebar_width', '280', 'appearance', 'number', 'Sidebar width in pixels'),
('font_size', '14', 'appearance', 'number', 'Base font size in pixels')
ON CONFLICT (key) DO NOTHING;