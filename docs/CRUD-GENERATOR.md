# CRUD Generator Documentation

## Quick Start

```bash
# Generate CRUD for a table
bun scripts/generate-crud.js products products

# Generate sub-feature
bun scripts/generate-crud.js inventory/categories categories
```

## What Gets Generated

- **Types** - TypeScript interfaces from schema
- **Queries** - Server-side data fetching  
- **Actions** - Create & delete server actions
- **Table Component** - With sorting, search, pagination, export
- **Create Dialog** - Form with all fields
- **Page** - Complete route with auth guard
- **Format Utils** - Number/date formatting

## Features

- Auto-detect fields from Supabase OpenAPI
- Type inference (SQL → TypeScript)
- Required validation from NOT NULL constraints
- Export to Excel functionality
- Admin-only permissions
- System format preferences integration

## Fallback Schema

If target table not found, generator tries:
1. `_user_preferences` schema
2. General settings schema  
3. Default name field

## Generated Structure

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

## Post-Generation Steps

1. Add to sidebar (`components/sidebar.tsx`)
2. Add translations (`messages/en.json`, `messages/th.json`)
3. Customize generated files as needed

## Format Integration

Generated tables automatically use system preferences:

```typescript
// Auto-generated format usage
const formatSettings = useFormatSettings()
cell: ({ row }) => formatDate(new Date(row.original.created_at), formatSettings)
```