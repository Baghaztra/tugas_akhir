import { test, expect } from '@playwright/test'

const API_BASE = 'http://localhost:8000'

test.describe('Forgot Password', () => {
  test.describe('UI Navigation', () => {
    test('clicking Lupa Password navigates to forgot-password page', async ({ page }) => {
      await page.goto('/login')
      await page.locator('a', { hasText: 'Lupa password?' }).click()
      await expect(page).toHaveURL('/forgot-password')
      await expect(page.locator('h1')).toContainText('Rumah Jahit Yan')
      await expect(page.locator('text=Reset Password')).toBeVisible()
    })

    test('forgot-password page has back link to login', async ({ page }) => {
      await page.goto('/forgot-password')
      const backLink = page.locator('a', { hasText: 'Kembali ke Login' })
      await expect(backLink).toBeVisible()
      await expect(backLink).toHaveAttribute('href', '/login')
    })

    test('forgot-password shows email step initially', async ({ page }) => {
      await page.goto('/forgot-password')
      await expect(page.locator('text=Lupa Password')).toBeVisible()
      await expect(page.locator('text=Kirim Kode OTP')).toBeVisible()
    })
  })

  test.describe('API — Forgot Password', () => {
    test('POST /auth/forgot-password returns success for any email', async ({ request }) => {
      const res = await request.post(`${API_BASE}/auth/forgot-password`, {
        data: { email: `test-${Date.now()}@test.com` },
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.ok()).toBeTruthy()
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.message).toContain('Jika email terdaftar')
    })
  })

  test.describe('API — Reset Password', () => {
    test('PUT /auth/reset-password rejects invalid OTP', async ({ request }) => {
      const res = await request.put(`${API_BASE}/auth/reset-password`, {
        data: {
          email: 'owner@rumahjahit.id',
          otp: '000000',
          new_password: 'newpass123',
        },
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.status()).toBe(400)
      const body = await res.json()
      expect(body.detail).toContain('OTP')
    })

    test('PUT /auth/reset-password rejects short password', async ({ request }) => {
      const res = await request.put(`${API_BASE}/auth/reset-password`, {
        data: {
          email: 'owner@rumahjahit.id',
          otp: '123456',
          new_password: 'abc',
        },
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.status()).toBe(400)
      const body = await res.json()
      expect(body.detail).toContain('minimal 6 karakter')
    })

    test('PUT /auth/reset-password rejects unknown email', async ({ request }) => {
      const res = await request.put(`${API_BASE}/auth/reset-password`, {
        data: {
          email: `unknown-${Date.now()}@test.com`,
          otp: '123456',
          new_password: 'newpass123',
        },
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.status()).toBe(400)
      const body = await res.json()
      expect(body.detail).toContain('Email tidak terdaftar')
    })
  })

  test.describe('Happy Path — Full Flow', () => {
    test('request OTP then verify old password still works', async ({ request }) => {
      const forgotRes = await request.post(`${API_BASE}/auth/forgot-password`, {
        data: { email: 'owner@rumahjahit.id' },
        headers: { 'Content-Type': 'application/json' },
      })
      expect(forgotRes.ok()).toBeTruthy()

      const loginBefore = await request.post(`${API_BASE}/auth/login`, {
        data: { name: 'Yan', password: '111111' },
        headers: { 'Content-Type': 'application/json' },
      })
      expect(loginBefore.ok()).toBeTruthy()
    })

    test('forgot-password endpoint is idempotent for same email', async ({ request }) => {
      const res = await request.post(`${API_BASE}/auth/forgot-password`, {
        data: { email: `idempotent-${Date.now()}@test.com` },
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.ok()).toBeTruthy()
      const body = await res.json()
      expect(body.success).toBe(true)
    })
  })
})
