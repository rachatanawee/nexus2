# Contributing Guide

## Development Setup

### Prerequisites
- Node.js 18+ or Bun
- Supabase account
- Git

### Setup
```bash
git clone <repository>
cd nexus-admin
bun install
cp .env.example .env.local
# Configure Supabase credentials
bun dev
```

## Code Standards

### File Structure
Follow Feature-Colocation pattern:
```
feature-name/
├── _components/     # Private UI components
├── _lib/           # Private logic (types, queries, actions)
└── page.tsx        # Route component
```

### Naming Conventions
- **Files:** kebab-case (`user-table.tsx`)
- **Components:** PascalCase (`UserTable`)
- **Functions:** camelCase (`getUserData`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

### TypeScript
- Use strict TypeScript
- Define interfaces for all data structures
- Use proper return types for functions
- Avoid `any` type

```typescript
// Good
interface User {
  id: string
  email: string
  roles: string[]
}

export async function getUsers(): Promise<User[]> {
  // implementation
}

// Bad
export async function getUsers(): Promise<any> {
  // implementation
}
```

## Component Guidelines

### Server Components (Default)
Use for data fetching and static content:
```typescript
export default async function UsersPage() {
  const users = await getUsers()
  return <UserTable data={users} />
}
```

### Client Components
Use 'use client' for interactivity:
```typescript
'use client'

export function UserTable({ data }: { data: User[] }) {
  const [selected, setSelected] = useState<string[]>([])
  // interactive logic
}
```

### Component Props
Use TypeScript interfaces:
```typescript
interface UserTableProps {
  data: User[]
  onSelect?: (ids: string[]) => void
}

export function UserTable({ data, onSelect }: UserTableProps) {
  // component logic
}
```

## Database Guidelines

### Table Naming
- **System tables:** Use `_` prefix (`_app_settings`)
- **Business tables:** No prefix (`products`, `orders`)
- Use singular nouns (`user` not `users`)

### Migrations
Always use Supabase migrations:
```sql
-- migrations/001_create_products.sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin can manage products" ON products FOR ALL USING (auth.user_has_role('admin'));
```

## Security Guidelines

### Authentication
- Always check user authentication in server components
- Use middleware for route protection
- Implement proper session handling

### Authorization
- Implement defense in depth (UI + API + Database)
- Use RLS policies for database-level security
- Check permissions in server actions

### Data Validation
- Validate all inputs on server side
- Use TypeScript for compile-time validation
- Sanitize user inputs

```typescript
// Good
export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const price = Number(formData.get('price'))
  
  if (!name || name.length < 1) {
    return { error: 'Name is required' }
  }
  
  if (!price || price < 0) {
    return { error: 'Price must be positive' }
  }
  
  // Create product
}
```

## Testing

### Unit Tests
Test utility functions and components:
```typescript
// __tests__/permissions.test.ts
import { isAdmin } from '@/lib/permissions'

describe('Permissions', () => {
  it('should return true for admin user', () => {
    const user = { user_metadata: { roles: ['admin'] } }
    expect(isAdmin(user)).toBe(true)
  })
})
```

### Integration Tests
Test API endpoints and user flows:
```typescript
// __tests__/api/users.test.ts
describe('/api/users', () => {
  it('should require admin access', async () => {
    const response = await request('/api/users', { user: normalUser })
    expect(response.status).toBe(403)
  })
})
```

## Git Workflow

### Branch Naming
- `feature/user-management`
- `fix/login-redirect`
- `docs/update-readme`

### Commit Messages
Use conventional commits:
```
feat: add user role management
fix: resolve login redirect issue
docs: update API documentation
refactor: simplify permission checks
```

### Pull Requests
1. Create feature branch from `main`
2. Make changes with tests
3. Update documentation
4. Create PR with description
5. Request review
6. Merge after approval

## Documentation

### Code Comments
- Document complex logic
- Explain business rules
- Add JSDoc for public functions

```typescript
/**
 * Checks if user has admin role
 * @param user - User object from Supabase auth
 * @returns true if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.user_metadata?.roles?.includes('admin') ?? false
}
```

### README Updates
Update README.md when adding:
- New features
- Configuration changes
- Setup requirements

## Performance

### Database Queries
- Use proper indexes
- Avoid N+1 queries
- Use RLS for security, not performance

### Client-Side
- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size

### Caching
- Cache user preferences
- Use React Query for client-side caching
- Implement proper cache invalidation

## Accessibility

### Semantic HTML
Use proper HTML elements:
```tsx
// Good
<button onClick={handleClick}>Submit</button>

// Bad
<div onClick={handleClick}>Submit</div>
```

### ARIA Labels
Add labels for screen readers:
```tsx
<button aria-label="Delete user" onClick={handleDelete}>
  <TrashIcon />
</button>
```

### Keyboard Navigation
Ensure all interactive elements are keyboard accessible.

## Internationalization

### Adding Translations
1. Add keys to `messages/en.json`
2. Add translations to other language files
3. Use in components:

```tsx
import { useTranslations } from 'next-intl'

export function UserTable() {
  const t = useTranslations('users')
  
  return <h1>{t('title')}</h1>
}
```

## Release Process

### Version Bumping
Use semantic versioning:
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

### Changelog
Update CHANGELOG.md with:
- New features
- Bug fixes
- Breaking changes
- Migration notes

### Deployment
1. Test in staging environment
2. Run full test suite
3. Update documentation
4. Deploy to production
5. Monitor for issues

## Getting Help

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Community
- Create GitHub issues for bugs
- Start discussions for feature requests
- Join project Discord/Slack

## Code Review Checklist

### Before Submitting PR
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Proper error handling
- [ ] Security considerations addressed

### Reviewer Checklist
- [ ] Code is readable and maintainable
- [ ] Tests cover new functionality
- [ ] No security vulnerabilities
- [ ] Performance considerations
- [ ] Accessibility compliance
- [ ] Documentation is accurate