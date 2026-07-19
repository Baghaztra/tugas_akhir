# Machine Learning (XGBoost Ranking)

## Overview

Model XGBoost (XGBRanker) digunakan untuk mengurutkan pesanan berdasarkan prioritas.

**File model**: `backend/xgboost/xgboost_ranker_v7.pkl`

## Fitur

| Fitur | Tipe | Deskripsi |
|-------|------|-----------|
| `days_to_deadline` | int | Sisa hari ke deadline |
| `urgency_score` | float | Exponential decay: `exp(-0.1 * days)`, capped 1.0 untuk overdue |
| `complexity_score` | int | Jumlah attribute aktif (Bordir, Furing, dll) |
| `jenis_encoded` | int | Mapping garment type: Dinas=0, Rok=1, Gamis=2, ..., Rompi=9 |
| attribute flags | binary | Per-attribute 1/0 (Bordir, Furing, dll) dari `order.attributes` JSON |

## Alur Inference

1. Ambil data pesanan dari database
2. Hitung `days_to_deadline` dari hari ini
3. Hitung `urgency_score` (exponential decay)
4. Parse attributes sebagai binary features
5. Hitung `complexity_score` (count active attributes)
6. Encode garment type ke integer
7. Prediksi skor menggunakan model XGBoost
8. Sort descending (skor tertinggi = prioritas tertinggi)

## Fallback

Jika model tidak tersedia (file .pkl tidak ada) atau error saat inference, sort berdasarkan deadline ascending (soonest first).

## Urgency Label

Digunakan di UI untuk badge warna:
- `red`: <= 1 hari ke deadline (atau overdue)
- `yellow`: 2-3 hari ke deadline
- `green`: > 3 hari ke deadline

## Digunakan di

- `GET /orders/admin-work` → Kanban board (prioritas urutan card)
- Halaman task-list karyawan (`/task-list`)
