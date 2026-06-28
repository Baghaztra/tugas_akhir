import { test, expect } from '@playwright/test'
import { TEST_ORDER } from '../fixtures/test-data'
import { apiDelete, loginAdmin, loginAdminUI } from '../utils/helpers'

test.describe('Orders CRUD', () => {
  let createdOrderId: number | null = null
  let createdReceipt: string | null = null

  test.beforeEach(async ({ page }) => {
    await loginAdminUI(page)
  })

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
    await loginAdmin(request)
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

test.describe('Orders - Payment Update', () => {
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

  test('order detail show payment section with edit button', async ({ page }) => {
    await page.goto(`/admin/orders/${orderId}`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Pembayaran')).toBeVisible()
    await expect(page.locator('text=Total')).toBeVisible()
    await expect(page.locator('text=Dibayar')).toBeVisible()

    const editBtn = page.locator('button').filter({ has: page.locator('svg') }).first()
    await expect(editBtn).toBeVisible()
  })

  test('click edit show payment form with inputs', async ({ page }) => {
    await page.goto(`/admin/orders/${orderId}`)
    await page.waitForLoadState('networkidle')

    const editBtn = page.locator('button').filter({ has: page.locator('svg') }).first()
    await editBtn.click()

    await expect(page.locator('label', { hasText: 'Total Biaya' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Dibayar' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Status Pembayaran' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Simpan' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Batal' })).toBeVisible()
  })

  test('edit payment and save updates values', async ({ page }) => {
    await page.goto(`/admin/orders/${orderId}`)
    await page.waitForLoadState('networkidle')

    const editBtn = page.locator('button').filter({ has: page.locator('svg') }).first()
    await editBtn.click()

    const totalInput = page.locator('input[type="number"]').first()
    const paidInput = page.locator('input[type="number"]').nth(1)
    await totalInput.fill('500000')
    await paidInput.fill('500000')

    const statusSelect = page.locator('select').first()
    await statusSelect.selectOption('paid')

    await page.locator('button', { hasText: 'Simpan' }).click()
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Lunas')).toBeVisible()
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

  test('order list show WhatsApp icon per row', async ({ page }) => {
    await page.goto('/admin/orders')
    await page.waitForLoadState('networkidle')

    const waIcons = page.locator('a[title="Kirim WhatsApp"]')
    const count = await waIcons.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})
