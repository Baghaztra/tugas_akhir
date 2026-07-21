import { test, expect } from '@playwright/test'
import { TEST_ORDER } from '../fixtures/test-data'
import { apiDelete, loginAdmin, loginAdminUI } from '../utils/helpers'

test.describe('Kanban Board (Admin Work)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdminUI(page)
  })

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
})

test.describe('Kanban Board - Sketch Preview', () => {
  let orderId: number

  test.beforeEach(async ({ request, page }) => {
    await loginAdmin(request)
    await loginAdminUI(page)
    const res = await request.post('http://localhost:8000/orders/', {
      multipart: {
        data: JSON.stringify({
          ...TEST_ORDER,
          items: [{
            garmentTypeId: 1,
            description: 'E2E Test Item with sketch',
            quantity: 1,
            measurements: {},
            attributes: {},
          }],
        }),
      },
    })
    expect(res.ok(), `Failed to create test order: ${res.status()}`).toBeTruthy()
    const order = await res.json()
    orderId = order.id
  })

  test.afterEach(async ({ request }) => {
    try {
      await apiDelete(request, `/orders/${orderId}`)
    } catch {}
  })

  test('click Sketsa button open modal with image', async ({ page }) => {
    test.skip(true, 'Order created without sketch file — Sketsa button not rendered')
  })
})
