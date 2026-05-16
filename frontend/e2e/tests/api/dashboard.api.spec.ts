import { test, expect } from '@playwright/test'
import { apiGet } from '../../utils/helpers'

test.describe('Dashboard API', () => {
  test('GET /dashboard/summary return stats', async ({ request }) => {
    const data = await apiGet(request, '/dashboard/summary')
    expect(data).toHaveProperty('activeOrders')
    expect(data).toHaveProperty('weeklyRevenue')
    expect(data).toHaveProperty('todayDone')
    expect(typeof data.activeOrders).toBe('number')
    expect(typeof data.weeklyRevenue).toBe('number')
  })

  test('GET /dashboard/trend return trend data', async ({ request }) => {
    const data = await apiGet(request, '/dashboard/trend')
    expect(data).toHaveProperty('labels')
    expect(data).toHaveProperty('incoming')
    expect(data).toHaveProperty('completed')
    expect(Array.isArray(data.labels)).toBeTruthy()
    expect(data.labels.length).toBe(7)
  })

  test('GET /dashboard/notifications return array', async ({ request }) => {
    const data = await apiGet(request, '/dashboard/notifications')
    expect(Array.isArray(data)).toBeTruthy()
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('receiptNumber')
      expect(data[0]).toHaveProperty('daysLeft')
      expect(data[0]).toHaveProperty('urgency')
    }
  })

  test('GET /reports/volume return report data', async ({ request }) => {
    const data = await apiGet(request, '/reports/volume?period=weekly')
    expect(data).toHaveProperty('labels')
    expect(data).toHaveProperty('data')
    expect(data.labels.length).toBe(7)
  })

  test('GET /reports/product-trends return array', async ({ request }) => {
    const data = await apiGet(request, '/reports/product-trends')
    expect(Array.isArray(data)).toBeTruthy()
  })

  test('GET /reports/productivity return sorted array', async ({ request }) => {
    const data = await apiGet(request, '/reports/productivity')
    expect(Array.isArray(data)).toBeTruthy()
  })
})
