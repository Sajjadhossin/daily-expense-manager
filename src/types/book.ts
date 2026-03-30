export interface Book {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string; // lucide icon name or emoji
  color: string; // tailwind color class or hex
  isSystem: boolean; // Cannot be deleted if true
  order: number;
}
