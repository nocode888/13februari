import create from 'zustand';
import type { MetaAudience } from '../types/meta';

interface AnalysisState {
  activeFilters: {
    age_min: string;
    age_max: string;
    budget_min: string;
    budget_max: string;
    gender: string;
    objective: string;
  };
  selectedInterests: MetaAudience[];
  setActiveFilters: (filters: Record<string, string>) => void;
  setSelectedInterests: (interests: MetaAudience[]) => void;
  clearAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  activeFilters: {
    age_min: '18',
    age_max: '24',
    budget_min: '10',
    budget_max: '50',
    gender: 'all',
    objective: 'CONVERSIONS'
  },
  selectedInterests: [],
  setActiveFilters: (filters) => set((state) => ({
    activeFilters: { ...state.activeFilters, ...filters }
  })),
  setSelectedInterests: (interests) => set({ selectedInterests: interests }),
  clearAnalysis: () => set({
    selectedInterests: [],
    activeFilters: {
      age_min: '18',
      age_max: '24',
      budget_min: '10',
      budget_max: '50',
      gender: 'all',
      objective: 'CONVERSIONS'
    }
  })
}));