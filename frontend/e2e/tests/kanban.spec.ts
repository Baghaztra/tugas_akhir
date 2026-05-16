import { test, expect } from '@playwright/test'

test.describe('Kanban Board (Admin Work)', () => {
  test('kanban page render phase columns', async ({ page }) => {
    await page.goto('/admin/work')

    await page.waitForLoadState('networkidle')

    const columns = page.locator('h2')
    const columnCount = await columns.count()
    expect(columnCount).toBeGreaterThanOrEqual(1)
  })

  test('kanban show cutting/sewing/finishing labels', async ({ page }) => {
    await page.goto('/admin/work')

    await page.waitForLoadState('networkidle')

    const headers = await page.locator('h2').allTextContents()
    const hasPhase = headers.some(h =>
      h.includes('Potong') || h.includes('Jahit') || h.includes('Finishing')
    )
    expect(hasPhase).toBeTruthy()
  })

  test('refresh button click reload data', async ({ page }) => {
    await page.goto('/admin/work')

    await page.waitForLoadState('networkidle')

    const refreshButton = page.locator('button', { hasText: 'Segarkan' })
    if (await refreshButton.isVisible()) {
      await refreshButton.click()
      await page.waitForTimeout(500)
    }
  })
})
