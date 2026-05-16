# ERD Database Konveksi

```dbdiagram
Table workers {
  id INTEGER [pk, increment]
  name VARCHAR(100)
  role ENUM('Potong', 'Jahit', 'Finishing', 'Magang', 'Other')
  status ENUM('Working', 'Idle')
  date_joined DATETIME
}

Table orders {
  id INTEGER [pk, increment]
  receiptNumber VARCHAR(30) [unique, not null]
  customerName VARCHAR(150) [not null]
  customerPhone VARCHAR(20)
  paymentStatus ENUM('paid', 'unpaid', 'partial') [not null]
  totalPrice FLOAT
  paidAmount FLOAT
  deadline VARCHAR(20) [not null]
  notes VARCHAR(500)
  createdAt DATETIME
  updatedAt DATETIME
}

Table garment_types {
  id INTEGER [pk, increment]
  name VARCHAR(100) [not null]
  is_deleted BOOLEAN [default: false]
}

Table order_items {
  id INTEGER [pk, increment]
  order_id INTEGER [not null]
  garmentTypeId INTEGER
  description VARCHAR(300)
  sketch VARCHAR(200)
  quantity INTEGER [default: 1]
  measurements JSON
  attributes JSON
  status ENUM('received', 'cutting', 'cutted', 'sewing', 'sewed', 'finishing', 'done') [not null]
}

Table order_logs {
  id INTEGER [pk, increment]
  order_item_id INTEGER [not null]
  status VARCHAR(30) [not null]
  note VARCHAR(300)
  employeeName VARCHAR(100)
  worker_id INTEGER
  worker_name VARCHAR(100)
  createdAt DATETIME
}

Table business_profiles {
  id INTEGER [pk, default: 1]
  name VARCHAR(150) [not null]
  slogan VARCHAR(300)
  address VARCHAR(500)
  phone VARCHAR(30)
  email VARCHAR(150)
  hours VARCHAR(200)
  instagram VARCHAR(100)
  logo VARCHAR(500)
}

Table portfolio_items {
  id INTEGER [pk, increment]
  title VARCHAR(200) [not null]
  category VARCHAR(100) [not null]
  image VARCHAR(500)
  description VARCHAR(1000)
  createdAt DATETIME
}

Table attributes {
  id INTEGER [pk, increment]
  name VARCHAR(100) [not null]
  is_deleted BOOLEAN [default: false]
}

Ref: orders.id < order_items.order_id
Ref: garment_types.id < order_items.garmentTypeId
Ref: workers.id < order_logs.worker_id
Ref: order_items.id < order_logs.order_item_id
```

## Notes

- **orders** → **order_items**: 1-to-many. Satu order bisa punya banyak item.
- **garment_types** → **order_items**: 1-to-many. Satu tipe garment bisa dipakai banyak item.
- **workers** → **order_logs**: 1-to-many. Satu worker bisa tercatat di banyak log.
- **order_items** → **order_logs**: 1-to-many. Satu item punya banyak log status (termasuk riwayat penugasan pekerja).
- **business_profiles**: Single-row table (selalu id=1) untuk profil bisnis.
- **attributes**: Tabel referensi untuk attribute tags (soft-delete via `is_deleted`).
- **garment_types**: Soft-delete via `is_deleted`.
```
