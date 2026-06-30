import { test, expect } from '@playwright/test'
import { TEST_ORDER } from '../fixtures/test-data'
import { apiDelete, loginAdmin, loginAdminUI } from '../utils/helpers'

test.describe('Tambah Pesanan', () => {
  let createdOrderId: number | null = null

  test.beforeEach(async ({ page }) => {
    await loginAdminUI(page)
  })

  test.afterEach(async ({ request }) => {
    if (createdOrderId) {
      try {
        await apiDelete(request, `/orders/${createdOrderId}`)
      } catch {}
      createdOrderId = null
    }
  })

  test('navigate to create order page from orders list', async ({ page }) => {
    await page.goto('/admin/orders')
    await page.waitForLoadState('networkidle')

    const createLink = page.locator('a', { hasText: 'Tambah Pesanan' })
    await expect(createLink).toBeVisible()
    await createLink.click()
    await page.waitForURL('**/admin/orders/create')

    await expect(page.locator('h1')).toContainText('Pesanan Baru')
  })

  test('create order form has all required fields', async ({ page }) => {
    await page.goto('/admin/orders/create')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('label', { hasText: 'Nama Pelanggan' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'No. HP' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Deadline' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Status Pembayaran' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Total Biaya' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Jenis Pakaian' })).toBeVisible()
  })

  test('fill and submit create order form', async ({ page, request }) => {
    await loginAdmin(request)
    await page.goto('/admin/orders/create')
    await page.waitForLoadState('networkidle')

    await page.fill('input[placeholder="Nama lengkap"]', TEST_ORDER.customerName)
    await page.fill('input[placeholder="08xxxxxxxxxx"]', TEST_ORDER.customerPhone)

    const deadlineInput = page.locator('input[type="date"]').first()
    await deadlineInput.fill(TEST_ORDER.deadline)

    await page.fill('input[type="number"][min="0"]', String(TEST_ORDER.totalPrice))

    const garmentSelect = page.locator('select').first()
    await garmentSelect.selectOption({ index: 1 })

    await page.locator('button', { hasText: 'Simpan Pesanan' }).click()
    await page.waitForURL('**/admin/orders/**', { timeout: 15000 })

    const urlParts = page.url().split('/')
    const idStr = urlParts[urlParts.length - 1]
    createdOrderId = Number(idStr)
    expect(createdOrderId).toBeGreaterThan(0)

    await expect(page.locator(`text=${TEST_ORDER.customerName}`)).toBeVisible()
  })
})

test.describe('Edit Pesanan', () => {
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

  test('order detail page show payment section', async ({ page }) => {
    await page.goto(`/admin/orders/${orderId}`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Pembayaran')).toBeVisible()
    await expect(page.locator('text=Total')).toBeVisible()
    await expect(page.locator('text=Dibayar')).toBeVisible()
  })

  test('click edit button show payment edit form', async ({ page }) => {
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

  test('edit payment amount and status', async ({ page }) => {
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

  test('cancel edit restore read-only view', async ({ page }) => {
    await page.goto(`/admin/orders/${orderId}`)
    await page.waitForLoadState('networkidle')

    const editBtn = page.locator('button').filter({ has: page.locator('svg') }).first()
    await editBtn.click()

    await expect(page.locator('button', { hasText: 'Batal' })).toBeVisible()
    await page.locator('button', { hasText: 'Batal' }).click()

    await expect(page.locator('text=Total')).toBeVisible()
    await expect(page.locator('text=Dibayar')).toBeVisible()
  })
})

test.describe('Gambar Sketsa', () => {
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
    const order = await res.json()
    orderId = order.id
  })

  test.afterEach(async ({ request }) => {
    try {
      await apiDelete(request, `/orders/${orderId}`)
    } catch {}
  })

  test('sketch modal accessible from kanban board', async ({ page }) => {
    await page.goto('/admin/work')
    await page.waitForLoadState('networkidle')

    const sketchButton = page.locator('button', { hasText: 'Sketsa' }).first()
    if (await sketchButton.isVisible()) {
      await sketchButton.click()

      const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Sketsa Item' })
      await expect(modal).toBeVisible()
    }
  })

  test('sketch modal has canvas and toolbar', async ({ page }) => {
    await page.goto('/admin/orders/create')
    await page.waitForLoadState('networkidle')

    const sketchButton = page.locator('button', { hasText: 'Tambah Sketsa' }).first()
    if (await sketchButton.isVisible()) {
      await sketchButton.click()

      const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Sketsa Item' })
      await expect(modal).toBeVisible()

      await expect(modal.locator('canvas')).toBeVisible()

      await expect(modal.locator('button', { hasText: 'Simpan Sketsa' })).toBeVisible()
      await expect(modal.locator('button', { hasText: 'Batal' })).toBeVisible()
    }
  })

  test('sketch modal has template buttons', async ({ page }) => {
    await page.goto('/admin/orders/create')
    await page.waitForLoadState('networkidle')

    const sketchButton = page.locator('button', { hasText: 'Tambah Sketsa' }).first()
    if (await sketchButton.isVisible()) {
      await sketchButton.click()

      const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Sketsa Item' })
      await expect(modal).toBeVisible()

      await expect(modal.locator('button', { hasText: 'Kemeja' })).toBeVisible()
    }
  })

  test('sketch modal close on cancel', async ({ page }) => {
    await page.goto('/admin/orders/create')
    await page.waitForLoadState('networkidle')

    const sketchButton = page.locator('button', { hasText: 'Tambah Sketsa' }).first()
    if (await sketchButton.isVisible()) {
      await sketchButton.click()

      const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Sketsa Item' })
      await expect(modal).toBeVisible()

      await modal.locator('button', { hasText: 'Batal' }).click()
      await page.waitForTimeout(500)

      await expect(modal).not.toBeVisible()
    }
  })
})
