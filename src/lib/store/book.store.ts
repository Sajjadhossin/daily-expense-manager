import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface BookState {
  activeBookId: string | null;
  setActiveBook: (id: string) => void;
}

export const useBookStore = create<BookState>()(
  persist(
    (set) => ({
      activeBookId: null,
      setActiveBook: (id) => set({ activeBookId: id }),
    }),
    {
      name: 'dem-active-book',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
