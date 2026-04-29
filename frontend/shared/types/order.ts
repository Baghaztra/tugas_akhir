export type OrderStatus =
  | "received"
  | "cutting"
  | "cutted"
  | "sewing"
  | "sewed"
  | "finishing"
  | "done";
export type PaymentStatus = "paid" | "unpaid" | "partial";

// -- Order Log --
export interface OrderLogCreate {
  status: string;
  note?: string | null;
  employeeName?: string | null;
}

export interface OrderLog {
  id: number;
  order_item_id: number;
  status: string;
  note?: string | null;
  employeeName?: string | null;
  createdAt: string; // ISO DateTime string
}

// -- Order Item --
export interface OrderItemCreate {
  garmentTypeId: number | null;
  sketch?: string | null;
  description?: string | null;
  quantity?: number;
  measurements?: Record<string, any>;
  attributes?: Record<string, any>;
}

export interface OrderItem {
  id: number;
  garmentType?: { name: string } | null;
  sketch?: string | null;
  description?: string | null;
  quantity?: number;
  measurements?: Record<string, any>;
  attributes?: Record<string, any>;
  status: OrderStatus;
  logs: OrderLog[];
}

// -- Order --
export interface OrderCreate {
  customerName: string;
  customerPhone?: string | null;
  deadline: string;
  totalPrice?: number;
  paidAmount?: number;
  paymentStatus?: PaymentStatus;
  notes?: string | null;
  items: OrderItemCreate[];
}

export interface OrderUpdate {
  customerName?: string | null;
  customerPhone?: string | null;
  deadline?: string | null;
  paymentStatus?: PaymentStatus | null;
  totalPrice?: number | null;
  paidAmount?: number | null;
  notes?: string | null;
}

export interface Order {
  id: number;
  receiptNumber: string;
  customerName: string;
  customerPhone?: string | null;
  deadline: string;
  totalPrice?: number;
  paidAmount?: number;
  paymentStatus?: PaymentStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  items: OrderItem[];
}

// -- Tracking --
export interface OrderTracking {
  id: number;
  receiptNumber: string;
  customerName: string;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  paidAmount: number;
  deadline: string;
  createdAt: string;
  items: OrderItem[];
}
