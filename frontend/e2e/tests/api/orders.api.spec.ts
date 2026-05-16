import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiDelete } from '../../utils/helpers'
import { TEST_ORDER } from '../../fixtures/test-data'

test.describe('Orders API', () => {
  test('GET /orders/ return array', async ({ request }) => {
    const data = await apiGet(request, '/orders/')
    expect(Array.isArray(data)).toBeTruthy()
  })

  test('POST /orders/ create order', async ({ request }) => {
    const res = await request.post('http://localhost:8000/orders/', {
      multipart: {
        data: JSON.stringify(TEST_ORDER),
      },
    })
    expect(res.ok()).toBeTruthy()
    const order = await res.json()
    expect(order.id).toBeDefined()
    expect(order.receiptNumber).toBeDefined()
    expect(order.customerName).toBe(TEST_ORDER.customerName)

    await apiDelete(request, `/orders/${order.id}`)
  })

  test('GET /orders/{id} return single order', async ({ request }) => {
    const res = await request.post('http://localhost:8000/orders/', {
      multipart: {
        data: JSON.stringify(TEST_ORDER),
      },
    })
    expect(res.ok()).toBeTruthy()
    const created = await res.json()

    const order = await apiGet(request, `/orders/${created.id}`)
    expect(order.id).toBe(created.id)
    expect(order.customerName).toBe(TEST_ORDER.customerName)

    await apiDelete(request, `/orders/${created.id}`)
  })

  test('GET /orders/tracking/{receipt} return tracking info', async ({ request }) => {
    const res = await request.post('http://localhost:8000/orders/', {
      multipart: {
        data: JSON.stringify(TEST_ORDER),
      },
    })
    expect(res.ok()).toBeTruthy()
    const created = await res.json()

    const tracking = await apiGet(request, `/orders/tracking/${created.receiptNumber}`)
    expect(tracking.receiptNumber).toBe(created.receiptNumber)

    await apiDelete(request, `/orders/${created.id}`)
  })

  test('DELETE /orders/{id} remove order', async ({ request }) => {
    const res = await request.post('http://localhost:8000/orders/', {
      multipart: {
        data: JSON.stringify(TEST_ORDER),
      },
    })
    expect(res.ok()).toBeTruthy()
    const created = await res.json()

    await apiDelete(request, `/orders/${created.id}`)

    const get = await request.get(`http://localhost:8000/orders/${created.id}`)
    expect(get.status()).toBe(404)
  })

  test('GET /orders/admin-work return kanban structure', async ({ request }) => {
    const data = await apiGet(request, '/orders/admin-work')
    expect(data.phases).toBeDefined()
    expect(Array.isArray(data.phases)).toBeTruthy()
    expect(data.phases.length).toBeGreaterThanOrEqual(1)
    expect(data.phases[0]).toHaveProperty('phase')
    expect(data.phases[0]).toHaveProperty('ready')
    expect(data.phases[0]).toHaveProperty('in_progress')
  })
})
