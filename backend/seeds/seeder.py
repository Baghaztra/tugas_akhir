"""
Dummy Seeder – mengisi database dengan data contoh yang realistis.

Tabel yang diisi:
  - workers
  - orders  (+ order_logs otomatis)
  - business_profiles (upsert id=1)
  - portfolio_items
"""

import sys
import os
from datetime import datetime, timedelta
import random

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models import * #noqa
from app.auth import get_password_hash

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

ORDERS = 0


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


def generate_receipt(index: int) -> str:
    date_str = datetime.now().strftime("%Y%m%d")
    return f"ORD-{date_str}-{index:04d}"


def build_item_logs(item: OrderItem, final_status: OrderStatus) -> list[OrderLog]:
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
        logs.append(
            OrderLog(
                order_item_id=item.id,
                status=status.value,
                note=notes_map[status],
                employeeName=random.choice(WORKERS_DATA)["name"],
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
            password_hash=get_password_hash("admin123"),
            name="Owner",
            is_owner=True,
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
    if (ORDERS >=0):
        print("   → Generating data orders & logs...")
        status_weights = [0.1, 0.15, 0.25, 0.15, 0.35]
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

            order = Order(
                receiptNumber=generate_receipt(i),
                customerName=random.choice(CUSTOMER_NAMES),
                customerPhone=random_phone(),
                paymentStatus=payment,
                totalPrice=float(total),
                paidAmount=float(paid),
                deadline=random_deadline(),
                notes="Harap dikerjakan dengan teliti." if random.random() > 0.6 else None,
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

                item = OrderItem(
                    order_id=order.id,
                    garmentTypeId=garment_map.get(random.choice(GARMENT_TYPES)),
                    description="Item custom",
                    quantity=random.randint(1, 5),
                    measurements={
                        "lingkar_dada": random.randint(85, 110),
                        "lingkar_pinggang": random.randint(65, 90),
                    },
                    attributes={
                        "bordir": random.choice([True, False]),
                        "payet": random.choice([True, False]),
                    },
                    status=item_status,
                )

                db.add(item)
                db.flush()

                # buat log per item
                logs = build_item_logs(item, item_status)
                for log in logs:
                    db.add(log)
        
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
    print(f"   Users          : 1 (owner@rumahjahit.id)")
    print(f"   Workers        : {len(WORKERS_DATA)}")
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
