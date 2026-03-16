import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Recipe, Session, MeasurementSystem, WaterProfile } from '../types/brewing';

export const defaultTapWater: WaterProfile = {
  id: 'wp-source', name: 'My Tap Water', calcium: 40, magnesium: 10, sodium: 15, sulfate: 40, chloride: 30, bicarbonate: 50
};

interface BrewState {
  // Global Settings
  measurementSystem: MeasurementSystem;
  setMeasurementSystem: (system: MeasurementSystem) => void;
  
  defaultSourceWater: WaterProfile;
  setDefaultSourceWater: (profile: WaterProfile) => void;

  // Data
  recipes: Recipe[];
  sessions: Session[];
  
  // Recipe Actions
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  
  // Session Actions
  addSession: (session: Session) => void;
  updateSession: (id: string, session: Partial<Session>) => void;
  deleteSession: (id: string) => void;
}

export const useBrewStore = create<BrewState>()(
  persist(
    (set) => ({
      measurementSystem: 'metric', 
      setMeasurementSystem: (system) => set({ measurementSystem: system }),

      defaultSourceWater: defaultTapWater,
      setDefaultSourceWater: (profile) => set({ defaultSourceWater: profile }),

      recipes: [],
      sessions: [],
      
      addRecipe: (recipe) => 
        set((state) => ({ recipes: [...state.recipes, recipe] })),
        
      updateRecipe: (id, updatedRecipe) =>
        set((state) => ({
          recipes: state.recipes.map((r) => 
            r.id === id ? { ...r, ...updatedRecipe } : r
          ),
        })),
        
      deleteRecipe: (id) =>
        set((state) => ({
          recipes: state.recipes.filter((r) => r.id !== id),
        })),
        
      addSession: (session) =>
        set((state) => ({ sessions: [...state.sessions, session] })),
        
      updateSession: (id, updatedSession) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...updatedSession } : s
          ),
        })),
        
      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),
    }),
    {
      name: 'brewmanager-storage',
    }
  )
);
