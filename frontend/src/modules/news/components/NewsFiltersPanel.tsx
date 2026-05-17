import { useRef, useState } from "react";
import { ChevronDown, Search, Tag, X } from "lucide-react";
import type { Category, NewsSortBy, NewsStatus } from "../../../api/newsApi";
import { getStatusLabel } from "../utils";

interface NewsFiltersPanelProps {
  categories: Category[];
  selectedCategory?: number;
  onSelectCategory: (id: number | undefined) => void;
  sortBy: NewsSortBy;
  onChangeSortBy: (sort: NewsSortBy) => void;
  appliedSearch: string;
  onApplySearch: (value: string) => void;
  appliedTag: string;
  onApplyTag: (value: string) => void;
  statusFilter: NewsStatus | '';
  onChangeStatus: (status: NewsStatus | '') => void;
}

const NewsFiltersPanel = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onChangeSortBy,
  appliedSearch,
  onApplySearch,
  appliedTag,
  onApplyTag,
  statusFilter,
  onChangeStatus,
}: NewsFiltersPanelProps) => {
  const [searchInput, setSearchInput] = useState(appliedSearch);
  const [tagInput, setTagInput] = useState(appliedTag);
  const searchRef = useRef<HTMLInputElement>(null);

  const hasActive = appliedSearch || appliedTag || statusFilter;

  return (
    <div className="rounded-[28px] bg-white p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Category */}
        <div>
          <label className="mb-2 block text-[12.5px] font-bold tracking-wide text-gray-500">Категория</label>
          <div className="relative">
            <select
              value={selectedCategory || ''}
              onChange={(e) => onSelectCategory(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full appearance-none rounded-[14px] bg-white px-4 py-3 text-[14.5px] font-semibold text-gray-800 outline-none ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-wb-green transition"
              style={{ paddingRight: 38 }}
            >
              <option value="">Все категории</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-wb-green" />
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="mb-2 block text-[12.5px] font-bold tracking-wide text-gray-500">Сортировка</label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onChangeSortBy(e.target.value as NewsSortBy)}
              className="w-full appearance-none rounded-[14px] bg-white px-4 py-3 text-[14.5px] font-semibold text-gray-800 outline-none ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-wb-green transition"
              style={{ paddingRight: 38 }}
            >
              <option value="newest">Сначала новые</option>
              <option value="popular">Популярные</option>
              <option value="discussed">Обсуждаемые</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-wb-green" />
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="mb-2 block text-[12.5px] font-bold tracking-wide text-gray-500">
            Поиск по названию / описанию
          </label>
          <div className="flex gap-2">
            <input
              ref={searchRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onApplySearch(searchInput); }}
              placeholder="Введите запрос..."
              className="flex-1 min-w-0 rounded-[14px] bg-white px-4 py-3 text-[14.5px] font-semibold text-gray-800 outline-none ring-1 ring-inset ring-gray-200 placeholder:font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-wb-green transition"
            />
            <button
              type="button"
              onClick={() => onApplySearch(searchInput)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-wb-green text-white transition hover:opacity-90"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tag */}
        <div>
          <label className="mb-2 block text-[12.5px] font-bold tracking-wide text-gray-500">Фильтр по тегу</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onApplyTag(tagInput); }}
              placeholder="Введите тег..."
              className="flex-1 min-w-0 rounded-[14px] bg-white px-4 py-3 text-[14.5px] font-semibold text-gray-800 outline-none ring-1 ring-inset ring-gray-200 placeholder:font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-wb-green transition"
            />
            <button
              type="button"
              onClick={() => onApplyTag(tagInput)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-wb-green text-white transition hover:opacity-90"
            >
              <Tag className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {hasActive && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t-2 border-dashed border-gray-100 pt-4">
          <span className="text-[12.5px] font-bold text-gray-500">Активные фильтры:</span>
          {appliedSearch && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-wb-green-light px-3 py-1.5 text-[12.5px] font-bold text-wb-green">
              <Search className="h-3 w-3" />
              {appliedSearch}
              <button
                type="button"
                onClick={() => { onApplySearch(''); setSearchInput(''); }}
                className="transition hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {appliedTag && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-wb-pink-light px-3 py-1.5 text-[12.5px] font-bold text-wb-pink-dark">
              <Tag className="h-3 w-3" />
              {appliedTag}
              <button
                type="button"
                onClick={() => { onApplyTag(''); setTagInput(''); }}
                className="transition hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-wb-pink-light px-3 py-1.5 text-[12.5px] font-bold text-wb-pink-dark">
              {getStatusLabel(statusFilter).label}
              <button
                type="button"
                onClick={() => onChangeStatus('')}
                className="transition hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsFiltersPanel;
