import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksService, BookCreateInput, BookUpdateInput } from '@/services/api/books';
import { useBookStore } from '@/lib/store/book.store';

export const BOOKS_QUERY_KEY = ['books'];

export function useBooks() {
  const query = useQuery({
    queryKey: BOOKS_QUERY_KEY,
    queryFn: booksService.getAll,
  });

  const { activeBookId, setActiveBook } = useBookStore();

  // Auto-activate default book when no book is selected or stored book no longer exists
  useEffect(() => {
    if (query.data && query.data.length > 0) {
      const bookExists = activeBookId && query.data.some((b: any) => b.id === activeBookId);
      if (!bookExists) {
        const defaultBook = query.data.find((b: any) => b.isDefault) || query.data[0];
        setActiveBook(defaultBook.id);
      }
    }
  }, [activeBookId, query.data, setActiveBook]);

  return query;
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
