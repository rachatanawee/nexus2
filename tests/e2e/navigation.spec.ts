import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('Navigation', () => {
  test('sidebar navigation works', async ({ page }) => {
    await loginAsAdmin(page)
    
    // Test dashboard link
    await page.click('[href="/en/dashboard"]')
    await expect(page).toHaveURL('/en/dashboard')
    
    // Test users link
    await page.click('[href="/en/users"]')
    await expect(page).toHaveURL('/en/users')
    
    // Test inventory submenu
    await page.click('button:has-text("Inventory")')
    await page.click('[href="/en/inventory/products"]')
    await expect(page).toHaveURL('/en/inventory/products')
  })

  test('language switching works', async ({ page }) => {
    await loginAsAdmin(page)
    
    // Switch to Thai
    await page.click('button:has([data-lucide="languages"])')
    await expect(page).toHaveURL('/th/dashboard')
    
    // Switch back to English
    await page.click('button:has([data-lucide="languages"])')
    await expect(page).toHaveURL('/en/dashboard')
  })

  test('logout works', async ({ page }) => {
    await loginAsAdmin(page)
    
    await page.click('button:has([data-lucide="log-out"])')
    await expect(page).toHaveURL('/en/login')
  })
})