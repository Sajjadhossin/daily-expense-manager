import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false, // Ensures app knows if local storage has loaded
      
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'dem-auth-storage', // Key in local storage
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated();
      },
    }
  )
);
