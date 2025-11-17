import { Page } from '@playwright/test'

export async function loginAsAdmin(page: Page) {
  await page.goto('/en/login')
  await page.fill('#email', 'admin@test.com')
  await page.fill('#password', 'asdfasdf')
  await page.click('button[type="submit"]')
  await page.waitForURL('/en/dashboard')
}

export async function loginAsUser(page: Page) {
  await page.goto('/en/login')
  await page.fill('#email', 'user1@test.com')
  await page.fill('#password', 'asdfasdf')
  await page.click('button[type="submit"]')
  await page.waitForURL('/en/dashboard')
}
