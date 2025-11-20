# Coding Standards & Guidelines

## Architecture Principles

### Feature-Colocation Pattern
```
app/[locale]/(dashboard)/feature-name/
├── _components/          # Private UI components
├── _lib/                 # Private logic & data
│   ├── types.ts         # Type definitions
│   ├── queries.ts       # Data fetching
│   ├── actions.ts       # Server actions
│   └── format.ts        # Format utilities
└── page.tsx             # Route component
```

### System Tables Convention
- **Prefix**: Use `_` for system tables (`_app_settings`, `_user_preferences`)
- **Separation**: Clear distinction between system and business data
- **Security**: Proper RLS policies for each table

## Permission & Security

### Multi-Level Security
```typescript
// 1. Proxy-level (Route Guard)
if (isUsersPage && (!user || !isAdmin(user))) {
  return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
}

// 2. Database-level (RLS)
CREATE POLICY "Users can read" ON table_name FOR SELECT 
USING (has_role('user') OR has_role('manager') OR has_role('admin'));

// 3. UI-level (Conditional Rendering)
{userIsAdmin && <AdminOnlyComponent />}
```

### Permission Checks
- **NO server-side checks in page components** - Use proxy.ts only
- **Use RLS policies** for database-level security
- **Client-side checks** for UI visibility only

## Component Structure

### Page Components
```typescript
// ✅ Correct - Clean page component
export default async function FeaturePage() {
  const { data: items } = await getFeatures()
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Features</h1>
      <FeatureTable data={items || []} totalItems={items?.length || 0} />
    </div>
  )
}

// ❌ Wrong - Permission checks cause hooks errors
export default async function FeaturePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !isAdmin(user)) {
    redirect('/dashboard') // Causes hooks error
  }
  // ...
}
```

### Server Actions
```typescript
// ✅ Correct - Let RLS handle permissions
export async function createFeature(prevState: FormState, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  if (!name) return { success: false, message: 'Name is required' }
  
  const { error } = await supabase.from('features').insert({ name })
  if (error) return { success: false, message: error.message }
  
  revalidatePath('/features')
  return { success: true, message: 'Feature created successfully' }
}
```

## Format System

### Use Preferences Context
```typescript
// ✅ Correct - Use context to prevent flickering
import { usePreferences } from '@/lib/preferences-context'

export function useFormatSettings() {
  const { settings } = usePreferences()
  return settings
}

// ❌ Wrong - Causes flickering
export function useFormatSettings() {
  const [settings, setSettings] = useState<any>({})
  useEffect(() => {
    getSystemFormatSettings().then(setSettings)
  }, [])
  return settings
}
```

### Format Functions
```typescript
export function formatDate(date: Date, settings?: any) {
  const dateFormat = settings?.date_format || 'dd-MM-yyyy' // Always provide fallback
  return formatSystemDate(date, dateFormat)
}
```

## Data Fetching

### Queries Pattern
```typescript
// queries.ts
export async function getFeatures() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('features')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return { data: null, error }
  return { data: data as Feature[], error: null }
}
```

### Error Handling
```typescript
// ✅ Return structured response
return { data: null, error }
return { data: items, error: null }

// ❌ Don't throw errors in queries
throw new Error('Failed to fetch')
```

## TypeScript Standards

### Type Definitions
```typescript
// types.ts
export type Feature = {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  [key: string]: unknown // Allow additional properties
}

export type FeatureInsert = Omit<Feature, 'id' | 'created_at' | 'updated_at'>
export type FeatureUpdate = Partial<FeatureInsert>
```

### Import Organization
```typescript
// 1. React/Next.js imports
import { useState } from 'react'
import { NextRequest } from 'next/server'

// 2. Third-party libraries
import { createClient } from '@supabase/supabase-js'

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format-utils'

// 4. Relative imports
import { FeatureTable } from './_components/feature-table'
import { getFeatures } from './_lib/queries'
```

## UI Components

### Table Components
```typescript
// Use DataTable with proper configuration
<DataTable
  getColumns={getColumns}
  fetchDataFn={fetchData}
  exportConfig={{
    entityName: 'features',
    columnMapping: { name: 'Name', description: 'Description' },
    columnWidths: [{ wch: 20 }, { wch: 30 }],
    headers: ['Name', 'Description']
  }}
  idField="id"
  config={{
    enableRowSelection: false,
    enableToolbar: true,
    enablePagination: true,
    enableSearch: true,
    enableDateFilter: false,
    enableExport: true,
    enableColumnVisibility: true
  }}
/>
```

### Dialog Components
```typescript
// Use useActionState for form handling
const [state, formAction] = useActionState(createFeature, { success: false, message: '' })

useEffect(() => {
  if (state.success) {
    toast.success(state.message)
    onOpenChange(false)
    window.location.reload()
  } else if (state.message) {
    toast.error(state.message)
  }
}, [state, onOpenChange])
```

## File Naming

### Conventions
- **Components**: `kebab-case.tsx` (`user-table.tsx`)
- **Types**: `types.ts`
- **Queries**: `queries.ts`
- **Actions**: `actions.ts`
- **Utils**: `format.ts`, `utils.ts`
- **Pages**: `page.tsx`

### Folder Structure
```
feature-name/
├── _components/
│   ├── feature-table.tsx
│   └── create-feature-dialog.tsx
├── _lib/
│   ├── types.ts
│   ├── queries.ts
│   ├── actions.ts
│   └── format.ts
└── page.tsx
```

## Database Patterns

### RLS Policies
```sql
-- Read permissions
CREATE POLICY "Users can read features" ON features FOR SELECT 
USING (has_role('user') OR has_role('manager') OR has_role('admin'));

-- Write permissions
CREATE POLICY "Managers can write features" ON features FOR ALL 
USING (has_role('manager') OR has_role('admin'));
```

### Table Structure
```sql
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Error Prevention

### Common Pitfalls
1. **Hooks Error**: Never use permission checks in page components
2. **Flickering**: Always use context for shared state
3. **Undefined Formats**: Always provide fallback values
4. **Missing RLS**: Every table needs proper policies

### Best Practices
1. **Proxy handles routing** - All permission redirects
2. **RLS handles data** - Database-level security
3. **Context handles state** - Shared preferences/settings
4. **Fallbacks handle errors** - Default values everywhere

## Testing Guidelines

### Component Testing
```typescript
// Test with proper providers
<PreferencesProvider>
  <SettingsProvider>
    <FeatureTable data={mockData} totalItems={5} />
  </SettingsProvider>
</PreferencesProvider>
```

### Integration Testing
- Test permission flows through proxy
- Test RLS policies with different roles
- Test format system with various settings

## Performance

### Optimization Rules
1. **Cache preferences** in context
2. **Batch database queries** when possible
3. **Use proper indexes** on frequently queried columns
4. **Minimize re-renders** with proper dependencies

### Monitoring
- Watch for unnecessary re-renders
- Monitor database query performance
- Track format system cache hits

---

**Remember**: This architecture prioritizes simplicity, security, and maintainability. When in doubt, follow the existing patterns in the codebase.