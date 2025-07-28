import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { type Bulletin, type BulletinsData } from "../types/bulletinsTypes";
import { type FilterType, type FiltersData } from "../types/filtersTypes";
import { type Category } from "../types/categoriesTypes";

interface DataStore {
    bulletins: BulletinsData;
    filters: FiltersData;
    categories: Category[];
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;
    
    loadAllData: () => Promise<void>;
    getBulletinsByCategoryId: (categoryId: string) => Bulletin[];
    getFiltersByCategoryId: (categoryId: string) => FilterType[];
    getCategoryByTitle: (title: string) => Category | undefined;
    getAllCategories: () => Category[];
    getCurrentCategory: () => Category | undefined;
    clearData: () => void;
}

// функция для параллельной загрузки всех данных
const loadAllDataParallel = async (): Promise<{
    bulletins: BulletinsData;
    filters: FiltersData;
    categories: Category[];
}> => {
    const [bulletinsResponse, filtersResponse, categoriesResponse] = await Promise.all([
        fetch("/stubs/bulletins.json"),
        fetch("/stubs/filters.json"),
        fetch("/stubs/dirs.json")
    ]);

    if (!bulletinsResponse.ok) {
        throw new Error(`Ошибка загрузки объявлений: ${bulletinsResponse.status}`);
    }
    if (!filtersResponse.ok) {
        throw new Error(`Ошибка загрузки фильтров: ${filtersResponse.status}`);
    }
    if (!categoriesResponse.ok) {
        throw new Error(`Ошибка загрузки категорий: ${categoriesResponse.status}`);
    }

    const [bulletins, filters, categories] = await Promise.all([
        bulletinsResponse.json(),
        filtersResponse.json(),
        categoriesResponse.json()
    ]);

    return { bulletins, filters, categories };
};

export const useDataStore = create<DataStore>()(
    immer((set, get) => ({
        bulletins: {},
        filters: {},
        categories: [],
        isLoading: false,
        error: null,
        isInitialized: false,

        loadAllData: async () => {
            const state = get();
            if (state.isLoading || state.isInitialized) return;

            set((state) => {
                state.isLoading = true;
                state.error = null;
            });

            try {
                const { bulletins, filters, categories } = await loadAllDataParallel();

                set((state) => {
                    state.bulletins = bulletins;
                    state.filters = filters;
                    state.categories = categories;
                    state.isLoading = false;
                    state.error = null;
                    state.isInitialized = true;
                });

            } catch (error) {
                set((state) => {
                    state.error = error instanceof Error ? error.message : "Ошибка загрузки данных";
                    state.isLoading = false;
                    state.isInitialized = false;
                });
            }
        },

        getBulletinsByCategoryId: (categoryId: string) => {
            const state = get();
            return state.bulletins[categoryId] || [];
        },

        getFiltersByCategoryId: (categoryId: string) => {
            const state = get();
            return state.filters[categoryId] || [];
        },

        getCategoryByTitle: (title: string) => {
            const state = get();
            return state.categories.find(category => category.title === title);
        },

        getAllCategories: () => {
            const state = get();
            return state.categories;
        },

        getCurrentCategory: () => {
            const state = get();
            return state.categories.find(category => category.active);
        },
        
        clearData: () => {
            set((state) => {
                state.bulletins = {};
                state.filters = {};
                state.categories = [];
                state.error = null;
                state.isLoading = false;
                state.isInitialized = false;
            });
        },
    }))
);
