# Dokumentasi API

Base URL: `http://localhost:8000`

## A. Modul Pesanan (Orders)

### 1. Buat Pesanan Baru

**Endpoint**: `POST /orders/`
**Request Body**:

```json
{
  "nama_pelanggan": "Budi Santoso",
  "jenis_pakaian": "Kemeja",
  "deadline": "2023-12-31T00:00:00",
  "tanggal_masuk": "2023-12-01T10:00:00",
  "catatan": "Slim fit, kerah shanghai",
  "biaya": 150000,
  "status_pembayaran": "Lunas",
  "items": [...]
}
```

### 2. Ambil List Pesanan (Admin)

**Endpoint**: `GET /orders/`
**Query Parameters**: `status`, `search` (nama/resi).

### 3. Tracking Pesanan (Publik)

**Endpoint**: `GET /orders/tracking/{order_id}`
**Deskripsi**: Digunakan oleh pelanggan untuk melihat status pesanan.
**Response Body**:

```json
{
  "order_id": "ORD-123",
  "customer_name": "Budi",
  "items": [{ "type": "Kemeja", "qty": 1 }],
  "current_stage": "Sedang Dijahit",
  "estimated_completion": "2023-12-30",
  "payment_status": "Lunas",
  "history": [
    { "date": "2023-12-01", "status": "Pesanan Diterima" },
    { "date": "2023-12-05", "status": "Mulai Potong" }
  ]
}
```

## B. Modul Prioritas & Ranking (Machine Learning)

### 4. Ambil Antrean Prioritas (Pekerja)

**Endpoint**: `GET /orders/priority`
**Query Parameters**: `stage` (potong/jahit/finishing).
**Response Body**:

```json
{
  "potong": [
    {
      "order_id": "ORD-123",
      "urgency_score": 0.95,
      "color_label": "red",
      "details": {...}
    }
  ]
}
```

## C. Modul Manajemen Pekerja (Workers)

### 5. Ambil Daftar Pekerja

**Endpoint**: `GET /workers/`

### 6. Ambil Detail Pekerja (Admin)

**Endpoint**: `GET /workers/{worker_id}`
**Response Body**:

```json
{
  "id": 1,
  "name": "Siti",
  "role": "Jahit",
  "status": "Working",
  "current_task": "ORD-123",
  "weekly_completed_tasks": 15,
  "performance_score": 85.0
}
```

### 7. Ambil Upah Pekerja

**Endpoint**: `GET /workers/{worker_id}/wages`
**Query Parameters**: `start_date`, `end_date`.
**Response Body**:

```json
{
  "worker_id": 1,
  "period": "2023-12-01 - 2023-12-07",
  "completed_items": 20,
  "rate_per_item": 5000,
  "total_wage": 100000
}
```

## D. Modul Laporan & Analitik

### 8. Laporan Volume & Tren

**Endpoint**: `GET /reports/volume`
**Query Parameters**: `period` (weekly/monthly).
**Response Body**:

```json
{
  "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
  "data": [50, 60, 45, 70]
}
```

### 9. Laporan Tren Produk

**Endpoint**: `GET /reports/product-trends`
**Response Body**:

```json
[
  { "type": "Kemeja", "count": 120 },
  { "type": "Celana", "count": 80 }
]
```

### 10. Laporan Produktivitas

**Endpoint**: `GET /reports/productivity`
**Response Body**:

```json
[{ "worker": "Siti", "avg_time_per_item": 45.5, "total_finished": 150 }]
```

## E. Modul Profil Usaha

### 11. Ambil Profil Publik

**Endpoint**: `GET /profile/public`
**Response Body**:

```json
{
  "shop_name": "Tailor Maju Jaya",
  "address": "Jl. Merdeka No. 1",
  "phone": "08123456789",
  "hours": "08:00 - 17:00",
  "portfolio_images": ["url1.jpg", "url2.jpg"]
}
```

### 12. Update Profil (Admin)

**Endpoint**: `PUT /profile/`
