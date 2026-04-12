"""
Modul prioritas pesanan untuk halaman Employee Tasks.

Saat ini: sort ascending berdasarkan deadline (paling dekat = prioritas tertinggi).

# TODO: Ganti fungsi sort_by_priority() dengan model ML (XGBoost) yang
#        memperhitungkan: deadline proximity, beban kerja, jenis pakaian,
#        riwayat durasi pengerjaan worker, dll.
#        Model disimpan di: backend/app/ml_model/priority_model.pkl
#        Training script: backend/ml/train_priority.py
"""

from datetime import date
from typing import List


# Stage mapping: query param → OrderStatus value
STAGE_STATUS_MAP = {
    "potong": "cutting",
    "jahit": "sewing",
    "finishing": "finishing",
    "semua": None,  # Semua status non-done
}


def sort_by_priority(orders: List) -> List:
    """
    Urutkan pesanan berdasarkan deadline ascending (paling dekat = index 0).

    # TODO: Ganti implementasi ini dengan model ML (XGBoost) untuk skoring
    #        urgency sesungguhnya setelah data training tersedia.
    """
    def deadline_key(order):
        try:
            return date.fromisoformat(order.deadline)
        except (ValueError, TypeError):
            return date.max  # Taruh di akhir jika deadline tidak valid

    return sorted(orders, key=deadline_key)


def get_urgency_label(deadline_str: str) -> str:
    """
    Tentukan label warna berdasarkan jarak ke deadline.
    red = sudah lewat atau ≤ 1 hari, yellow = 2-3 hari, green = > 3 hari.

    # TODO: Ganti dengan output probabilitas dari model ML.
    """
    try:
        dl = date.fromisoformat(deadline_str)
        days_left = (dl - date.today()).days
        if days_left <= 1:
            return "red"
        elif days_left <= 3:
            return "yellow"
        else:
            return "green"
    except (ValueError, TypeError):
        return "yellow"
