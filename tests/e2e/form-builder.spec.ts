import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('Form Builder', () => {
  test.describe.configure({ mode: 'serial' })

  test('should create and delete a form schema', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/en/form-builder')

    // --- Create ---
    await page.click('button:has-text("Create Form Schema")')
    
    // Wait for dialog animation
    await page.waitForSelector('#name', { state: 'visible', timeout: 10000 })

    const timestamp = Date.now()
    const formName = `Test Form ${timestamp}`
    const tableName = `test_table_${timestamp}`

    await page.fill('#name', formName)
    await page.fill('#table_name', tableName)
    await page.fill('#description', 'Test Description')
    // Schema has a default value, so we can leave it or modify it if needed. 
    // For this test, the default valid JSON is sufficient.

    await page.click('button[type="submit"]')

    // Verify creation success
    await page.waitForSelector('[data-sonner-toast]', { timeout: 10000 })
    await expect(page.locator('[data-sonner-toast]')).toContainText('successfully')
    
    // Verify presence in table
    await expect(page.locator('table')).toContainText(formName)

    // --- Delete ---
    // Handle confirm dialog
    page.on('dialog', async dialog => {
      await dialog.accept()
    })

    // Find the row with our test form and click its delete button
    const formRow = page.locator('table tbody tr').filter({ hasText: formName })
    // Buttons: [View, Edit, Delete] -> Delete is index 2
    await formRow.locator('button').nth(2).click()

    // Verify delete success
    await page.waitForSelector('[data-sonner-toast]', { timeout: 10000 })
    await expect(page.locator('[data-sonner-toast]')).toContainText('successfully')

    // Verify removal from table
    await page.waitForTimeout(1000)
    await page.reload()
    await expect(page.locator('table')).not.toContainText(formName)
  })

  test('should submit and delete form data', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/en/form-builder')

    // --- Create Form Schema ---
    await page.click('button:has-text("Create Form Schema")')
    await page.waitForSelector('#name', { state: 'visible', timeout: 10000 })

    const timestamp = Date.now()
    const formName = `Test Form Data ${timestamp}`
    const tableName = `test_form_data_${timestamp}`

    await page.fill('#name', formName)
    await page.fill('#table_name', tableName)
    await page.fill('#description', 'Test form for data submission')
    // Use default schema which has name and description fields

    await page.click('button[type="submit"]')
    await page.waitForSelector('[data-sonner-toast]', { timeout: 10000 })
    await expect(page.locator('[data-sonner-toast]')).toContainText('successfully')

    // --- Navigate to Form Data Page ---
    // Click the View button (eye icon) to go to the form data page
    const formRow = page.locator('table tbody tr').filter({ hasText: formName })
    await formRow.locator('button').first().click() // First button is View

    // Wait for navigation to form data page
    await page.waitForURL(/\/form-builder\/[a-f0-9-]+$/, { timeout: 10000 })
    await expect(page.locator('h1')).toContainText(formName)

    // --- Submit Form Data ---
    await page.click('button:has-text("Add Data")')
    await page.waitForSelector('input[id="name"]', { state: 'visible', timeout: 10000 })

    const testDataName = `Test Data ${timestamp}`
    await page.fill('input[id="name"]', testDataName)
    await page.fill('textarea[id="description"]', 'Test data description')

    await page.click('button[type="submit"]')
    await page.waitForSelector('[data-sonner-toast]', { timeout: 10000 })
    await expect(page.locator('[data-sonner-toast]')).toContainText('successfully')

    // Verify data appears in table
    await page.waitForTimeout(1000)
    await page.reload()
    await expect(page.locator('table')).toContainText(testDataName)

    // --- Delete Form Data ---
    page.on('dialog', async dialog => {
      await dialog.accept()
    })

    const dataRow = page.locator('table tbody tr').filter({ hasText: testDataName })
    // Buttons: [View, Edit, Delete] -> Delete is index 2
    await dataRow.locator('button').nth(2).click()

    await page.waitForSelector('[data-sonner-toast]', { timeout: 10000 })
    await expect(page.locator('[data-sonner-toast]')).toContainText('successfully')

    // Verify removal from table
    await expect(page.locator('table')).not.toContainText(testDataName)

    // --- Cleanup: Delete Form Schema ---
    try {
      await page.goto('/en/form-builder')
      const cleanupRow = page.locator('table tbody tr').filter({ hasText: formName })
      await cleanupRow.locator('button').nth(2).click() // Delete button

      await page.waitForSelector('[data-sonner-toast]', { timeout: 10000 })
      await expect(page.locator('[data-sonner-toast]')).toContainText('successfully')
    } catch (error) {
      // Cleanup failed, but test data was verified successfully
      console.log('Cleanup failed:', error)
    }
  })
})

