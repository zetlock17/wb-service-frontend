import { type FilterType } from "../types/filtersTypes";

export const sortFiltersByActiveState = (
  filters: FilterType[],
  isFilterActive: (filter: FilterType) => boolean
): FilterType[] => {
  return [...filters].sort((a, b) => {
    const aActive = isFilterActive(a);
    const bActive = isFilterActive(b);

    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return 0;
  });
};
