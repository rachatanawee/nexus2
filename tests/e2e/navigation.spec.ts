import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('Navigation', () => {
  test('sidebar navigation works', async ({ page }) => {
    await loginAsAdmin(page)

    // Test dashboard link (should already be on dashboard after login)
    await expect(page).toHaveURL('/en/dashboard')

    // Test inventory submenu
    await page.click('button:has-text("Inventory")')
    await page.click('[href="/en/inventory/products"]')
    await expect(page).toHaveURL('/en/inventory/products')
  })

  test('language switching to Thai works', async ({ page }) => {
    await loginAsAdmin(page)

    // Switch to Thai - click the languages button
    await page.locator('button').filter({ has: page.locator('.lucide-languages') }).click()
    // Should stay on dashboard but in Thai locale
    await expect(page).toHaveURL('/th/dashboard')
  })

  test('logout works', async ({ page }) => {
    await loginAsAdmin(page)

    await page.locator('button').filter({ has: page.locator('.lucide-log-out') }).click()
    await expect(page).toHaveURL('/en/login')
  })
})
