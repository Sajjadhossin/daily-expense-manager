import { apiClient } from './client';
import { Transaction, Category } from '../../generated/client';

export type TransactionWithCategory = Transaction & { category: Category };

export type TransactionCreateInput = {
  type: string;
  amount: number;
  date: Date | string;
  time?: string;
  note?: string;
  bookId: string;
  categoryId: string;
};

export type TransactionUpdateInput = Partial<Omit<TransactionCreateInput, 'bookId'>>;

export const transactionsService = {
  getAll: (bookId: string, categoryId?: string) => 
    apiClient.get<TransactionWithCategory[]>('/api/transactions', { bookId, ...(categoryId && { categoryId }) }),
  getById: (id: string) => apiClient.get<TransactionWithCategory>(`/api/transactions/${id}`),
  create: (data: TransactionCreateInput) => apiClient.post<TransactionWithCategory>('/api/transactions', data),
  update: (id: string, data: TransactionUpdateInput) => apiClient.patch<TransactionWithCategory>(`/api/transactions/${id}`, data),
  delete: (id: string) => apiClient.delete<TransactionWithCategory>(`/api/transactions/${id}`),
};
