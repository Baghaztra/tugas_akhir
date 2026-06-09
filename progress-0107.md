# Progress Fitur: Histori Ukuran (Auto-fill dari Pesanan Sebelumnya)

> Generated: 2026-06-02

---

## Ringkasan

Menambahkan fitur **Cari dari Histori** di halaman `admin/orders/create`.  
Admin dapat search nama pelanggan → lihat daftar item pesanan sebelumnya (nama, jenis pakaian, tgl masuk, ukuran sebagai deret angka) → klik salah satu → ukuran terisi otomatis ke form.

## Alur

```
[Form Pesanan Baru] → [Klik "Cari dari Histori"]
  → [Modal search] → [Ketik nama pelanggan]
  → [List item histori muncul: Nama · Jenis · Tgl · Ukuran]
  → [Klik salah satu row] → [Ukuran autofill ke item-0 form]
```

## Perubahan

### Backend

#### Schema Baru: `backend/app/schemas/order.py:122`

```python
class CustomerHistoryItem(BaseModel):
    customerName: str
    customerPhone: Optional[str] = None
    orderDate: datetime
    garmentTypeName: Optional[str] = None
    measurements: Optional[Dict[str, Any]]
```

#### CRUD Baru: `backend/app/crud/order.py:48`

`get_customer_history(db, search, limit=20)`:

- Query `OrderItem` join `Order`
- Filter `Order.customerName ILIKE %search%`
- Eager load `garmentType` + `order` relationships
- Order by `Order.createdAt DESC`
- Limit 20 hasil

#### Endpoint Baru: `backend/app/routers/orders.py:89`

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| `GET` | `/orders/history?search=...` | JWT | Cari histori item pesanan by nama pelanggan |

Response flat list of items (bukan dikelompokkan per order), tiap item bawa `customerName` dari parent order.

### Frontend

#### Type Baru: `frontend/shared/types/order.ts`

```typescript
interface CustomerHistoryItem {
  customerName: string
  customerPhone?: string | null
  orderDate: string
  garmentTypeName?: string | null
  measurements: Record<string, string>
}
```

#### Composable Baru: `frontend/app/composables/useOrders.ts`

`useCustomerHistory()` — debounced search ke `/orders/history`.

#### Komponen Baru: `frontend/app/components/HistoryMeasurementModal.vue`

| Elemen | Detail |
|--------|--------|
| **Trigger** | Klik row → emit `select(measurements)` + tutup modal |
| **Search** | Auto-focus, debounce 300ms via `watch(query)` |
| **Results** | Maks 20 item, tiap row = `Nama · Jenis · Tgl` + `ukuran (space-separated)` |
| **Loading** | Skeleton animasi 3 baris |
| **Empty state** | "Tidak ditemukan data untuk 'query'" |
| **Prompt state** | "Ketik nama pelanggan untuk mencari histori ukuran" |
| **Ukuran display** | Values dari 7 key (`Lingkar badan`..`Panjang rok`) digabung spasi |

#### Modifikasi: `frontend/app/pages/admin/orders/create.vue`

| Perubahan | Detail |
|-----------|--------|
| **Tombol** | "Cari dari Histori" di header (sebelah kanan judul) |
| **State** | `showHistoryModal` ref |
| **Handler** | `fillMeasurements(m)` → spread ke `form.items[0].measurements` |

## File yang Diubah/Dibuat

| File | Status | Perubahan |
|------|--------|-----------|
| `backend/app/schemas/order.py` | Diubah | + CustomerHistoryItem schema |
| `backend/app/crud/order.py` | Diubah | + get_customer_history() |
| `backend/app/routers/orders.py` | Diubah | + GET /orders/history endpoint |
| `frontend/shared/types/order.ts` | Diubah | + CustomerHistoryItem interface |
| `frontend/app/composables/useOrders.ts` | Diubah | + useCustomerHistory() |
| `frontend/app/components/HistoryMeasurementModal.vue` | **Baru** | Modal search + list + select |
| `frontend/app/pages/admin/orders/create.vue` | Diubah | + tombol + modal + handler |
