import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('CRUD Operations', () => {
  test('create and delete product', async ({ page }) => {
    // Use admin login since delete requires admin/manager permissions
    await loginAsAdmin(page)
    await page.goto('/en/inventory/products')

    // Create product
    await page.click('button:has-text("Create Product")')

    // Wait for dialog to open
    await page.waitForSelector('input[name="name"]', { timeout: 5000 })

    await page.fill('[name="name"]', 'Test Product E2E')
    await page.fill('[name="sku"]', 'TEST-E2E-001')
    await page.fill('[name="price"]', '99.99')
    await page.fill('[name="cost"]', '49.99')
    await page.fill('[name="stock_quantity"]', '100')

    // Wait for button to be enabled and click
    await page.waitForSelector('button:has-text("Create"):not([disabled])', { timeout: 5000 })
    await page.click('button:has-text("Create")')

    // Wait for either success toast or page reload (dialog closes and page refreshes)
    try {
      await page.waitForSelector('.toast', { timeout: 5000 })
      await expect(page.locator('.toast')).toContainText('successfully')
    } catch {
      // If no toast appears, wait for page to stabilize after reload
      await page.waitForTimeout(2000)
    }

    // Verify creation - product should appear in table
    await expect(page.locator('table')).toContainText('Test Product E2E')

    // Delete product - wait for the delete button to be available
    await page.waitForSelector('button[aria-label="Delete"]', { timeout: 5000 })

    // Click the first delete button (should be for our test product)
    await page.locator('button[aria-label="Delete"]').first().click()

    // Wait for and click the confirmation delete button
    await page.waitForSelector('button:has-text("Delete")', { timeout: 5000 })
    await page.click('button:has-text("Delete")')

    // Wait for success message
    await page.waitForSelector('.toast', { timeout: 10000 })
    await expect(page.locator('.toast')).toContainText('deleted')
  })

  test('create and delete category', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/en/inventory/categories')
    
    // Create category
    await page.click('button:has-text("Create")')
    await page.fill('[name="name"]', 'Test Category E2E')
    await page.click('button[type="submit"]')
    
    // Verify creation
    await expect(page.locator('table')).toContainText('Test Category E2E')
    
    // Delete category
    await page.click('button[aria-label="Delete"]:first')
    
    // Verify deletion
    await expect(page.locator('.toast')).toContainText('deleted')
  })
})
