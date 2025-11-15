# Project Structure - Feature-Colocation

## Overview
This project uses Feature-Colocation pattern where each feature contains its own UI, logic, and data access.

## Structure

```
app/[locale]/(dashboard)/
├── dashboard/                    # Dashboard overview
├── users/                        # Users feature
│   ├── _components/              # Private components
│   │   ├── user-table.tsx
│   │   └── user-form.tsx
│   ├── _lib/                     # Private logic
│   │   ├── types.ts              # Type definitions
│   │   ├── queries.ts            # Supabase queries
│   │   ├── actions.ts            # Server actions
│   │   └── hooks.ts              # React hooks (optional)
│   ├── page.tsx                  # /users
│   ├── new/
│   │   └── page.tsx              # /users/new
│   ├── [id]/
│   │   ├── page.tsx              # /users/[id]
│   │   └── edit/
│   │       └── page.tsx          # /users/[id]/edit
│   └── layout.tsx
└── inventory/                    # Inventory feature (example)
    ├── _components/
    ├── _lib/
    ├── products/                 # Sub-feature
    │   ├── _components/
    │   ├── _lib/
    │   └── page.tsx
    ├── warehouses/               # Sub-feature
    │   ├── _components/
    │   ├── _lib/
    │   └── page.tsx
    └── page.tsx
```

## File Naming Convention

- `_components/` - Private components (Next.js won't create routes)
- `_lib/` - Private logic and utilities
- `types.ts` - Type definitions
- `queries.ts` - Server-side data fetching (Supabase)
- `actions.ts` - Server actions (mutations)
- `hooks.ts` - React hooks (client-side)

## Adding New Feature

1. Create feature folder: `app/[locale]/(dashboard)/feature-name/`
2. Add structure:
   ```
   feature-name/
   ├── _components/
   ├── _lib/
   │   ├── types.ts
   │   ├── queries.ts
   │   └── actions.ts
   └── page.tsx
   ```
3. Add route to sidebar
4. Add translations to messages/

## Benefits

✅ Everything for a feature is in one place
✅ Easy to delete/move features
✅ Clear boundaries between features
✅ No jumping between folders
✅ Easy to understand for new developers
