import { test, expect } from '@playwright/test'
import { TEST_USER, TEST_USER_UPDATED } from '../fixtures/test-data'
import { loginAdmin, loginAdminUI, apiDelete } from '../utils/helpers'

test.describe('Kelola User', () => {
  let createdUserId: number | null = null

  test.beforeEach(async ({ page }) => {
    await loginAdminUI(page)
  })

  test.afterEach(async ({ request }) => {
    if (createdUserId) {
      try {
        await apiDelete(request, `/users/${createdUserId}`)
      } catch {}
      createdUserId = null
    }
  })

  test('users page render table with columns', async ({ page }) => {
    await page.goto('/admin/users')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1, h2').filter({ hasText: 'Kelola User' }).first()).toBeVisible()
    const tableOrEmpty = page.locator('th', { hasText: 'Nama' }).or(page.locator('text=Tidak ada user'))
    await expect(tableOrEmpty).toBeVisible({ timeout: 10000 })
  })

  test('users page has add user button', async ({ page }) => {
    await page.goto('/admin/users')
    await page.waitForLoadState('networkidle')

    const tambahButton = page.locator('button', { hasText: 'Tambah User' })
    await expect(tambahButton).toBeVisible()
  })

  test('users page has search input', async ({ page }) => {
    await page.goto('/admin/users')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[placeholder*="Cari"]')
    await expect(searchInput).toBeVisible()
  })

  test('add user modal open and close', async ({ page }) => {
    await page.goto('/admin/users')
    await page.waitForLoadState('networkidle')

    await page.locator('button', { hasText: 'Tambah User' }).click()

    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Tambah User' }).or(page.locator('[role="dialog"]').filter({ hasText: 'Tambah User' }))
    await expect(modal.first()).toBeVisible()

    await expect(page.locator('label', { hasText: 'Nama Lengkap' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Email' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Password' })).toBeVisible()

    await page.locator('button', { hasText: 'Batal' }).click()
    await page.waitForTimeout(300)
  })

  test('add new user and verify in table', async ({ page, request }) => {
    await loginAdmin(request)
    await page.goto('/admin/users')
    await page.waitForLoadState('networkidle')

    await page.locator('button', { hasText: 'Tambah User' }).click()

    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Tambah User' }).or(page.locator('[role="dialog"]').filter({ hasText: 'Tambah User' }))
    await expect(modal.first()).toBeVisible()

    await page.fill('input[placeholder="Masukkan nama..."]', TEST_USER.name)
    await page.fill('input[placeholder="Masukkan email..."]', TEST_USER.email)
    await page.fill('input[placeholder="Masukkan password..."]', TEST_USER.password)

    await page.locator('button', { hasText: 'Simpan' }).click()
    await page.waitForLoadState('networkidle')

    await expect(page.locator(`text=${TEST_USER.name}`).first()).toBeVisible()
    await expect(page.locator(`text=${TEST_USER.email}`).first()).toBeVisible()

    const res = await request.get('http://localhost:8000/users/')
    const users = await res.json()
    const created = users.find((u: any) => u.email === TEST_USER.email)
    if (created) createdUserId = created.id
  })

  test('edit user via modal', async ({ page, request }) => {
    await loginAdmin(request)

    const createRes = await request.post('http://localhost:8000/users/', {
      data: {
        name: TEST_USER.name,
        email: TEST_USER.email,
        password: TEST_USER.password,
        is_owner: false,
      },
      headers: { 'Content-Type': 'application/json' },
    })
    const created = await createRes.json()
    createdUserId = created.id

    await page.goto('/admin/users')
    await page.waitForLoadState('networkidle')

    const row = page.locator('tr').filter({ hasText: TEST_USER.email })
    await expect(row).toBeVisible()

    const editBtn = row.locator('button[title="Edit"]')
    await editBtn.click()

    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Edit User' }).or(page.locator('[role="dialog"]').filter({ hasText: 'Edit User' }))
    await expect(modal.first()).toBeVisible()

    const nameInput = page.locator('input[placeholder="Masukkan nama..."]')
    await nameInput.fill(TEST_USER_UPDATED.name)

    await page.locator('button', { hasText: 'Simpan' }).click()
    await page.waitForLoadState('networkidle')

    await expect(page.locator(`text=${TEST_USER_UPDATED.name}`).first()).toBeVisible()
  })

  test('delete user via modal', async ({ page, request }) => {
    await loginAdmin(request)

    const createRes = await request.post('http://localhost:8000/users/', {
      data: {
        name: TEST_USER.name,
        email: TEST_USER.email,
        password: TEST_USER.password,
        is_owner: false,
      },
      headers: { 'Content-Type': 'application/json' },
    })
    const created = await createRes.json()

    await page.goto('/admin/users')
    await page.waitForLoadState('networkidle')

    const row = page.locator('tr').filter({ hasText: TEST_USER.email })
    await expect(row).toBeVisible()

    const deleteBtn = row.locator('button[title="Hapus"]')
    await deleteBtn.click()

    const confirmModal = page.locator('[class*="fixed"]').filter({ hasText: 'Hapus User' }).or(page.locator('[role="dialog"]').filter({ hasText: 'Hapus User' }))
    await expect(confirmModal.first()).toBeVisible()

    await page.locator('button', { hasText: 'Ya, Hapus' }).click()
    await page.waitForLoadState('networkidle')

    await expect(page.locator(`text=${TEST_USER.email}`)).not.toBeVisible()

    createdUserId = null
  })
})
