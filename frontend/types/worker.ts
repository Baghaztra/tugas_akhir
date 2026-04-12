export type WorkerRole = 'Potong' | 'Jahit' | 'Finishing' | 'Magang' | 'Other';
export type WorkerStatus = 'Working' | 'Idle';

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

// -- Wages & Performance --
export interface WorkerWage {
  worker_id: int;
  worker_name: string;
  period: string;
  total_finished: number;
  wage: number;
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