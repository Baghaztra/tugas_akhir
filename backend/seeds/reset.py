"""
Reset Script – menghapus semua data dari semua tabel dan mengulang auto-increment.

Urutan penghapusan memperhatikan foreign-key constraints.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models.order import Order, OrderLog
from app.models.worker import Worker
from app.models.profile import BusinessProfile
from app.models.portfolio import PortfolioItem
from sqlalchemy import text

# Import agar semua model terdaftar di Base.metadata
import app.models.order      # noqa
import app.models.worker     # noqa
import app.models.profile    # noqa
import app.models.portfolio  # noqa


def reset(db, reseed: bool = False):
    """
    Hapus semua baris dari setiap tabel, lalu reset auto-increment ke 1.

    Args:
        reseed: Jika True, jalankan seeder otomatis setelah reset.
    """
    print("🗑️  Mereset database...")

    # Nonaktifkan FK checks sementara (MySQL)
    db.execute(text("SET FOREIGN_KEY_CHECKS = 0"))

    tables = ["order_logs", "orders", "workers", "portfolio_items", "business_profiles"]
    for table in tables:
        db.execute(text(f"TRUNCATE TABLE `{table}`"))
        print(f"   ✓ Tabel '{table}' dikosongkan")

    db.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
    db.commit()
    print("✅ Semua tabel berhasil dikosongkan dan auto-increment direset.")

    if reseed:
        print()
        from seeds.seeder import seed
        seed(db)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Reset database tables")
    parser.add_argument(
        "--reseed",
        action="store_true",
        help="Jalankan seeder setelah reset",
    )
    args = parser.parse_args()

    db = SessionLocal()
    try:
        reset(db, reseed=args.reseed)
    except Exception as e:
        db.rollback()
        print(f"❌ Reset gagal: {e}")
        raise
    finally:
        db.close()
