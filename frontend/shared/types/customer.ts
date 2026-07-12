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