import { test, expect } from '@playwright/test'
import { loginAsAdmin, loginAsUser } from '../helpers/auth'

test.describe('Permissions', () => {
  test('admin can access users page', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/en/users')
    await expect(page.locator('h1')).toContainText('Users')
  })

  test('admin can access settings page', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/en/settings')
    await expect(page.locator('h1')).toContainText('Settings')
  })

  test('user cannot access users page', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/en/users')
    await expect(page).toHaveURL('/en/dashboard')
  })

  test('user cannot access settings page', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/en/settings')
    await expect(page).toHaveURL('/en/dashboard')
  })

  test('user can access inventory pages', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/en/inventory/products')
    await expect(page.locator('h1')).toContainText('Products')
  })
})