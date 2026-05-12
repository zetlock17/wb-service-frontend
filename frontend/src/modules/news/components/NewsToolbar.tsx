import { Filter, Plus } from "lucide-react";

interface NewsToolbarProps {
  isNewsEditor: boolean;
  isAdmin: boolean;
  activeTab: 'news' | 'drafts';
  onChangeTab: (tab: 'news' | 'drafts') => void;
  draftsCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  onCreateNews: () => void;
  onManageCategories: () => void;
}

const NewsToolbar = ({
  isNewsEditor,
  isAdmin,
  activeTab,
  onChangeTab,
  draftsCount,
  showFilters,
  onToggleFilters,
  onCreateNews,
  onManageCategories,
}: NewsToolbarProps) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-4">
      <h2 className="text-2xl font-bold text-gray-900">Внутренние коммуникации</h2>
      {isNewsEditor && (
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => onChangeTab('news')}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'news' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Новости
          </button>
          <button
            onClick={() => onChangeTab('drafts')}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'drafts' ? 'bg-gray-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Черновики
            {draftsCount > 0 && activeTab !== 'drafts' && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                {draftsCount}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={onToggleFilters}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
          showFilters ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Filter className="w-4 h-4" />
        Фильтры
      </button>
      {isNewsEditor && (
        <button
          onClick={onCreateNews}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Создать новость
        </button>
      )}
      {isAdmin && (
        <button
          onClick={onManageCategories}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Управление категориями
        </button>
      )}
    </div>
  </div>
);

export default NewsToolbar;
