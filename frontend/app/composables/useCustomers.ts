import { $fetch } from 'ofetch'
import { useAsyncData } from '#app'
import { unref } from 'vue'
import type { Customer, CustomerBrief, CustomerCreate, CustomerUpdate } from '~/shared/types/customer'

const api = $fetch.create({ baseURL: '/api' })

export function useCustomers(search?: string | Ref<string>) {
  return useAsyncData('customers', () => 
    api<Customer[]>('/customers', { 
      params: { search: unref(search) || '' } 
    })
  )
}

export function useCustomerSearch(query: string | Ref<string>, limit = 10) {
  return useAsyncData('customer-search', () => 
    api<CustomerBrief[]>('/customers/search', { 
      params: { query: unref(query), limit } 
    }),
    { watch: [query], immediate: !!unref(query) }
  )
}

export function useCustomer(id: number | Ref<number>) {
  return useAsyncData(`customer-${id}`, () => 
    api<Customer>(`/customers/${unref(id)}`)
  )
}

export async function getCustomer(id: number) {
  return await api<Customer>(`/customers/${id}`)
}

export function useCreateCustomer() {
  return async (payload: CustomerCreate) => {
    return await api<Customer>('/customers', { method: 'POST', body: payload })
  }
}

export function useUpdateCustomer() {
  return async (id: number, payload: CustomerUpdate) => {
    return await api<Customer>(`/customers/${id}`, { method: 'PUT', body: payload })
  }
}

export function useDeleteCustomer() {
  return async (id: number) => {
    return await api<Customer>(`/customers/${id}`, { method: 'DELETE' })
  }
}