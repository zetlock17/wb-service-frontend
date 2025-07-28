import { type RangeFilter } from "../types/filtersTypes";
import { useState, useEffect } from "react";
import { useActiveFiltersStore } from "../store/activeFiltersStore";
import Cross from "../assets/cross.svg";

type Props = {
    filter: RangeFilter;
}

const FilterRangeCompact = ({ filter }: Props) => {
  const [minValue, setMinValue] = useState<string>("");
  const [maxValue, setMaxValue] = useState<string>("");
  const { addFilter, removeFilter, getFilterByAttributeName } = useActiveFiltersStore();

  useEffect(() => {
    const activeFilter = getFilterByAttributeName(filter.attributeName);
    if (activeFilter && typeof activeFilter.value === "object" && activeFilter.value !== null) {
      const rangeValue = activeFilter.value as { min?: number; max?: number };
      setMinValue(rangeValue.min?.toString() || "");
      setMaxValue(rangeValue.max?.toString() || "");
    }
  }, [filter.attributeName, getFilterByAttributeName]);

  useEffect(() => {
    const min = minValue ? parseFloat(minValue) : undefined;
    const max = maxValue ? parseFloat(maxValue) : undefined;
    
    if (min !== undefined || max !== undefined) {
      addFilter({
        ...filter,
        value: { min, max }
      });
    } else {
      removeFilter(filter.attributeName);
    }
  }, [minValue, maxValue, filter.attributeName, filter.title, filter.type, filter.measureUnit, addFilter, removeFilter]);

  return (
    <>
      <div className="">
        <div className="flex flex-row gap-3">
          <div className="rounded-md p-2 bg-[#F3F3F3] gap-2.5 flex flex-row w-1/2 focus-within:bg-white border border-transparent focus-within:border-[#C3C3C3]">
            <input
              type="number"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              placeholder="от"
              className="w-full min-w-0"
            />
            {minValue && (
              <button onClick={() => setMinValue("")} className="flex-shrink-0 w-6 h-6">
                <img src={Cross} alt="Clear" className="w-full h-full"/>
              </button>
            )}
          </div>
          
          <div className="rounded-md p-2 bg-[#F3F3F3] gap-2.5 flex flex-row w-1/2 focus-within:bg-white border border-transparent focus-within:border-[#C3C3C3]">
            <input
              type="number"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              placeholder="до"
              className="w-full min-w-0"
            />
            {maxValue && (
              <button onClick={() => setMaxValue("")} className="flex-shrink-0 w-6 h-6">
                <img src={Cross} alt="Clear" className="w-full h-full"/>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterRangeCompact;