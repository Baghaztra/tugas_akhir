# Struktur & Format Penulisan Kode

## Backend (Python / FastAPI)

### Konvensi

- **Python style**: PEP 8, type hints pada semua function signature
- **Naming**: `snake_case` untuk variable/function, `PascalCase` untuk class
- **File organization**: Satu file per entity di setiap layer (models, schemas, crud, routers)
- **Import**: Menggunakan relative import (`from ..models import ...`)

### Pola CRUD

```python
# routers/worker.py - Endpoint
@router.post("/", response_model=Worker)
def create_worker(worker: WorkerCreate, db: Session = Depends(get_db)):
    return crud_worker.create_worker(db=db, worker=worker)

# crud/worker.py - Business logic
def create_worker(db: Session, worker: WorkerCreate):
    db_worker = Worker(**worker.model_dump())
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker

# schemas/worker.py - Validation
class WorkerCreate(BaseModel):
    name: str
    role: WorkerRole

# models/worker.py - Database model
class Worker(Base):
    __tablename__ = "workers"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    role = Column(Enum(WorkerRole))
```

### Router Registration

Di `app/main.py`:

```python
from .routers import workers, orders, profile
app.include_router(workers.router)
app.include_router(orders.router)
```

## Frontend (TypeScript / Vue 3 / Nuxt 4)

### Konvensi

- **Component**: `PascalCase` nama file dan komponen (`AppButton.vue`)
- **Composable**: `camelCase` dengan prefix `use` (`useOrders.ts`)
- **Script**: `<script setup lang="ts">` (Composition API)
- **Style**: Tailwind CSS utility classes di template
- **Naming**: `camelCase` untuk variable/function, `PascalCase` untuk component

### Composable Pattern

```typescript
// composables/useOrders.ts
export function useOrders() {
  const { apiBase } = useRuntimeConfig().public
  const { data, status, refresh } = useFetch(`${apiBase}/orders`, {
    credentials: 'include',
  })
  return { orders: data, status, refresh }
}
```

### Page Pattern

```vue
<template>
  <div>
    <definePageMeta :layout="'admin'" />
    <!-- content -->
  </div>
</template>

<script setup lang="ts">
const { orders, status } = useOrders()
</script>
```

### UI Components

Prefix `App` untuk semua UI primitives di `components/ui/`:

AppButton, AppCard, AppBadge, AppModal, AppConfirmModal, AppStatCard, AppSkeleton, AppEmptyState

### State Management (Pinia)

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  return { user, isAuthenticated, login, logout }
})
```

### Hybrid Rendering

Di `nuxt.config.ts`:
- `/` → Prerender (statis, SEO optimal)
- `/login`, `/admin/*`, `/tracking/*` → SPA (client-side)

### Tailwind Custom Colors

- `primary`: Teal/hijau (brand color) — `500: #17726d`
- `secondary`: Cream/beige — `500: #eae4d2`
