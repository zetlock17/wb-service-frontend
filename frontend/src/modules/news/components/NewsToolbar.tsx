import { Bell, Filter, Plus, Settings, X } from "lucide-react";
import type { Category } from "../../../api/newsApi";

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
  followedCategories: Category[];
  selectedCategory?: number;
  onSelectCategory: (categoryId: number | undefined) => void;
  onUnfollowCategory: (categoryId: number) => void;
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
  followedCategories,
  selectedCategory,
  onSelectCategory,
  onUnfollowCategory,
}: NewsToolbarProps) => (
  <header className="rounded-[28px] bg-wb-green px-7 pt-8 pb-8 sm:px-10">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {isNewsEditor && (
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => onChangeTab('news')}
              style={{ paddingLeft: 16, paddingRight: 16 }}
              className={`inline-flex items-center rounded-full py-2 text-[13.5px] font-bold transition ${
                activeTab === 'news'
                  ? 'bg-white text-wb-green'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Новости
            </button>
            <button
              type="button"
              onClick={() => onChangeTab('drafts')}
              style={{ paddingLeft: 16, paddingRight: 16 }}
              className={`inline-flex items-center gap-2 rounded-full py-2 text-[13.5px] font-bold transition ${
                activeTab === 'drafts'
                  ? 'bg-white text-wb-green'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Черновики
              {draftsCount > 0 && activeTab !== 'drafts' && (
                <span className="rounded-full bg-wb-pink-dark px-2 py-0.5 text-[11px] font-extrabold text-white">
                  {draftsCount}
                </span>
              )}
            </button>
          </div>
        )}
        <h1 className="text-[32px] font-black leading-tight tracking-tight text-white sm:text-[42px]">
          Внутренние коммуникации
        </h1>
      </div>

      <div className="flex flex-wrap items-start gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onToggleFilters}
          style={{ paddingLeft: 18, paddingRight: 18 }}
          className={`inline-flex items-center gap-2 rounded-full py-3.5 text-[15px] font-bold whitespace-nowrap transition hover:-translate-y-px ${
            showFilters
              ? 'bg-wb-pink-dark text-white'
              : 'bg-white text-gray-800 hover:opacity-90'
          }`}
        >
          <Filter className="h-4 w-4" />
          Фильтры
        </button>

        {isNewsEditor && (
          <button
            type="button"
            onClick={onCreateNews}
            style={{ paddingLeft: 18, paddingRight: 18 }}
            className="inline-flex items-center gap-2 rounded-full bg-wb-green-dark py-3.5 text-[15px] font-bold whitespace-nowrap text-white transition hover:-translate-y-px"
          >
            <Plus className="h-4 w-4" />
            Создать новость
          </button>
        )}

        <button
          type="button"
          onClick={onManageCategories}
          style={{ paddingLeft: 18, paddingRight: 18 }}
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 py-3.5 text-[15px] font-bold whitespace-nowrap text-white transition hover:-translate-y-px"
        >
          {isAdmin ? (
            <><Settings className="h-4 w-4" />Управление категориями</>
          ) : (
            <><Bell className="h-4 w-4" />Подписки</>
          )}
        </button>
      </div>
    </div>

    {followedCategories.length > 0 && (
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-bold text-white/70">
          <Bell className="h-3.5 w-3.5" />
          Подписки:
        </span>
        {followedCategories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <div key={cat.id} className="group relative inline-flex">
              <button
                type="button"
                onClick={() => onSelectCategory(isActive ? undefined : cat.id)}
                style={{ paddingLeft: 14, paddingRight: 28 }}
                className={`rounded-full py-2 text-[13.5px] font-bold transition hover:-translate-y-px ${
                  isActive
                    ? 'bg-white text-wb-green'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {cat.name}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isActive) onSelectCategory(undefined);
                  onUnfollowCategory(cat.id);
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full opacity-0 transition group-hover:opacity-100 hover:bg-black/20"
                title="Отписаться"
              >
                <X className={`h-3 w-3 ${isActive ? 'text-wb-green' : 'text-white'}`} />
              </button>
            </div>
          );
        })}
      </div>
    )}
  </header>
);

export default NewsToolbar;
