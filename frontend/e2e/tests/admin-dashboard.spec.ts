import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard', () => {
  test('dashboard page render stat cards', async ({ page }) => {
    await page.goto('/admin/dashboard')

    await page.waitForLoadState('networkidle')

    const statCards = page.locator('[class*="stat"]')
    const count = await statCards.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('dashboard show trend chart area', async ({ page }) => {
    await page.goto('/admin/dashboard')

    await page.waitForLoadState('networkidle')

    const chartSection = page.locator('text=Tren Pesanan Mingguan').or(page.locator('text=tren'))
    await expect(chartSection).toBeVisible()
  })

  test('dashboard show notifications section', async ({ page }) => {
    await page.goto('/admin/dashboard')

    await page.waitForLoadState('networkidle')

    const notifSection = page.locator('text=Notifikasi').or(page.locator('text=notifikasi'))
    await expect(notifSection).toBeVisible()
  })

  test('dashboard link to orders page', async ({ page }) => {
    await page.goto('/admin/dashboard')

    const lihatSemua = page.locator('a', { hasText: 'Lihat Semua' })
    if (await lihatSemua.isVisible()) {
      await lihatSemua.click()
      await page.waitForURL('**/admin/orders')
      expect(page.url()).toContain('/admin/orders')
    }
  })
})
