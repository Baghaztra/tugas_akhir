export const useAttributes = () => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error, refresh } = useFetch<Attribute[]>(`${apiBase}/attributes/`, {
    credentials: 'include',
    default: () => [] as Attribute[],
  });
  return { attributes: data, status, error, refresh };
};
