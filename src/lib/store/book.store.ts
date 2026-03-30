import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Book, Category, CategoryType } from '@/types/book';
import { INITIAL_BOOK, DEFAULT_CATEGORIES } from '@/services/mock/book.mock';

interface BookState {
  // Books
  books: Book[];
  activeBookId: string | null;
  
  // Categories
  categories: Category[];
  
  // Actions
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  updateBook: (book: Book) => void;
  removeBook: (id: string) => void;
  setActiveBook: (id: string) => void;
  
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  removeCategory: (id: string) => void;
  
  // Selectors/Computed
  getActiveBook: () => Book | undefined;
  getCategoriesByType: (type: CategoryType) => Category[];
}

export const useBookStore = create<BookState>()(
  persist(
    (set, get) => ({
      books: [INITIAL_BOOK],
      activeBookId: INITIAL_BOOK.id,
      categories: [...DEFAULT_CATEGORIES],

      // --- Books Actions ---
      setBooks: (books) => {
        set({ books });
        // Guarantee an active book exists
        const state = get();
        if (!books.find((b) => b.id === state.activeBookId) && books.length > 0) {
          set({ activeBookId: books[0].id });
        }
      },
      addBook: (book) => set((state) => ({ books: [...state.books, book] })),
      updateBook: (book) => set((state) => ({
        books: state.books.map((b) => (b.id === book.id ? book : b))
      })),
      removeBook: (id) => set((state) => {
        const newBooks = state.books.filter((b) => b.id !== id);
        let newActiveId = state.activeBookId;
        if (state.activeBookId === id) {
          newActiveId = newBooks.length > 0 ? newBooks[0].id : null;
        }
        return { books: newBooks, activeBookId: newActiveId };
      }),
      setActiveBook: (id) => set({ activeBookId: id }),

      // --- Categories Actions ---
      setCategories: (categories) => set({ categories }),
      addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
      updateCategory: (category) => set((state) => ({
        categories: state.categories.map((c) => (c.id === category.id ? category : c))
      })),
      removeCategory: (id) => set((state) => ({
        categories: state.categories.filter((c) => c.id !== id)
      })),

      // --- Getters ---
      getActiveBook: () => {
        const state = get();
        return state.books.find((b) => b.id === state.activeBookId);
      },
      getCategoriesByType: (type) => {
        const state = get();
        return state.categories.filter((c) => c.type === type).sort((a, b) => a.order - b.order);
      },
    }),
    {
      name: 'dem-book-storage', // Key in local storage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
