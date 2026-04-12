export interface PortfolioItemCreate {
  title: string;
  category: string;
  description?: string | null;
}

export interface PortfolioItemUpdate {
  title?: string | null;
  category?: string | null;
  description?: string | null;
}

export interface PortfolioItemRead {
  id: number;
  title: string;
  category: string;
  image?: string | null;
  description?: string | null;
  createdAt?: string | null;
}