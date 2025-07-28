import React, { useEffect, useState } from "react";
import Cross from "../assets/cross.svg";
import Checkmark from "../assets/checkmark.svg";
import { type Category } from "../types/categoriesTypes";
import { type FilterType } from "../types/filtersTypes";
import { type ActiveFilterType } from "../types/filtersTypes";
import FilterRangeWithTitle from "./FilterRangeWithTitle";
import FilterOptionCompact from "./FilterOptionCompact";
import FilterBooleanCompact from "./FilterBooleanCompact";
import CategorySelectModal from "./CategorySelectModal";
import { useActiveFiltersStore } from "../store/activeFiltersStore";
import { useDataStore } from "../store/dataStore";

interface AllFiltersModalProps {
    isOpen: boolean;
    onClose: () => void;
    // currentCategory: Category;
    filters: FilterType[];
}

const AllFiltersModal: React.FC<AllFiltersModalProps> = ({ isOpen, onClose, filters }) => {
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    // const { getFilterByAttributeName } = useActiveFiltersStore();
    const activeFilters = useActiveFiltersStore.getState().activeFilters;

    // это повтор функции из CatalogContent.tsx, но она немного другая
    const getFilterDisplayText = (filter: ActiveFilterType): string => {

        const originalFilter = filters.find(f => f.attributeName === filter.attributeName);

        switch (filter.type) {
            case "range":
                if (typeof filter.value === "object" && filter.value !== null) {
                    const { min, max } = filter.value as { min?: number; max?: number };
                    const unit = filter.measureUnit ? ` ${filter.measureUnit}` : "";
                    if (min !== undefined && max !== undefined) {
                        return `${min}${unit} - ${max}${unit}`;
                    } else if (min !== undefined) {
                        return `от ${min}${unit}`;
                    } else if (max !== undefined) {
                        return `до ${max}${unit}`;
                    }
                }
                return filter.title;
            
            case "optionSelect":
            case "optionSelectSearch":
                if (typeof filter.value === "string") {
                    const optionText = originalFilter && "options" in originalFilter ? originalFilter.options[filter.value] || filter.value : filter.value;
                    return `${optionText}`;
                }
                return filter.title;
            
            case "boolean":
                return filter.title;
        }
    };

    const { 
        isInitialized,
        loadAllData, 
        getCurrentCategory
    } = useDataStore();

    useEffect(() => {
        if (!isInitialized) {
            loadAllData();
        }
    }, [isInitialized, loadAllData]);

    const currentCategory = getCurrentCategory();

    const handleApply = () => {
        onClose();
    };

    const handleAllSectionsClick = () => {
        setIsCategoryModalOpen(true);
    };

    const handleCategoryModalClose = () => {
        setIsCategoryModalOpen(false);
    };

    const handleCategorySelect = (category: Category | null) => {
        console.log("Selected category:", category);
        setIsCategoryModalOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#F3F3F3] z-50 flex flex-col">
            <div className="flex justify-between items-center bg-white">
                <h2 className="text-lg font-semibold p-3 text-[19px]">
                    Фильтры
                </h2>
                <button onClick={onClose} className="h-12 w-12 flex justify-center items-center">
                    <img src={Cross} alt="Close" />
                </button>
            </div>
            <div className="gap-2 flex flex-col flex-1 overflow-y-auto">
                <div className="pb-3 bg-white rounded-b-xl">
                    <div className="px-3">
                        <button
                            onClick={handleAllSectionsClick}
                            className={"flex items-center justify-between px-2 rounded-l"}
                            >
                            <span className="text-left py-3">Все разделы</span>
                        </button>
                        <div className="flex items-center justify-between px-2 rounded-lg bg-[#F3F3F3]">
                            <span className="text-left py-3">{currentCategory?.title}</span>
                            <div className="flex items-center justify-center w-6 h-6">
                                <img src={Checkmark} alt="Expanded" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rounded-t-xl bg-white px-3 pb-20 flex-1">
                    {activeFilters && activeFilters.length > 0 && (
                        <div className="pt-3 flex flex-wrap gap-2">
                            <button className="flex items-center justify-center bg-[#F3F3F3] rounded-[8px] p-2" onClick={() => useActiveFiltersStore.getState().clearFilters()}>
                                <img src={Cross} alt="Clear Filters" className="w-4 h-4" />
                            </button>
                            {activeFilters && activeFilters.length > 0 && (
                                activeFilters.map((filter) => (
                                    <React.Fragment key={filter.attributeName}>
                                        {(filter.type === "range" || filter.type === "boolean") && (
                                            <div className="h-8 py-1 px-3 rounded-[8px] flex flex-row justify-between gap-1 bg-black items-center">
                                                <span className="text-white text-[14px] leading-[20px]">
                                                    {getFilterDisplayText(filter)}
                                                </span>
                                                <button
                                                    onClick={() => useActiveFiltersStore.getState().removeFilter(filter.attributeName)}
                                                    className="flex items-center justify-center w-4 h-4"
                                                >
                                                    <img src={Cross} alt="Remove Filter" className="w-full h-full" />
                                                </button>
                                            </div>
                                        )}

                                        {(filter.type === "optionSelect" || filter.type === "optionSelectSearch") && (
                                            <>
                                                {Array.isArray(filter.value) ? (
                                                    filter.value.map((option) => {
                                                        const originalFilter = filters.find(f => f.attributeName === filter.attributeName);
                                                        const optionText = originalFilter && "options" in originalFilter ? originalFilter.options[option] || option : option;
                                                        return (
                                                            <div key={option} className="h-8 py-1 px-3 rounded-[8px] flex flex-row justify-between gap-1 bg-black items-center">
                                                                <span className="text-white text-[14px] leading-[20px]">
                                                                    {optionText}
                                                                </span>
                                                                <button
                                                                    onClick={() => useActiveFiltersStore.getState().removeFilterOption(filter.attributeName, option)}
                                                                    className="flex items-center justify-center w-4 h-4"
                                                                >
                                                                    <img src={Cross} alt="Remove Filter" className="w-full h-full" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    typeof filter.value === "string" && filter.value && (
                                                        <div className="h-8 py-1 px-3 rounded-[8px] flex flex-row justify-between gap-1 bg-black items-center">
                                                            <span className="text-white text-[14px] leading-[20px]">
                                                                {(() => {
                                                                    const originalFilter = filters.find(f => f.attributeName === filter.attributeName);
                                                                    return originalFilter && "options" in originalFilter ? originalFilter.options[filter.value as string] || filter.value : filter.value;
                                                                })()}
                                                            </span>
                                                            <button
                                                                onClick={() => useActiveFiltersStore.getState().removeFilter(filter.attributeName)}
                                                                className="flex items-center justify-center w-4 h-4"
                                                            >
                                                                <img src={Cross} alt="Remove Filter" className="w-full h-full" />
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </>
                                        )
                                        }
                                    </React.Fragment>
                                ))
                            )}
                        </div>
                    )}
                    {filters.map((filter) => (
                        <div key={filter.attributeName}>
                            {filter.type === "range" && <FilterRangeWithTitle filter={filter} />}
                            {filter.type === "optionSelect" && <FilterOptionCompact filter={filter} />}
                            {filter.type === "optionSelectSearch" && <FilterOptionCompact filter={filter} />}
                            {filter.type === "boolean" && <FilterBooleanCompact filter={filter} />}
                        </div>
                    ))}

                    <div className="absolute bottom-0 left-0 right-0 px-3 pt-3 pb-4">
                        <button
                            onClick={handleApply}
                            className="px-5 py-3 bg-black text-white rounded-lg w-full"
                            >
                            Выбрать
                        </button>
                    </div>
                </div>
            </div>
            
            <CategorySelectModal
                isOpen={isCategoryModalOpen}
                onClose={handleCategoryModalClose}
                currentCategory={currentCategory || null}
                onCategorySelect={handleCategorySelect}
                initialShowAllCategories={true}
            />
        </div>
    );
};

export default AllFiltersModal;