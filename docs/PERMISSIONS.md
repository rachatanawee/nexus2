# Permissions & RBAC Documentation

## Overview

The system implements Role-Based Access Control (RBAC) with multiple roles per user stored in Supabase Auth metadata.

## Role System

### Available Roles
- `admin` - Full system access
- `manager` - Limited admin access
- `user` - Basic user access

### Role Storage
Roles are stored in `auth.users.user_metadata.roles` as an array:
```json
{
  "roles": ["admin", "manager"]
}
```

## Permission Helpers

### Server-side Checks
```typescript
import { isAdmin, hasAnyRole, hasAllRoles } from '@/lib/permissions'

// Check single role
if (isAdmin(user)) {
  // Admin only logic
}

// Check any role
if (hasAnyRole(user, ['admin', 'manager'])) {
  // Admin or manager logic
}

// Check all roles
if (hasAllRoles(user, ['admin', 'manager'])) {
  // Must have both roles
}
```

### Client-side Protection
```tsx
import { RoleGuard } from '@/app/[locale]/(dashboard)/users/_components/role-guard'

<RoleGuard requiredRoles={['admin']} fallback={<div>Access Denied</div>}>
  <AdminPanel />
</RoleGuard>
```

## Implementation Levels

### 1. Route Level (Server Components)
```typescript
export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!isAdmin(user)) {
    redirect('/dashboard')
  }
  
  return <AdminContent />
}
```

### 2. Component Level (Client Components)
```tsx
'use client'

export function DeleteButton() {
  const { user } = useUser()
  
  if (!isAdmin(user)) return null
  
  return <Button>Delete</Button>
}
```

### 3. Server Action Level
```typescript
'use server'

export async function deleteUser(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!isAdmin(user)) {
    return { error: 'Unauthorized' }
  }
  
  // Delete logic
}
```

### 4. Database Level (RLS)
```sql
-- Create helper function
CREATE OR REPLACE FUNCTION auth.user_has_role(required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT required_role = ANY(
      COALESCE(
        (auth.jwt() -> 'user_metadata' -> 'roles')::jsonb::text[],
        '{}'::text[]
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Use in policies
CREATE POLICY "Admin only" ON products 
FOR ALL USING (auth.user_has_role('admin'));

CREATE POLICY "Admin and Manager" ON orders 
FOR ALL USING (
  auth.user_has_role('admin') OR 
  auth.user_has_role('manager')
);
```

## User Management

### Assigning Roles
```typescript
// Via Supabase Dashboard
// Authentication → Users → Select user → Edit Raw User Meta Data
{
  "roles": ["admin"]
}

// Via API (admin only)
await supabase.auth.admin.updateUserById(userId, {
  user_metadata: { roles: ['admin', 'manager'] }
})
```

### Role Dialog Component
```tsx
import { RoleDialog } from '@/app/[locale]/(dashboard)/users/_components/role-dialog'

<RoleDialog
  open={open}
  onOpenChange={setOpen}
  user={user}
/>
```

## Middleware Protection

Routes are protected in `middleware.ts`:
```typescript
export default async function middleware(request: NextRequest) {
  const { supabase, response } = createServerClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  // Protect admin routes
  if (request.nextUrl.pathname.includes('/admin') && !isAdmin(user)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}
```

## Best Practices

### 1. Defense in Depth
Always implement permissions at multiple levels:
- UI level (hide/show components)
- Route level (redirect unauthorized users)
- API level (validate in server actions)
- Database level (RLS policies)

### 2. Fail Secure
Default to denying access:
```typescript
// Good
if (isAdmin(user)) {
  return <AdminPanel />
}
return <AccessDenied />

// Bad
if (!isAdmin(user)) {
  return <AccessDenied />
}
return <AdminPanel />
```

### 3. Consistent Checks
Use the same permission logic across all layers:
```typescript
// Define once
export const canDeleteUser = (user: User) => isAdmin(user)

// Use everywhere
if (canDeleteUser(user)) { /* ... */ }
```

### 4. Audit Trail
Log permission checks for security auditing:
```typescript
export function isAdmin(user: User | null): boolean {
  const hasAccess = user?.user_metadata?.roles?.includes('admin') ?? false
  
  // Log access attempts
  console.log(`Admin check for ${user?.email}: ${hasAccess}`)
  
  return hasAccess
}
```

## Common Patterns

### Multi-role Requirements
```typescript
// User needs ANY of these roles
const canAccess = hasAnyRole(user, ['admin', 'manager'])

// User needs ALL of these roles
const canAccess = hasAllRoles(user, ['admin', 'billing'])
```

### Conditional Rendering
```tsx
{isAdmin(user) && <AdminButton />}
{hasAnyRole(user, ['admin', 'manager']) && <ManagerButton />}
```

### Route Groups
```typescript
// Protect entire route groups
const adminRoutes = ['/users', '/settings', '/admin']
const managerRoutes = ['/reports', '/analytics']

if (adminRoutes.some(route => pathname.startsWith(route))) {
  if (!isAdmin(user)) redirect('/dashboard')
}
```

## Testing Permissions

### Unit Tests
```typescript
describe('Permissions', () => {
  it('should allow admin access', () => {
    const user = { user_metadata: { roles: ['admin'] } }
    expect(isAdmin(user)).toBe(true)
  })
  
  it('should deny non-admin access', () => {
    const user = { user_metadata: { roles: ['user'] } }
    expect(isAdmin(user)).toBe(false)
  })
})
```

### Integration Tests
```typescript
// Test protected routes
it('should redirect non-admin from /users', async () => {
  const response = await request('/users', { user: normalUser })
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe('/dashboard')
})
```

## Troubleshooting

### User Can't Access Protected Route
1. Check user has correct roles in Supabase Dashboard
2. Verify middleware is running
3. Check RLS policies are correct
4. Ensure JWT contains user_metadata

### RLS Policy Not Working
1. Enable RLS on table: `ALTER TABLE products ENABLE ROW LEVEL SECURITY;`
2. Check policy syntax
3. Test with service role key
4. Verify auth.user_has_role function exists

### Permission Helper Returns Wrong Result
1. Check user object structure
2. Verify roles array format
3. Test with console.log debugging
4. Check for null/undefined values