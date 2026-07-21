import { test, expect } from '@playwright/test'
import { loginAdmin, loginAdminUI } from '../utils/helpers'

test.describe('Cek Laporan', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdminUI(page)
  })

  test('reports page render summary cards', async ({ page }) => {
    await page.goto('/admin/reports')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Pesanan Masuk')).toBeVisible()
    await expect(page.locator('text=Pendapatan')).toBeVisible()
    await expect(page.locator('text=Pesanan Selesai')).toBeVisible()
    await expect(page.locator('text=Total Item')).toBeVisible()
  })

  test('reports page render daily breakdown table', async ({ page }) => {
    await page.goto('/admin/reports')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Rekap Harian')).toBeVisible()
    await expect(page.locator('th', { hasText: 'Hari' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Tanggal' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Masuk' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Selesai' })).toBeVisible()
  })

  test('reports page render garment type breakdown', async ({ page }) => {
    await page.goto('/admin/reports')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Jenis Pakaian')).toBeVisible()
  })

  test('reports page render payment status breakdown', async ({ page }) => {
    await page.goto('/admin/reports')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Status Pembayaran')).toBeVisible()
    await expect(page.locator('text=Lunas')).toBeVisible()
    await expect(page.locator('text=DP')).toBeVisible()
    await expect(page.locator('text=Belum Lunas')).toBeVisible()
  })

  test('reports page render productivity table', async ({ page }) => {
    await page.goto('/admin/reports')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Produktivitas Karyawan')).toBeVisible()
    await expect(page.locator('th', { hasText: 'Karyawan' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Divisi' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Selesai' })).toBeVisible()
  })

  test('week navigator has prev/next buttons and today button', async ({ page }) => {
    await page.goto('/admin/reports')
    await page.waitForLoadState('networkidle')

    const todayBtn = page.locator('button', { hasText: 'Hari Ini' })
    await expect(todayBtn).toBeVisible()
  })
})

test.describe('Export Laporan', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdminUI(page)
  })

  test('export Excel button is visible', async ({ page }) => {
    await page.goto('/admin/reports')
    await page.waitForLoadState('networkidle')

    const exportBtn = page.locator('button', { hasText: 'Export Excel' })
    await expect(exportBtn).toBeVisible()
  })

  test('click export Excel trigger download', async ({ page, request }) => {
    await loginAdmin(request)
    await page.goto('/admin/reports')
    await page.waitForLoadState('networkidle')

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }),
      page.locator('button', { hasText: 'Export Excel' }).click(),
    ])

    const filename = download.suggestedFilename()
    expect(filename).toContain('.xlsx')
    expect(filename).toContain('laporan')
  })

  test('export API endpoint return Excel file', async ({ request }) => {
    await loginAdmin(request)

    const today = new Date()
    const dayOfWeek = today.getDay()
    const sunday = new Date(today)
    sunday.setDate(today.getDate() - dayOfWeek)
    const weekStart = sunday.toISOString().split('T')[0]

    const res = await request.get(`http://localhost:8000/reports/weekly-recap/export?week_start=${weekStart}`)
    expect(res.ok()).toBeTruthy()
    expect(res.headers()['content-type']).toContain('spreadsheetml')
  })
})
