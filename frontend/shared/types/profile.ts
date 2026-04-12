export interface BusinessProfileUpdate {
  name?: string | null;
  slogan?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  hours?: string | null;
  instagram?: string | null;
  logo?: string | null;
}

export interface BusinessProfileRead {
  id: number;
  name: string;
  slogan?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  hours?: string | null;
  instagram?: string | null;
  logo?: string | null;
}