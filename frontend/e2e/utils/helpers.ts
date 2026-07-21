import { APIRequestContext, Page, expect } from '@playwright/test'

const API_BASE = 'http://localhost:8000'

export const ADMIN_CREDENTIALS = {
  name: 'Owner',
  password: '111111',
}

export const STAFF_CREDENTIALS = {
  name: 'E2E Test Staff',
  password: 'staff123',
}

export async function loginAdmin(request: APIRequestContext) {
  const res = await request.post(`${API_BASE}/auth/login`, {
    data: ADMIN_CREDENTIALS,
    headers: { 'Content-Type': 'application/json' },
  })
  expect(res.ok()).toBeTruthy()
  return res
}

export async function loginAdminUI(page: Page) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.fill('input[placeholder="Nama pengguna"]', ADMIN_CREDENTIALS.name)
  await page.fill('input[placeholder="Password"]', ADMIN_CREDENTIALS.password)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL('**/admin/**', { timeout: 10000 })
}

export async function loginStaff(request: APIRequestContext) {
  const res = await request.post(`${API_BASE}/auth/login`, {
    data: { name: STAFF_CREDENTIALS.name, password: STAFF_CREDENTIALS.password },
    headers: { 'Content-Type': 'application/json' },
  })
  expect(res.ok()).toBeTruthy()
  return res
}

export async function loginStaffUI(page: Page) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.fill('input[placeholder="Nama pengguna"]', STAFF_CREDENTIALS.name)
  await page.fill('input[placeholder="Password"]', STAFF_CREDENTIALS.password)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL('**/admin/**', { timeout: 10000 })
}

export async function ensureStaffUser(request: APIRequestContext) {
  await loginAdmin(request)
  const res = await request.get(`${API_BASE}/users/`)
  expect(res.ok()).toBeTruthy()
  const users = await res.json()
  const exists = users.some((u: any) => u.name === STAFF_CREDENTIALS.name)
  if (!exists) {
    const createRes = await request.post(`${API_BASE}/users/`, {
      data: {
        name: STAFF_CREDENTIALS.name,
        email: 'staff.e2e@rumahjahit.id',
        password: STAFF_CREDENTIALS.password,
        is_owner: false,
      },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(createRes.ok()).toBeTruthy()
  }
}

export async function deleteStaffUser(request: APIRequestContext) {
  await loginAdmin(request)
  const res = await request.get(`${API_BASE}/users/`)
  const users = await res.json()
  const staff = users.find((u: any) => u.name === STAFF_CREDENTIALS.name)
  if (staff) {
    await request.delete(`${API_BASE}/users/${staff.id}`)
  }
}

export async function apiGet(request: APIRequestContext, path: string) {
  const res = await request.get(`${API_BASE}${path}`)
  expect(res.ok()).toBeTruthy()
  return res.json()
}

export async function apiPost(request: APIRequestContext, path: string, body: any) {
  const res = await request.post(`${API_BASE}${path}`, {
    data: body,
    headers: { 'Content-Type': 'application/json' },
  })
  expect(res.ok()).toBeTruthy()
  return res.json()
}

export async function apiPut(request: APIRequestContext, path: string, body: any) {
  const res = await request.put(`${API_BASE}${path}`, {
    data: body,
    headers: { 'Content-Type': 'application/json' },
  })
  expect(res.ok()).toBeTruthy()
  return res.json()
}

export async function apiDelete(request: APIRequestContext, path: string) {
  const res = await request.delete(`${API_BASE}${path}`)
  expect(res.ok()).toBeTruthy()
  return res.json()
}

export function isOverdue(deadline: string): boolean {
  return new Date(deadline) < new Date()
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
