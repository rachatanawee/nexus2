# Setup Admin User

## Method 1: Using Script (Recommended)

```bash
node scripts/setup-admin.js
```

## Method 2: Using Supabase Dashboard

1. Go to **Authentication → Users**
2. Click on the user you want to make admin
3. Scroll to **User Metadata** section
4. Click **Edit** on **Raw App Meta Data**
5. Add or update:
```json
{
  "provider": "email",
  "providers": ["email"],
  "roles": ["admin"]
}
```
6. Click **Save**

## Method 3: Using SQL (Create New Admin)

Run in Supabase SQL Editor:

```sql
-- This creates a new user via SQL trigger
-- Note: Password will be sent via email
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('your-password-here', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"],"roles":["admin"]}'::jsonb,
  '{}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

**Note:** Method 2 (Dashboard) is easiest for existing users.
