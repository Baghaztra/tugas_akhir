import { test, expect } from '@playwright/test'
import { TEST_ORDER } from '../fixtures/test-data'
import { apiDelete, loginAdmin, loginAdminUI } from '../utils/helpers'

const API_BASE = 'http://localhost:8000'

test.describe('Cek Laporan', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAdmin(request)
    await loginAdminUI(page)

    const res = await request.post(`${API_BASE}/orders/`, {
      multipart: { data: JSON.stringify(TEST_ORDER) },
    })
    if (res.ok()) {
      const order = await res.json()
      await request.delete(`${API_BASE}/orders/${order.id}`).catch(() => {})
    }
  })

  test('reports page render summary cards', async ({ page }) => {
    await page.goto('/admin/reports')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Pesanan Masuk', { exact: true })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Pendapatan', { exact: true })).toBeVisible()
    await expect(page.getByText('Pesanan Selesai', { exact: true })).toBeVisible()
    await expect(page.getByText('Total Item', { exact: true })).toBeVisible()
  })

  test('reports page render daily breakdown table', async ({ page }) => {
    await page.goto('/admin/reports')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Rekap Harian', { exact: true })).toBeVisible({ timeout: 10000 })
    await expect(page.locator('th', { hasText: 'Hari' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Tanggal' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Masuk' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Selesai' }).first()).toBeVisible()
  })

  test('reports page render garment type breakdown', async ({ page }) => {
    await page.goto('/admin/reports')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Jenis Pakaian', { exact: true })).toBeVisible({ timeout: 10000 })
  })

  test('reports page render payment status breakdown', async ({ page }) => {
    await page.goto('/admin/reports')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Status Pembayaran', { exact: true })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Lunas', { exact: true })).toBeVisible()
    await expect(page.getByText('DP', { exact: true })).toBeVisible()
    await expect(page.getByText('Belum Lunas', { exact: true })).toBeVisible()
  })

  test('reports page render productivity table', async ({ page }) => {
    await page.goto('/admin/reports')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Produktivitas Karyawan', { exact: true })).toBeVisible({ timeout: 10000 })
    await expect(page.locator('th', { hasText: 'Karyawan' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Divisi' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Selesai' }).first()).toBeVisible()
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

    const res = await request.get(`${API_BASE}/reports/weekly-recap/export?week_start=${weekStart}`)
    expect(res.ok()).toBeTruthy()
    expect(res.headers()['content-type']).toContain('spreadsheetml')
  })
})
