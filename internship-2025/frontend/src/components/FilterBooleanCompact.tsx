import { type BooleanFilter } from "../types/filtersTypes";
import { useState, useEffect } from "react";
import { useActiveFiltersStore } from "../store/activeFiltersStore";

type Props = {
    filter: BooleanFilter;
}

const FilterBooleanCompact = ({ filter }: Props) => {
  const { getFilterByAttributeName, addFilter, removeFilter } = useActiveFiltersStore();
  const activeFilter = getFilterByAttributeName(filter.attributeName);
  const [toggle, setToggle] = useState<boolean>(Boolean(activeFilter?.value));

  // синхронизируем состояние toggle с активным фильтром
  useEffect(() => {
    setToggle(Boolean(activeFilter?.value));
  }, [activeFilter]);

  const handleToggle = () => {
    const newToggleValue = !toggle;
    setToggle(newToggleValue);

    if (newToggleValue) {
      addFilter({
        ...filter,
        value: true
      });
    } else {
      removeFilter(filter.attributeName);
    }
  };

  return (
    <>
      <div className="flex items-center cursor-pointer justify-between pt-4 pb-1" onClick={handleToggle}>
        <span className="text-[16px] font-bold text-black mr-2">{filter.title}</span>
        <div className="relative inline-block w-[46px] h-[26px]">
          <span className={`absolute cursor-pointer inset-0 rounded-3xl transition-all duration-300 ease-in-out ${toggle ? "bg-black" : "bg-black/50"}`}>
            <span
              className={`absolute w-5 h-5 bg-white rounded-full transition-all duration-300 ease-in-out top-1/2 -translate-y-1/2 shadow-sm ${
                toggle ? "left-[23px]" : "left-[3px]"
              }`}
            />
          </span>
        </div>
      </div>
    </>
  );
};

export default FilterBooleanCompact;