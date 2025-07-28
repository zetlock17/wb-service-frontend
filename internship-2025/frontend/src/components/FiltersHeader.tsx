import { useState } from "react";
import { createPortal } from "react-dom";
import { useScrollContext } from "../contexts/ScrollContext";
import InactiveFiltersArrow from "../assets/inactive-filters-arrow.svg";
import ActiveFiltersArrow from "../assets/active-filters-arrow.svg";
import FiltersIcon from "../assets/filters-icon.svg";
import SortingIcon from "../assets/sorting-icon.svg";
import SubscribeIcon from "../assets/bell.svg";
import ActiveBell from "../assets/active-bell.svg";
import { type FilterType, type OptionSelectFilter } from "../types/filtersTypes";
import { useActiveFiltersStore } from "../store/activeFiltersStore";
import { useSortingStore } from "../store/sortingStore";
import { sortFiltersByActiveState } from "../utils/filterUtils";
import FilterRangeModal from "./FilterRangeModal";
import FilterOptionSearchModal from "./FilterOptionSearchModal";
import SortModal from "./SortModal";
import AllFiltersModal from "./AllFiltersModal";

interface FiltersHeaderProps {
  isSub: boolean;
  // currentCategory: Category;
  filters: FilterType[];
  onSubscribeClick: () => void;
}

const FiltersHeader = ({ isSub, filters, onSubscribeClick }: FiltersHeaderProps) => {
  const { hideStickyElements } = useScrollContext();
  const [activeModal, setActiveModal] = useState<{ type: string; filter: FilterType } | null>(null);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isAllFiltersModalOpen, setIsAllFiltersModalOpen] = useState(false);
  const { getFilterByAttributeName } = useActiveFiltersStore();
  const { getSortTitle } = useSortingStore();

  const isOptionSelectFilter = (filter: FilterType): filter is OptionSelectFilter => {
    return filter.type === "optionSelect" || filter.type === "optionSelectSearch";
  };

  const handleFilterClick = (filter: FilterType) => {
    if (filter.type === "boolean") {
      // для boolean фильтров сразу добавляем/убираем без модального окна
      const { addFilter, removeFilter } = useActiveFiltersStore.getState();
      const existingFilter = getFilterByAttributeName(filter.attributeName);
      
      if (existingFilter) {
        removeFilter(filter.attributeName);
      } else {
        addFilter({
          attributeName: filter.attributeName,
          title: filter.title,
          type: filter.type,
          value: true,
          measureUnit: filter.measureUnit
        });
      }
    } else {
      setActiveModal({ type: filter.type, filter });
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleSortButtonClick = () => {
    setIsSortModalOpen(true);
  };

  const handleSortModalClose = () => {
    setIsSortModalOpen(false);
  };

  const handleAllFiltersButtonClick = () => {
    setIsAllFiltersModalOpen(true);
  };

  const handleAllFiltersModalClose = () => {
    setIsAllFiltersModalOpen(false);
  };

  const isFilterActive = (filter: FilterType) => {
    return getFilterByAttributeName(filter.attributeName) !== undefined;
  };

  const getFilterDisplayText = (filter: FilterType): string => {
    const activeFilter = getFilterByAttributeName(filter.attributeName);
    if (!activeFilter) return filter.title;

    switch (filter.type) {
      case "range":
        if (typeof activeFilter.value === "object" && activeFilter.value !== null) {
          const { min, max } = activeFilter.value as { min?: number; max?: number };
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
        if (typeof activeFilter.value === "string") {
          const optionText = "options" in filter ? filter.options[activeFilter.value] || activeFilter.value : activeFilter.value;
          return `${optionText}`;
        }
        return filter.title;
      
      case "boolean":
        return filter.title;
    }
  };

  return (
    <>
      <div className={`px-3 sticky top-[60px] bg-white transition-transform duration-300 ease-in-out ${hideStickyElements ? "translate-y-0" : "-translate-y-[calc(100%+60px)]"}`}>
        <div className="flex flex-row gap-1 pt-3 pb-2 overflow-x-auto scrollbar-hide -mx-3">
          <div className="flex flex-row gap-1 whitespace-nowrap mx-3">
            
            <button 
              className="bg-[#F3F3F3] rounded-lg py-1.5 px-2 gap-1 text-[14px] flex justify-center items-center"
              onClick={handleAllFiltersButtonClick}
            >
              <div className="h-6 w-6 flex items-center justify-center">
                <img src={FiltersIcon} alt="Filters Icon" />
              </div>
            </button>

            {sortFiltersByActiveState(filters, isFilterActive).map((filter) => (
              <button 
                key={filter.attributeName} 
                onClick={() => handleFilterClick(filter)}
                className={`rounded-lg py-2 px-4 text-[14px] whitespace-nowrap flex flex-row justify-center items-center transition-colors ${
                  isFilterActive(filter) 
                    ? "bg-black text-white" 
                    : "bg-[#F3F3F3] text-black"
                }`}
              >
                {getFilterDisplayText(filter)}
                {filter.type !== "boolean" && (
                  <img 
                    src={isFilterActive(filter) ? ActiveFiltersArrow : InactiveFiltersArrow} 
                    alt="Arrow" 
                    className="w-3 h-3 ml-1" 
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-row justify-between pb-3 text-[14px]">
            <button className="flex flex-row items-center gap-1 py-1" onClick={handleSortButtonClick}>
              <img src={SortingIcon} alt="Sorting Icon" />
              {getSortTitle()}
            </button>

            <button className="flex flex-row items-center gap-1 py-1" onClick={onSubscribeClick}>
              {isSub ? (
                <>
                  <img src={ActiveBell} alt="Active Bell Icon" />
                  Вы подписаны
                </>
              ) : (
                <>
                  <img src={SubscribeIcon} alt="Subscribe Icon" />
                  Подписаться
                </>
              )}
            </button>
        </div>
      </div>

      {createPortal(
        <>
          {activeModal && activeModal.type === "range" && (
            <FilterRangeModal
              filter={activeModal.filter}
              isOpen={true}
              onClose={closeModal}
            />
          )}
          
          {activeModal && isOptionSelectFilter(activeModal.filter) && (activeModal.type === "optionSelectSearch" || activeModal.type === "optionSelect") && (
            <FilterOptionSearchModal
              filter={activeModal.filter}
              isOpen={true}
              onClose={closeModal}
            />
          )}

          <SortModal
            isOpen={isSortModalOpen}
            onClose={handleSortModalClose}
          />

          <AllFiltersModal 
            isOpen={isAllFiltersModalOpen}
            onClose={handleAllFiltersModalClose}
            // currentCategory={currentCategory}
            filters={filters}
          />
        </>,
        document.body
      )}
    </>
  );
};

export default FiltersHeader;