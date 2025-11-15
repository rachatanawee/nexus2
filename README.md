# Next.js + Supabase Boilerplate

Next.js boilerplate with Supabase authentication, multi-language support (EN/TH), admin dashboard, and route guards.

## Features

- ✅ Next.js 15 with App Router
- ✅ Supabase Authentication with Server Actions
- ✅ Cookie-based JWT storage
- ✅ Multi-language (English/Thai) with next-intl
- ✅ Route Guards (middleware protection)
- ✅ Admin Dashboard Template
- ✅ shadcn/ui Components
- ✅ Tailwind CSS

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
│   │   └── dashboard/      # Protected dashboard
│   ├── layout.tsx          # Locale layout with i18n
│   └── page.tsx            # Root redirect
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
middleware.ts               # Route guard + i18n
```

## Usage

### Authentication
- Login: `/en/login` or `/th/login`
- Dashboard: `/en/dashboard` or `/th/dashboard`
- Automatic redirect if not authenticated

### Language Switching
- English: `/en/*`
- Thai: `/th/*`

### Protected Routes
All `/dashboard` routes require authentication. Middleware automatically redirects to login if not authenticated.
