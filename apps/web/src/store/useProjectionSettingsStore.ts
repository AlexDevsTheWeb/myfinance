import { create } from 'zustand';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './useAuthStore';

export interface IProjectionSettings {
  inflationRate: number;
  taxRate: number;
}

interface ProjectionSettingsStore extends IProjectionSettings {
  loaded: boolean;
  loadSettings: () => Promise<void>;
  saveSettings: (settings: Partial<IProjectionSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export const DEFAULT_PROJECTION_SETTINGS: IProjectionSettings = {
  inflationRate: 0.02,
  taxRate: 0.26,
};

export const useProjectionSettingsStore = create<ProjectionSettingsStore>((set, get) => ({
  ...DEFAULT_PROJECTION_SETTINGS,
  loaded: false,

  loadSettings: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.projectionSettings) {
          set({ ...DEFAULT_PROJECTION_SETTINGS, ...data.projectionSettings, loaded: true });
          return;
        }
      }
      set({ loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  saveSettings: async (settings) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');
    const prev = { inflationRate: get().inflationRate, taxRate: get().taxRate };
    set({ ...prev, ...settings });
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { projectionSettings: { ...prev, ...settings } });
    } catch {
      set({ ...prev });
    }
  },

  resetToDefaults: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const prev = { inflationRate: get().inflationRate, taxRate: get().taxRate };
    set({ ...DEFAULT_PROJECTION_SETTINGS });
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { projectionSettings: DEFAULT_PROJECTION_SETTINGS });
    } catch {
      set({ ...prev });
    }
  },
}));
