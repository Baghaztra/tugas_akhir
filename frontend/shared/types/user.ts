export interface User {
  id: number
  name: string
  email: string
  is_owner: boolean
  created_at: string
  updated_at: string | null
}

export interface UserCreate {
  name: string
  email: string
  password: string
  is_owner?: boolean
}

export interface UserUpdate {
  name?: string
  email?: string
  password?: string
  is_owner?: boolean
}