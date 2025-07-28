import { type RangeFilter } from "../types/filtersTypes";
import FilterRangeCompact from "./FilterRangeCompact";

type Props = {
    filter: RangeFilter;
}

const FilterRangeWithTitle = ({ filter }: Props) => {
  return (
    <>
      <h3 className="pt-4 pb-3 text-[16px] font-bold">{filter.title}</h3>
      <FilterRangeCompact filter={filter} />
    </>
  );
};

export default FilterRangeWithTitle;
