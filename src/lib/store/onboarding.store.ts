import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface OnboardingState {
  completed: boolean;
  markCompleted: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      markCompleted: () => set({ completed: true }),
      reset: () => set({ completed: false }),
    }),
    {
      name: 'dem-onboarding',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
