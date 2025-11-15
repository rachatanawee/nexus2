# Permission System

## Overview
This project uses Supabase `app_metadata` for role-based access control (RBAC).

## Role Structure

Users can have multiple roles stored in `app_metadata.roles` as an array:
```json
{
  "app_metadata": {
    "roles": ["admin", "manager"]
  }
}
```

## Permission Levels

### 1. Screen Level (UI)
Control what users can see in the frontend.

**Server Component:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/permissions'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!isAdmin(user)) {
    return <div>Access Denied</div>
  }
  
  return <div>Admin Content</div>
}
```

**Client Component:**
```typescript
import { RoleGuard } from '@/app/[locale]/(dashboard)/users/_components/role-guard'

<RoleGuard requiredRoles={['admin', 'manager']} fallback={<div>Access Denied</div>}>
  <AdminPanel />
</RoleGuard>
```

### 2. Data Level (RLS)
Control what data users can access using Row Level Security.

**SQL Function:**
```sql
-- Create function to check user roles
CREATE OR REPLACE FUNCTION auth.user_has_role(required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT required_role = ANY(
      COALESCE(
        (auth.jwt() -> 'app_metadata' -> 'roles')::jsonb::text[],
        '{}'::text[]
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example RLS Policy
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (auth.user_has_role('admin'));

CREATE POLICY "Managers can view their team"
ON users FOR SELECT
USING (
  auth.user_has_role('manager') 
  AND team_id = (SELECT team_id FROM users WHERE id = auth.uid())
);
```

## Server Actions

**Update User Roles:**
```typescript
// Only admins can update roles
const formData = new FormData()
formData.append('targetUserId', 'user-id')
formData.append('newRoles', 'admin,manager') // comma-separated

await updateUserRole(prevState, formData)
```

## Helper Functions

```typescript
import { hasRole, hasAnyRole, hasAllRoles, isAdmin } from '@/lib/permissions'

// Check single role
hasRole(user, 'admin') // true/false

// Check any role
hasAnyRole(user, ['admin', 'manager']) // true if has either

// Check all roles
hasAllRoles(user, ['admin', 'manager']) // true if has both

// Shortcuts
isAdmin(user)
isManager(user)
```

## Setting Roles

**Via Supabase Dashboard:**
1. Go to Authentication > Users
2. Click user
3. Edit Raw User Meta Data
4. Add: `{"roles": ["admin"]}`

**Via Admin API:**
```typescript
const supabaseAdmin = createAdminClient(url, serviceRoleKey)
await supabaseAdmin.auth.admin.updateUserById(userId, {
  app_metadata: { roles: ['admin', 'manager'] }
})
```

## Best Practices

✅ Always check permissions on both frontend AND backend
✅ Use RLS for data-level security
✅ Store roles in `app_metadata` (not `user_metadata`)
✅ Use arrays for multiple roles
✅ Create SQL functions for complex permission logic
