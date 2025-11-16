-- Add theme and other preferences with select type
INSERT INTO user_preferences (user_id, key, value, category, type, description)
SELECT 
  id as user_id,
  unnest(ARRAY['theme_mode', 'theme_name', 'profile_visibility']) as key,
  unnest(ARRAY['system', 'tangerine', 'public']) as value,
  unnest(ARRAY['appearance', 'appearance', 'privacy']) as category,
  unnest(ARRAY['select', 'select', 'select']) as type,
  unnest(ARRAY[
    'Theme mode preference (light, dark, system)',
    'Theme color scheme',
    'Who can see your profile'
  ]) as description
FROM auth.users
ON CONFLICT (user_id, key) DO NOTHING;