# Getting Started Guide

## Quick Setup

### 1. Install Dependencies
```bash
bun install
```

### 2. Configure Supabase
Create project at [supabase.com](https://supabase.com) and update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Setup Database
Run `db/complete_setup.sql` in Supabase SQL Editor.

### 4. Create Admin User
```bash
node setup-admin.js
```

### 5. Run Development
```bash
bun dev
```

## Creating New Features

### Manual Feature Creation

```bash
mkdir -p app/[locale]/(dashboard)/products/_components
mkdir -p app/[locale]/(dashboard)/products/_lib
```

**Structure:**
```
products/
├── _components/
│   └── product-table.tsx
├── _lib/
│   ├── types.ts
│   ├── queries.ts
│   └── actions.ts
└── page.tsx
```

### Using CRUD Generator

```bash
# Generate complete CRUD
bun scripts/generate-crud.js products products

# Generate sub-feature
bun scripts/generate-crud.js inventory/categories categories
```

**Auto-generates:**
- Types from Supabase schema
- Queries and actions
- Table component with sorting/pagination
- Create dialog
- Format integration

## Adding to Navigation

Edit `components/sidebar.tsx`:
```tsx
<Link href={`/${locale}/products`}>
  <Package className="h-5 w-5" />
  {!collapsed && 'Products'}
</Link>
```

## Permissions

### Server Component Protection
```typescript
import { isAdmin } from '@/lib/permissions'

if (!isAdmin(user)) redirect('/dashboard')
```

### Client Component Protection
```tsx
<RoleGuard requiredRoles={['admin']}>
  <AdminPanel />
</RoleGuard>
```

### Database Level (RLS)
```sql
CREATE POLICY "Admin only" ON products 
FOR ALL USING (auth.user_has_role('admin'));
```

## Internationalization

Add translations in `messages/en.json` and `messages/th.json`:
```json
{
  "products": {
    "title": "Products",
    "create": "Create Product"
  }
}
```

## Deployment

### Build
```bash
bun run build
```

### Deploy to Vercel
```bash
vercel
```

Set environment variables in Vercel Dashboard.

## Troubleshooting

**Login Issues:**
- Check middleware.ts routes
- Verify Supabase URL configuration

**Permission Issues:**
- Check user has roles in app_metadata
- Verify RLS policies

**Build Errors:**
```bash
rm -rf .next && bun install && bun run build
```