import { useState, useEffect, useMemo } from "react";
import { type OptionSelectFilter } from "../types/filtersTypes";
import { useActiveFiltersStore } from "../store/activeFiltersStore";
import Cross from "../assets/cross.svg";
import Search from "../assets/search-catalog.svg";

interface FilterOptionSearchModalProps {
  filter: OptionSelectFilter;
  isOpen: boolean;
  onClose: () => void;
}

const FilterOptionSearchModal = ({ filter, isOpen, onClose }: FilterOptionSearchModalProps) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const { addFilter, getFilterByAttributeName, removeFilter } = useActiveFiltersStore();

  useEffect(() => {
    if (isOpen) {
      const activeFilter = getFilterByAttributeName(filter.attributeName);
      if (activeFilter && typeof activeFilter.value === "string") {
        setSelectedValues([activeFilter.value]);
      } else if (activeFilter && Array.isArray(activeFilter.value)) {
        setSelectedValues(activeFilter.value);
      } else {
        setSelectedValues([]);
      }
      setSearchQuery("");
    }
  }, [isOpen, filter.attributeName, getFilterByAttributeName]);

  const filteredOptions = useMemo(() => {
    const options = filter.options || {};
    if (!searchQuery) return options;
    
    return Object.entries(options).reduce((acc, [key, value]) => {
      if (value.toLowerCase().includes(searchQuery.toLowerCase())) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
  }, [filter.options, searchQuery]);

  const handleOptionToggle = (optionKey: string) => {
    setSelectedValues(prev => {
      if (prev.includes(optionKey)) {
        return prev.filter(val => val !== optionKey);
      } else {
        return [...prev, optionKey];
      }
    });
  };

  const handleApply = () => {
    if (selectedValues.length > 0) {
      addFilter({
        ...filter,
        value: selectedValues.length === 1 ? selectedValues[0] : selectedValues
      });
    } else {
      removeFilter(filter.attributeName);
    }
    
    onClose();
  };

  const handleBackdropClick = () => {
    handleApply();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 modal-background" 
      onClick={handleBackdropClick}
    >
      <div 
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl w-full flex flex-col max-h-[calc(100dvh-60px)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pl-3 flex-shrink-0">
          <h2 className="text-[19px] font-semibold p-3">{filter.title}</h2>
          <button onClick={handleApply} className="h-12 w-12 flex justify-center items-center">
            <img src={Cross} alt="Close" />
          </button>
        </div>
        
        {filter.type === "optionSelectSearch" && (
          <div className="px-3 pb-2 flex-shrink-0">
            <div className="w-full rounded-lg gap-1 flex flex-row items-center bg-[#F3F3F3] py-2.5 pr-2 pl-2.5 ">
              <div className="flex items-center justify-center w-6 h-6">
                <img src={Search} alt="Search" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Найти"
              />
            </div>
          </div>
        )}
        
        <div className="px-3 overflow-y-auto flex-1 min-h-0 pb-20">
          {Object.entries(filteredOptions).map(([key, value]) => (
            <div 
              key={key} 
              className={`flex items-center rounded-lg cursor-pointer justify-between px-3 ${
                selectedValues.includes(key) ? "bg-[#F3F3F3]" : "bg-white"
              }`}
              onClick={() => handleOptionToggle(key)}
            >
              <span className="text-[16px] py-2">{value}</span>
              <input
                type="checkbox"
                checked={selectedValues.includes(key)}
                onChange={() => {}}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded pointer-events-none"
              />
            </div>
          ))}
          
          {Object.keys(filteredOptions).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Ничего не найдено
            </div>
          )}
        </div>
        
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
  );
};

export default FilterOptionSearchModal;