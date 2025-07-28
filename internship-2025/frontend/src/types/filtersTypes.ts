export interface FilterOption {
    [key: string]: string;
}

export interface Filter {
    // type: "range" | "optionSelect" | "optionSelectSearch" | "boolean";
    measureUnit?: string | null;
    attributeName: string;
    title: string;
    // options?: FilterOption;
}

export interface OptionSelectFilter extends Filter {
    type: "optionSelect" | "optionSelectSearch";
    options: FilterOption;
}

export interface RangeFilter extends Filter {
    type: "range";
    value: { min?: number; max?: number };
}

export interface BooleanFilter extends Filter {
    type: "boolean";
    value: boolean;
}

export type FilterType = OptionSelectFilter | RangeFilter | BooleanFilter;

export interface FiltersData {
    [categoryId: string]: FilterType[];
}

// Active filter interfaces that extend the base filter types
export interface ActiveOptionSelectFilter extends OptionSelectFilter {
    value: string | string[];
}

// For RangeFilter and BooleanFilter, we can use the original types as they already have the correct value types
export type ActiveFilterType = ActiveOptionSelectFilter | RangeFilter | BooleanFilter;