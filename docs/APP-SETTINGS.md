# App Settings & User Preferences

## Overview

The system provides two levels of configuration:
- **App Settings** (`_app_settings`) - Global system settings
- **User Preferences** (`_user_preferences`) - Per-user preferences

## App Settings

### Categories

**General Settings:**
- `app_title` - Application title
- `company_name` - Company name
- `support_email` - Support contact
- `max_file_size` - File upload limit (MB)
- `session_duration` - Session timeout (minutes)

**Appearance Settings:**
- `theme_mode` - Default theme (light/dark/system)
- `theme_primary_color` - Brand color
- `logo_url` - Application logo
- `favicon_url` - Favicon
- `sidebar_width` - Sidebar width (pixels)
- `font_size` - Base font size (pixels)

**Preferences Settings:**
- `items_per_page` - Default pagination
- `notification_timeout` - Notification duration
- `number_format_locale` - Number format (en-US/th-TH/de-DE)
- `number_decimal_places` - Decimal places
- `number_thousands_separator` - Use thousands separator
- `currency_format` - Currency (USD/THB/EUR)
- `date_format` - Date format (MM/dd/yyyy/dd/MM/yyyy/yyyy-MM-dd)
- `timezone` - Default timezone

### Usage

```typescript
// Admin settings page
import { getAppSettings } from '@/app/[locale]/(dashboard)/settings/_lib/queries'
import { updateSettings } from '@/app/[locale]/(dashboard)/settings/_lib/actions'

// Read all settings
const { data: settings } = await getAppSettings()

// Update settings (admin only)
const formData = new FormData()
formData.append('updates', JSON.stringify({ app_title: 'New Title' }))
await updateSettings(prevState, formData)
```

## User Preferences

### Categories

**Profile Settings:**
- `language` - Interface language (en/th)
- `timezone` - User timezone
- `session_timeout` - Personal session timeout
- `items_per_page` - Personal pagination

**Notifications:**
- `email_notifications` - Email notifications (true/false)
- `push_notifications` - Push notifications (true/false)
- `notification_delay` - Notification delay (seconds)

**Privacy & Security:**
- `profile_visibility` - Profile visibility (public/private/friends)
- `data_sharing` - Allow data sharing (true/false)

**Appearance:**
- `theme_mode` - Personal theme (light/dark/system)
- `theme_name` - Theme color scheme (tangerine/claude/clean-slate/ocean-breeze/twitter)
- `sidebar_collapsed` - Keep sidebar collapsed (true/false)

### Usage

```typescript
// Profile page
import { getUserPreferences } from '@/app/[locale]/(dashboard)/profile/_lib/queries'
import { updatePreferences } from '@/app/[locale]/(dashboard)/profile/_lib/actions'

// Read user preferences
const { data: preferences } = await getUserPreferences()

// Update preferences
const formData = new FormData()
formData.append('updates', JSON.stringify({ theme_mode: 'dark' }))
await updatePreferences(prevState, formData)
```

## Format System

### Number Formatting

```typescript
import { formatSystemNumber } from '@/lib/format-utils'

// Uses number_format_locale, number_decimal_places, number_thousands_separator
const formatted = formatSystemNumber(1234.56, settings)
// en-US: "1,234.56"
// de-DE: "1.234,56"
// th-TH: "1,234.56"
```

### Date Formatting

```typescript
import { formatSystemDate } from '@/lib/format-utils'

// Uses date_format setting
const formatted = formatSystemDate(new Date(), settings.date_format)
// MM/dd/yyyy: "12/25/2024"
// dd/MM/yyyy: "25/12/2024"  
// yyyy-MM-dd: "2024-12-25"
```

## Caching System

Preferences are cached using React Context:

```typescript
// Wrap app with PreferencesProvider
<PreferencesProvider>
  <App />
</PreferencesProvider>

// Use in components
const { settings, refreshSettings, isLoading } = usePreferences()

// Auto-refresh after settings save
useEffect(() => {
  if (settingsSaved) {
    refreshSettings() // Updates cache
  }
}, [settingsSaved])
```

## Access Control

### App Settings
- **Read:** All authenticated users
- **Write:** Admin only (`isAdmin(user)`)

### User Preferences  
- **Read/Write:** Own preferences only (RLS: `auth.uid() = user_id`)

## Database Schema

```sql
-- System tables use _ prefix
CREATE TABLE _app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE _user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  type TEXT NOT NULL DEFAULT 'text',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key)
);
```

## Setup

Run `db/complete_setup.sql` to create tables and insert default data.