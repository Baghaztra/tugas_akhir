"""
Modul prioritas pesanan untuk Admin Kanban & sorting.

Sort by priority menggunakan model XGBoost (jika tersedia).
Fallback: ascending berdasarkan deadline (paling dekat = prioritas tertinggi).
"""

from datetime import date, datetime
import os
import pickle
import logging
import math
import pandas as pd
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Coba import xgboost, kalau gagal fallback
try:
    import xgboost as xgb
except ImportError:
    xgb = None

# Load Model XGBoost
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "xgboost", "xgboost_ranker_v7.pkl"))
RANKER_MODEL = None
EXPECTED_FEATURES = []

try:
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            RANKER_MODEL = pickle.load(f)
        EXPECTED_FEATURES = getattr(RANKER_MODEL, "feature_names_in_", [])
except Exception as e:
    logger.warning("Failed to load XGBoost model: %s", e)

JENIS_MAPPING = {
    'Dinas': 0, 'Rok': 1, 'Gamis': 2, 'Basiba': 3, 'Blouse': 4,
    'Kebaya': 5, 'Blazer': 6, 'Kemeja': 7, 'Gaun': 8, 'Rompi': 9
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

        # 1. Hitung days_to_deadline (sisa hari dari sekarang)
        try:
            deadline_date = datetime.strptime(order.get("deadline", ""), "%Y-%m-%d")
            days_to_deadline = (deadline_date - today).days
        except (ValueError, TypeError):
            days_to_deadline = 0

        row["days_to_deadline"] = days_to_deadline

        # Hitung urgency_score (exponential decay, sama dengan training v7)
        if days_to_deadline < 0:
            urgency_score = 1.0
        else:
            urgency_score = math.exp(-0.1 * days_to_deadline)
        row["urgency_score"] = urgency_score

        # 2. Parsing Features dari attributes
        attrs = order.get("attributes") or {}
        computed_feats = {"days_to_deadline", "complexity_score", "jenis_encoded", "urgency_score"}
        active_count = 0

        for feat in EXPECTED_FEATURES:
            if feat in computed_feats:
                continue

            val = 0
            if isinstance(attrs, dict):
                if attrs.get(feat):
                    val = 1
            elif isinstance(attrs, list):
                if feat in attrs:
                    val = 1

            row[feat] = val
            if val:
                active_count += 1

        row["complexity_score"] = active_count
        row["jenis_encoded"] = JENIS_MAPPING.get(order.get("garmentType", ""), -1)

        data_rows.append(row)

    try:
        df = pd.DataFrame(data_rows)
        X = df[EXPECTED_FEATURES]

        # Prediksi skor AI — coba sklearn-style dulu, fallback ke DMatrix
        try:
            scores = RANKER_MODEL.predict(X)
        except Exception:
            scores = RANKER_MODEL.predict(xgb.DMatrix(X))
        df["model_score"] = scores

        # Urutkan descending (skor tertinggi = rank 1)
        df = df.sort_values(by="model_score", ascending=False)

        sorted_orders = []
        for sorted_idx in df["_list_index"]:
            sorted_orders.append(orders[sorted_idx])
        
        logger.info("Model sorting successfully")
        return sorted_orders
        
    except Exception as e:
        logger.warning("XGBoost inference error: %s", e)
        return sorted(orders, key=deadline_key)


def get_urgency_label(deadline_str: str) -> str:
    """
    Tentukan label warna berdasarkan jarak ke deadline.
    red = sudah lewat atau ≤ 1 hari, yellow = 2-3 hari, green = > 3 hari.

    Catatan: model XGBRanker output ranking score, bukan probabilitas.
    Jika ingin label berbasis ML, mapping score ke 3 bucket via
    percentile threshold (contoh: top 30% → red, 30-70% → yellow,
    sisanya → green).
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
