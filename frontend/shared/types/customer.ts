export interface Customer {
  id: number
  name: string
  phone?: string | null
  lingkar_badan?: number | null
  lingkar_pinggang?: number | null
  lingkar_panggul?: number | null
  panjang_bahu?: number | null
  panjang_tgn?: number | null
  panjang_baju?: number | null
  panjang_rok?: number | null
  createdAt?: string
  updatedAt?: string | null
  total_orders: number
}

export interface CustomerBrief {
  id: number
  name: string
  phone?: string | null
}

export interface CustomerCreate {
  name: string
  phone?: string | null
  lingkar_badan?: number | null
  lingkar_pinggang?: number | null
  lingkar_panggul?: number | null
  panjang_bahu?: number | null
  panjang_tgn?: number | null
  panjang_baju?: number | null
  panjang_rok?: number | null
}

export interface CustomerUpdate {
  name?: string | null
  phone?: string | null
  lingkar_badan?: number | null
  lingkar_pinggang?: number | null
  lingkar_panggul?: number | null
  panjang_bahu?: number | null
  panjang_tgn?: number | null
  panjang_baju?: number | null
  panjang_rok?: number | null
}

export interface CustomerOrderItem {
  id: number
  receipt_number: string
  total_price: number
  paid_amount: number
  payment_status: string
  status: string
  created_at: string
}

export interface CustomerDetail {
  customer: Customer
  orders: CustomerOrderItem[]
  total_bon: number
}
