import { test, expect } from '@playwright/test'
import { TEST_ORDER } from '../fixtures/test-data'
import { apiDelete, loginAdmin, loginAdminUI } from '../utils/helpers'

test.describe('Orders CRUD', () => {
  let createdOrderId: number | null = null

  test.beforeEach(async ({ page }) => {
    await loginAdminUI(page)
  })

  test.afterEach(async ({ request }) => {
    if (createdOrderId) {
      try {
        await apiDelete(request, `/orders/${createdOrderId}`)
      } catch {}
    }
  })

  test('orders list page render table', async ({ page }) => {
    await page.goto('/admin/orders')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[placeholder*="Cari"]').or(page.locator('input[placeholder*="cari"]'))
    await expect(searchInput).toBeVisible()

    const tambahButton = page.locator('a', { hasText: 'Tambah Pesanan' }).first()
    await expect(tambahButton).toBeVisible()
  })

  test('create order via API and verify in list', async ({ page, request }) => {
    await loginAdmin(request)
    const res = await request.post('http://localhost:8000/orders/', {
      multipart: {
        data: JSON.stringify(TEST_ORDER),
      },
    })
    expect(res.ok()).toBeTruthy()
    const order = await res.json()
    createdOrderId = order.id

    await page.goto('/admin/orders')
    await page.waitForLoadState('networkidle')
    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(page.locator(`text=${order.receiptNumber}`).first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator(`text=${TEST_ORDER.customerName}`).first()).toBeVisible()
  })
})

test.describe('Orders - WhatsApp Button', () => {
  let orderId: number

  test.beforeEach(async ({ request, page }) => {
    await loginAdmin(request)
    await loginAdminUI(page)
    const res = await request.post('http://localhost:8000/orders/', {
      multipart: {
        data: JSON.stringify(TEST_ORDER),
      },
    })
    const order = await res.json()
    orderId = order.id
  })

  test.afterEach(async ({ request }) => {
    try {
      await apiDelete(request, `/orders/${orderId}`)
    } catch {}
  })

  test('order detail page show WhatsApp button when phone exists', async ({ page }) => {
    await page.goto(`/admin/orders/${orderId}`)
    await page.waitForLoadState('networkidle')

    const waLink = page.locator('a', { hasText: 'WhatsApp' })
    await expect(waLink).toBeVisible()
    await expect(waLink).toHaveAttribute('href', /wa\.me\/6281234567890/)
    await expect(waLink).toHaveAttribute('target', '_blank')
  })
})
