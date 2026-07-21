# Database

## ERD (Entity Relationship Diagram)

```
┌──────────────┐       ┌──────────────┐       ┌─────────────┐
│   customers  │──1:N──│    orders     │──1:N──│ order_items  │──1:N──│ order_logs │
└──────────────┘       └──────────────┘       └─────────────┘       └─────────────┘
                              │                      │                     │
                             N:1                    N:1                   N:1
                              │                      │                     │
                          (self-ref)            garment_types           workers
                                               └────────────┘         └─────────┘

┌──────────────┐  ┌────────────────┐  ┌──────────┐  ┌───────────────┐  ┌─────────────────────┐
│    users     │  │business_profiles│  │portfolio_items│  │  attributes   │  │password_reset_tokens  │
└──────────────┘  └────────────────┘  └─────────────┘  └───────────────┘  └─────────────────────┘
      │
      └──1:N── password_reset_tokens
```

## Tabel

| Tabel | Fungsi |
|-------|--------|
| `users` | Akun admin (email, password_hash, name, is_owner) |
| `password_reset_tokens` | Token OTP reset password (FK ke users) |
| `customers` | Data pelanggan (nama, telepon, 7 ukuran tubuh) |
| `orders` | Data pesanan (customer, deadline, pembayaran) |
| `order_items` | Item dalam pesanan (garment type, ukuran, status, sketch, attributes JSON) |
| `order_logs` | Log perubahan status setiap item (FK ke workers) |
| `workers` | Data karyawan (nama, role, status: Working/Idle) |
| `garment_types` | Jenis pakaian (Kemeja, Batik, dll) — soft delete |
| `attributes` | Attribute tags (Bordir, Furing, dll) — soft delete |
| `business_profiles` | Profil bisnis (single row, id=1) |
| `portfolio_items` | Portofolio hasil jahit (title, category, image, description) |

## Kolom Detail

### `users`

| Kolom | Tipe | Constraint |
|-------|------|-----------|
| id | Integer | PK, autoincrement |
| email | String(255) | unique, not null, indexed |
| password_hash | String(255) | not null |
| name | String(100) | unique, not null, indexed |
| is_owner | Boolean | default=True |
| created_at | DateTime(tz) | server_default=now |
| updated_at | DateTime(tz) | onupdate=now |

### `password_reset_tokens`

| Kolom | Tipe | Constraint |
|-------|------|-----------|
| id | Integer | PK, autoincrement |
| user_id | Integer | FK → users.id, not null |
| otp_code | String(6) | not null |
| expires_at | DateTime(tz) | not null |
| used | Boolean | default=False |
| created_at | DateTime(tz) | server_default=now |

### `customers`

| Kolom | Tipe | Constraint |
|-------|------|-----------|
| id | Integer | PK |
| name | String(150) | not null, indexed |
| phone | String(20) | nullable, indexed |
| lingkar_badan | Float | nullable |
| lingkar_pinggang | Float | nullable |
| lingkar_panggul | Float | nullable |
| panjang_bahu | Float | nullable |
| panjang_tgn | Float | nullable |
| panjang_baju | Float | nullable |
| panjang_rok | Float | nullable |
| createdAt | DateTime(tz) | server_default=now |
| updatedAt | DateTime(tz) | onupdate=now |

### `orders`

| Kolom | Tipe | Constraint |
|-------|------|-----------|
| id | Integer | PK |
| receiptNumber | String(30) | unique, indexed, not null |
| customer_id | Integer | FK → customers.id, nullable |
| customerName | String(150) | not null |
| customerPhone | String(20) | nullable |
| paymentStatus | Enum(PaymentStatus) | not null, default=UNPAID |
| totalPrice | Float | default=0 |
| dpAmount | Float | default=0 |
| deadline | String(20) | not null |
| notes | String(500) | nullable |
| createdAt | DateTime(tz) | server_default=now |
| updatedAt | DateTime(tz) | onupdate=now |

### `order_items`

| Kolom | Tipe | Constraint |
|-------|------|-----------|
| id | Integer | PK |
| order_id | Integer | FK → orders.id, not null |
| garmentTypeId | Integer | FK → garment_types.id, nullable |
| description | String(300) | nullable |
| sketch | String(200) | nullable |
| quantity | Integer | default=1 |
| measurements | JSON | nullable, default=dict |
| attributes | JSON | nullable, default=dict |
| status | Enum(OrderStatus) | not null, default=RECEIVED |

### `order_logs`

| Kolom | Tipe | Constraint |
|-------|------|-----------|
| id | Integer | PK, indexed |
| order_item_id | Integer | FK → order_items.id, not null |
| status | String(30) | not null |
| note | String(300) | nullable, default="" |
| employeeName | String(100) | nullable, default="Admin" |
| worker_id | Integer | FK → workers.id, nullable |
| worker_name | String(100) | nullable |
| createdAt | DateTime(tz) | server_default=now |

### `workers`

| Kolom | Tipe | Constraint |
|-------|------|-----------|
| id | Integer | PK, indexed |
| name | String(100) | indexed |
| role | Enum(WorkerRole) | — |
| status | Enum(WorkerStatus) | default=IDLE |
| date_joined | DateTime(tz) | server_default=now |

### `garment_types`

| Kolom | Tipe | Constraint |
|-------|------|-----------|
| id | Integer | PK |
| name | String(100) | not null |
| is_deleted | Boolean | not null, default=False |

### `attributes`

| Kolom | Tipe | Constraint |
|-------|------|-----------|
| id | Integer | PK, indexed |
| name | String(100) | not null |
| is_deleted | Boolean | not null, default=False |

### `business_profiles`

| Kolom | Tipe | Constraint |
|-------|------|-----------|
| id | Integer | PK, default=1 |
| name | String(150) | not null, default="" |
| slogan | String(300) | nullable, default="" |
| address | String(500) | nullable, default="" |
| phone | String(30) | nullable, default="" |
| email | String(150) | nullable, default="" |
| hours | String(200) | nullable, default="" |
| instagram | String(100) | nullable, default="" |
| logo | String(500) | nullable |

### `portfolio_items`

| Kolom | Tipe | Constraint |
|-------|------|-----------|
| id | Integer | PK, indexed |
| title | String(200) | not null |
| category | String(100) | not null |
| image | String(500) | nullable |
| description | String(1000) | nullable, default="" |
| createdAt | DateTime(tz) | server_default=now |

## Enums

### OrderStatus
`RECEIVED` → `CUTTING` → `CUTTED` → `SEWING` → `SEWED` → `FINISHING` → `DONE`

### PaymentStatus
`PAID`, `UNPAID`, `PARTIAL`

### WorkerRole
`Potong`, `Jahit`, `Finishing`, `Magang`, `Other`

### WorkerStatus
`Working`, `Idle`

## Status Flow Order Item

```
received → cutting → cutted → sewing → sewed → finishing → done
```

- `received`: Pesanan diterima
- `cutting`: Sedang dipotong
- `cutted`: Selesai dipotong (siap dijahit)
- `sewing`: Sedang dijahit
- `sewed`: Selesai dijahit (siap finishing)
- `finishing`: Sedang finishing
- `done`: Selesai

## Alur Development Database

1. Ubah model di `app/models/`
2. Generate migration: `python manage.py generate`
3. Apply migration: `python manage.py migrate`
4. (Opsional) Seed data: `python manage.py seed`
