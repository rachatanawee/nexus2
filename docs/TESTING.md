# Testing Guide

Complete testing setup with Jest, React Testing Library, and Playwright for unit, integration, and E2E testing.

## Setup

### Dependencies
```bash
# Testing dependencies (already included)
bun add -d jest @testing-library/react @testing-library/jest-dom
bun add -d @playwright/test
bun add -d jest-environment-jsdom
```

### Configuration Files

**jest.config.js:**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

**jest.setup.js:**
```javascript
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/en/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}))
```

**playwright.config.ts:**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'bun dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Unit Testing (Jest + RTL)

### Component Testing

**Example: Sidebar Component**
```typescript
// __tests__/components/sidebar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '@/components/sidebar'

const mockProps = {
  collapsed: false,
  onToggle: jest.fn(),
  locale: 'en' as const,
}

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders navigation items when expanded', () => {
    render(<Sidebar {...mockProps} />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Inventory')).toBeInTheDocument()
  })

  it('hides text when collapsed', () => {
    render(<Sidebar {...mockProps} collapsed={true} />)
    
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('calls onToggle when collapse button is clicked', () => {
    render(<Sidebar {...mockProps} />)
    
    const toggleButton = screen.getByRole('button', { name: /toggle/i })
    fireEvent.click(toggleButton)
    
    expect(mockProps.onToggle).toHaveBeenCalledTimes(1)
  })
})
```

**Example: DataTable Component**
```typescript
// __tests__/components/ui/data-table.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable } from '@/components/ui/data-table'
import { createColumnHelper } from '@tanstack/react-table'

const data = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
]

const columnHelper = createColumnHelper<typeof data[0]>()
const columns = [
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('email', { header: 'Email' }),
]

describe('DataTable', () => {
  it('renders table with data', () => {
    render(<DataTable data={data} columns={columns} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('filters data when search is used', () => {
    render(<DataTable data={data} columns={columns} />)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'John' } })
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })
})
```

### Utility Testing

**Example: Permissions**
```typescript
// __tests__/lib/permissions.test.ts
import { isAdmin, hasAnyRole, hasAllRoles } from '@/lib/permissions'

const mockUser = {
  user: {
    user_metadata: {
      roles: ['admin', 'manager']
    }
  }
}

describe('Permissions', () => {
  describe('isAdmin', () => {
    it('returns true for admin user', () => {
      expect(isAdmin(mockUser)).toBe(true)
    })

    it('returns false for non-admin user', () => {
      const user = {
        user: {
          user_metadata: { roles: ['user'] }
        }
      }
      expect(isAdmin(user)).toBe(false)
    })
  })

  describe('hasAnyRole', () => {
    it('returns true when user has any of the required roles', () => {
      expect(hasAnyRole(mockUser, ['admin', 'user'])).toBe(true)
    })

    it('returns false when user has none of the required roles', () => {
      expect(hasAnyRole(mockUser, ['user', 'guest'])).toBe(false)
    })
  })
})
```

### Server Action Testing

**Example: Auth Actions**
```typescript
// __tests__/lib/actions/auth.test.ts
import { signIn, signOut } from '@/lib/actions/auth'
import { supabase } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server')

describe('Auth Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signIn', () => {
    it('calls supabase auth with correct credentials', async () => {
      const mockSignIn = jest.fn().mockResolvedValue({ error: null })
      ;(supabase.auth.signInWithPassword as jest.Mock) = mockSignIn

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')

      await signIn(formData)

      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })
})
```

## E2E Testing (Playwright)

### Authentication Tests

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/en/login')

    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/en/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/en/login')

    await page.fill('[name="email"]', 'invalid@example.com')
    await page.fill('[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('[role="alert"]')).toContainText('Invalid credentials')
  })

  test('redirects to login when accessing protected route', async ({ page }) => {
    await page.goto('/en/dashboard')
    await expect(page).toHaveURL('/en/login')
  })
})
```

### Dashboard Tests

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/en/login')
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/en/dashboard')
  })

  test('displays sidebar navigation', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Users')).toBeVisible()
    await expect(page.getByText('Inventory')).toBeVisible()
  })

  test('can collapse and expand sidebar', async ({ page }) => {
    const sidebar = page.locator('nav')
    const toggleButton = page.getByRole('button', { name: /toggle/i })

    // Collapse sidebar
    await toggleButton.click()
    await expect(sidebar).toHaveClass(/collapsed/)

    // Expand sidebar
    await toggleButton.click()
    await expect(sidebar).not.toHaveClass(/collapsed/)
  })

  test('can switch language', async ({ page }) => {
    await page.getByText('ไทย').click()
    await expect(page).toHaveURL('/th/dashboard')
    await expect(page.locator('h1')).toContainText('แดชบอร์ด')
  })
})
```

### User Management Tests

```typescript
// e2e/users.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/en/login')
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.goto('/en/users')
  })

  test('displays users table', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible()
    await expect(page.getByText('Email')).toBeVisible()
    await expect(page.getByText('Roles')).toBeVisible()
  })

  test('can create new user', async ({ page }) => {
    await page.getByText('Create User').click()
    
    await page.fill('[name="email"]', 'newuser@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.fill('[name="full_name"]', 'New User')
    await page.check('[value="user"]')
    
    await page.getByText('Create').click()
    
    await expect(page.getByText('newuser@example.com')).toBeVisible()
  })

  test('can search users', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill('admin')
    
    await expect(page.getByText('admin@example.com')).toBeVisible()
  })
})
```

## Test Commands

### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:codegen": "playwright codegen localhost:3000"
  }
}
```

### Running Tests

```bash
# Unit tests
bun test                    # Run all unit tests
bun test:watch             # Watch mode
bun test:coverage          # With coverage report

# E2E tests
bun test:e2e               # Run all E2E tests
bun test:e2e:ui            # Run with Playwright UI
bun test:e2e --headed      # Run with browser visible

# Specific tests
bun test sidebar           # Run tests matching "sidebar"
bun test:e2e auth.spec.ts  # Run specific E2E test file
```

## Best Practices

### Unit Testing
- Test component behavior, not implementation
- Mock external dependencies (Supabase, Next.js)
- Use descriptive test names
- Group related tests with `describe`
- Clean up mocks with `beforeEach`

### E2E Testing
- Test critical user journeys
- Use page object pattern for complex flows
- Set up test data in `beforeEach`
- Clean up test data after tests
- Use stable selectors (data-testid)

### Coverage Goals
- **Components:** 80%+ coverage
- **Utilities:** 90%+ coverage
- **Critical paths:** 100% E2E coverage

## CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test:coverage
      - run: bun test:e2e
```

This testing setup ensures code quality and prevents regressions while maintaining fast development cycles.