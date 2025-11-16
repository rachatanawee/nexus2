# System Tables Documentation

## Overview

System tables use the `_` prefix to distinguish them from business tables.

## System Tables

### `_app_settings`
Global application settings.

**Categories:** general, appearance, preferences  
**Types:** text, email, url, color, number, select

### `_user_preferences` 
User-specific preferences.

**Categories:** profile, notifications, privacy, appearance

## Usage

```typescript
// Read settings
const { data } = await supabase.from('_app_settings').select('*')

// Read user preferences  
const { data } = await supabase
  .from('_user_preferences')
  .select('*')
  .eq('user_id', user.id)
```

## Format System

```typescript
import { formatSystemNumber, formatSystemDate } from '@/lib/format-utils'

const formatted = formatSystemNumber(1234.56, settings)
const date = formatSystemDate(new Date(), settings.date_format)
```

## Caching

```typescript
const { settings, refreshSettings } = usePreferences()
```