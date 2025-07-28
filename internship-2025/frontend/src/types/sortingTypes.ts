export interface SortOption {
  id: string;
  title: string;
  value: string;
}

export interface SortingState {
  currentSort: SortOption | null;
  availableSorts: SortOption[];
}

export const defaultSortOptions: SortOption[] = [
  { id: "relevance", title: "По актуальности", value: "relevance" },
  { id: "price_asc", title: "По цене, сначала дешевые", value: "price_asc" },
  { id: "price_desc", title: "По цене, сначала дорогие", value: "price_desc" },
];