/**
 * Composable untuk API Attributes
 * GET /attributes — mengambil semua atribut yang tersedia
 */

export const useAttributes = () => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error, refresh } = useFetch<Attribute[]>(`${apiBase}/attributes`, {
    default: () => [] as Attribute[],
  });
  return { attributes: data, status, error, refresh };
};
