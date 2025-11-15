# Next.js + Supabase Boilerplate

Next.js boilerplate with Supabase authentication, multi-language support (EN/TH), admin dashboard, and route guards.

## Features

- ✅ Next.js 16 with App Router
- ✅ Supabase Authentication with Server Actions
- ✅ Cookie-based JWT storage
- ✅ Multi-language (English/Thai) with next-intl
- ✅ Route Guards (proxy.ts protection)
- ✅ Admin Dashboard with Collapsible Sidebar
- ✅ TanStack Table (sorting, pagination)
- ✅ shadcn/ui Components
- ✅ Tailwind CSS v4
- ✅ Language Switcher

## Setup

1. Install dependencies:
```bash
bun install
```

2. Configure Supabase:
   - Create a project at [supabase.com](https://supabase.com)
   - Update `.env.local` with your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run development server:
```bash
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Structure

```
app/
├── [locale]/
│   ├── (auth)/
│   │   └── login/          # Login page
│   ├── (dashboard)/
│   │   ├── dashboard/      # Protected dashboard
│   │   └── users/          # Users page with table
│   ├── layout.tsx          # Locale layout with i18n
│   └── page.tsx            # Root redirect
components/
├── ui/                     # shadcn/ui components
├── sidebar.tsx             # Collapsible sidebar
├── dashboard-layout.tsx    # Dashboard wrapper
└── data-table.tsx          # TanStack Table component
lib/
├── actions/
│   └── auth.ts             # Server actions (login/logout)
├── supabase/
│   ├── client.ts           # Browser client
│   ├── server.ts           # Server client
│   └── middleware.ts       # Auth middleware
└── utils.ts                # Utilities
messages/
├── en.json                 # English translations
└── th.json                 # Thai translations
proxy.ts                    # Route guard + i18n (Next.js 16)
```

## Usage

### Authentication
- Login: `/en/login` or `/th/login`
- Dashboard: `/en/dashboard` or `/th/dashboard`
- Users: `/en/users` or `/th/users`
- Automatic redirect if not authenticated

### Language Switching
- Click language button in sidebar (EN/ไทย)
- Or navigate to `/en/*` or `/th/*`

### Dashboard Features
- Collapsible sidebar (click chevron icon)
- Navigation menu (Overview, Users, Settings)
- Language switcher
- Logout button

### Data Table
- TanStack Table with sorting
- Pagination controls
- Example implementation in `/users` page

### Protected Routes
All `/dashboard` routes require authentication. Proxy automatically redirects to login if not authenticated.
