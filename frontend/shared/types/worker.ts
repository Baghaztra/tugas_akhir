export const WORKER_ROLES = ['Potong', 'Jahit', 'Finishing', 'Magang', 'Other'] as const;
export type WorkerRole = typeof WORKER_ROLES[number];

export const WORKER_STATUSES = ['Working', 'Idle'] as const;
export type WorkerStatus = typeof WORKER_STATUSES[number];

// -- Worker --
export interface WorkerCreate {
  name: string;
  role: WorkerRole;
  status?: WorkerStatus;
}

export interface WorkerUpdate {
  name?: string | null;
  role?: WorkerRole | null;
  status?: WorkerStatus | null;
}

export interface Worker {
  id: number;
  name: string;
  role: WorkerRole;
  status?: WorkerStatus;
  date_joined: string; // ISO DateTime string
}

export interface DailyPerf {
  date: string;
  count: number;
}

export interface WorkerPerformance {
  worker_id: number;
  worker_name: string;
  performance_score: number;
  total_finished: number;
  daily: DailyPerf[];
}

export interface WorkerTask {
  log_id: number;
  order_item_id: number;
  receipt_number: string;
  customer_name: string;
  garment_type: string;
  status: string;
  completed_at: string;
}