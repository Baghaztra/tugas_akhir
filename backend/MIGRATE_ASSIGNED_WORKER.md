# Migrasi: Pindahkan Relasi `assigned_worker_id` dari `order_items` ke `order_logs`

## Latar Belakang

Sebelumnya, `assigned_worker_id` dan `assigned_worker_name` disimpan langsung di tabel
`order_items`. Setiap kali pekerja mengambil/menyelesaikan tugas, kolom ini di-*update* —
padahal `order_items` adalah data master yang seharusnya jarang berubah.

Setelah migrasi, relasi pekerja dipindahkan ke `order_logs`:
- Setiap kali pekerja ditugaskan, `worker_id`/`worker_name` dicatat di log (status: cutting/sewing/finishing)
- Setiap kali fase selesai, `worker_id`/`worker_name` tetap dicatat di log untuk atribusi sejarah (status: cutted/sewed/done)
- Kolom `assigned_worker_id`/`assigned_worker_name` di `order_items` dihapus

## File yang Berubah

| File | Perubahan |
|------|-----------|
| `app/models/order.py` | OrderItem: hapus `assigned_worker_id`, `assigned_worker_name`. OrderLog: tambah `worker_id` (FK→workers.id), `worker_name`, relasi `worker` |
| `app/schemas/order.py` | OrderItem response: hapus field. OrderLog schemas: tambah `worker_id`, `worker_name` |
| `app/crud/order.py` | `_add_log()` terima `worker_id`/`worker_name`. Helper `_complete_phase()` untuk completion. `update_item_status_flow()` bersih tanpa mutasi OrderItem |
| `app/routers/orders.py` | admin-work eager-load logs, derive `assigned_worker_*` dari log terakhir yang punya `worker_id` |
| `ERD.md` | Update diagram relasi |

## Langkah Migration

### 1. Generate migration

```bash
cd backend
python manage.py generate
```

### 2. Edit file migrasi hasil generate

File baru akan muncul di `migrations/versions/`. Buka file tersebut dan
tambahkan logika migrasi data di dalam fungsi `upgrade()`:

```python
"""
move assigned_worker_id to order_logs

Revision ID: xxxxxxxx
Revises: 2f42ad7f7a53
Create Date: 2026-05-16 xx:xx:xx.xxxxxx
"""
from alembic import op
import sqlalchemy as sa


revision = 'xxxxxxxx'
down_revision = '2f42ad7f7a53'
branch_labels = None
depends_on = None


def upgrade():
    # ── 1. Tambah kolom baru ke order_logs ──
    op.add_column('order_logs', sa.Column('worker_id', sa.Integer(), nullable=True))
    op.add_column('order_logs', sa.Column('worker_name', sa.String(length=100), nullable=True))
    op.create_foreign_key(
        'fk_order_logs_worker',
        'order_logs', 'workers',
        ['worker_id'], ['workers.id']
    )

    # ── 2. Migrasi data: copy assigned_worker_* → order_logs ──
    #     (sesuaikan nama FK constraint jika perlu)
    op.execute("""
        UPDATE order_logs ol
        JOIN order_items oi ON ol.order_item_id = oi.id
        SET ol.worker_id = oi.assigned_worker_id,
            ol.worker_name = oi.assigned_worker_name
        WHERE oi.assigned_worker_id IS NOT NULL
    """)

    # ── 3. Hapus kolom lama dari order_items ──
    op.drop_constraint('order_items_ibfk_3', 'order_items', type_='foreignkey')
    op.drop_column('order_items', 'assigned_worker_id')
    op.drop_column('order_items', 'assigned_worker_name')


def downgrade():
    # ── Rollback: restore kolom dan data ──
    op.add_column('order_items', sa.Column('assigned_worker_id', sa.Integer(), nullable=True))
    op.add_column('order_items', sa.Column('assigned_worker_name', sa.String(length=100), nullable=True))
    op.create_foreign_key(
        'order_items_ibfk_3',
        'order_items', 'workers',
        ['assigned_worker_id'], ['workers.id']
    )

    op.execute("""
        UPDATE order_items oi
        JOIN (
            SELECT ol.order_item_id, ol.worker_id, ol.worker_name
            FROM order_logs ol
            WHERE ol.worker_id IS NOT NULL
            AND ol.id = (
                SELECT MAX(ol2.id)
                FROM order_logs ol2
                WHERE ol2.order_item_id = ol.order_item_id
                AND ol2.worker_id IS NOT NULL
            )
        ) latest ON oi.id = latest.order_item_id
        SET oi.assigned_worker_id = latest.worker_id,
            oi.assigned_worker_name = latest.worker_name
    """)

    op.drop_constraint('fk_order_logs_worker', 'order_logs', type_='foreignkey')
    op.drop_column('order_logs', 'worker_name')
    op.drop_column('order_logs', 'worker_id')
```

> **Catatan**: Nama FK constraint `order_items_ibfk_3` tergantung engine MySQL dan
> urutan pembuatan tabel. Jika salah, error akan muncul saat `drop_constraint`.
> Lihat troubleshooting di bawah untuk cara cek nama FK yang benar.

### 3. Jalankan migrasi

```bash
python manage.py migrate
```

### 4. Verifikasi

Cek bahwa kolom sudah berubah:

```sql
DESCRIBE order_items;
-- ❌ assigned_worker_id dan assigned_worker_name sudah tidak ada

DESCRIBE order_logs;
-- ✅ worker_id dan worker_name muncul
```

Cek data tetap utuh:

```sql
SELECT ol.id, ol.status, ol.worker_id, w.name AS worker_name
FROM order_logs ol
LEFT JOIN workers w ON w.id = ol.worker_id
WHERE ol.worker_id IS NOT NULL
LIMIT 20;
```

### 5. Restart backend

```bash
# restart server FastAPI
# (Ctrl+C lalu uvicorn lagi, atau restart container)
```

---

## Troubleshooting

### Nama FK constraint tidak cocok

**Error:**
```
sqlalchemy.exc.InvalidRequestError: Foreign key constraint with name "order_items_ibfk_3" not found
```

**Sebab:** Nama foreign key di database Anda berbeda.

**Solusi:** Cek nama FK yang benar:

```sql
SELECT CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'order_items'
  AND COLUMN_NAME = 'assigned_worker_id'
  AND REFERENCED_TABLE_NAME = 'workers';
```

Hasil query tersebut adalah nama FK yang harus dipakai di `drop_constraint()`.

### Data `assigned_worker_id` tidak ter-copy ke `order_logs`

**Cek:**
```sql
-- Apakah ada data di order_items?
SELECT id, assigned_worker_id, assigned_worker_name
FROM order_items
WHERE assigned_worker_id IS NOT NULL
LIMIT 10;

-- Apakah order_logs sudah punya worker_id setelah migrasi?
SELECT COUNT(*) AS total_with_worker
FROM order_logs
WHERE worker_id IS NOT NULL;
```

**Penyebab:** Jika tidak ada data di `order_items` (seeder tidak mengisi
`assigned_worker_id`), maka tidak ada yang perlu di-copy. Ini normal.

### Downgrade ingin dilakukan

```bash
python manage.py migrate:down
```

Atau rollback ke base:

```bash
python manage.py migrate:reset
```

### Kolom sudah ada / belum ada (Alembic conflict)

Jika migration gagal karena kolom sudah/sudah tidak ada (misal setelah rollback
sebagian), reset migration dan buat ulang:

```bash
python manage.py migrate:reset
python manage.py migrate
```

---

## Ringkasan Logika Baru

| Transisi | `_add_log` params | Worker status |
|----------|-------------------|---------------|
| RECEIVED → CUTTING (+worker_id) | status=cutting, worker_id=X, worker_name="Ali" | WORKING |
| CUTTING → CUTTED | status=cutted, worker_id=X, worker_name="Ali" (atribusi) | IDLE |
| CUTTED → SEWING (+worker_id) | status=sewing, worker_id=X, worker_name="Ali" | WORKING |
| SEWING → SEWED | status=sewed, worker_id=X, worker_name="Ali" (atribusi) | IDLE |
| SEWED → FINISHING (+worker_id) | status=finishing, worker_id=X, worker_name="Ali" | WORKING |
| FINISHING → DONE | status=done, worker_id=X, worker_name="Ali" (atribusi) | IDLE |

Untuk menentukan "current worker" di endpoint admin-work, backend mengambil
**log terakhir yang memiliki `worker_id`** untuk item tersebut.
