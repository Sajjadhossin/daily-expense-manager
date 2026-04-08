import { apiClient } from './client';
import { Book, Category, Transaction, User } from '../../generated/client';

export type BookCreateInput = Pick<Book, 'name' | 'description' | 'currency' | 'isDefault'>;
export type BookUpdateInput = Partial<BookCreateInput>;

export const booksService = {
  getAll: () => apiClient.get<Book[]>('/api/books'),
  getById: (id: string) => apiClient.get<Book>(`/api/books/${id}`),
  create: (data: BookCreateInput) => apiClient.post<Book>('/api/books', data),
  update: (id: string, data: BookUpdateInput) => apiClient.patch<Book>(`/api/books/${id}`, data),
  delete: (id: string) => apiClient.delete<Book>(`/api/books/${id}`),
};
