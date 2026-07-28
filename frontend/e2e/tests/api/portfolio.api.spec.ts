import { test, expect } from '@playwright/test'
import { loginAdmin, apiGet, apiDelete } from '../../utils/helpers'
import { TEST_PORTFOLIO } from '../../fixtures/test-data'

const API_BASE = 'http://localhost:8000'

test.describe('Portfolio API', () => {
  test.beforeEach(async ({ request }) => {
    await loginAdmin(request)
  })

  test('GET /portfolio/ return array', async ({ request }) => {
    const data = await apiGet(request, '/portfolio/')
    expect(Array.isArray(data)).toBeTruthy()
  })

  test('POST /portfolio/ create with file upload', async ({ request }) => {
    const res = await request.post(`${API_BASE}/portfolio/`, {
      multipart: {
        title: TEST_PORTFOLIO.title,
        category: TEST_PORTFOLIO.category,
        description: TEST_PORTFOLIO.description,
      },
    })
    expect(res.ok()).toBeTruthy()
    const item = await res.json()
    expect(item.id).toBeDefined()
    expect(item.title).toBe(TEST_PORTFOLIO.title)
    expect(item.category).toBe(TEST_PORTFOLIO.category)

    await apiDelete(request, `/portfolio/${item.id}`)
  })

  test('POST /portfolio/preview with invalid URL return 400', async ({ request }) => {
    const res = await request.post(`${API_BASE}/portfolio/preview`, {
      multipart: {
        instagram_url: 'https://www.instagram.com/p/invalid_url_that_does_not_exist/',
      },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.detail).toContain('Tidak dapat mengambil gambar')
  })

  test('POST /portfolio/preview with empty URL return 422', async ({ request }) => {
    const res = await request.post(`${API_BASE}/portfolio/preview`, {
      multipart: {},
    })
    expect(res.status()).toBe(422)
  })

  test('POST /portfolio/ create with thumbnail_url', async ({ request }) => {
    const fakeThumbnail = 'https://scontent.cdninstagram.com/v/fake-thumbnail.jpg'
    const res = await request.post(`${API_BASE}/portfolio/`, {
      multipart: {
        title: 'IG Test Item',
        category: 'Test',
        description: 'From Instagram',
        thumbnail_url: fakeThumbnail,
      },
    })
    expect(res.ok()).toBeTruthy()
    const item = await res.json()
    expect(item.id).toBeDefined()
    expect(item.image).toBe(fakeThumbnail)

    await apiDelete(request, `/portfolio/${item.id}`)
  })

  test('DELETE /portfolio/{id} remove item', async ({ request }) => {
    const res = await request.post(`${API_BASE}/portfolio/`, {
      multipart: {
        title: 'To Delete',
        category: 'Test',
      },
    })
    expect(res.ok()).toBeTruthy()
    const item = await res.json()

    const del = await request.delete(`${API_BASE}/portfolio/${item.id}`)
    expect(del.ok()).toBeTruthy()
  })

  test('created portfolio item appear in GET list', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/portfolio/`, {
      multipart: {
        title: 'List Check Item',
        category: 'Test',
        thumbnail_url: 'https://example.com/thumb.jpg',
      },
    })
    expect(createRes.ok()).toBeTruthy()
    const created = await createRes.json()

    const list = await apiGet(request, '/portfolio/')
    const found = list.find((item: any) => item.id === created.id)
    expect(found).toBeDefined()
    expect(found.title).toBe('List Check Item')
    expect(found.image).toBe('https://example.com/thumb.jpg')

    await apiDelete(request, `/portfolio/${created.id}`)
  })
})
