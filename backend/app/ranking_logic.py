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
from typing import List, Dict, Any
from collections import OrderedDict


# Stage mapping: query param → OrderStatus value
STAGE_STATUS_MAP = {
    "potong": "cutting",
    "jahit": "sewing",
    "finishing": "finishing",
    "semua": None,  # Semua status non-done
}

# Urutan phase yang ditampilkan di frontend
PHASE_ORDER = ["cutting", "sewing", "finishing"]

PHASE_LABELS = {
    "cutting": "Potong",
    "sewing": "Jahit",
    "finishing": "Finishing",
}


def _get_deadline(order) -> str:
    """Ambil deadline dari dict atau object."""
    if isinstance(order, dict):
        return order.get("deadline", "")
    return getattr(order, "deadline", "")


def sort_by_priority(orders: List) -> List:
    """
    Urutkan pesanan berdasarkan deadline ascending (paling dekat = index 0).

    # TODO: Ganti implementasi ini dengan model ML (XGBoost) untuk skoring
    #        urgency sesungguhnya setelah data training tersedia.
    """
    def deadline_key(order):
        try:
            return date.fromisoformat(_get_deadline(order))
        except (ValueError, TypeError):
            return date.max  # Taruh di akhir jika deadline tidak valid

    return sorted(orders, key=deadline_key)


def group_by_phase(orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Kelompokkan task list berdasarkan phase (cutting → sewing → finishing),
    masing-masing sudah diurutkan by priority (deadline ascending).

    Returns:
        [
          {
            "phase": "cutting",
            "phase_label": "Potong",
            "tasks": [ ... sorted tasks ... ]
          },
          ...
        ]
    """
    buckets: Dict[str, list] = {phase: [] for phase in PHASE_ORDER}

    for task in orders:
        status = task.get("status", "")
        if status in buckets:
            buckets[status].append(task)

    result = []
    for phase in PHASE_ORDER:
        sorted_tasks = sort_by_priority(buckets[phase])
        result.append({
            "phase": phase,
            "phase_label": PHASE_LABELS.get(phase, phase),
            "count": len(sorted_tasks),
            "tasks": sorted_tasks,
        })

    return result


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
