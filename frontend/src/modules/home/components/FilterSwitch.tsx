import { ChevronLeft, ChevronRight } from "lucide-react";

interface FilterSwitchProps<T extends string> {
  options: readonly T[];
  labels: Record<T, string>;
  filter: T;
  setFilter: (value: T) => void;
}

const FilterSwitch = <T extends string>({
  options,
  labels,
  filter,
  setFilter,
}: FilterSwitchProps<T>) => {
  const index = options.indexOf(filter);

  const prev = () => {
    if (index > 0) setFilter(options[index - 1]);
  };

  const next = () => {
    if (index < options.length - 1) setFilter(options[index + 1]);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={prev}
        disabled={index === 0}
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg bg-white whitespace-nowrap">
        {labels[filter]}
      </div>

      <button
        onClick={next}
        disabled={index === options.length - 1}
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default FilterSwitch;
