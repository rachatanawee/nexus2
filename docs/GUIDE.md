# Complete Guide

## Quick Setup

```bash
# 1. Install
bun install

# 2. Configure .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# 3. Run db/complete_setup.sql in Supabase SQL Editor

# 4. Create admin
node setup-admin.js

# 5. Start
bun dev
```

## CRUD Generator

```bash
# Generate feature
bun scripts/generate-crud.js products products

# Generate sub-feature
bun scripts/generate-crud.js inventory/categories categories
```

Auto-generates: types, queries, actions, table, dialog, format integration

## Add to Sidebar

Edit `components/sidebar.tsx`:
```tsx
<Link href={`/${locale}/products`}>
  <Package className="h-5 w-5" />
  {!collapsed && 'Products'}
</Link>
```

## Permissions

**Server:**
```typescript
import { isAdmin } from '@/lib/permissions'
if (!isAdmin(user)) redirect('/dashboard')
```

**Client:**
```tsx
<RoleGuard requiredRoles={['admin']}>
  <AdminPanel />
</RoleGuard>
```

**Database (RLS):**
```sql
CREATE POLICY "Admin only" ON products 
FOR ALL USING (auth.user_has_role('admin'));
```

## Settings & Preferences

**App Settings** (`_app_settings`) - Global, admin-only  
**User Preferences** (`_user_preferences`) - Per-user

```typescript
// Format numbers
import { formatSystemNumber } from '@/lib/format-utils'
formatSystemNumber(1234.56, settings) // "1,234.56"

// Format dates
import { formatSystemDate } from '@/lib/format-utils'
formatSystemDate(new Date(), 'MM/dd/yyyy') // "12/25/2024"

// Use cached preferences
const { settings, refreshSettings } = usePreferences()
```

## Internationalization

Add to `messages/en.json` and `messages/th.json`:
```json
{
  "products": {
    "title": "Products"
  }
}
```

## PDF Reports

**Generate PDF:**
```typescript
import { generatePDF } from '@/lib/pdf'
import { ProductListPDF } from '../../reports/product-list-pdf'

await generatePDF(
  <ProductListPDF products={data} generatedBy={user} />,
  'products.pdf'
)
```

**Shared components:** PDFHeader, PDFTable, PDFFooter  
**Location:** `lib/pdf/` (shared), `[feature]/reports/` (templates)  
**Features:** Fixed headers, custom styles, multi-page support

## Deployment

**Vercel:**
```bash
vercel
```

**Docker:**
```bash
docker-compose up -d
```

Set environment variables in platform dashboard.

## Troubleshooting

**Login issues:** Check middleware.ts and Supabase URL  
**Permission issues:** Verify user roles in app_metadata and RLS policies  
**Build errors:** `rm -rf .next && bun install && bun run build`
