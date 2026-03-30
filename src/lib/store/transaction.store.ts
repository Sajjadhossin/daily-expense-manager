import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Transaction } from '@/types/transaction';
import { useBookStore } from '@/lib/store/book.store';

interface TransactionState {
  transactions: Transaction[];
  
  // Actions
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  
  // Selectors
  getTransactionsByBook: (bookId: string) => Transaction[];
  getTransactionsByDateRange: (bookId: string, startDate: string, endDate: string) => Transaction[];
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (transaction) => {
        set((state) => ({ transactions: [transaction, ...state.transactions] }));
        
        // Synchronize Book balance
        const bookStore = useBookStore.getState();
        const activeBook = bookStore.books.find(b => b.id === transaction.bookId);
        if (activeBook) {
          bookStore.updateBook({
            ...activeBook,
            balance: transaction.type === 'income' 
              ? activeBook.balance + transaction.amount 
              : activeBook.balance - transaction.amount
          });
        }
      },

      updateTransaction: (transaction) => {
        set((state) => {
          const oldTx = state.transactions.find(t => t.id === transaction.id);
          if (!oldTx) return state;

          // Compute balance difference
          const bookStore = useBookStore.getState();
          const activeBook = bookStore.books.find(b => b.id === transaction.bookId);
          
          if (activeBook) {
            // Revert old transaction effect
            let newBalance = activeBook.balance;
            newBalance = oldTx.type === 'income' ? newBalance - oldTx.amount : newBalance + oldTx.amount;
            
            // Apply new transaction effect
            newBalance = transaction.type === 'income' ? newBalance + transaction.amount : newBalance - transaction.amount;
            
            bookStore.updateBook({
              ...activeBook,
              balance: newBalance
            });
          }

          return {
            transactions: state.transactions.map(t => t.id === transaction.id ? transaction : t)
          };
        });
      },

      removeTransaction: (id) => {
        set((state) => {
          const obsoleteTx = state.transactions.find(t => t.id === id);
          if (!obsoleteTx) return state;

          // Revert Book balance
          const bookStore = useBookStore.getState();
          const activeBook = bookStore.books.find(b => b.id === obsoleteTx.bookId);
          if (activeBook) {
            bookStore.updateBook({
              ...activeBook,
              balance: obsoleteTx.type === 'income' 
                ? activeBook.balance - obsoleteTx.amount 
                : activeBook.balance + obsoleteTx.amount
            });
          }

          return {
            transactions: state.transactions.filter(t => t.id !== id)
          };
        });
      },

      getTransactionsByBook: (bookId) => {
        const state = get();
        return state.transactions
          .filter(t => t.bookId === bookId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      
      getTransactionsByDateRange: (bookId, startDate, endDate) => {
        const state = get();
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        
        return state.transactions
          .filter(t => {
            if (t.bookId !== bookId) return false;
            const txDate = new Date(t.date).getTime();
            return txDate >= start && txDate <= end;
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    }),
    {
      name: 'dem-transaction-storage', // Key in local storage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
