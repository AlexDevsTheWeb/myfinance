import { create } from 'zustand';
import { doc, updateDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import { db } from '../lib/firebase';
import { useAuthStore } from './useAuthStore';
import type { BudgetTarget } from './types';

export interface BudgetState {
  budgetTargets: BudgetTarget[];
  isSaving: boolean;
  saveError: string | null;

  addBudgetTarget: (target: Omit<BudgetTarget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBudgetTarget: (id: string, updates: Partial<BudgetTarget>) => Promise<void>;
  deleteBudgetTarget: (id: string) => Promise<void>;
  setBudgetTargets: (targets: BudgetTarget[]) => void;
  clearSaveError: () => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgetTargets: [],
  isSaving: false,
  saveError: null,

  addBudgetTarget: async (target) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ saveError: null, isSaving: true });
    try {
      const now = dayjs().toISOString();
      const newTarget: BudgetTarget = {
        ...target,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      set((state) => ({
        budgetTargets: [...state.budgetTargets, newTarget],
        isSaving: false,
      }));

      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, { budgetTargets: get().budgetTargets });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add budget target';
      set({ saveError: errorMessage, isSaving: false });
      console.error('addBudgetTarget error:', err);
    }
  },

  updateBudgetTarget: async (id, updates) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ saveError: null, isSaving: true });
    try {
      set((state) => ({
        budgetTargets: state.budgetTargets.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: dayjs().toISOString() } : t
        ),
        isSaving: false,
      }));

      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, { budgetTargets: get().budgetTargets });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update budget target';
      set({ saveError: errorMessage, isSaving: false });
      console.error('updateBudgetTarget error:', err);
    }
  },

  deleteBudgetTarget: async (id) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ saveError: null, isSaving: true });
    try {
      set((state) => ({
        budgetTargets: state.budgetTargets.filter((t) => t.id !== id),
        isSaving: false,
      }));

      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, { budgetTargets: get().budgetTargets });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete budget target';
      set({ saveError: errorMessage, isSaving: false });
      console.error('deleteBudgetTarget error:', err);
    }
  },

  setBudgetTargets: (targets) => {
    set({ budgetTargets: targets });
  },

  clearSaveError: () => set({ saveError: null }),
}));
