/**
 * Composable untuk API Profil Bisnis & Portofolio (Halaman Publik)
 * Base URL dikonfigurasi via nuxt.config runtimeConfig atau
 * environment variable NUXT_PUBLIC_API_BASE.
 */
import { dummyBusiness, dummyPortfolio } from "~/data/dummy";
import type { BusinessProfile, PortfolioItem } from "~/data/dummy";

export const useProfile = () => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error, refresh } = useFetch<BusinessProfile>(`${apiBase}/profile/public`, {
    default: () => dummyBusiness,
  });
  return { business: data, status, error, refresh };
};

export const usePortfolio = () => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error, refresh } = useFetch<PortfolioItem[]>(`${apiBase}/portfolio`, {
    default: () => dummyPortfolio,
  });
  return { portfolio: data, status, error, refresh };
};
