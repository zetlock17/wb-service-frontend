import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { type SortOption, type SortingState, defaultSortOptions } from "../types/sortingTypes";

interface SortingStore extends SortingState {
  setSort: (sortOption: SortOption) => void;
  resetSort: () => void;
  getSortTitle: () => string;
  isDefaultSort: () => boolean;
}

export const useSortingStore = create<SortingStore>()(
  immer((set, get) => ({
    currentSort: null,
    availableSorts: defaultSortOptions,

    setSort: (sortOption: SortOption) => {
      set((state) => {
        state.currentSort = sortOption;
      });
    },

    resetSort: () => {
      set((state) => {
        state.currentSort = null;
      });
    },

    getSortTitle: () => {
      const state = get();
      return state.currentSort?.title || "Сортировка";
    },

    isDefaultSort: () => {
      const state = get();
      return state.currentSort === null;
    },
  }))
);