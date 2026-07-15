// ponytail: button-triggered search — $fetch on demand, no auto-refetch
export const useCustomers = (queryParams?: { search?: Ref<string> }) => {
  const { apiBase } = useRuntimeConfig().public;
  const customers = ref<Customer[]>([]) as Ref<Customer[]>;
  const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle');

  const refresh = async () => {
    status.value = 'pending';
    try {
      const params: Record<string, any> = {};
      if (queryParams?.search?.value) params.search = queryParams.search.value;
      customers.value = await $fetch<Customer[]>(`${apiBase}/customers/`, {
        credentials: 'include',
        params,
      });
      status.value = 'success';
    } catch {
      customers.value = [];
      status.value = 'error';
    }
  };

  // ponytail: searchCustomers for autocomplete — manual $fetch, no reactive overhead
  const searchCustomers = async (q: string, limit = 10): Promise<CustomerBrief[]> => {
    if (!q || q.length < 2) return [];
    return await $fetch<CustomerBrief[]>(`${apiBase}/customers/search`, {
      credentials: 'include',
      params: { query: q, limit },
    });
  };

  return { customers, status, refresh, searchCustomers };
};

export const getCustomer = async (id: number): Promise<Customer> => {
  const { apiBase } = useRuntimeConfig().public;
  return await $fetch<Customer>(`${apiBase}/customers/${id}`, { credentials: 'include' });
};

export const useCustomerDetail = (id: number) => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error } = useFetch<CustomerDetail>(
    `${apiBase}/customers/${id}/detail`,
    { credentials: 'include' },
  );
  return { detail: data, status, error };
};

export const useCreateCustomer = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);
  const createCustomer = async (payload: CustomerCreate) => {
    loading.value = true;
    try {
      return await $fetch<Customer>(`${apiBase}/customers/`, {
        method: 'POST',
        credentials: 'include',
        body: payload,
      });
    } finally {
      loading.value = false;
    }
  };
  return { createCustomer, loading };
};

export const useUpdateCustomer = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);
  const updateCustomer = async (id: number, payload: CustomerUpdate) => {
    loading.value = true;
    try {
      return await $fetch<Customer>(`${apiBase}/customers/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: payload,
      });
    } finally {
      loading.value = false;
    }
  };
  return { updateCustomer, loading };
};

export const useDeleteCustomer = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);
  const deleteCustomer = async (id: number) => {
    loading.value = true;
    try {
      return await $fetch(`${apiBase}/customers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } finally {
      loading.value = false;
    }
  };
  return { deleteCustomer, loading };
};
