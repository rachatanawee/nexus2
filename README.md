# Next.js + Supabase Boilerplate (Monolith Architecture)

Production-ready Next.js boilerplate with Supabase authentication, role-based access control, multi-language support, and admin dashboard using Feature-Colocation pattern.

## Features

- ✅ **Next.js 16** with App Router
- ✅ **Supabase Auth** with Server Actions & Cookie-based session
- ✅ **Role-Based Access Control (RBAC)** - Multiple roles per user
- ✅ **Multi-language** (EN/TH) with next-intl
- ✅ **Route Guards** (Middleware protection)
- ✅ **Admin Dashboard** with collapsible sidebar & submenu
- ✅ **User Management** - Full CRUD with role assignment
- ✅ **DataTable** - TanStack Table v8 with advanced features
  - Column sorting, resizing, visibility toggle
  - Sticky headers, row selection, faceted filters
  - Search with reset, export to Excel
  - Advanced pagination (page size, first/last)
- ✅ **CRUD Generator** - Auto-generate from Supabase schema
- ✅ **App Settings & User Preferences** - Configurable system
- ✅ **Format System** - Number/Date formatting with caching
- ✅ **Profile Management** - User profiles with preferences
- ✅ **System Tables** - Organized with "_" prefix
- ✅ **PDF Reports** - React-PDF with shared components
- ✅ **shadcn/ui Components**
- ✅ **Tailwind CSS**
- ✅ **Feature-Colocation** - Monolith architecture pattern

## Architecture: Monolith with Feature-Colocation

This boilerplate uses **Feature-Colocation** pattern where each feature contains its own UI, logic, and data access in one place.

### Why Monolith?
- ✅ Simple deployment (single app)
- ✅ Easy to develop and maintain
- ✅ No network overhead between services
- ✅ Perfect for small to medium projects
- ✅ Can scale vertically

### Feature-Colocation Structure
```
app/[locale]/(dashboard)/
├── users/                    # User Management Feature
│   ├── _components/          # Private UI components
│   │   ├── user-table.tsx
│   │   ├── role-dialog.tsx
│   │   └── create-user-dialog.tsx
│   ├── _lib/                 # Private logic
│   │   ├── types.ts          # Type definitions
│   │   ├── queries.ts        # Data fetching (Supabase)
│   │   └── actions.ts        # Server actions (mutations)
│   └── page.tsx              # Route: /users
│
├── inventory/                # Inventory Feature
│   ├── _components/
│   ├── _lib/
│   │   └── types.ts          # Shared types for sub-features
│   ├── products/             # Sub-feature
│   │   ├── _components/
│   │   ├── _lib/
│   │   └── page.tsx          # Route: /inventory/products
│   ├── warehouses/           # Sub-feature
│   │   ├── _components/
│   │   ├── _lib/
│   │   └── page.tsx          # Route: /inventory/warehouses
│   └── page.tsx              # Route: /inventory
```

### Benefits
- **Everything in one place** - No jumping between folders
- **Easy to delete** - Remove entire feature by deleting folder
- **Clear boundaries** - Each feature is independent
- **Easy to understand** - New developers can navigate easily

## Setup

### 1. Install Dependencies
```bash
bun install
```

### 2. Configure Supabase
Create a project at [supabase.com](https://supabase.com) and update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Setup Database
Run the complete database setup:
```bash
# Run in Supabase SQL Editor
# This creates system tables and default data
```
Copy and run `db/complete_setup.sql` in Supabase SQL Editor.

### 4. Setup Admin User
Run the setup script to create your first admin:
```bash
node setup-admin.js
```

Or manually via Supabase Dashboard:
1. Authentication → Users → Select user
2. Edit **Raw User Meta Data**:
```json
{
  "roles": ["admin"]
}
```

### 5. Run Development Server
```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/[locale]/(dashboard)/
├── dashboard/              # Dashboard overview
├── users/                  # User management (CRUD + roles)
│   ├── _components/
│   ├── _lib/
│   └── page.tsx
├── inventory/              # Inventory management
│   ├── products/
│   ├── warehouses/
│   └── page.tsx
└── layout.tsx

components/
├── ui/                     # shadcn/ui components
│   └── data-table.tsx      # TanStack Table v8 wrapper
├── sidebar.tsx             # Collapsible sidebar with submenu
└── dashboard-layout.tsx    # Dashboard wrapper

lib/
├── actions/
│   └── auth.ts             # Auth server actions
├── supabase/
│   ├── client.ts           # Browser client
│   ├── server.ts           # Server client
│   └── middleware.ts       # Auth middleware
├── permissions.ts          # RBAC helpers
└── utils.ts

messages/
├── en.json                 # English translations
└── th.json                 # Thai translations

middleware.ts               # Route guard + i18n
```

## Usage

### Authentication
- **Login:** `/en/login` or `/th/login`
- **Dashboard:** `/en/dashboard` or `/th/dashboard`
- Auto-redirect if not authenticated

### User Management (Admin Only)
- **View Users:** `/en/users`
- **Create User:** Click "Create User" button
- **Manage Roles:** Click "Manage Roles" on any user
- **Delete User:** Click trash icon

### Role-Based Access Control
Users can have multiple roles: `admin`, `manager`, `user`

**Check permissions in code:**
```typescript
import { isAdmin, hasAnyRole } from '@/lib/permissions'

// Server Component
const user = await supabase.auth.getUser()
if (!isAdmin(user)) redirect('/dashboard')

// Client Component
<RoleGuard requiredRoles={['admin', 'manager']}>
  <AdminPanel />
</RoleGuard>
```

**Row Level Security (RLS):**
```sql
CREATE POLICY "Admins only"
ON products FOR ALL
USING (auth.user_has_role('admin'));
```

See [PERMISSIONS.md](PERMISSIONS.md) for details.

### Inventory Management
- **Overview:** `/en/inventory`
- **Products:** `/en/inventory/products`
- **Warehouses:** `/en/inventory/warehouses`

### Language Switching
- Click language button in sidebar (EN/ไทย)
- Or navigate to `/en/*` or `/th/*`

### Dashboard Features
- **Collapsible Sidebar** - Click chevron to collapse
- **Submenu** - Click Inventory to expand/collapse
- **Active Highlighting** - Current page highlighted
- **Language Switcher** - Switch between EN/TH
- **Profile Access** - User profile and preferences
- **Settings Access** - App settings (admin only)
- **Logout** - Secure logout with session cleanup

## CRUD Generator

Automatically generate full CRUD features from Supabase tables.

### Quick Start

```bash
# 1. Create table in Supabase
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

# 2. Generate CRUD
bun scripts/generate-crud.js products products

# 3. For sub-features (e.g., inventory/categories)
bun scripts/generate-crud.js inventory/categories categories
```

### What Gets Generated

The script automatically creates:
- ✅ **Types** - TypeScript interfaces from schema
- ✅ **Queries** - Server-side data fetching
- ✅ **Actions** - Create & delete server actions
- ✅ **Columns** - Column definitions with sorting and formatting
- ✅ **Table Component** - Using modern DataTable with all features
- ✅ **Create Dialog** - Form with all fields
- ✅ **Page** - Complete route with auth guard

### Features

- **Auto-detect fields** - Reads schema from Supabase OpenAPI
- **Type inference** - Converts SQL types to TypeScript
- **Required validation** - Based on NOT NULL constraints
- **Export to Excel** - Built-in export functionality
- **Admin-only** - Includes permission checks

### Next Steps After Generation

1. **Add to Sidebar** - Edit `components/sidebar.tsx`
2. **Add Translations** - Edit `messages/en.json` and `messages/th.json`
3. **Customize** - Modify generated files as needed

### Format Integration
Generated tables automatically use system format preferences:
- **Number Formatting** - Locale, decimals, thousands separator
- **Date Formatting** - MM/dd/yyyy, dd/MM/yyyy, yyyy-MM-dd
- **Caching** - Preferences cached for performance

### Example: Inventory System

```bash
# Generate all inventory features
bun scripts/generate-crud.js inventory/categories categories
bun scripts/generate-crud.js inventory/products products
bun scripts/generate-crud.js inventory/warehouses warehouses
bun scripts/generate-crud.js inventory/suppliers suppliers
```

See [docs/CRUD-GENERATOR.md](docs/CRUD-GENERATOR.md) for detailed guide.

## Adding New Features Manually

### 1. Create Feature Folder
```bash
mkdir -p app/[locale]/(dashboard)/feature-name/_components
mkdir -p app/[locale]/(dashboard)/feature-name/_lib
```

### 2. Add Files
```
feature-name/
├── _components/
│   └── feature-table.tsx
├── _lib/
│   ├── types.ts
│   ├── queries.ts
│   └── actions.ts
└── page.tsx
```

### 3. Add to Sidebar
Edit `components/sidebar.tsx`:
```tsx
<Link href={`/${locale}/feature-name`}>
  <Icon className="h-5 w-5" />
  {!collapsed && 'Feature Name'}
</Link>
```

### 4. Add Translations
Edit `messages/en.json` and `messages/th.json`

See [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) for detailed guide.

## System Features

### App Settings & User Preferences
- **Global Settings** - Configure app title, theme, formats
- **User Preferences** - Personal settings per user
- **Format System** - Number/date formatting with caching
- **Access Control** - Admin settings vs user preferences

See [docs/APP-SETTINGS.md](docs/APP-SETTINGS.md) for details.

### Profile Management
- **Profile Information** - Full name, phone, bio (stored in auth.users.user_metadata)
- **Personal Preferences** - Theme, language, notifications
- **Settings Integration** - Uses system format preferences
- **Route:** `/profile`

### System Tables
- **Organized Structure** - System tables use `_` prefix
- **Clear Separation** - System vs business data
- **Security** - Proper RLS policies
- **Examples:** `_app_settings`, `_user_preferences`

See [docs/SYSTEM-TABLES.md](docs/SYSTEM-TABLES.md) for details.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database & Auth:** Supabase (PostgreSQL + Auth)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Tables:** TanStack Table
- **i18n:** next-intl
- **Language:** TypeScript
- **Package Manager:** Bun

## Documentation

- [docs/GUIDE.md](docs/GUIDE.md) - Complete guide
- [docs/CRUD-GENERATOR.md](docs/CRUD-GENERATOR.md) - CRUD generator documentation
- [docs/PERMISSIONS.md](docs/PERMISSIONS.md) - RBAC implementation
- [docs/CODING-STANDARDS.md](docs/CODING-STANDARDS.md) - Code style guide
- [docs/DOCKER-DEPLOYMENT.md](docs/DOCKER-DEPLOYMENT.md) - Docker deployment
- [docs/SETUP-ADMIN.md](docs/SETUP-ADMIN.md) - Admin setup guide
- [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) - Contributing guidelines
- [docs/CHANGELOG.md](docs/CHANGELOG.md) - Version history
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

## License

MIT
