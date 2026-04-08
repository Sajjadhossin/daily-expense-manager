import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsService, TransactionCreateInput, TransactionUpdateInput } from '@/services/api/transactions';
import { BOOKS_QUERY_KEY } from './use-books';

export const TRANSACTIONS_QUERY_KEY = ['transactions'];

export function useTransactions(bookId: string | null, categoryId?: string) {
  return useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, bookId, categoryId],
    queryFn: () => {
      if (!bookId) return Promise.resolve([]);
      return transactionsService.getAll(bookId, categoryId);
    },
    enabled: !!bookId,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionCreateInput) => transactionsService.create(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...TRANSACTIONS_QUERY_KEY, variables.bookId] });
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY }); // Because book balance changes
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionUpdateInput }) => transactionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY }); // Because book balance changes
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY }); // Because book balance changes
    },
  });
}
