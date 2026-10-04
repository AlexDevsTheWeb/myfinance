import { create } from 'zustand';
import type { IAuthState } from '../types/auth.types';

export const useAuthStore = create<IAuthState>((set) => ({
  user: null,
  loading: true,
  isLoggingOut: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setIsLoggingOut: (isLoggingOut) => set({ isLoggingOut }),
}));
