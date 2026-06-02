# Progress Fix: Urutan Prioritas /orders/admin-work

> Generated: 2026-05-27

---

## Perbaikan: Sorting by Urgency di Admin Work

### Masalah

Di endpoint `GET /orders/admin-work`, urutan item tidak mencerminkan urgensi
yang sebenarnya. Item dengan label **green** (Aman) muncul di atas item
**red** (Mendesak).

### Root Cause

Di `backend/app/ranking_logic.py:102`, fitur `days_to_deadline` untuk model
XGBoost dihitung menggunakan **`created_at`** (statis sejak order dibuat):

```python
days_to_deadline = (deadline_date - created_at).days  # SALAH
```

Sementara label urgensi (`get_urgency_label`) menggunakan **hari ini**:

```python
days_left = (dl - date.today()).days  # BENAR
```

Akibatnya, model memprioritaskan berdasarkan total span dari creation ke
deadline (angka tetap), bukan sisa hari yang sebenarnya. Item dengan
lead time panjang (misal 45 hari, tapi sekarang overdue 15 hari → RED)
memiliki `days_to_deadline = 45` sementara item green dengan lead time 7
hari memiliki nilai 7 — model memberi skor lebih tinggi ke nilai kecil,
sehingga green naik ke atas.

### Perubahan

#### `backend/app/ranking_logic.py`

| Baris | Sebelum | Sesudah |
|-------|---------|---------|
| 1-10 | Docstring lama (TODO model ML) | Docstring baru, menjelaskan `days_to_deadline` dihitung dari hari ini |
| 90-102 | `days_to_deadline` dari `(deadline_date - created_at).days` | `days_to_deadline` dari `(deadline_date - today).days` |
| 93-100 | Blok parsing `created_at` (tidak lagi dipakai) | Dihapus |

#### File Baru

- `progress-0105.md` — dokumentasi ini

### Dampak

- Urutan item di Kanban Admin Work sekarang mencerminkan urgensi aktual
  (RED > YELLOW > GREEN)
- Fallback sort (deadline ascending) tetap sama, tidak berubah

### Verifikasi

- Test E2E: `GET /orders/admin-work` — urutan item teratas harus memiliki
  urgency `"red"` atau `"yellow"`, bukan `"green"`
- Secara manual: item dengan `deadline` paling dekat (atau sudah lewat)
  muncul di atas
