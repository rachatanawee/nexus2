import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'

test.describe('Authentication', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/en/dashboard')
    await expect(page).toHaveURL('/en/login')
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)
    
    await loginPage.goto()
    // ใช้ admin user ที่สร้างจาก setup-admin.js
    await loginPage.login('admin@test.com', 'asdfasdf')
    
    await expect(page).toHaveURL('/en/dashboard')
    await expect(page.locator('h1')).toContainText('Overview')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.login('invalid@example.com', 'wrongpassword')

    await expect(page.locator('.text-red-500')).toBeVisible()
  })

  test('should show validation error when email is not filled', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    // Fill only password, leave email empty
    await loginPage.passwordInput.fill('password123')
    await loginPage.loginButton.click()

    // Should stay on login page and show validation error
    await expect(page).toHaveURL('/en/login')
    // Check for HTML5 validation or custom error message
    await expect(page.locator('#email:invalid')).toBeVisible()
  })
})
