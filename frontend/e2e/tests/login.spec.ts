import { test, expect } from '@playwright/test'
import { ADMIN_CREDENTIALS } from '../utils/helpers'

test.describe('Login Functional', () => {
  test('login page render form elements', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('h1')).toContainText('Rumah Jahit Yan')
    await expect(page.locator('h2')).toContainText('Masuk')
    await expect(page.locator('input[placeholder="Nama pengguna"]')).toBeVisible()
    await expect(page.locator('input[placeholder="Password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('login with valid credentials redirect to admin dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.fill('input[placeholder="Nama pengguna"]', ADMIN_CREDENTIALS.name)
    await page.fill('input[placeholder="Password"]', ADMIN_CREDENTIALS.password)
    await page.locator('button[type="submit"]').click()

    await page.waitForURL('**/admin/dashboard', { timeout: 10000 })
    expect(page.url()).toContain('/admin/dashboard')
  })

  test('login with wrong password show error message', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.fill('input[placeholder="Nama pengguna"]', ADMIN_CREDENTIALS.name)
    await page.fill('input[placeholder="Password"]', 'wrongpassword')
    await page.locator('button[type="submit"]').click()

    await page.waitForTimeout(2000)
    const bodyText = await page.locator('body').innerText()
    const hasError = bodyText.toLowerCase().includes('gagal') || bodyText.toLowerCase().includes('salah') || bodyText.toLowerCase().includes('invalid') || bodyText.toLowerCase().includes('incorrect')
    expect(hasError).toBeTruthy()
  })

  test('login page has forgot password link', async ({ page }) => {
    await page.goto('/login')

    const forgotLink = page.locator('a', { hasText: 'Lupa password' })
    await expect(forgotLink).toBeVisible()
    await expect(forgotLink).toHaveAttribute('href', '/forgot-password')
  })

  test('already logged in user redirect from login to dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.fill('input[placeholder="Nama pengguna"]', ADMIN_CREDENTIALS.name)
    await page.fill('input[placeholder="Password"]', ADMIN_CREDENTIALS.password)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 })

    await page.goto('/login')
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 })
    expect(page.url()).toContain('/admin/dashboard')
  })
})
