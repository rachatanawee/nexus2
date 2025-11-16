-- Add number format settings to app_settings table
INSERT INTO app_settings (key, value, category, type, description) VALUES
('number_format_locale', 'en-US', 'preferences', 'select', 'Number format locale (en-US, th-TH, de-DE)'),
('number_decimal_places', '2', 'preferences', 'number', 'Default decimal places for numbers'),
('number_thousands_separator', 'true', 'preferences', 'select', 'Use thousands separator (true/false)'),
('currency_format', 'USD', 'preferences', 'select', 'Default currency format (USD, THB, EUR)'),
('date_format', 'MM/dd/yyyy', 'preferences', 'select', 'Date format (MM/dd/yyyy, dd/MM/yyyy, yyyy-MM-dd)')
ON CONFLICT (key) DO NOTHING;