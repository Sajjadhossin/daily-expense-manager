import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksService, BookCreateInput, BookUpdateInput } from '@/services/api/books';

export const BOOKS_QUERY_KEY = ['books'];

export function useBooks() {
  return useQuery({
    queryKey: BOOKS_QUERY_KEY,
    queryFn: booksService.getAll,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BookCreateInput) => booksService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BookUpdateInput }) => booksService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => booksService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY });
    },
  });
}
