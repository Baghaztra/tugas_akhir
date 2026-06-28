import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, apiDelete, loginAdmin } from '../../utils/helpers'
import { TEST_ORDER } from '../../fixtures/test-data'

test.describe('Orders API', () => {
  test.beforeEach(async ({ request }) => {
    await loginAdmin(request)
  })

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

test.describe('Orders API - Payment Update', () => {
  test.beforeEach(async ({ request }) => {
    await loginAdmin(request)
  })

  test('PUT /orders/{id} update payment fields', async ({ request }) => {
    const res = await request.post('http://localhost:8000/orders/', {
      multipart: {
        data: JSON.stringify(TEST_ORDER),
      },
    })
    const created = await res.json()

    const updated = await apiPut(request, `/orders/${created.id}`, {
      totalPrice: 500000,
      paidAmount: 500000,
      paymentStatus: 'paid',
    })

    expect(updated.totalPrice).toBe(500000)
    expect(updated.paidAmount).toBe(500000)
    expect(updated.paymentStatus).toBe('paid')

    await apiDelete(request, `/orders/${created.id}`)
  })

  test('PUT /orders/{id} update only paymentStatus', async ({ request }) => {
    const res = await request.post('http://localhost:8000/orders/', {
      multipart: {
        data: JSON.stringify(TEST_ORDER),
      },
    })
    const created = await res.json()

    const updated = await apiPut(request, `/orders/${created.id}`, {
      paymentStatus: 'unpaid',
    })

    expect(updated.paymentStatus).toBe('unpaid')
    expect(updated.totalPrice).toBe(TEST_ORDER.totalPrice)

    await apiDelete(request, `/orders/${created.id}`)
  })
})

test.describe('Orders API - Sketch in Admin Work', () => {
  test.beforeEach(async ({ request }) => {
    await loginAdmin(request)
  })

  test('GET /orders/admin-work items include sketch field', async ({ request }) => {
    const data = await apiGet(request, '/orders/admin-work')
    expect(data.phases).toBeDefined()

    for (const phase of data.phases) {
      for (const task of [...phase.ready, ...phase.in_progress]) {
        expect(task).toHaveProperty('sketch')
      }
    }
  })

  test('GET /orders/admin-work item sketch is null when no sketch uploaded', async ({ request }) => {
    const res = await request.post('http://localhost:8000/orders/', {
      multipart: {
        data: JSON.stringify(TEST_ORDER),
      },
    })
    const created = await res.json()

    const data = await apiGet(request, '/orders/admin-work')
    const item = data.phases
      .flatMap((p: any) => [...p.ready, ...p.in_progress])
      .find((t: any) => t.order_id === created.id)

    if (item) {
      expect(item.sketch).toBeNull()
    }

    await apiDelete(request, `/orders/${created.id}`)
  })
})
