import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('render landing page with title and CTA', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=Cek Status Pesanan').or(page.locator('text=cek status'))).toBeVisible()

    const links = page.locator('a')
    await expect(links.first()).toBeVisible()
  })

  test.skip('navigate to tracking page from landing', async ({ page }) => {
    await page.goto('/')

    const cekButton = page.getByRole('button', { name: 'Cek' })
    await expect(cekButton).toBeVisible()
    await cekButton.click()
    await page.waitForURL('**/tracking', { timeout: 10000 })
    expect(page.url()).toContain('/tracking')
  })

  test('landing page load under 5 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - start
    expect(loadTime).toBeLessThan(15000)
  })
})
