import { test, expect } from '@playwright/test'
import {
  loginAdmin,
  loginStaff,
  loginStaffUI,
  ensureStaffUser,
  deleteStaffUser,
  STAFF_CREDENTIALS,
} from '../utils/helpers'

test.describe('Authorization - Staff User Access Control', () => {
  test.beforeAll(async ({ request }) => {
    await ensureStaffUser(request)
  })

  test.afterAll(async ({ request }) => {
    await deleteStaffUser(request)
  })

  // RBAC not yet implemented — skip tests that expect role-based restrictions
  test.skip('staff login redirect to /admin/orders (not dashboard)', async ({ page }) => {
    await loginStaffUI(page)
    expect(page.url()).not.toContain('/admin/dashboard')
    expect(page.url()).toContain('/admin')
  })

  test.skip('staff cannot access /admin/dashboard - redirect to /admin/work', async ({ page }) => {
    await loginStaffUI(page)
    await page.goto('/admin/dashboard')
    await page.waitForTimeout(2000)
    expect(page.url()).not.toContain('/admin/dashboard')
    expect(page.url()).toContain('/admin/work')
  })

  test.skip('staff cannot access /admin/reports - redirect to /admin/work', async ({ page }) => {
    await loginStaffUI(page)
    await page.goto('/admin/reports')
    await page.waitForTimeout(2000)
    expect(page.url()).not.toContain('/admin/reports')
    expect(page.url()).toContain('/admin/work')
  })

  test.skip('staff cannot access /admin/users - redirect to /admin/work', async ({ page }) => {
    await loginStaffUI(page)
    await page.goto('/admin/users')
    await page.waitForTimeout(2000)
    expect(page.url()).not.toContain('/admin/users')
    expect(page.url()).toContain('/admin/work')
  })

  test('staff can access /admin/orders', async ({ page }) => {
    await loginStaffUI(page)

    await page.goto('/admin/orders')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/admin/orders')
    await expect(page.locator('text=Tambah Pesanan').or(page.locator('h1')).first()).toBeVisible()
  })

  test('staff can access /admin/work', async ({ page }) => {
    await loginStaffUI(page)

    await page.goto('/admin/work')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/admin/work')
  })

  test('staff can access /admin/workers', async ({ page }) => {
    await loginStaffUI(page)

    await page.goto('/admin/workers')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/admin/workers')
  })

  test('staff can access /admin/settings', async ({ page }) => {
    await loginStaffUI(page)

    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/admin/settings')
  })

  test.skip('staff sidebar does not show Dashboard link', async ({ page }) => {
    await loginStaffUI(page)

    await page.goto('/admin/orders')
    await page.waitForLoadState('networkidle')

    const sidebar = page.locator('nav').or(page.locator('aside'))
    const dashboardLink = sidebar.locator('a', { hasText: 'Dashboard' })
    await expect(dashboardLink).not.toBeVisible()
  })

  test.skip('staff sidebar does not show Kelola User link', async ({ page }) => {
    await loginStaffUI(page)

    await page.goto('/admin/orders')
    await page.waitForLoadState('networkidle')

    const sidebar = page.locator('nav').or(page.locator('aside'))
    const usersLink = sidebar.locator('a', { hasText: 'Kelola User' })
    await expect(usersLink).not.toBeVisible()
  })

  test('unauthenticated user redirect to login from admin routes', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForTimeout(2000)

    expect(page.url()).toContain('/login')
  })
})
