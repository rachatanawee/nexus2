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
- ✅ **TanStack Table** - Sorting, pagination, filtering
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

### 3. Setup Admin User
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

### 4. Run Development Server
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
├── sidebar.tsx             # Collapsible sidebar with submenu
├── dashboard-layout.tsx    # Dashboard wrapper
└── data-table.tsx          # TanStack Table

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
- **Logout** - Secure logout with session cleanup

## Adding New Features

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

See [STRUCTURE.md](STRUCTURE.md) for detailed guide.

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

- [STRUCTURE.md](STRUCTURE.md) - Project structure guide
- [PERMISSIONS.md](PERMISSIONS.md) - RBAC implementation
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

## License

MIT
