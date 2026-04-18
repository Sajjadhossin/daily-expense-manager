import { apiClient } from './client';
import { Category } from '../../generated/client';

export type CategoryCreateInput = Pick<Category, 'name'> & Partial<Pick<Category, 'type' | 'icon' | 'color' | 'bookId'>>;
export type CategoryUpdateInput = Pick<Category, 'name' | 'icon' | 'color' | 'order'>;

export const categoriesService = {
  getAll: (bookId?: string | null) =>
    apiClient.get<Category[]>(bookId ? `/api/categories?bookId=${bookId}` : '/api/categories'),
  create: (data: CategoryCreateInput) => apiClient.post<Category>('/api/categories', data),
  update: (id: string, data: CategoryUpdateInput) => apiClient.patch<Category>(`/api/categories/${id}`, data),
  delete: (id: string) => apiClient.delete<Category>(`/api/categories/${id}`),
};
