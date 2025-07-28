import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { type ActiveFilterType } from "../types/filtersTypes";

interface ActiveFiltersStore {
  activeFilters: ActiveFilterType[];
  
  addFilter: (filter: ActiveFilterType) => void;
  removeFilter: (attributeName: string) => void;
  removeFilterOption: (attributeName: string, optionValue: string) => void;
  updateFilter: (attributeName: string, value: string) => void;
  clearFilters: () => void;
  getFilterByAttributeName: (attributeName: string) => ActiveFilterType | undefined;
  hasActiveFilters: () => boolean;
}

export const useActiveFiltersStore = create<ActiveFiltersStore>()(
  immer((set, get) => ({
    activeFilters: [],

    addFilter: (filter: ActiveFilterType) => {
      set((state) => {
        const existingIndex = state.activeFilters.findIndex(
          (f) => f.attributeName === filter.attributeName
        );
        
        if (existingIndex >= 0) {
          state.activeFilters[existingIndex] = filter;
        } else {
          state.activeFilters.push(filter);
        }
      });
    },

    removeFilter: (attributeName: string) => {
      set((state) => {
        state.activeFilters = state.activeFilters.filter(
          (f) => f.attributeName !== attributeName
        );
      });
    },

    removeFilterOption: (attributeName: string, optionValue: string) => {
      set((state) => {
        const filterIndex = state.activeFilters.findIndex(
          (f) => f.attributeName === attributeName
        );
        
        if (filterIndex >= 0) {
          const filter = state.activeFilters[filterIndex];
          
          if (Array.isArray(filter.value)) {
            filter.value = filter.value.filter((v) => v !== optionValue);
          } else if (typeof filter.value === "string" && filter.value === optionValue) {
            filter.value = "";
          }
        }
      });
    },

    updateFilter: (attributeName: string, value: string) => {
      set((state) => {
        const filterIndex = state.activeFilters.findIndex(
          (f) => f.attributeName === attributeName
        );
        
        if (filterIndex >= 0) {
          state.activeFilters[filterIndex].value = value;
        }
      });
    },

    clearFilters: () => {
      set((state) => {
        state.activeFilters = [];
      });
    },

    getFilterByAttributeName: (attributeName: string) => {
      const state = get();
      return state.activeFilters.find((f) => f.attributeName === attributeName);
    },

    hasActiveFilters: () => {
      const state = get();
      return state.activeFilters.length > 0;
    },
  }))
);
