import { test, expect } from '@playwright/test'
import { TEST_PORTFOLIO, TEST_PORTFOLIO_IG } from '../fixtures/test-data'
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
    await page.locator('button', { hasText: 'Ubah Password' }).click()
    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Ubah Password' })
    await expect(modal).toBeVisible()
    await expect(modal.locator('label', { hasText: 'Password Saat Ini' })).toBeVisible()
    await expect(modal.getByText('Password Baru', { exact: true })).toBeVisible()
    await expect(modal.locator('label', { hasText: 'Konfirmasi Password Baru' })).toBeVisible()
    await expect(modal.locator('button', { hasText: 'Simpan' })).toBeVisible()
  })

  test('password mismatch show error', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    await page.locator('button', { hasText: 'Ubah Password' }).click()
    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Ubah Password' })
    await expect(modal).toBeVisible()

    await modal.locator('input[type="password"]').nth(0).fill('111111')
    await modal.locator('input[type="password"]').nth(1).fill('newpass123')
    await modal.locator('input[type="password"]').nth(2).fill('differentpass')

    await modal.locator('form').evaluate(form => form.requestSubmit())
    await expect(modal.locator('text=tidak cocok')).toBeVisible({ timeout: 5000 })
  })

  test('short password show error', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    await page.locator('button', { hasText: 'Ubah Password' }).click()
    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Ubah Password' })
    await expect(modal).toBeVisible()

    await modal.locator('input[type="password"]').nth(0).fill('111111')
    await modal.locator('input[type="password"]').nth(1).fill('abc')
    await modal.locator('input[type="password"]').nth(2).fill('abc')

    await modal.locator('form').evaluate(form => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
    await expect(modal.getByText('minimal 6 karakter')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Tambah Portofolio', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdminUI(page)
  })

  test('settings page render portfolio section', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Portofolio')).toBeVisible()
  })

  test('open portfolio modal and check form fields', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    await page.locator('button', { hasText: 'Tambah' }).click()
    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Tambah Portofolio' })
    await expect(modal).toBeVisible()
    await expect(modal.locator('label', { hasText: 'Judul' })).toBeVisible()
    await expect(modal.locator('label', { hasText: 'Kategori' })).toBeVisible()
    await expect(modal.locator('label', { hasText: 'Deskripsi' })).toBeVisible()
  })

  test('portfolio upload button disabled without required fields', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    await page.locator('button', { hasText: 'Tambah' }).click()
    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Tambah Portofolio' })
    await expect(modal).toBeVisible()

    const uploadButton = modal.locator('button', { hasText: 'Tambahkan' })
    await expect(uploadButton).toBeVisible()
    await expect(uploadButton).toBeDisabled()
  })

  test('fill portfolio metadata enable upload button', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    await page.locator('button', { hasText: 'Tambah' }).click()
    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Tambah Portofolio' })
    await expect(modal).toBeVisible()

    await modal.locator('button', { hasText: 'Upload Gambar' }).click()

    await modal.locator('input[placeholder*="Kemeja Batik"]').fill(TEST_PORTFOLIO.title)
    await modal.locator('input[placeholder*="Kemeja, Kebaya"]').fill(TEST_PORTFOLIO.category)

    const uploadButton = modal.locator('button', { hasText: 'Tambahkan' })
    await expect(uploadButton).toBeEnabled()
  })

  test('create portfolio via API and verify in settings page', async ({ page, request }) => {
    await loginAdmin(request)

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

    await expect(page.locator('text=Portofolio').first()).toBeVisible()
    await expect(page.locator(`text=${TEST_PORTFOLIO.title}`).first()).toBeVisible()

    await request.delete(`${API_BASE}/portfolio/${created.id}`)
  })

  test('settings page render existing portfolio grid', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Portofolio').first()).toBeVisible()

    const reloadBtn = page.locator('button').filter({ has: page.locator('[class*="arrow-path"]') })
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

test.describe('Portfolio - Instagram Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdminUI(page)
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')
    await page.locator('button', { hasText: 'Tambah' }).click()
  })

  test('modal shows two tabs with Instagram as default', async ({ page }) => {
    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Tambah Portofolio' })
    await expect(modal).toBeVisible()

    await expect(modal.locator('button', { hasText: 'Link Instagram' })).toBeVisible()
    await expect(modal.locator('button', { hasText: 'Upload Gambar' })).toBeVisible()

    // Instagram tab should be active (has bg-white shadow class)
    const igTab = modal.locator('button', { hasText: 'Link Instagram' })
    await expect(igTab).toHaveClass(/bg-white/)

    // Instagram input should be visible by default
    await expect(modal.locator('input[placeholder*="instagram.com"]')).toBeVisible()
  })

  test('switch to Upload Gambar tab shows file drop zone', async ({ page }) => {
    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Tambah Portofolio' })
    await expect(modal).toBeVisible()

    await modal.locator('button', { hasText: 'Upload Gambar' }).click()

    await expect(modal.locator('text=Klik atau seret foto ke sini')).toBeVisible()
    await expect(modal.locator('text=PNG, JPG, WEBP')).toBeVisible()
  })

  test('switch back to Instagram tab hides drop zone', async ({ page }) => {
    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Tambah Portofolio' })
    await expect(modal).toBeVisible()

    // Switch to file then back
    await modal.locator('button', { hasText: 'Upload Gambar' }).click()
    await expect(modal.locator('text=Klik atau seret foto ke sini')).toBeVisible()

    await modal.locator('button', { hasText: 'Link Instagram' }).click()
    await expect(modal.locator('input[placeholder*="instagram.com"]')).toBeVisible()
    await expect(modal.locator('text=Klik atau seret foto ke sini')).not.toBeVisible()
  })

  test('preview button disabled when URL empty', async ({ page }) => {
    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Tambah Portofolio' })
    const previewBtn = modal.locator('button', { hasText: 'Preview' })
    await expect(previewBtn).toBeDisabled()
  })

  test('preview button enabled when URL entered', async ({ page }) => {
    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Tambah Portofolio' })
    await modal.locator('input[placeholder*="instagram.com"]').fill('https://www.instagram.com/p/test123/')
    const previewBtn = modal.locator('button', { hasText: 'Preview' })
    await expect(previewBtn).toBeEnabled()
  })

  test('submit button disabled without required fields on Instagram tab', async ({ page }) => {
    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Tambah Portofolio' })
    const submitBtn = modal.locator('button', { hasText: 'Tambahkan' })
    await expect(submitBtn).toBeDisabled()
  })

  test('submit button disabled without preview on Instagram tab', async ({ page }) => {
    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Tambah Portofolio' })

    // Fill required fields but no preview
    await modal.locator('input[placeholder*="Kemeja Batik"]').fill(TEST_PORTFOLIO_IG.title)
    await modal.locator('input[placeholder*="Kemeja, Kebaya"]').fill(TEST_PORTFOLIO_IG.category)

    const submitBtn = modal.locator('button', { hasText: 'Tambahkan' })
    await expect(submitBtn).toBeDisabled()
  })

  test('fill metadata on Upload tab enables submit button', async ({ page }) => {
    const modal = page.locator('[class*="fixed"]').filter({ hasText: 'Tambah Portofolio' })

    // Switch to file tab
    await modal.locator('button', { hasText: 'Upload Gambar' }).click()

    // Fill required fields — no image needed for file mode
    await modal.locator('input[placeholder*="Kemeja Batik"]').fill('Test File Upload')
    await modal.locator('input[placeholder*="Kemeja, Kebaya"]').fill('Kemeja')

    const submitBtn = modal.locator('button', { hasText: 'Tambahkan' })
    await expect(submitBtn).toBeEnabled()
  })
})
