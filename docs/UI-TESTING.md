# UI Testing Guide

## Setup Complete ✅

Playwright has been installed and configured for this project.

## Available Commands

```bash
# Run all E2E tests
bun test:e2e

# Run tests with UI mode (visual test runner)
bun test:e2e:ui

# Debug tests (step through)
bun test:e2e:debug

# Install/update browsers
bun test:setup
```

## Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   ├── auth.spec.ts       # Authentication flows
│   ├── permissions.spec.ts # Role-based access
│   ├── navigation.spec.ts  # Sidebar & routing
│   └── crud.spec.ts       # Create/delete operations
├── helpers/
│   └── auth.ts            # Login helpers
└── pages/
    └── login.page.ts      # Page object models
```

## Test Coverage

### ✅ Authentication
- Login/logout flows
- Invalid credentials handling
- Redirect to login when not authenticated

### ✅ Permissions
- Admin access to users/settings
- User restrictions
- Inventory access for all roles

### ✅ Navigation
- Sidebar links
- Language switching
- Inventory submenu

### ✅ CRUD Operations
- Product creation/deletion
- Category management
- Form validation

## Running Tests

### Development
```bash
# Start dev server first
bun dev

# Run tests in another terminal
bun test:e2e
```

### CI/CD Ready
Tests automatically start the dev server when needed.

## Adding New Tests

### 1. Create Test File
```typescript
// tests/e2e/feature.spec.ts
import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('Feature Tests', () => {
  test('should do something', async ({ page }) => {
    await loginAsAdmin(page)
    // Test implementation
  })
})
```

### 2. Add Data Test IDs
```tsx
// In your components
<Button data-testid="submit-button">Submit</Button>
<Input data-testid="name-input" />
```

### 3. Use Stable Selectors
```typescript
// ✅ Good
page.locator('[data-testid="submit-button"]')
page.locator('role=button[name="Submit"]')

// ❌ Avoid
page.locator('.btn-primary')
page.locator('button:nth-child(2)')
```

## Best Practices

### Wait Strategies
```typescript
// Wait for elements
await expect(page.locator('.toast')).toBeVisible()

// Wait for navigation
await page.waitForURL('/dashboard')

// Wait for network
await page.waitForLoadState('networkidle')
```

### Test Data
- Use predictable test data
- Clean up after tests
- Avoid dependencies between tests

### Error Handling
- Take screenshots on failure (automatic)
- Use descriptive test names
- Group related tests with describe()

## Debugging

### Visual Mode
```bash
bun test:e2e:ui
```
Opens interactive test runner with timeline and DOM inspector.

### Debug Mode
```bash
bun test:e2e:debug
```
Runs tests with debugger - add `await page.pause()` to stop execution.

### Screenshots
Failed tests automatically capture screenshots in `test-results/` folder.

## Next Steps

1. **Add more test scenarios** as features grow
2. **Mock external APIs** for faster, reliable tests
3. **Add visual regression tests** for UI consistency
4. **Integrate with CI/CD** pipeline

---

**Ready to test!** Run `bun test:e2e:ui` to see the visual test runner.