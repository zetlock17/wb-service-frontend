import { type OptionSelectFilter } from "../types/filtersTypes";
import FilterOptionSearchModal from "./FilterOptionSearchModal";
import { useState } from "react";
import { useActiveFiltersStore } from "../store/activeFiltersStore";

type Props = {
    filter: OptionSelectFilter;
}

const FilterOptionCompact = ({ filter }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { addFilter, removeFilter, getFilterByAttributeName } = useActiveFiltersStore();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleOptionToggle = (optionKey: string) => {
    const activeFilter = getFilterByAttributeName(filter.attributeName);
    
    if (activeFilter) {
      const currentValues = Array.isArray(activeFilter.value) ? activeFilter.value : [activeFilter.value as string];
      
      if (currentValues.includes(optionKey)) {
        const newValues = currentValues.filter(val => val !== optionKey);
        if (newValues.length === 0) {
          removeFilter(filter.attributeName);
        } else {
          addFilter({
            ...filter,
            value: newValues.length === 1 ? newValues[0] : newValues
          });
        }
      } else {
        addFilter({
          ...filter,
          value: [...currentValues, optionKey]
        });
      }
    } else {
      addFilter({
        ...filter,
        value: optionKey
      });
    }
  };

  const isOptionSelected = (optionKey: string): boolean => {
    const activeFilter = getFilterByAttributeName(filter.attributeName);
    if (!activeFilter) return false;
    
    if (Array.isArray(activeFilter.value)) {
      return activeFilter.value.includes(optionKey);
    }
    return activeFilter.value === optionKey;
  };
  
  return (
    <>
        <h3 className="pt-4 pb-1 text-[16px] font-bold">{filter.title}</h3>
        {filter.options && Object.keys(filter.options).length <= 5 && 
            Object.entries(filter.options).map(([key, value]) => (
                <div 
                  key={key} 
                  className={`flex items-center rounded-lg cursor-pointer justify-between px-3 ${
                    isOptionSelected(key) ? "bg-[#F3F3F3]" : "bg-white"
                  }`}
                  onClick={() => handleOptionToggle(key)}
                >
                  <span className="text-[16px] py-2">{value}</span>
                  <input
                    type="checkbox"
                    checked={isOptionSelected(key)}
                    onChange={() => {}}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                  />
                </div>
            ))
        }
        {filter.options && Object.keys(filter.options).length > 5 && (
            <>
                {(() => {
                    const allOptions = Object.entries(filter.options);
                    const selectedOptions = allOptions.filter(([key]) => isOptionSelected(key));
                    const unselectedOptions = allOptions.filter(([key]) => !isOptionSelected(key));
                    
                    const optionsToShow = [
                        ...selectedOptions,
                        ...unselectedOptions.slice(0, Math.max(0, 4 - selectedOptions.length))
                    ];
                    
                    return optionsToShow.map(([key, value]) => (
                        <div 
                          key={key} 
                          className={`flex items-center rounded-lg cursor-pointer justify-between px-3 ${
                            isOptionSelected(key) ? "bg-[#F3F3F3]" : "bg-white"
                          }`}
                          onClick={() => handleOptionToggle(key)}
                        >
                          <span className="text-[16px] py-2">{value}</span>
                          <input
                            type="checkbox"
                            checked={isOptionSelected(key)}
                            onChange={() => {}}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                          />
                        </div>
                    ));
                })()}
                
                <button 
                  className="flex items-center justify-start py-2 text-[16px] text-blue-600 w-full"
                  onClick={handleOpenModal}
                >
                  <span>Все {filter.title.toLowerCase()}</span>
                </button>
            </>
        )}

        <FilterOptionSearchModal 
          filter={filter}
          onClose={() => setIsModalOpen(false)} 
          isOpen={isModalOpen}
        />
    </>
  );
};

export default FilterOptionCompact;