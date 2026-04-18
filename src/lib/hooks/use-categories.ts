import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService, CategoryCreateInput, CategoryUpdateInput } from '@/services/api/categories';

export const CATEGORIES_QUERY_KEY = ['categories'];

export function useCategories(bookId?: string | null) {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, bookId ?? 'all'],
    queryFn: () => categoriesService.getAll(bookId),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryCreateInput) => categoriesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdateInput }) => categoriesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}
