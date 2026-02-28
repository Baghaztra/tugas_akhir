/**
 * Composable untuk API Profil Bisnis & Portofolio (Halaman Publik)
 * Ganti BASE_URL dan hapus `default:` setelah backend siap.
 */
import { dummyBusiness, dummyPortfolio } from "~/data/dummy";
import type { BusinessProfile, PortfolioItem } from "~/data/dummy";

const BASE_URL = "http://localhost:8000";

export const useProfile = () => {
  const { data, status, error, refresh } = useFetch<BusinessProfile>(`${BASE_URL}/profile/public`, {
    default: () => dummyBusiness,
  });
  return { business: data, status, error, refresh };
};

export const usePortfolio = () => {
  const { data, status, error, refresh } = useFetch<PortfolioItem[]>(`${BASE_URL}/portfolio`, {
    default: () => dummyPortfolio,
  });
  return { portfolio: data, status, error, refresh };
};
