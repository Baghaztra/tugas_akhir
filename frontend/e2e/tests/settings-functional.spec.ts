import { test, expect } from '@playwright/test'
import { TEST_PORTFOLIO } from '../fixtures/test-data'
import { loginAdmin, loginAdminUI } from '../utils/helpers'

const API_BASE = 'http://localhost:8000'

test.describe('Ubah Password', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdminUI(page)
  })

  test('settings page render password change form', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Ubah Password')).toBeVisible()
    await expect(page.locator('label', { hasText: 'Password Saat Ini' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Password Baru' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Konfirmasi Password Baru' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Simpan Password' })).toBeVisible()
  })

  test('password mismatch show error', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    const passwordSection = page.locator('text=Ubah Password').locator('..')

    await page.fill('input[type="password"] >> nth=0', 'admin123')
    await page.fill('input[type="password"] >> nth=1', 'newpass123')
    await page.fill('input[type="password"] >> nth=2', 'differentpass')

    await page.locator('button', { hasText: 'Simpan Password' }).click()

    await page.waitForTimeout(1000)
    const bodyText = await page.locator('body').innerText()
    const hasError = bodyText.includes('tidak cocok') || bodyText.includes('Tidak cocok') || bodyText.includes('mismatch')
    expect(hasError).toBeTruthy()
  })

  test('short password show error', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    await page.fill('input[type="password"] >> nth=0', 'admin123')
    await page.fill('input[type="password"] >> nth=1', 'abc')
    await page.fill('input[type="password"] >> nth=2', 'abc')

    await page.locator('button', { hasText: 'Simpan Password' }).click()

    await page.waitForTimeout(1000)
    const bodyText = await page.locator('body').innerText()
    const hasError = bodyText.includes('minimal 6') || bodyText.includes('karakter')
    expect(hasError).toBeTruthy()
  })
})

test.describe('Tambah Portofolio', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdminUI(page)
  })

  test('settings page render portfolio upload section', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Tambah Foto Portofolio')).toBeVisible()
    await expect(page.locator('label', { hasText: 'Judul' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Kategori' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Deskripsi' })).toBeVisible()
  })

  test('portfolio upload button disabled without required fields', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    const uploadButton = page.locator('button', { hasText: 'Tambahkan' })
    await expect(uploadButton).toBeVisible()
    await expect(uploadButton).toBeDisabled()
  })

  test('fill portfolio metadata enable upload button', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    await page.fill('input[placeholder*="Kemeja Batik"]', TEST_PORTFOLIO.title)
    await page.fill('input[placeholder*="Kemeja, Kebaya"]', TEST_PORTFOLIO.category)

    const uploadButton = page.locator('button', { hasText: 'Tambahkan' })
    await expect(uploadButton).toBeEnabled()
  })

  test('create portfolio via API and verify in settings page', async ({ page, request }) => {
    await loginAdmin(request)

    const formData = new FormData()
    formData.append('title', TEST_PORTFOLIO.title)
    formData.append('category', TEST_PORTFOLIO.category)
    formData.append('description', TEST_PORTFOLIO.description)

    const res = await request.post(`${API_BASE}/portfolio/`, {
      multipart: {
        title: TEST_PORTFOLIO.title,
        category: TEST_PORTFOLIO.category,
        description: TEST_PORTFOLIO.description,
      },
    })
    expect(res.ok()).toBeTruthy()
    const created = await res.json()

    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Daftar Portofolio')).toBeVisible()
    await expect(page.locator(`text=${TEST_PORTFOLIO.title}`).first()).toBeVisible()

    await request.delete(`${API_BASE}/portfolio/${created.id}`)
  })

  test('settings page render existing portfolio grid', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Daftar Portofolio')).toBeVisible()

    const reloadBtn = page.locator('button', { hasText: 'Muat ulang' })
    await expect(reloadBtn).toBeVisible()
  })
})

test.describe('Settings - Profile Info', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdminUI(page)
  })

  test('settings page render business info form', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Informasi Usaha')).toBeVisible()
    await expect(page.locator('label', { hasText: 'Nama Usaha' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Alamat Lengkap' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'No. Telepon' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Email' })).toBeVisible()
  })

  test('click edit enable form fields and show save button', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    const editBtn = page.locator('button', { hasText: 'Edit' }).first()
    await editBtn.click()

    await expect(page.locator('button', { hasText: 'Simpan' }).first()).toBeVisible()
    await expect(page.locator('button', { hasText: 'Batal' }).first()).toBeVisible()
  })
})
