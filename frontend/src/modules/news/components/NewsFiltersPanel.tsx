import { useRef, useState } from "react";
import { Search, Tag, X } from "lucide-react";
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

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
          <select
            value={selectedCategory || ''}
            onChange={(e) => onSelectCategory(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Все категории</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Сортировка</label>
          <select
            value={sortBy}
            onChange={(e) => onChangeSortBy(e.target.value as NewsSortBy)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="newest">Сначала новые</option>
            <option value="popular">Популярные</option>
            <option value="discussed">Обсуждаемые</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <button
              onClick={() => onApplySearch(searchInput)}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Фильтр по тегу</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onApplyTag(tagInput); }}
              placeholder="Введите тег..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <button
              onClick={() => onApplyTag(tagInput)}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Tag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {(appliedSearch || appliedTag || statusFilter) && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
          <span className="text-sm text-gray-500">Активные фильтры:</span>
          {appliedSearch && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
              <Search className="w-3 h-3" />
              {appliedSearch}
              <button
                onClick={() => { onApplySearch(''); setSearchInput(''); }}
                className="hover:text-purple-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {appliedTag && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
              <Tag className="w-3 h-3" />
              {appliedTag}
              <button
                onClick={() => { onApplyTag(''); setTagInput(''); }}
                className="hover:text-purple-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
              {getStatusLabel(statusFilter).label}
              <button onClick={() => onChangeStatus('')} className="hover:text-purple-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsFiltersPanel;
