"""
manage.py – CLI helper untuk migrasi, seeding, dan reset database.

Perintah:
  python manage.py generate      -> Buat migration baru
  python manage.py migrate       -> Jalankan semua migration yang pending
  python manage.py migrate:down  -> Rollback migration terakhir
  python manage.py migrate:reset -> Rollback semua migration (downgrade ke base)
  python manage.py seed          -> Isi database dengan data dummy
  python manage.py reset         -> Kosongkan semua tabel (reset auto-increment)
  python manage.py fresh         -> reset + seed (fresh start)
"""

import sys
import subprocess
import os

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stdin.reconfigure(encoding="utf-8", errors="replace")


def run(cmd: list[str]):
    """Jalankan sub-proses dan teruskan output-nya."""
    # Use venv Python if available
    venv_python = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".venv", "Scripts", "python.exe")
    if os.path.exists(venv_python) and cmd[0] == sys.executable:
        cmd[0] = venv_python
    result = subprocess.run(cmd, cwd=os.path.dirname(os.path.abspath(__file__)))
    sys.exit(result.returncode)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    command = sys.argv[1].lower()

    # ── Migration commands ──────────────────────────────────────────────────
    if command == "generate":
        print(">> Membuat migration baru...")
        run(["alembic", "revision", "--autogenerate"])

    elif command == "migrate":
        print(">> Menjalankan migration ke versi terbaru...")
        run(["alembic", "upgrade", "head"])

    elif command == "migrate:down":
        print(">> Rollback migration terakhir...")
        run(["alembic", "downgrade", "-1"])

    elif command == "migrate:reset":
        print(">> Rollback semua migration ke base...")
        run(["alembic", "downgrade", "base"])

    elif command == "migrate:status":
        run(["alembic", "current"])

    elif command == "migrate:history":
        run(["alembic", "history", "--verbose"])

    # ── Seed command ────────────────────────────────────────────────────────
    elif command == "seed":
        print(">> Menjalankan seeder...")
        run([sys.executable, "-m", "seeds.seeder"])

    # ── Reset command ───────────────────────────────────────────────────────
    elif command == "reset":
        confirm = input("[!] Semua data akan dihapus. Lanjutkan? (y/N): ").strip().lower()
        if confirm != "y":
            print("Dibatalkan.")
            sys.exit(0)
        run([sys.executable, "-m", "seeds.reset"])

    # ── Fresh command (reset + seed) ────────────────────────────────────────
    elif command == "fresh":
        confirm = input("[!] Semua data akan dihapus dan di-seed ulang. Lanjutkan? (y/N): ").strip().lower()
        if confirm != "y":
            print("Dibatalkan.")
            sys.exit(0)
        run([sys.executable, "-m", "seeds.reset"])
        run([sys.executable, "-m", "seeds.seeder"])

    else:
        print(f"[X] Perintah tidak dikenal: '{command}'")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
