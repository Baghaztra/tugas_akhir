import { test, expect } from '@playwright/test'
import { TEST_WORKER, TEST_WORKER_UPDATED } from '../fixtures/test-data'
import { apiDelete } from '../utils/helpers'

test.describe('Workers CRUD', () => {
  let createdWorkerId: number | null = null

  test.afterEach(async ({ request }) => {
    if (createdWorkerId) {
      try {
        await apiDelete(request, `/workers/${createdWorkerId}`)
      } catch {
        // cleanup best-effort
      }
    }
  })

  test('workers list page render table', async ({ page }) => {
    await page.goto('/admin/workers')

    await page.waitForLoadState('networkidle')

    const tambahButton = page.locator('button', { hasText: 'Tambah Karyawan' })
    await expect(tambahButton).toBeVisible()
  })

  test('filter workers by role', async ({ page }) => {
    await page.goto('/admin/workers')

    await page.waitForLoadState('networkidle')

    const roleFilter = page.locator('select').first()
    await roleFilter.selectOption('Jahit')
    await page.waitForTimeout(300)
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

  test('create, update, verify worker via API', async ({ request }) => {
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
  })
})
