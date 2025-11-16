-- Add number type preferences for testing
INSERT INTO user_preferences (user_id, key, value, category, type, description)
SELECT 
  id as user_id,
  unnest(ARRAY['session_timeout', 'items_per_page', 'notification_delay']) as key,
  unnest(ARRAY['30', '10', '5']) as value,
  unnest(ARRAY['profile', 'profile', 'notifications']) as category,
  unnest(ARRAY['number', 'number', 'number']) as type,
  unnest(ARRAY[
    'Session timeout in minutes',
    'Number of items to display per page',
    'Notification delay in seconds'
  ]) as description
FROM auth.users
ON CONFLICT (user_id, key) DO NOTHING;