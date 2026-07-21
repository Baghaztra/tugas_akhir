import { test, expect } from '@playwright/test'
import { loginAdminUI } from '../utils/helpers'

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdminUI(page)
  })

  test('dashboard page render stat cards', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Pesanan Aktif')).toBeVisible()
    await expect(page.locator('text=Pendapatan Minggu Ini')).toBeVisible()
  })

  test('dashboard show trend chart area', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')

    const chartSection = page.locator('text=Tren Pesanan 7 Hari').or(page.locator('text=tren'))
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

    const lihatSemua = page.locator('a', { hasText: 'Lihat Semua' }).first()
    await expect(lihatSemua).toBeVisible()
    await lihatSemua.click()
    await page.waitForURL('**/admin/orders')
    expect(page.url()).toContain('/admin/orders')
  })
})
