import { test, expect } from '@playwright/test'
import { TEST_WORKER, TEST_WORKER_UPDATED } from '../fixtures/test-data'
import { apiDelete, loginAdmin, loginAdminUI } from '../utils/helpers'

test.describe('CRUD Karyawan', () => {
  let createdWorkerId: number | null = null

  test.beforeEach(async ({ page }) => {
    await loginAdminUI(page)
  })

  test.afterEach(async ({ request }) => {
    if (createdWorkerId) {
      try {
        await apiDelete(request, `/workers/${createdWorkerId}`)
      } catch {}
      createdWorkerId = null
    }
  })

  test('workers list page render table and add button', async ({ page }) => {
    await page.goto('/admin/workers')
    await page.waitForLoadState('networkidle')

    const tambahButton = page.locator('button', { hasText: 'Tambah Karyawan' })
    await expect(tambahButton).toBeVisible()
  })

  test('open add worker modal and create worker', async ({ page, request }) => {
    await loginAdmin(request)
    await page.goto('/admin/workers')
    await page.waitForLoadState('networkidle')

    await page.locator('button', { hasText: 'Tambah Karyawan' }).click()

    const modal = page.locator('[class*="fixed"]').filter({ hasText: /Tambah|Karyawan/ }).or(page.locator('[role="dialog"]'))
    await expect(modal.first()).toBeVisible()

    const nameInput = modal.first().locator('input[type="text"]').first()
    await nameInput.fill(TEST_WORKER.name)

    const roleInput = modal.first().locator('input[type="text"]').nth(1).or(modal.first().locator('select').first())
    if (await roleInput.evaluate(el => el.tagName === 'SELECT')) {
      await roleInput.selectOption(TEST_WORKER.role)
    } else {
      await roleInput.fill(TEST_WORKER.role)
    }

    await modal.first().locator('button', { hasText: 'Simpan' }).click()
    await page.waitForLoadState('networkidle')

    await expect(page.locator(`text=${TEST_WORKER.name}`).first()).toBeVisible()
  })

  test('create worker via API and verify in list', async ({ page, request }) => {
    const worker = await request.post('http://localhost:8000/workers/', {
      data: TEST_WORKER,
    })
    expect(worker.ok()).toBeTruthy()
    const created = await worker.json()
    createdWorkerId = created.id

    await page.goto('/admin/workers')
    await page.waitForLoadState('networkidle')

    await expect(page.locator(`text=${TEST_WORKER.name}`).first()).toBeVisible()
  })

  test('edit worker via API and verify updated data', async ({ request }) => {
    const res = await request.post('http://localhost:8000/workers/', {
      data: TEST_WORKER,
    })
    expect(res.ok()).toBeTruthy()
    const created = await res.json()
    createdWorkerId = created.id

    const updated = await request.put(`http://localhost:8000/workers/${created.id}`, {
      data: TEST_WORKER_UPDATED,
    })
    expect(updated.ok()).toBeTruthy()
    const updatedData = await updated.json()
    expect(updatedData.name).toBe(TEST_WORKER_UPDATED.name)
    expect(updatedData.role).toBe(TEST_WORKER_UPDATED.role)
  })

  test('delete worker via API', async ({ request }) => {
    const res = await request.post('http://localhost:8000/workers/', {
      data: TEST_WORKER,
    })
    expect(res.ok()).toBeTruthy()
    const created = await res.json()

    const del = await request.delete(`http://localhost:8000/workers/${created.id}`)
    expect(del.ok()).toBeTruthy()

    const get = await request.get(`http://localhost:8000/workers/${created.id}`)
    expect(get.status()).toBe(404)

    createdWorkerId = null
  })

  test('workers list has search input', async ({ page }) => {
    await page.goto('/admin/workers')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[placeholder*="Cari"]').or(page.locator('input[placeholder*="cari"]'))
    await expect(searchInput.first()).toBeVisible()
  })
})
