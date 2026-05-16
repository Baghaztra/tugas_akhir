import { APIRequestContext, expect } from '@playwright/test'

const API_BASE = 'http://localhost:8000'

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
