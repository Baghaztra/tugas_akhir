"""
Modul prioritas pesanan untuk halaman Employee Tasks.

Saat ini: sort ascending berdasarkan deadline (paling dekat = prioritas tertinggi).

# TODO: Ganti fungsi sort_by_priority() dengan model ML (XGBoost) yang
#        memperhitungkan: deadline proximity, beban kerja, jenis pakaian,
#        riwayat durasi pengerjaan worker, dll.
#        Model disimpan di: backend/app/ml_model/priority_model.pkl
#        Training script: backend/ml/train_priority.py
"""

from datetime import date, datetime
import os
import pickle
import pandas as pd
from typing import List, Dict, Any
from collections import OrderedDict

# Coba import xgboost, kalau gagal fallback
try:
    import xgboost as xgb
except ImportError:
    xgb = None

# Load Model XGBoost
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "xgboost", "xgboost_ranker_v5.pkl"))
RANKER_MODEL = None
EXPECTED_FEATURES = []

try:
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            RANKER_MODEL = pickle.load(f)
        EXPECTED_FEATURES = getattr(RANKER_MODEL, "feature_names_in_", [])
except Exception as e:
    print(f"[Warning] Failed to load XGBoost model: {e}")


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


def sort_by_priority(orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Urutkan pesanan menggunakan model XGBoost.
    Fallback: Jika model tidak tersedia/gagal, sort berdasarkan deadline ascending.
    """
    if not orders:
        return orders

    def deadline_key(order):
        try:
            return date.fromisoformat(_get_deadline(order))
        except (ValueError, TypeError):
            return date.max

    if RANKER_MODEL is None or xgb is None or not EXPECTED_FEATURES:
        return sorted(orders, key=deadline_key)

    # ---- INFERENCE ML ----
    data_rows = []
    today = datetime.now()

    for idx, order in enumerate(orders):
        row = {"_list_index": idx}

        # 1. Hitung days_to_deadline
        try:
            deadline_date = datetime.strptime(order.get("deadline", ""), "%Y-%m-%d")
            # created_at dari database
            created_at = order.get("created_at")
            if isinstance(created_at, datetime):
                created_at = created_at.replace(tzinfo=None)
            elif isinstance(created_at, str):
                # Handle isoformat string fallback
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00')).replace(tzinfo=None)
            else:
                created_at = today

            days_to_deadline = (deadline_date - created_at).days
        except (ValueError, TypeError):
            days_to_deadline = 0

        row["days_to_deadline"] = days_to_deadline

        # 2. Parsing Features dari attributes
        attrs = order.get("attributes") or {}
        
        for feat in EXPECTED_FEATURES:
            if feat == "days_to_deadline":
                continue
            
            val = 0
            if isinstance(attrs, dict):
                # attributes mungkin dict { "Bordir": true, "Furing": false }
                if attrs.get(feat):
                    val = 1
            elif isinstance(attrs, list):
                # atau array of string
                if feat in attrs:
                    val = 1
            
            row[feat] = val
        
        data_rows.append(row)

    try:
        df = pd.DataFrame(data_rows)
        X = df[EXPECTED_FEATURES]

        # Prediksi skor AI
        scores = RANKER_MODEL.predict(xgb.DMatrix(X))
        df["model_score"] = scores

        # Urutkan descending (skor tertinggi = rank 1)
        df = df.sort_values(by="model_score", ascending=False)

        sorted_orders = []
        for sorted_idx in df["_list_index"]:
            sorted_orders.append(orders[sorted_idx])
        
        print("[Info] Model soring successfully")
        return sorted_orders
        
    except Exception as e:
        print(f"[Warning] XGBoost inference error: {e}")
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
