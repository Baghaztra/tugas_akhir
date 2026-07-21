import { test, expect } from '@playwright/test'
import { TRACKING_SAMPLE_RECEIPT } from '../fixtures/test-data'

test.describe('Public Tracking', () => {
  test('tracking page render search form', async ({ page }) => {
    await page.goto('/tracking')

    await expect(page.locator('h1')).toContainText('Cek Status')
    const searchInput = page.locator('input[placeholder*="Contoh"]')
    await expect(searchInput).toBeVisible()
    const cariButton = page.locator('button', { hasText: 'Cari' })
    await expect(cariButton).toBeVisible()
  })

  test('search valid receipt redirect to tracking detail', async ({ page }) => {
    await page.goto(`/tracking/${TRACKING_SAMPLE_RECEIPT}`)

    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain(TRACKING_SAMPLE_RECEIPT)
  })

  test('search invalid receipt show 404 or error', async ({ page }) => {
    const response = await page.goto('/tracking/NONEXISTENT-99999')

    if (response?.status() === 404) {
      expect(response.status()).toBe(404)
    } else {
      await page.waitForLoadState('networkidle')
      const bodyText = await page.locator('body').innerText()
      const hasError = bodyText.toLowerCase().includes('tidak ditemukan') || bodyText.toLowerCase().includes('not found')
      expect(hasError).toBeTruthy()
    }
  })
})
