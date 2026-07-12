"""
Dummy Seeder – mengisi database dengan data contoh yang realistis.

Tabel yang diisi:
  - workers
  - customers
  - orders  (+ order_logs otomatis)
  - business_profiles (upsert id=1)
  - portfolio_items
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models import * #noqa
from app.auth import get_password_hash
from app.crud.order import _generate_receipt_number

Base.metadata.create_all(bind=engine)


# DATA DUMMY

WORKERS_DATA = [
    {"name": "Yan", "role": WorkerRole.POTONG},
    {"name": "Reza", "role": WorkerRole.POTONG},
    {"name": "Rusda", "role": WorkerRole.POTONG},
    {"name": "Elvi", "role": WorkerRole.POTONG},
    {"name": "Nabila", "role": WorkerRole.POTONG},
    {"name": "Zahra", "role": WorkerRole.POTONG},
    {"name": "Ari", "role": WorkerRole.JAHIT},
    {"name": "Isal", "role": WorkerRole.JAHIT},
    {"name": "Viora", "role": WorkerRole.JAHIT},
    {"name": "Nesa", "role": WorkerRole.JAHIT},
    {"name": "Vida", "role": WorkerRole.JAHIT},
    {"name": "Wiza", "role": WorkerRole.JAHIT},
    {"name": "Aiva", "role": WorkerRole.JAHIT},
    {"name": "Salwa", "role": WorkerRole.JAHIT},
    {"name": "Fitri", "role": WorkerRole.JAHIT},
    {"name": "Wati", "role": WorkerRole.JAHIT},
    {"name": "Mega", "role": WorkerRole.JAHIT},
    {"name": "Siti", "role": WorkerRole.JAHIT},
    {"name": "Anit", "role": WorkerRole.JAHIT},
    {"name": "Widya", "role": WorkerRole.FINISHING},
    {"name": "Airin", "role": WorkerRole.MAGANG},
    {"name": "Arini", "role": WorkerRole.MAGANG},
    {"name": "Saskia", "role": WorkerRole.MAGANG},
    {"name": "Azizah", "role": WorkerRole.MAGANG},
]

GARMENT_TYPES = [
    "Kemeja",
    "Dinas",
    "Blouse",
    "Blazer",
    "Gamis",
    "Kebaya",
    "Basiba",
    "Gaun",
    "Celana",
    "Rok",
]

ATTRIBUTES = [
    "Ban", "Batik", "Bis", "Bordir", "Borkat", "Celana", "Furing", "Furingpayet", 
    "Karet", "Karet Lengan", "Kerah Sanghai", "Kerat", "Kog", "Kubnat", "Mutiara", 
    "Payet", "Pita", "Polos", "Rok", "Rok Payung", "Selendang", "Songket", "Stik", 
    "Sulam", "Tic"
]

CUSTOMER_NAMES = [
    "Andi Wijaya", "Bela Kurnia", "Cahyo Nugroho", "Dina Marlina",
    "Erwin Saputra", "Fiona Halim", "Gunawan Hadi", "Hesti Agustina",
    "Ivan Susilo", "Julia Kartika", "Kevin Santoso", "Lina Megawati",
    "Mochammad Rizky", "Nadia Putri", "Oscar Firmansyah", "Putri Wahyu",
    "Rizal Maulana", "Sari Dewi", "Taufik Hidayat", "Utari Permata",
]

PHONE_PREFIXES = ["0812", "0813", "0821", "0822", "0851", "0852", "0878", "0881"]

STATUSES_FLOW = [
    OrderStatus.RECEIVED,
    OrderStatus.CUTTING,
    OrderStatus.SEWING,
    OrderStatus.FINISHING,
    OrderStatus.DONE,
]

BASE_URL = "http://localhost:8000"

PORTFOLIO_DATA = [
  {
    "title": "Kebaya Merah Bordir",
    "category": "Kebaya",
    "description": "Kebaya merah dengan bordir elegan dan rok batik",
    "image": BASE_URL+"/uploads/portofolio/kebaya_merah.png",
  },
  {
    "title": "Blouse Bunga Merah",
    "category": "Blouse",
    "description": "Blouse asimetris dengan motif bunga merah putih",
    "image": BASE_URL+"/uploads/portofolio/blouse_bunga.png",
  },
  {
    "title": "Baju Pesta Pink",
    "category": "Baju Pesta",
    "description": "Baju pesta pink dengan sulam hijau dan kuning",
    "image": BASE_URL+"/uploads/portofolio/baju_pesta_pink.png",
  },
  {
    "title": "Blouse Bunga Biru",
    "category": "Blouse",
    "description": "Blouse biru dengan motif bunga putih dan ruffles",
    "image": BASE_URL+"/uploads/portofolio/blouse_bunga_biru.png",
  },
  {
    "title": "Blouse Kombinasi Pink",
    "category": "Blouse",
    "description": "Blouse pink kombinasi dengan lengan transparan",
    "image": BASE_URL+"/uploads/portofolio/blouse_jambu.png",
  },
  {
    "title": "Baju Maroon Batik",
    "category": "Baju Batik",
    "description": "Baju maroon dengan kombinasi batik tribal",
    "image": BASE_URL+"/uploads/portofolio/merah_maroon.png",
  }
]

BUSINESS_PROFILE = {
    "id": 1,
    "name": "Rumah Jahit Yan",
    "slogan": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "address": "Jl. Kenangan, Kel. Napar, Kec. Payakumbuh Utara, Kota Payakumbuh, Sumatera Barat",
    "phone": "0126731094",
    "email": "info@rumahjahityan.id",
    "hours": "Senin–Sabtu: 08.00–17.00 WIB",
    "instagram": "@rumahjahityan",
    "logo": None,
}

ORDERS = 30


# ═══════════════════════════════════════════════════════════════════════════════
# HELPER
# ═══════════════════════════════════════════════════════════════════════════════

def random_phone() -> str:
    prefix = random.choice(PHONE_PREFIXES)
    suffix = "".join([str(random.randint(0, 9)) for _ in range(8)])
    return f"{prefix}{suffix}"


def random_deadline(days_ahead_min=7, days_ahead_max=30) -> str:
    delta = random.randint(days_ahead_min, days_ahead_max)
    return (datetime.now() + timedelta(days=delta)).strftime("%Y-%m-%d")


def _pick_worker_for_status(workers: list, status: OrderStatus):
    role_map = {
        OrderStatus.CUTTING: WorkerRole.POTONG,
        OrderStatus.SEWING: WorkerRole.JAHIT,
        OrderStatus.FINISHING: WorkerRole.FINISHING,
    }
    role = role_map.get(status)
    if role:
        eligible = [w for w in workers if w.role == role]
        if eligible:
            return random.choice(eligible)
    return random.choice(workers)


def build_item_logs(item: OrderItem, final_status: OrderStatus, workers: list) -> list[OrderLog]:
    logs = []
    notes_map = {
        OrderStatus.RECEIVED:  "Pesanan diterima.",
        OrderStatus.CUTTING:   "Kain dipotong.",
        OrderStatus.SEWING:    "Proses jahit.",
        OrderStatus.FINISHING: "Finishing.",
        OrderStatus.DONE:      "Selesai.",
    }

    target_index = STATUSES_FLOW.index(final_status)

    for i, status in enumerate(STATUSES_FLOW[: target_index + 1]):
        worker = _pick_worker_for_status(workers, status)
        logs.append(
            OrderLog(
                order_item_id=item.id,
                status=status.value,
                note=notes_map[status],
                employeeName=worker.name,
                worker_id=worker.id,
                worker_name=worker.name,
                createdAt=datetime.now() - timedelta(days=(target_index - i)),
            )
        )

    return logs

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN SEEDER
# ═══════════════════════════════════════════════════════════════════════════════

def seed(db):
    print("🌱 Memulai seeding database...")

    # Owner User
    print("   → Generating owner user...")
    existing_user = db.query(User).filter(User.email == "owner@rumahjahit.id").first()
    if not existing_user:
        db.add(User(
            email="owner@rumahjahit.id",
            password_hash=get_password_hash("111111"),
            name="Owner",
            is_owner=True,
        ))
        db.flush()
    
    # Staff admin user
    print("   → Generating staff admin user...")
    existing_staff = db.query(User).filter(User.email == "staff@rumahjahit.id").first()
    if not existing_staff:
        db.add(User(
            email="staff@rumahjahit.id",
            password_hash=get_password_hash("111111"),
            name="Staff 1",
            is_owner=False,
        ))
        db.flush()

    # Workers
    print("   → Generating data workers...")
    workers = []
    for data in WORKERS_DATA:
        worker = Worker(
            name=data["name"],
            role=data["role"],
            status=WorkerStatus.IDLE,
        )
        db.add(worker)
        workers.append(worker)
    db.flush()

    worker_names = [w.name for w in workers]

    # Customers
    print("   → Generating data customers...")
    customers = []
    for name in CUSTOMER_NAMES:
        customer = Customer(
            name=name,
            phone=random_phone(),
            lingkar_badan=round(random.uniform(85, 110), 1),
            lingkar_pinggang=round(random.uniform(65, 90), 1),
            lingkar_panggul=round(random.uniform(90, 115), 1),
            panjang_bahu=round(random.uniform(38, 48), 1),
            panjang_tgn=round(random.uniform(50, 65), 1),
            panjang_baju=round(random.uniform(60, 80), 1),
            panjang_rok=round(random.uniform(55, 100), 1),
        )
        db.add(customer)
        customers.append(customer)
    db.flush()

    # Garment Types
    print("   → Generating data garment types...")
    garments = [GarmentType(name=gt) for gt in GARMENT_TYPES]
    db.add_all(garments)
    db.flush()

    # Attributes
    print("   → Generating data attributes...")
    attrs = [Attribute(name=a) for a in ATTRIBUTES]
    db.add_all(attrs)
    db.flush()

    garment_map = {gt.name: gt.id for gt in garments}
    
    # Orders + OrderLogs
    if (ORDERS >= 0):
        print("   → Generating data orders & logs...")
        status_weights = [0.1, 0.15, 0.25, 0.15, 0.35]
        in_progress_assignments = []
        for i in range(1, (ORDERS + 1)):
            final_status = random.choices(STATUSES_FLOW, weights=status_weights, k=1)[0]
            payment = random.choices(
                [PaymentStatus.PAID, PaymentStatus.UNPAID, PaymentStatus.PARTIAL],
                weights=[0.4, 0.3, 0.3],
                k=1,
            )[0]
            total = random.choice([150_000, 200_000, 250_000, 300_000, 400_000, 500_000])
            paid = 0
            if payment == PaymentStatus.PAID:
                paid = total
            elif payment == PaymentStatus.PARTIAL:
                paid = total // 2

            # Pick a customer for this order
            customer = random.choice(customers)

            order = Order(
                receiptNumber=_generate_receipt_number(db),
                customer_id=customer.id,
                customerName=customer.name,
                customerPhone=customer.phone,
                paymentStatus=payment,
                totalPrice=float(total),
                paidAmount=float(paid),
                deadline=random_deadline(),
                notes=random.choice([
                    "Harap dikerjakan dengan teliti.",
                    "Pelanggan repeat order, kualitas dijaga.",
                    "Tambahan: minta bordir di dada kiri.",
                    "Warna harus sesuai sample.",
                    None, None, None,
                ]),
                createdAt=datetime.now() - timedelta(days=random.randint(1, 60)),
            )
            db.add(order)
            db.flush()

            # Buat item
            num_items = random.randint(1, 3)
            for _ in range(num_items):
                item_status = random.choices(
                    STATUSES_FLOW,
                    weights=[0.1, 0.2, 0.3, 0.2, 0.2],
                    k=1
                )[0]

                garment_name = random.choice(GARMENT_TYPES)
                descriptions = {
                    "Kemeja": ["Kemeja lengan panjang bahan katun", "Kemeja flannel motif kotak", "Kemeja putih formal"],
                    "Dinas": ["Seragam dinas PNS", "Dinas warna khaki", "Dinas lengkap dengan emblem"],
                    "Blouse": ["Blouse bahan sifon", "Blouse motif bunga", "Blouse lengan lonceng"],
                    "Blazer": ["Blazer hitam formal", "Blazer kerja wanita", "Blazer slim fit"],
                    "Gamis": ["Gamis bahan wolfis", "Gamis syar'i warna pastel", "Gamis brokat kombinasi"],
                    "Kebaya": ["Kebaya modern kutu baru", "Kebaya brokat Bali", "Kebaya encim warna merah"],
                    "Basiba": ["Basiba bahan tile", "Basiba warna emas", "Basiba dengan payet"],
                    "Gaun": ["Gaun pesta panjang", "Gaun bridesmaid", "Gaun malam warna navy"],
                    "Celana": ["Celana bahan formal", "Celana kulot wanita", "Celana pensil warna hitam"],
                    "Rok": ["Rok span warna hitam", "Rok plisket panjang", "Rok A-line motif batik"],
                }
                item = OrderItem(
                    order_id=order.id,
                    garmentTypeId=garment_map.get(garment_name),
                    description=random.choice(descriptions.get(garment_name, ["Item custom"])),
                    quantity=random.randint(1, 3),
                    measurements={
                        "Lingkar badan": str(random.randint(85, 110)),
                        "Lingkar pinggang": str(random.randint(65, 90)),
                        "Lingkar panggul": str(random.randint(90, 115)),
                        "Panjang bahu": str(random.randint(38, 48)),
                        "Panjang tgn": str(random.randint(50, 65)),
                        "Panjang baju": str(random.randint(60, 80)),
                        "Panjang rok": str(random.randint(55, 100)),
                    },
                    attributes={
                        random.choice(ATTRIBUTES): True,
                        random.choice(ATTRIBUTES): True,
                    },
                    status=item_status,
                )

                db.add(item)
                db.flush()

                # buat log per item
                logs = build_item_logs(item, item_status, workers)
                for log in logs:
                    db.add(log)

                # Track worker assignment for in-progress items
                if item_status in (OrderStatus.CUTTING, OrderStatus.SEWING, OrderStatus.FINISHING):
                    last_log = logs[-1]
                    if last_log.worker_id:
                        in_progress_assignments.append(last_log.worker_id)

        # Update worker status: workers assigned to in-progress items → WORKING
        for wid in set(in_progress_assignments):
            worker = next((w for w in workers if w.id == wid), None)
            if worker:
                worker.status = WorkerStatus.WORKING
        
    # Business Profile
    print("   → Generating data business profile...")
    existing = db.query(BusinessProfile).filter_by(id=1).first()
    if not existing:
        db.add(BusinessProfile(**BUSINESS_PROFILE))

    # Portfolio
    print("   → Generating data portfolio...")
    for p in PORTFOLIO_DATA:
        db.add(PortfolioItem(**p))

    db.commit()
    print("✅ Seeding selesai!")
    print(f"   Users          : 2")
    print(f"   Workers        : {len(WORKERS_DATA)}")
    print(f"   Customers      : {len(CUSTOMER_NAMES)}")
    print(f"   Orders         : {ORDERS}")
    print(f"   Portfolio Items: {len(PORTFOLIO_DATA)}")
    print(f"   Business Profile: 1")
    print(f"   Attributes     : {len(ATTRIBUTES)}")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed(db)
    except Exception as e:
        db.rollback()
        print(f"❌ Seeding gagal: {e}")
        raise
    finally:
        db.close()
