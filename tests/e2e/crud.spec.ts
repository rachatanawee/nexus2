import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('CRUD Operations', () => {
  test.describe.configure({ mode: 'serial' })

  test('create and delete product', async ({ page }) => {
    // Use admin login since delete requires admin/manager permissions
    await loginAsAdmin(page)
    await page.goto('/en/inventory/products')

    // Create product
    // Ensure any existing dialog overlay is detached so clicks are not intercepted
    await page.waitForSelector('div[data-slot="dialog-overlay"]', { state: 'detached', timeout: 5000 })
    await page.click('button:has-text("Create Product")')

    // Wait for dialog to open
    await page.waitForSelector('input[name="name"]', { timeout: 5000 })

    const timestamp = Date.now()
    await page.fill('[name="name"]', 'Test Product E2E')
    await page.fill('[name="sku"]', `TEST-E2E-${timestamp}`)
    await page.fill('[name="price"]', '99.99')
    await page.fill('[name="cost"]', '49.99')
    await page.fill('[name="stock_quantity"]', '100')

    // Click the submit button (Create/Update)
    await page.click('button[type="submit"]')

    // Wait for success toast
    await page.waitForSelector('[data-sonner-toast]', { timeout: 5000 })
    await expect(page.locator('[data-sonner-toast]')).toContainText('successfully')

    // Verify creation - product should appear in table
    await expect(page.locator('table')).toContainText('Test Product E2E')

    // Handle browser confirm dialog
    page.on('dialog', async dialog => {
      await dialog.accept()
    })

    // Delete product - find the row with our test product and click its delete button
    const productRow = page.locator('table tbody tr').filter({ hasText: 'Test Product E2E' })
    await productRow.locator('button').nth(1).click() // Second button is delete (first is edit)

    // Wait for delete success message
    await page.waitForSelector('[data-sonner-toast]:has-text("Product deleted successfully")', { timeout: 10000 })
    await expect(page.locator('[data-sonner-toast]:has-text("Product deleted successfully")')).toBeVisible()
  })

  test('create and delete category', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/en/inventory/categories')

    // Create category
    await page.click('button:has-text("Create Category")')

    // Wait for dialog to open
    await page.waitForSelector('input[name="name"]', { timeout: 5000 })

    const timestamp = Date.now()
    await page.fill('[name="name"]', `Test Category E2E ${timestamp}`)
    await page.click('button[type="submit"]')

    // Wait for success message
    await page.waitForSelector('[data-sonner-toast]', { timeout: 5000 })
    await expect(page.locator('[data-sonner-toast]')).toContainText('successfully')

    // Verify creation
    await expect(page.locator('table')).toContainText(`Test Category E2E ${timestamp}`)

    // Handle browser confirm dialog
    page.on('dialog', async dialog => {
      await dialog.accept()
    })

    // Delete category - find the row with our test category and click its delete button
    const categoryRow = page.locator('table tbody tr').filter({ hasText: `Test Category E2E ${timestamp}` })
    await categoryRow.locator('button').nth(1).click() // Second button is delete (first is edit)

    // Verify deletion
    await page.waitForSelector('[data-sonner-toast]:has-text("Categorie deleted successfully")', { timeout: 10000 })
    await expect(page.locator('[data-sonner-toast]:has-text("Categorie deleted successfully")')).toBeVisible()
  })
})
