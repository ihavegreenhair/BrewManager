import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Recipe, Session, MeasurementSystem, WaterProfile, RaptSettings, RaptDevice } from '../types/brewing';
import { generateBrewEvents } from '../utils/instructionGenerator';

export const defaultTapWater: WaterProfile = {
  id: 'wp-source', name: 'My Tap Water', calcium: 40, magnesium: 10, sodium: 15, sulfate: 40, chloride: 30, bicarbonate: 50
};

interface BrewState {
  // Global Settings
  measurementSystem: MeasurementSystem;
  setMeasurementSystem: (system: MeasurementSystem) => void;
  
  defaultSourceWater: WaterProfile;
  setDefaultSourceWater: (profile: WaterProfile) => void;

  // RAPT Integration
  raptSettings: RaptSettings;
  updateRaptSettings: (settings: Partial<RaptSettings>) => void;
  raptDevices: RaptDevice[];
  setRaptDevices: (devices: RaptDevice[]) => void;

  // Data
  recipes: Recipe[];
  sessions: Session[];
  
  // Recipe Actions
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  
  // Session Actions
  startSession: (recipe: Recipe, name: string) => string;
  updateSession: (id: string, session: Partial<Session>) => void;
  completeSession: (id: string) => void;
  deleteSession: (id: string) => void;
}

export const useBrewStore = create<BrewState>()(
  persist(
    (set) => ({
      measurementSystem: 'metric', 
      setMeasurementSystem: (system) => set({ measurementSystem: system }),

      defaultSourceWater: defaultTapWater,
      setDefaultSourceWater: (profile) => set({ defaultSourceWater: profile }),

      raptSettings: {},
      updateRaptSettings: (settings) => set((state) => ({ 
        raptSettings: { ...state.raptSettings, ...settings } 
      })),
      
      raptDevices: [],
      setRaptDevices: (devices) => set({ raptDevices: devices }),

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
        
      startSession: (recipe, name) => {
        const id = crypto.randomUUID();
        const newSession: Session = {
          id,
          recipeId: recipe.id,
          recipeSnapshot: JSON.parse(JSON.stringify(recipe)),
          name: name || `${recipe.name} - ${new Date().toLocaleDateString()}`,
          date: new Date().toISOString(),
          status: 'active',
          notes: '',
          currentEventIndex: 0,
          actuals: {},
          events: generateBrewEvents(recipe)
        };
        set((state) => ({ sessions: [newSession, ...state.sessions] }));
        return id;
      },
        
      updateSession: (id, updatedSession) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...updatedSession } : s
          ),
        })),

      completeSession: (id) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, status: 'completed' as const } : s
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
