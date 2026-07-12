# Refactor: Customer Table with Measurement Templates

## Overview

Add `customers` table as a template store for repeat customers. When creating an order, user can:
- **Pick existing customer** → measurements auto-fill into items (still editable)
- **Skip / new customer** → backend saves customer with first item's measurements as template

## Todo List

### Phase 1: Backend — Model, Schema, CRUD

- [x] **1.1** Create `backend/app/models/customers.py`
  - `Customer` model with fields:
    - `id` (PK, Integer, autoincrement)
    - `name` (String 150, not null, indexed)
    - `phone` (String 20, nullable, indexed)
    - `lingkar_badan` (Float, nullable)
    - `lingkar_pinggang` (Float, nullable)
    - `lingkar_panggul` (Float, nullable)
    - `panjang_bahu` (Float, nullable)
    - `panjang_tgn` (Float, nullable)
    - `panjang_baju` (Float, nullable)
    - `panjang_rok` (Float, nullable)
    - `createdAt`, `updatedAt` (DateTime)
  - Relationship: `orders = relationship("Order", back_populates="customer")`

- [x] **1.2** Modify `backend/app/models/order.py`
  - Add `customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)` to `Order`
  - Add `customer = relationship("Customer", back_populates="orders")` to `Order`
  - Keep existing `customerName`, `customerPhone` columns (backward compat)

- [x] **1.3** Update `backend/app/models/__init__.py`
  - Export `Customer` from `customers.py`

- [x] **1.4** Create `backend/app/schemas/customer.py`
  - `CustomerBase` (name, phone, all 7 measurements optional)
  - `CustomerCreate(CustomerBase)`
  - `CustomerUpdate` (all fields optional)
  - `Customer(CustomerBase)` with `id`, `createdAt`, `updatedAt`, `from_attributes=True`
  - `CustomerBrief` (id, name, phone only — for dropdown/autocomplete)

- [x] **1.5** Update `backend/app/schemas/order.py`
  - Add `customer_id: Optional[int] = None` to `OrderCreateFormData`
  - Add `customer_id: Optional[int] = None` to `OrderUpdate`
  - Add `customer: Optional[CustomerBrief] = None` to `Order` response schema

- [x] **1.6** Create `backend/app/crud/customer.py`
  - `create_customer(db, customer: CustomerCreate) -> Customer`
  - `get_customer(db, customer_id: int) -> Customer`
  - `get_customers(db, skip, limit, search) -> List[Customer]`
    - Search by `name` OR `phone` (ILIKE)
  - `update_customer(db, customer_id, customer: CustomerUpdate) -> Customer`
  - `delete_customer(db, customer_id) -> Customer`
  - `search_customers(db, query: str, limit=10) -> List[CustomerBrief]`
    - For autocomplete: search name OR phone, return brief

- [x] **1.7** Update `backend/app/crud/order.py`
  - In `create_order()`:
    - If `customer_id` provided → link order to existing customer
    - If `customer_id` NOT provided → create new customer from `customerName`/`customerPhone` + first item's measurements, then link
    - Still populate `order.customerName` / `order.customerPhone` (denormalized, backward compat)

- [x] **1.8** Create `backend/app/routers/customers.py`
  - `POST /` — create customer
  - `GET /` — list customers (paginated, search by name/phone)
  - `GET /search` — autocomplete search (returns `CustomerBrief[]`)
  - `GET /{id}` — get customer with full measurements
  - `PUT /{id}` — update customer
  - `DELETE /{id}` — delete customer

- [x] **1.9** Register customer router in `backend/app/main.py`
  - `from app.routers.customers import router as customers`
  - `app.include_router(customers)`

### Phase 2: Backend — Seeder Refactor

- [x] **2.1** Update `seeds/seeder.py`
  - Generate 20-30 customers with random names, phones, measurements
  - Link seeded orders to customers via `customer_id`
  - Use existing customer's `name`/`phone` for `order.customerName`/`order.customerPhone`
  - Ensure seeder creates customers BEFORE orders (FK dependency)

- [x] **2.2** Update `seeds/reset.py`
  - Add `customers` to truncation list (before `orders` due to FK)

### Phase 3: Frontend — Types & Composables

- [ ] **3.1** Create `frontend/shared/types/customer.ts`
  ```ts
  export interface Customer {
    id: number
    name: string
    phone?: string | null
    lingkar_badan?: number | null
    lingkar_pinggang?: number | null
    lingkar_panggul?: number | null
    panjang_bahu?: number | null
    panjang_tgn?: number | null
    panjang_baju?: number | null
    panjang_rok?: number | null
    createdAt?: string
    updatedAt?: string | null
  }

  export interface CustomerBrief {
    id: number
    name: string
    phone?: string | null
  }

  export interface CustomerCreate {
    name: string
    phone?: string | null
    lingkar_badan?: number | null
    lingkar_pinggang?: number | null
    lingkar_panggul?: number | null
    panjang_bahu?: number | null
    panjang_tgn?: number | null
    panjang_baju?: number | null
    panjang_rok?: number | null
  }

  export interface CustomerUpdate {
    name?: string | null
    phone?: string | null
    lingkar_badan?: number | null
    lingkar_pinggang?: number | null
    lingkar_panggul?: number | null
    panjang_bahu?: number | null
    panjang_tgn?: number | null
    panjang_baju?: number | null
    panjang_rok?: number | null
  }
  ```

- [ ] **3.2** Update `frontend/shared/types/index.ts`
  - Export from `customer.ts`

- [ ] **3.3** Create `frontend/app/composables/useCustomers.ts`
  - `useCustomers(search?)` — list customers with search
  - `useCustomerSearch(query)` — autocomplete search, returns `CustomerBrief[]`
  - `useCustomer(id)` — single customer detail
  - `useCreateCustomer()` — POST
  - `useUpdateCustomer()` — PUT
  - `useDeleteCustomer()` — DELETE

- [ ] **3.4** Update `frontend/shared/types/order.ts`
  - Add `customer_id?: number | null` to `OrderCreate`
  - Add `customer_id?: number | null` to `OrderUpdate`
  - Add optional `customer?: CustomerBrief` to `Order` response

### Phase 4: Frontend — Customer Management Page

- [ ] **4.1** Create `frontend/app/pages/admin/customers/index.vue`
  - Table: customer name, phone, measurements summary, actions (edit/delete)
  - Search bar (by name or phone)
  - Add customer button → modal with form (name, phone, 7 measurement fields)
  - Edit customer → same modal pre-filled
  - Delete confirmation modal
  - Pagination

- [ ] **4.2** Update `frontend/app/layouts/admin.vue`
  - Add "Pelanggan" nav item in sidebar (with icon)

### Phase 5: Frontend — Order Form Customer Integration

- [ ] **5.1** Modify `frontend/app/pages/admin/orders/create.vue`
  - Add customer search/autocomplete section at top of form:
    - Text input that searches customers by name or phone (debounced)
    - Dropdown shows matching `CustomerBrief[]` results
    - "Pelanggan Baru" button to clear selection and enter new customer
  - When existing customer selected:
    - Auto-fill `customerName` and `customerPhone`
    - Auto-fill all item measurements from customer template
    - User can still edit measurements per item (override)
  - When no customer selected (or "Pelanggan Baru"):
    - Form works exactly as before (name + phone are free text)
    - On submit, backend auto-creates customer from first item measurements

- [ ] **5.2** Update or replace `HistoryMeasurementModal.vue`
  - Change from searching order history → searching customers table
  - Return customer measurements as template to fill items

### Phase 6: Testing & Verification

- [ ] **6.1** Run seeder → verify customers table populated, orders linked
- [ ] **6.2** Test order creation with existing customer (measurements auto-fill)
- [ ] **6.3** Test order creation without customer (new customer auto-created)
- [ ] **6.4** Test customer CRUD page (create, edit, delete, search)
- [ ] **6.5** Test customer search autocomplete in order form

---

## File Change Summary

| Action | File | What |
|--------|------|------|
| **NEW** | `backend/app/models/customers.py` | Customer model |
| **NEW** | `backend/app/schemas/customer.py` | Customer schemas |
| **NEW** | `backend/app/crud/customer.py` | Customer CRUD |
| **NEW** | `backend/app/routers/customers.py` | Customer API endpoints |
| **EDIT** | `backend/app/models/order.py` | Add `customer_id` FK + relationship |
| **EDIT** | `backend/app/models/__init__.py` | Export Customer |
| **EDIT** | `backend/app/schemas/order.py` | Add `customer_id` to Order schemas |
| **EDIT** | `backend/app/crud/order.py` | Auto-create/link customer in `create_order` |
| **EDIT** | `backend/app/main.py` | Register customers router |
| **EDIT** | `seeds/seeder.py` | Generate customers, link to orders |
| **EDIT** | `seeds/reset.py` | Add customers to truncation |
| **NEW** | `frontend/shared/types/customer.ts` | Customer TypeScript types |
| **EDIT** | `frontend/shared/types/index.ts` | Export customer types |
| **EDIT** | `frontend/shared/types/order.ts` | Add `customer_id` to order types |
| **NEW** | `frontend/app/composables/useCustomers.ts` | Customer API composable |
| **NEW** | `frontend/app/pages/admin/customers/index.vue` | Customer management page |
| **EDIT** | `frontend/app/layouts/admin.vue` | Add nav item |
| **EDIT** | `frontend/app/pages/admin/orders/create.vue` | Customer search + auto-fill |

## Measurement Field Mapping

| Indonesian Label | DB Column | Type |
|-----------------|-----------|------|
| Lingkar badan | `lingkar_badan` | Float (cm) |
| Lingkar pinggang | `lingkar_pinggang` | Float (cm) |
| Lingkar panggul | `lingkar_panggul` | Float (cm) |
| Panjang bahu | `panjang_bahu` | Float (cm) |
| Panjang tgn | `panjang_tgn` | Float (cm) |
| Panjang baju | `panjang_baju` | Float (cm) |
| Panjang rok | `panjang_rok` | Float (cm) |

These are the **template** values. Actual per-item measurements remain in `order_items.measurements` JSON.
