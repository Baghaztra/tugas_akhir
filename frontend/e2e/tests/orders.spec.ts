import { test, expect } from '@playwright/test'
import { TEST_ORDER } from '../fixtures/test-data'
import { apiDelete } from '../utils/helpers'

test.describe('Orders CRUD', () => {
  let createdOrderId: number | null = null
  let createdReceipt: string | null = null

  test.afterEach(async ({ request }) => {
    if (createdOrderId) {
      try {
        await apiDelete(request, `/orders/${createdOrderId}`)
      } catch {
        // cleanup best-effort
      }
    }
  })

  test('orders list page render table', async ({ page }) => {
    await page.goto('/admin/orders')

    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[placeholder*="Cari"]').or(page.locator('input[placeholder*="cari"]'))
    await expect(searchInput).toBeVisible()

    const tambahButton = page.locator('a', { hasText: 'Tambah Pesanan' }).or(page.locator('button', { hasText: 'Tambah' }))
    await expect(tambahButton).toBeVisible()
  })

  test('filter orders by payment status', async ({ page }) => {
    await page.goto('/admin/orders')

    await page.waitForLoadState('networkidle')

    const paymentFilter = page.locator('select').first()
    await paymentFilter.selectOption('paid')
    await page.waitForTimeout(300)
  })

  test('create order via API and verify in list', async ({ page, request }) => {
    const res = await request.post('http://localhost:8000/orders/', {
      multipart: {
        data: JSON.stringify(TEST_ORDER),
      },
    })
    expect(res.ok()).toBeTruthy()
    const order = await res.json()
    createdOrderId = order.id
    createdReceipt = order.receiptNumber

    await page.goto('/admin/orders')
    await page.waitForLoadState('networkidle')

    await expect(page.locator(`text=${order.receiptNumber}`).first()).toBeVisible()
    await expect(page.locator(`text=${TEST_ORDER.customerName}`).first()).toBeVisible()
  })

  test('navigate to create order page', async ({ page }) => {
    await page.goto('/admin/orders')

    const createLink = page.locator('a', { hasText: 'Tambah Pesanan' })
    await createLink.click()
    await page.waitForURL('**/admin/orders/create')

    await expect(page.locator('h1')).toContainText('Pesanan Baru')
  })
})
