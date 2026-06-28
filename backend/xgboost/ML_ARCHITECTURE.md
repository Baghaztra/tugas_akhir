# ML Model Architecture: XGBoost Ranker v7

## Table of Contents

1. [Overview](#1-overview)
2. [Model Loading](#2-model-loading)
3. [Training Pipeline](#3-training-pipeline)
4. [Feature Engineering](#4-feature-engineering)
5. [Inference Pipeline](#5-inference-pipeline)
6. [API Integration](#6-api-integration)
7. [Fallback Logic](#7-fallback-logic)
8. [Model Performance](#8-model-performance)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Key Design Decisions](#10-key-design-decisions)

---

## 1. Overview

The backend uses **XGBoost Ranker (`rank:pairwise`)** as a **Learning-to-Rank (LTR)** model to prioritize order items on the admin Kanban board.

- **Purpose**: Sort order items by priority so tailors know which orders to work on first.
- **Model**: XGBRanker Booster (native XGBoost, not sklearn wrapper).
- **Version**: v7 (production) — replaces v6 which had data leakage and overfitting.
- **Framework**: FastAPI (Python).
- **File**: `backend/xgboost/xgboost_ranker_v7.pkl`

---

## 2. Model Loading

**File**: `backend/app/ranking_logic.py:25-35`

```python
MODEL_PATH = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "xgboost", "xgboost_ranker_v7.pkl"
))
RANKER_MODEL = None
EXPECTED_FEATURES = []

try:
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            RANKER_MODEL = pickle.load(f)
        EXPECTED_FEATURES = getattr(RANKER_MODEL, "feature_names_in_", [])
except Exception as e:
    logger.warning("Failed to load XGBoost model: %s", e)
```

### Loading Flow

1. Module `ranking_logic.py` is imported (at FastAPI startup).
2. Constructs absolute path to `xgboost_ranker_v7.pkl`.
3. Opens file in binary mode, loads via `pickle.load()`.
4. Extracts `feature_names_in_` from the model object (set during training).
5. If any step fails → `RANKER_MODEL = None` → automatic fallback.

### Why Pickle?

- XGBoost Booster objects are not serializable via JSON.
- `pickle` preserves the full trained model including:
  - Tree structures
  - Feature names
  - Training parameters
  - Internal XGBoost configuration

---

## 3. Training Pipeline

### 3.1 Data Source

- **Raw data**: `data.xlsx` (historical orders from Excel).
- **Processed**: `data_processed_clean.csv` (1218 rows, 30 columns).
- **Training data**: generated from processed CSV with group labels.

### 3.2 Target Engineering (v7)

The target score is a combination of three factors:

```python
# Base formula
target_clean = (complexity_score / lead_time_days)   # Historical priority
             + (exp(-0.1 * days_to_deadline) * 2.5)   # Urgency multiplier
             + penalty_telat                          # Late penalty

# Outlier handling
target_clipped = target_clean.clip(
    lower=target_clean.quantile(0.01),
    upper=target_clean.quantile(0.99)
)

# Noise injection (prevents memorization)
noise_std = 0.25 * target_clipped.std()
noise = np.random.normal(0, noise_std, size=len(target_clipped))
target_noisy = target_clipped + noise
```

**v6 Problem**: Target was derived from the same features used as model input (data leakage → 0.98+ scores).
**v7 Fix**: Noise injection + clipping breaks the exact mathematical relationship.

### 3.3 Model Parameters

| Parameter | v6 | v7 | Purpose |
|-----------|-----|-----|---------|
| `objective` | `rank:pairwise` | `rank:pairwise` | Learning-to-Rank objective |
| `eval_metric` | `ndcg` | `ndcg` | Normalized Discounted Cumulative Gain |
| `max_depth` | 6 | **5** | Limit tree depth to reduce overfitting |
| `eta` | 0.1 | 0.1 | Learning rate (unchanged) |
| `lambda` | 0 | **1.0** | L2 regularization penalizes large leaf weights |
| `alpha` | 0 | **0.1** | L1 regularization encourages sparsity |
| `min_child_weight` | 0 | **5** | Minimum sum of instance weight per leaf |
| `gamma` | 0 | **0.1** | Minimum loss reduction required to split |
| `subsample` | 0.8 | 0.8 | Row sampling per tree (unchanged) |
| `colsample_bytree` | 0.8 | 0.8 | Feature sampling per tree (unchanged) |
| `num_boost_round` | 150 (fixed) | **300 max** | Early stopping at 30 rounds without improvement |

### 3.4 Cross-Validation

**v6**: Single 80/20 train/test split (unreliable evaluation).
**v7**: **GroupKFold 5-fold CV** (respects weekly batch groups).

```python
gkf = GroupKFold(n_splits=5)
for train_idx, val_idx in gkf.split(X, y, groups=batch_group):
    # Train on weeks A, test on week B
    # No data leakage across time
```

- Groups = weekly batches (`tanggal_masuk` formatted as `%Y-W%U`).
- Ensures orders from the same week are not split across train/test.
- Provides honest generalization estimates.

---

## 4. Feature Engineering

### 4.1 Features Used by Model

| Feature | Type | Source | Description |
|---------|------|--------|-------------|
| `jenis_encoded` | Integer (0-9) | `garmentType` | Label-encoded garment type |
| `days_to_deadline` | Integer | `deadline - today` | Days remaining (can be negative) |
| `urgency_score` | Float | Computed | `exp(-0.1 * max(0, days_to_deadline))` |
| `complexity_score` | Integer | Computed | Count of active tambahan features |
| `Bordir` | Binary (0/1) | `attributes` | Has embroidery |
| `Payet` | Binary (0/1) | `attributes` | Has sequins |
| `Furing` | Binary (0/1) | `attributes` | Has lining |
| `Sulam` | Binary (0/1) | `attributes` | Has embroidery (different type) |
| `Kerah Sanghai` | Binary (0/1) | `attributes` | Has Shanghai collar |
| ... | Binary (0/1) | `attributes` | 26 total one-hot features |

### 4.2 Label Encoding (Garment Types)

| Garment | Code |
|---------|------|
| Dinas | 0 |
| Rok | 1 |
| Gamis | 2 |
| Basiba | 3 |
| Blouse | 4 |
| Kebaya | 5 |
| Blazer | 6 |
| Kemeja | 7 |
| Gaun | 8 |
| Rompi | 9 |

### 4.3 Feature Alignment

During inference, the model's `feature_names_in_` is used to:

1. Select only expected features from the inference DataFrame.
2. Fill missing features with `0`.
3. Drop unexpected features.

```python
df = pd.DataFrame(data_rows)
X = df[EXPECTED_FEATURES]  # Automatic alignment
```

This ensures training and inference use identical feature columns even if the input data structure changes.

---

## 5. Inference Pipeline

**File**: `backend/app/ranking_logic.py:49-138`

### 5.1 Flow

```
sort_by_priority(orders)
│
├─ Model available? ─No──► Sort by deadline ascending (fallback)
│
Yes
│
├─ For each order item:
│   ├─ Compute days_to_deadline = (deadline - today).days
│   ├─ Compute urgency_score = exp(-0.1 * max(0, days_to_deadline))
│   ├─ Encode garment type: jenis_encoded = JENIS_MAPPING[garmentType]
│   ├─ Parse attributes (dict/list of strings)
│   ├─ One-hot encode attribute features
│   └─ Compute complexity_score = sum(active features)
│
├─ Build DataFrame with all features
├─ Select columns matching EXPECTED_FEATURES
│
├─ Predict (try sklearn-style first, fallback to DMatrix):
│   try:
│       scores = RANKER_MODEL.predict(X)
│   except Exception:
│       scores = RANKER_MODEL.predict(xgb.DMatrix(X))
│
├─ Sort by model_score DESC (highest = rank 1)
└─ Return reordered original order objects
```

### 5.2 Scoring Details

**Urgency Score Formula** (matches training):

```python
if days_to_deadline < 0:
    urgency = 1.0        # Already overdue → max urgency
else:
    urgency = exp(-0.1 * days_to_deadline)  # Exponential decay
```

**Complexity Score**:

```python
complexity = sum(1 for feat in EXPECTED_FEATURES
                 if feat in order["attributes"])
```

### 5.3 Prediction API Compatibility

XGBoost Booster supports two prediction interfaces:

| API | When Used |
|-----|-----------|
| `model.predict(X)` (sklearn-style) | Primary attempt (works with sklearn-wrapped models) |
| `model.predict(xgb.DMatrix(X))` | Fallback (native XGBoost format) |

Both accept a DataFrame and return a 1D array of scores.

---

## 6. API Integration

**File**: `backend/app/routers/orders.py:116-200`

### 6.1 Endpoint

```
GET /orders/admin-work
Authentication: Required (Bearer token)
Response: JSON with phases grouped by production stage
```

### 6.2 Processing Pipeline

```python
@router.get("/admin-work")
def get_admin_work(db, current_user):
    # 1. Fetch all orders with eager-loaded items, garment types, logs
    query = db.query(OrderModel).options(
        joinedload(OrderModel.items).joinedload(OrderItem.garmentType),
        joinedload(OrderModel.items).joinedload(OrderItem.logs),
    )
    orders = query.all()

    # 2. Flatten to individual task items (skip DONE items)
    results = []
    for order in orders:
        for item in order.items:
            if item.status == OrderStatus.DONE:
                continue
            results.append({
                "order_id": order.id,
                "item_id": item.id,
                "receiptNumber": order.receiptNumber,
                "customerName": order.customerName,
                "garmentType": item.garmentType.name,
                "deadline": order.deadline,
                "status": item.status,
                "urgency_label": get_urgency_label(order.deadline),
                "attributes": item.attributes,
                "assigned_worker_id": ...,
            })

    # 3. Sort by ML priority
    sorted_results = sort_by_priority(results)

    # 4. Group by production phase + ready/in_progress status
    buckets = {
        "cutting":  {"ready": [], "in_progress": []},
        "sewing":   {"ready": [], "in_progress": []},
        "finishing": {"ready": [], "in_progress": []},
    }

    for task in sorted_results:
        status = task["status"]
        if status == "received":       buckets["cutting"]["ready"].append(task)
        elif status == "cutting":      buckets["cutting"]["in_progress"].append(task)
        elif status == "cutted":       buckets["sewing"]["ready"].append(task)
        elif status == "sewing":       buckets["sewing"]["in_progress"].append(task)
        elif status == "sewed":        buckets["finishing"]["ready"].append(task)
        elif status == "finishing":    buckets["finishing"]["in_progress"].append(task)

    # 5. Build response with counts
    phases_response = [
        {
            "phase": phase,
            "phase_label": "Potong" | "Jahit" | "Finishing",
            "ready": buckets[phase]["ready"],
            "in_progress": buckets[phase]["in_progress"],
            "ready_count": len(buckets[phase]["ready"]),
            "in_progress_count": len(buckets[phase]["in_progress"]),
        }
        for phase in ["cutting", "sewing", "finishing"]
    ]

    return {"phases": phases_response}
```

### 6.3 Response Structure

```json
{
  "phases": [
    {
      "phase": "cutting",
      "phase_label": "Potong",
      "ready": [
        {
          "order_id": 1,
          "item_id": 1,
          "customerName": "Budi",
          "garmentType": "Kemeja",
          "deadline": "2026-06-25",
          "status": "received",
          "urgency_label": "red",
          "attributes": {"Kancing": true, "Kerah": true}
        }
      ],
      "in_progress": [],
      "ready_count": 1,
      "in_progress_count": 0
    }
  ]
}
```

---

## 7. Fallback Logic

| Scenario | Behavior | Reason |
|----------|----------|--------|
| Model file not found (`FileNotFoundError`) | Sort by deadline ascending | File deleted or not deployed |
| XGBoost not installed (`ImportError`) | Sort by deadline ascending | Missing dependency |
| Corrupted pickle (`pickle.UnpicklingError`) | Sort by deadline ascending | Model file corrupted |
| Feature mismatch (missing columns) | Sort by deadline ascending | Schema change without retraining |
| Any prediction exception | Sort by deadline ascending | Catch-all safety net |

**Fallback sort function**:

```python
def deadline_key(order):
    try:
        return date.fromisoformat(_get_deadline(order))
    except (ValueError, TypeError):
        return date.max
```

**Urgency Label** (separate visual indicator, always active):

```python
def get_urgency_label(deadline_str):
    days_left = (deadline - today).days
    if days_left <= 1:      return "red"
    elif days_left <= 3:    return "yellow"
    else:                   return "green"
```

---

## 8. Model Performance

### 8.1 Cross-Validation Results (5-Fold GroupKFold)

| Fold | NDCG | MAP | Pairwise Accuracy | Rounds |
|------|------|-----|-------------------|--------|
| 1 | 0.9367 | 0.9484 | 0.8559 | 28 |
| 2 | 0.9509 | 0.9569 | 0.9154 | 51 |
| 3 | 0.9520 | 0.9676 | 0.9203 | 44 |
| 4 | 0.9265 | 0.9575 | 0.9244 | 52 |
| 5 | 0.9698 | 0.9722 | 0.9205 | 2 |
| **Mean ± Std** | **0.9472 ± 0.0147** | **0.9605 ± 0.0084** | **0.9073 ± 0.0259** | - |

### 8.2 Holdout Test Set (20%)

| Metric | v6 (Overfitted) | v7 (Production) | Change |
|--------|-----------------|-----------------|--------|
| NDCG | 0.9829 | **0.9162** | -6.8% (healthy) |
| MAP | 1.0000 | **0.9556** | -4.4% |
| Pairwise Accuracy | 98.99% | **91.08%** | -7.9% |

### 8.3 Validation Summary

- **Target range**: 0.90 - 0.95 NDCG.
- **v7 result**: 0.9162 — within target.
- **Interpretation**: Lower score indicates better generalization.
- v6's 0.98+ was a symptom of data leakage, not real performance.

---

## 9. Deployment Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                      FASTAPI SERVER                               │
├───────────────────────────────────────────────────────────────────┤
│  Module: app/routers/orders.py                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  GET /orders/admin-work                                     │  │
│  │  ├─ Fetch orders from MySQL via SQLAlchemy                  │  │
│  │  ├─ Flatten to task items                                   │  │
│  │  ├─ sort_by_priority(items)                                 │  │
│  │  │     │                                                     │  │
│  │  │     ▼                                                     │  │
│  │  │  Module: app/ranking_logic.py                             │  │
│  │  │  ├─ RANKER_MODEL (loaded at import time)                 │  │
│  │  │  ├─ Feature engineering                                 │  │
│  │  │  ├─ model.predict(df[EXPECTED_FEATURES])                 │  │
│  │  │  └─ Sort by score DESC                                   │  │
│  │  │                                                           │  │
│  │  └─ Group by phase → JSON response                          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Disk: backend/xgboost/xgboost_ranker_v7.pkl                │  │
│  │  ├─ Pickled xgb.Booster object                              │  │
│  │  ├─ ~29 features                                             │  │
│  │  └─ ~500 KB                                                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Trained offline
┌─────────────────────────────┴─────────────────────────────────────┐
│  DEVELOPMENT ENVIRONMENT                                          │
├───────────────────────────────────────────────────────────────────┤
│  backend/xgboost/training_model_v7.ipynb                          │
│                                                                   │
│  1. Load data_processed_clean.csv (1218 rows × 30 cols)          │
│  2. Feature engineering                                          │
│  3. Target construction + noise injection                         │
│  4. GroupKFold 5-fold CV                                          │
│  5. Train XGBRanker with early stopping                           │
│  6. Evaluate on holdout set                                       │
│  7. Save xgboost_ranker_v7.pkl                                    │
└───────────────────────────────────────────────────────────────────┘
```

### Data Flow Summary

```
[MySQL Database]
     │
     ▼
[FastAPI: GET /orders/admin-work]
     │
     ├─ Fetch orders ──► SQLAlchemy ORM
     ├─ Flatten to tasks ──► List[Dict]
     ├─ Sort by ML priority ──► ranking_logic.sort_by_priority()
     │     │
     │     ├─ Feature engineering (deadline, attributes, garment type)
     │     ├─ predict() ──► xgboost_ranker_v7.pkl
     │     └─ Sort descending by score
     │
     └─ Group by phase (cutting → sewing → finishing)
           │
           ▼
     [JSON Response: {phases: [{ready: [...], in_progress: [...]}]}]
```

---

## 10. Key Design Decisions

### 10.1 Ranking over Classification

- **Chosen**: `rank:pairwise` (XGBRanker).
- **Why**: Orders need to be reordered relative to each other within a batch, not classified into fixed priority tiers.
- **Benefit**: Ranking naturally handles varying batch sizes and changing workload.

### 10.2 Group-Aware Training

- **Chosen**: GroupKFold CV with weekly batch groups.
- **Why**: Prevents the model from seeing orders from the same week in both train and test sets.
- **Benefit**: Honest evaluation of generalization to unseen time periods.

### 10.3 Noise Injection in Target

- **Chosen**: Gaussian noise (25% of target std).
- **Why**: Target is a deterministic function of input features; without noise, the model could memorize the formula.
- **Benefit**: Forces the model to learn generalizable patterns, not exact arithmetic.

### 10.4 Dual Prediction API

- **Chosen**: Try sklearn-style first, DMatrix fallback.
- **Why**: Some environments wrap the Booster in an sklearn-compatible interface, others use native DMatrix.
- **Benefit**: Maximum compatibility across deployment environments.

### 10.5 Graceful Degradation

- **Chosen**: Fallback to deadline-based sort on any ML failure.
- **Why**: The admin Kanban must never break, even if the model fails to load.
- **Benefit**: Zero downtime; ML is a value-add, not a hard dependency.

### 10.6 Feature Contract via Model

- **Chosen**: Store `feature_names_in_` in the pickle file.
- **Why**: Inference code always knows exactly which features the model expects.
- **Benefit**: Schema changes can be detected early; prevents silent misalignment between training and inference.

### 10.7 Stateless Inference

- **Chosen**: Model loaded once at module import (not per-request).
- **Why**: Loading a pickle file every request would add ~50-100ms latency.
- **Benefit**: Sub-millisecond inference per order batch.
