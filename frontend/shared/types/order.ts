import type { CustomerBrief } from './customer';

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
  customer_id?: number | null;
  deadline: string;
  totalPrice?: number;
  dpAmount?: number;
  paymentStatus?: PaymentStatus;
  notes?: string | null;
  items: OrderItemCreate[];
}

export interface OrderUpdate {
  customerName?: string | null;
  customerPhone?: string | null;
  customer_id?: number | null;
  deadline?: string | null;
  paymentStatus?: PaymentStatus | null;
  totalPrice?: number | null;
  dpAmount?: number | null;
  notes?: string | null;
}

export interface Order {
  id: number;
  receiptNumber: string;
  customerName: string;
  customerPhone?: string | null;
  customer_id?: number | null;
  customer?: CustomerBrief | null;
  deadline: string;
  totalPrice?: number;
  dpAmount?: number;
  paymentStatus?: PaymentStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  items: OrderItem[];
}

// -- Customer History --
export interface CustomerHistoryItem {
  customerName: string
  customerPhone?: string | null
  orderDate: string
  garmentTypeName?: string | null
  measurements: Record<string, string>
}

// -- Tracking --
export interface OrderTracking {
  id: number;
  receiptNumber: string;
  customerName: string;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  dpAmount: number;
  deadline: string;
  createdAt: string;
  notes?: string | null;
  items: OrderItem[];
}
