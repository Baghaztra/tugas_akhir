import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/helpers'
import { TEST_WORKER, TEST_WORKER_UPDATED } from '../../fixtures/test-data'

test.describe('Workers API', () => {
  test('GET /workers/ return array', async ({ request }) => {
    const data = await apiGet(request, '/workers/')
    expect(Array.isArray(data)).toBeTruthy()
  })

  test('POST /workers/ create worker', async ({ request }) => {
    const worker = await apiPost(request, '/workers/', TEST_WORKER)
    expect(worker.id).toBeDefined()
    expect(worker.name).toBe(TEST_WORKER.name)
    expect(worker.role).toBe(TEST_WORKER.role)

    await apiDelete(request, `/workers/${worker.id}`)
  })

  test('PUT /workers/{id} update worker', async ({ request }) => {
    const created = await apiPost(request, '/workers/', TEST_WORKER)

    const updated = await apiPut(request, `/workers/${created.id}`, TEST_WORKER_UPDATED)
    expect(updated.name).toBe(TEST_WORKER_UPDATED.name)
    expect(updated.role).toBe(TEST_WORKER_UPDATED.role)

    await apiDelete(request, `/workers/${created.id}`)
  })

  test('DELETE /workers/{id} remove worker', async ({ request }) => {
    const created = await apiPost(request, '/workers/', TEST_WORKER)

    await apiDelete(request, `/workers/${created.id}`)

    const get = await request.get(`http://localhost:8000/workers/${created.id}`)
    expect(get.status()).toBe(404)
  })

  test('GET /workers/{id}/wages return wage structure', async ({ request }) => {
    const workers = await apiGet(request, '/workers/')
    if (workers.length === 0) {
      test.skip()
      return
    }

    const wages = await apiGet(request, `/workers/${workers[0].id}/wages`)
    expect(wages).toHaveProperty('worker_id')
    expect(wages).toHaveProperty('wage')
    expect(wages).toHaveProperty('total_finished')
  })

  test('GET /workers/{id}/performance return performance', async ({ request }) => {
    const workers = await apiGet(request, '/workers/')
    if (workers.length === 0) {
      test.skip()
      return
    }

    const perf = await apiGet(request, `/workers/${workers[0].id}/performance`)
    expect(perf).toHaveProperty('performance_score')
    expect(perf).toHaveProperty('total_finished')
    expect(perf).toHaveProperty('daily')
  })
})
