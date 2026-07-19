export const TEST_ORDER = {
  customerName: 'E2E Test Budi',
  customerPhone: '081234567890',
  deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  totalPrice: 250000,
  dpAmount: 100000,
  paymentStatus: 'partial' as const,
  notes: 'E2E test order - please ignore',
  items: [
    {
      garmentTypeId: 1,
      description: 'E2E Test Item - Kemeja',
      quantity: 2,
      measurements: {
        'Lingkar badan': '100',
        'Panjang baju': '70',
      },
      attributes: {},
    },
  ],
}

export const TEST_WORKER = {
  name: 'E2E Test Worker',
  role: 'Jahit',
}

export const TEST_WORKER_UPDATED = {
  name: 'E2E Test Worker Updated',
  role: 'Potong',
}

export const TRACKING_SAMPLE_RECEIPT = 'RES-2024-001'

export const TEST_PORTFOLIO = {
  title: 'E2E Test Kemeja Batik',
  category: 'Kemeja',
  description: 'Portofolio E2E test - please ignore',
}

export const TEST_USER = {
  name: 'E2E Test User',
  email: 'e2e.testuser@rumahjahit.id',
  password: 'testpass123',
}

export const TEST_USER_UPDATED = {
  name: 'E2E Test User Updated',
}
