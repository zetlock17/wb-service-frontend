import { type Bulletin } from "../types/bulletinsTypes";
import { type ActiveFilterType } from "../types/filtersTypes";
import { type SortOption } from "../types/sortingTypes";

// кеш для последнего результата
let lastBulletins: Bulletin[] | null = null;
let lastFilters: ActiveFilterType[] | null = null;
let lastSort: SortOption | null = null;
let lastResult: Bulletin[] | null = null;

// функция для применения всех активных фильтров
export const applyFilters = (bulletins: Bulletin[], activeFilters: ActiveFilterType[]): Bulletin[] => {
  if (activeFilters.length === 0) {
    return bulletins;
  }

  return bulletins.filter(bulletin => {
    return activeFilters.every(filter => {
      return applyFilter(bulletin, filter);
    });
  });
};

// функция для применения одного фильтра к объявлению
const applyFilter = (bulletin: Bulletin, filter: ActiveFilterType): boolean => {
  const attributeName = filter.attributeName;
  const bulletinValue = (bulletin as unknown as Record<string, unknown>)[attributeName];

  switch (filter.type) {
    case "range":
      return applyRangeFilter(bulletinValue, filter.value);
    
    case "optionSelect":
    case "optionSelectSearch":
      return applyOptionFilter(bulletinValue, filter.value);
    
    case "boolean":
      return applyBooleanFilter(bulletinValue, filter.value);
  }
};

// применение фильтра диапазона
const applyRangeFilter = (bulletinValue: unknown, filterValue: { min?: number; max?: number }): boolean => {
  if (bulletinValue === undefined || bulletinValue === null) {
    return false;
  }

  const numValue = typeof bulletinValue === "string" ? parseFloat(bulletinValue) : Number(bulletinValue);
  if (isNaN(numValue)) {
    return false;
  }

  const { min, max } = filterValue;
  
  if (min !== undefined && numValue < min) {
    return false;
  }
  
  if (max !== undefined && numValue > max) {
    return false;
  }
  
  return true;
};

// применение фильтра выбора опций
const applyOptionFilter = (bulletinValue: unknown, filterValue: string | string[]): boolean => {
  if (bulletinValue === undefined || bulletinValue === null) {
    return false;
  }

  const bulletinStringValue = String(bulletinValue).toLowerCase();

  if (typeof filterValue === "string") {
    return bulletinStringValue === filterValue.toLowerCase();
  }

  if (Array.isArray(filterValue)) {
    return filterValue.some(value => 
      bulletinStringValue === value.toLowerCase()
    );
  }

  return true;
};

// применение boolean фильтра
const applyBooleanFilter = (bulletinValue: unknown, filterValue: boolean): boolean => {
  // если фильтр true, проверяем что у объявления есть это поле и оно не пустое
  if (filterValue === true) {
    return Boolean(bulletinValue);
  }

  return true;
};

// функция для сортировки объявлений
export const applySorting = (bulletins: Bulletin[], sortOption: SortOption | null): Bulletin[] => {
  if (!sortOption) {
    return bulletins;
  }

  const sortedBulletins = [...bulletins];

  switch (sortOption.value) {
    case "relevance":
      return sortedBulletins.sort((a, b) => b.dateRelevance - a.dateRelevance);
    
    case "price_asc":
      return sortedBulletins.sort((a, b) => a["sell.priceNum"] - b["sell.priceNum"]);
    
    case "price_desc":
      return sortedBulletins.sort((a, b) => b["sell.priceNum"] - a["sell.priceNum"]);
    
    default:
      return sortedBulletins.sort((a, b) => b.dateRelevance - a.dateRelevance);
  }
};

// основная функция для обработки списка объявлений
export const processFilteredBulletins = (
  bulletins: Bulletin[], 
  activeFilters: ActiveFilterType[], 
  sortOption: SortOption | null
): Bulletin[] => {
  // проверяем, можем ли использовать кеш
  if (
    lastBulletins === bulletins &&
    lastFilters === activeFilters &&
    lastSort === sortOption &&
    lastResult !== null
  ) {
    return lastResult;
  }

  // сначала применяем фильтры
  const filtered = applyFilters(bulletins, activeFilters);
  
  // затем применяем сортировку
  const sorted = applySorting(filtered, sortOption);
  
  // сохраняем в кеш
  lastBulletins = bulletins;
  lastFilters = activeFilters;
  lastSort = sortOption;
  lastResult = sorted;
  
  return sorted;
};