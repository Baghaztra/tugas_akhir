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

# ─── Pastikan package app bisa diimpor ─────────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.worker import Worker, WorkerRole, WorkerStatus
from app.models.order import Order, OrderLog, OrderStatus, PaymentStatus
from app.models.profile import BusinessProfile
from app.models.portfolio import PortfolioItem

# Buat semua tabel kalau belum ada
import app.models.order      # noqa
import app.models.worker     # noqa
import app.models.profile    # noqa
import app.models.portfolio  # noqa
Base.metadata.create_all(bind=engine)


# ═══════════════════════════════════════════════════════════════════════════════
# DATA DUMMY
# ═══════════════════════════════════════════════════════════════════════════════

WORKERS_DATA = [
    {"name": "Budi Santoso",   "role": WorkerRole.POTONG,    "wagePerPiece": 15_000},
    {"name": "Siti Rahayu",    "role": WorkerRole.JAHIT,     "wagePerPiece": 20_000},
    {"name": "Ahmad Fauzi",    "role": WorkerRole.JAHIT,     "wagePerPiece": 20_000},
    {"name": "Dewi Kusuma",    "role": WorkerRole.FINISHING, "wagePerPiece": 12_000},
    {"name": "Eko Prasetyo",   "role": WorkerRole.POTONG,    "wagePerPiece": 15_000},
    {"name": "Fitri Handayani","role": WorkerRole.JAHIT,     "wagePerPiece": 22_000},
    {"name": "Gilang Ramadhan","role": WorkerRole.FINISHING, "wagePerPiece": 12_000},
    {"name": "Hani Pratiwi",   "role": WorkerRole.JAHIT,     "wagePerPiece": 18_000},
]

GARMENT_TYPES = [
    "Kemeja Formal", "Kemeja Batik", "Celana Panjang", "Celana Pendek",
    "Rok A-Line", "Blouse", "Jas", "Blazer", "Gamis", "Kebaya", "Tunik",
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

PORTFOLIO_DATA = [
    {
        "title": "Kemeja Batik Eksklusif",
        "category": "Kemeja",
        "description": "Kemeja batik motif parang dengan bahan katun premium, cocok untuk acara formal.",
    },
    {
        "title": "Gaun Pesta Mewah",
        "category": "Gaun",
        "description": "Gaun pesta dengan detail bordir tangan menggunakan bahan satin berkualitas tinggi.",
    },
    {
        "title": "Jas Pernikahan Custom",
        "category": "Jas",
        "description": "Jas pengantin custom dengan fitting sempurna, bahan wool impor pilihan.",
    },
    {
        "title": "Kebaya Modern",
        "category": "Kebaya",
        "description": "Kebaya modern dengan sentuhan kontemporer, cocok untuk wisuda dan lamaran.",
    },
    {
        "title": "Celana Bahan Formal",
        "category": "Celana",
        "description": "Celana bahan dengan potongan slim-fit, nyaman dipakai seharian di kantor.",
    },
    {
        "title": "Blazer Wanita Elegan",
        "category": "Blazer",
        "description": "Blazer wanita dengan potongan tailored, tersedia dalam berbagai pilihan warna.",
    },
]

BUSINESS_PROFILE = {
    "id": 1,
    "name": "Atelier Nusantara",
    "slogan": "Karya Tangan, Warisan Budaya",
    "address": "Jl. Mawar No. 12, Kel. Sukamaju, Kec. Cibeunying, Bandung, Jawa Barat 40132",
    "phone": "022-7654321",
    "email": "info@ateliernusantara.id",
    "hours": "Senin–Sabtu: 08.00–17.00 WIB",
    "instagram": "@ateliernusantara",
    "logo": None,
}


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


def build_order_logs(order: Order, final_status: OrderStatus) -> list[OrderLog]:
    """Buat log perjalanan status dari RECEIVED sampai final_status."""
    logs = []
    notes_map = {
        OrderStatus.RECEIVED:  "Pesanan diterima oleh admin.",
        OrderStatus.CUTTING:   "Kain sudah dipotong sesuai ukuran.",
        OrderStatus.SEWING:    "Proses jahit berjalan.",
        OrderStatus.FINISHING: "Finishing dan pengecekan kualitas.",
        OrderStatus.DONE:      "Pesanan selesai dan siap diambil.",
    }
    target_index = STATUSES_FLOW.index(final_status)
    for i, status in enumerate(STATUSES_FLOW[: target_index + 1]):
        log = OrderLog(
            order_id=order.id,
            status=status.value,
            note=notes_map[status],
            employeeName="Admin" if status == OrderStatus.RECEIVED else random.choice(WORKERS_DATA)["name"],
            createdAt=datetime.now() - timedelta(days=(target_index - i) * 2),
        )
        logs.append(log)
    return logs


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN SEEDER
# ═══════════════════════════════════════════════════════════════════════════════

def seed(db):
    print("🌱 Memulai seeding database...")

    # ── 1. Workers ──────────────────────────────────────────────────────────
    print("   → Menanam data workers...")
    workers = []
    for data in WORKERS_DATA:
        worker = Worker(
            name=data["name"],
            role=data["role"],
            status=random.choice([WorkerStatus.WORKING, WorkerStatus.IDLE]),
            wagePerPiece=data["wagePerPiece"],
            weeklyCompleted=random.randint(0, 20),
        )
        db.add(worker)
        workers.append(worker)
    db.flush()

    worker_names = [w.name for w in workers]

    # ── 2. Orders + OrderLogs ──────────────────────────────────────────────
    print("   → Menanam data orders & logs...")
    status_weights = [0.1, 0.15, 0.25, 0.15, 0.35]   # received → done
    for i in range(1, 31):   # 30 pesanan dummy
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
            garmentType=random.choice(GARMENT_TYPES),
            description="Pesanan custom sesuai ukuran pelanggan.",
            measurements={
                "lingkar_dada": random.randint(85, 110),
                "lingkar_pinggang": random.randint(65, 90),
                "panjang_baju": random.randint(60, 80),
                "panjang_lengan": random.randint(55, 65),
            },
            status=final_status,
            paymentStatus=payment,
            totalPrice=float(total),
            paidAmount=float(paid),
            deadline=random_deadline(),
            assignedTo=random.choice(worker_names) if final_status != OrderStatus.RECEIVED else None,
            notes="Harap dikerjakan dengan teliti." if random.random() > 0.6 else None,
            createdAt=datetime.now() - timedelta(days=random.randint(1, 60)),
        )
        db.add(order)
        db.flush()

        # Buat log
        logs = build_order_logs(order, final_status)
        for log in logs:
            db.add(log)

    # ── 3. Business Profile ─────────────────────────────────────────────────
    print("   → Menanam data business profile...")
    existing = db.query(BusinessProfile).filter_by(id=1).first()
    if not existing:
        db.add(BusinessProfile(**BUSINESS_PROFILE))

    # ── 4. Portfolio ─────────────────────────────────────────────────────────
    print("   → Menanam data portfolio...")
    for p in PORTFOLIO_DATA:
        db.add(PortfolioItem(**p))

    db.commit()
    print("✅ Seeding selesai!")
    print(f"   Workers        : {len(WORKERS_DATA)}")
    print(f"   Orders         : 30")
    print(f"   Portfolio Items: {len(PORTFOLIO_DATA)}")
    print(f"   Business Profile: 1")


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
