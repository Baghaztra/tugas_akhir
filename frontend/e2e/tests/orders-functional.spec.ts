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

    await expect(page.locator('h1').last()).toContainText('Pesanan Baru')
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
    await page.waitForLoadState('networkidle')

    const url = page.url()
    const match = url.match(/\/admin\/orders\/(\d+)/)
    if (match) {
      createdOrderId = Number(match[1])
      expect(createdOrderId).toBeGreaterThan(0)
      await expect(page.locator(`text=${TEST_ORDER.customerName}`)).toBeVisible()
    } else {
      expect(url).toContain('/admin/orders')
    }
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
    expect(res.ok(), `Failed to create test order: ${res.status()}`).toBeTruthy()
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

    const editBtn = page.locator('h3', { hasText: 'Pembayaran' }).locator('..').locator('button').first()
    await editBtn.click({ timeout: 10000 })

    await expect(page.locator('label', { hasText: 'Total Biaya' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'DP' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Status Pembayaran' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Simpan' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Batal' })).toBeVisible()
  })

  test('edit payment amount and status', async ({ page }) => {
    await page.goto(`/admin/orders/${orderId}`)
    await page.waitForLoadState('networkidle')

    const editBtn = page.locator('h3', { hasText: 'Pembayaran' }).locator('..').locator('button').first()
    await editBtn.click({ timeout: 10000 })

    const totalInput = page.locator('input[type="number"]').first()
    const paidInput = page.locator('input[type="number"]').nth(1)
    await totalInput.fill('500000')
    await paidInput.fill('500000')

    const statusSelect = page.locator('select').first()
    await statusSelect.selectOption('paid')

    await page.locator('button', { hasText: 'Simpan' }).click()
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.bg-emerald-500, .bg-emerald-100, [class*="success"]').filter({ hasText: 'Lunas' }).first()).toBeVisible({ timeout: 10000 })
  })

  test('cancel edit restore read-only view', async ({ page }) => {
    await page.goto(`/admin/orders/${orderId}`)
    await page.waitForLoadState('networkidle')

    const editBtn = page.locator('h3', { hasText: 'Pembayaran' }).locator('..').locator('button').first()
    await editBtn.click({ timeout: 10000 })

    await expect(page.locator('button', { hasText: 'Batal' })).toBeVisible()
    await page.locator('button', { hasText: 'Batal' }).click()

    await expect(page.locator('text=Total')).toBeVisible()
    await expect(page.locator('text=Dibayar')).toBeVisible()
  })
})

test.describe('Gambar Sketsa', () => {
  test('sketch modal has canvas and toolbar', async ({ page }) => {
    await loginAdminUI(page)
    await page.goto('/admin/orders/create')
    await page.waitForLoadState('networkidle')

    const sketchButton = page.locator('button', { hasText: 'Tambah Sketsa' }).first()
    await expect(sketchButton).toBeVisible()
    await sketchButton.click()

    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Sketsa Item' })
    await expect(modal).toBeVisible()

    await expect(modal.locator('canvas').first()).toBeVisible()
    await expect(modal.locator('button', { hasText: 'Simpan Sketsa' })).toBeVisible()
    await expect(modal.locator('button', { hasText: 'Batal' })).toBeVisible()
  })

  test('sketch modal has template buttons', async ({ page }) => {
    await loginAdminUI(page)
    await page.goto('/admin/orders/create')
    await page.waitForLoadState('networkidle')

    const sketchButton = page.locator('button', { hasText: 'Tambah Sketsa' }).first()
    await expect(sketchButton).toBeVisible()
    await sketchButton.click()

    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Sketsa Item' })
    await expect(modal).toBeVisible()

    await expect(modal.locator('button', { hasText: 'Kemeja' })).toBeVisible()
  })

  test('sketch modal close on cancel', async ({ page }) => {
    await loginAdminUI(page)
    await page.goto('/admin/orders/create')
    await page.waitForLoadState('networkidle')

    const sketchButton = page.locator('button', { hasText: 'Tambah Sketsa' }).first()
    await expect(sketchButton).toBeVisible()
    await sketchButton.click()

    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Sketsa Item' })
    await expect(modal).toBeVisible()

    await modal.locator('button', { hasText: 'Batal' }).click()
    await page.waitForTimeout(500)

    await expect(modal).not.toBeVisible()
  })

  test('sketch modal has Gambar and Kamera/Galeri tabs', async ({ page }) => {
    await loginAdminUI(page)
    await page.goto('/admin/orders/create')
    await page.waitForLoadState('networkidle')

    const sketchButton = page.locator('button', { hasText: 'Tambah Sketsa' }).first()
    await expect(sketchButton).toBeVisible()
    await sketchButton.click()

    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Sketsa Item' })
    await expect(modal).toBeVisible()

    await expect(modal.locator('button', { hasText: 'Gambar' })).toBeVisible()
    await expect(modal.locator('button', { hasText: 'Kamera / Galeri' })).toBeVisible()
  })

  test('sketch modal shows file input when Kamera/Galeri tab clicked', async ({ page }) => {
    await loginAdminUI(page)
    await page.goto('/admin/orders/create')
    await page.waitForLoadState('networkidle')

    const sketchButton = page.locator('button', { hasText: 'Tambah Sketsa' }).first()
    await sketchButton.click()

    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Sketsa Item' })
    await expect(modal).toBeVisible()

    await modal.locator('button', { hasText: 'Kamera / Galeri' }).click()

    await expect(modal.locator('input[type="file"][accept="image/*"]')).toBeAttached()
    await expect(modal.locator('button', { hasText: 'Pilih Foto' })).toBeVisible()
  })

  test('sketch modal Gambar tab is selected by default', async ({ page }) => {
    await loginAdminUI(page)
    await page.goto('/admin/orders/create')
    await page.waitForLoadState('networkidle')

    const sketchButton = page.locator('button', { hasText: 'Tambah Sketsa' }).first()
    await sketchButton.click()

    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Sketsa Item' })
    await expect(modal).toBeVisible()

    await expect(modal.locator('canvas').first()).toBeVisible()
    await expect(modal.locator('button', { hasText: 'Kemeja' })).toBeVisible()
  })
})

test.describe('Sketsa di Detail Pesanan', () => {
  let orderId: number

  test.beforeEach(async ({ request, page }) => {
    await loginAdmin(request)
    await loginAdminUI(page)

    // 1x1 white PNG
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    const sketchBuffer = Buffer.from(pngBase64, 'base64')

    const orderData = {
      ...TEST_ORDER,
      items: [{ ...TEST_ORDER.items[0] }],
    }

    const res = await request.post('http://localhost:8000/orders/', {
      multipart: {
        data: JSON.stringify(orderData),
        sketch_files: {
          name: 'sketch_item_0.png',
          mimeType: 'image/png',
          buffer: sketchBuffer,
        },
      },
    })
    expect(res.ok()).toBeTruthy()
    const order = await res.json()
    orderId = order.id
  })

  test.afterEach(async ({ request }) => {
    try { await apiDelete(request, `/orders/${orderId}`) } catch {}
  })

  test('item with sketch show Lihat Sketsa button', async ({ page }) => {
    await page.goto(`/admin/orders/${orderId}`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('button', { hasText: 'Lihat Sketsa' }).first()).toBeVisible()
  })

  test('click Lihat Sketsa open sketch preview modal', async ({ page }) => {
    await page.goto(`/admin/orders/${orderId}`)
    await page.waitForLoadState('networkidle')

    await page.locator('button', { hasText: 'Lihat Sketsa' }).first().click()

    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Sketsa Item' })
    await expect(modal).toBeVisible()
    await expect(modal.locator('img')).toBeVisible()
  })

  test('sketch preview modal close on X button', async ({ page }) => {
    await page.goto(`/admin/orders/${orderId}`)
    await page.waitForLoadState('networkidle')

    await page.locator('button', { hasText: 'Lihat Sketsa' }).first().click()

    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Sketsa Item' })
    await expect(modal).toBeVisible()

    await modal.locator('button').filter({ has: page.locator('[class*="x-mark"]') }).click()
    await page.waitForTimeout(500)

    await expect(modal).not.toBeVisible()
  })
})
