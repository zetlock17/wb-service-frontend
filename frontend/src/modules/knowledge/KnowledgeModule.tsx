import { Eye, Plus, Share2, Star, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import Modal from "../../components/common/Modal";
import usePortalStore from "../../store/usePortalStore";
import type { KnowledgeArticle } from "../../types/portal";

const KnowledgeModule = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const { knowledgeBase, loading } = usePortalStore();

  const categories = useMemo(() => ["all", ...new Set(knowledgeBase.map((article) => article.category))], [knowledgeBase]);

  const filteredArticles = useMemo(() => {
    let result = knowledgeBase;
    if (categoryFilter !== "all") {
      result = result.filter((article) => article.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((article) => article.title.toLowerCase().includes(query));
    }
    return result;
  }, [knowledgeBase, categoryFilter, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex gap-4 mb-6">
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">База знаний</h2>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Создать статью
          </button>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Поиск статей..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Все категории</option>
            {categories
              .filter((category) => category !== "all")
              .map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((article) => (
            <button
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="text-left border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex-1 mr-3">{article.title}</h3>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">{article.rating}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {article.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{article.category}</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.views}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {article.author} • {article.date}
              </div>
            </button>
          ))}
          {!filteredArticles.length && (
            <p className="text-center col-span-full text-gray-500 py-8">Статьи по выбранным параметрам не найдены</p>
          )}
        </div>
      </div>

      <Modal isOpen={Boolean(selectedArticle)} title={selectedArticle?.title ?? ""} onClose={() => setSelectedArticle(null)}>
        {selectedArticle && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{selectedArticle.category}</span>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-medium">{selectedArticle.rating}</span>
              </div>
              <span className="text-sm text-gray-600">{selectedArticle.views} просмотров</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedArticle.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-gray-700">
              Здесь находится полное содержание статьи с подробными инструкциями и примерами. Вы можете следовать этим рекомендациям для успешного выполнения задач.
            </p>
            <div className="text-sm text-gray-500">Автор: {selectedArticle.author} • Обновлено: {selectedArticle.date}</div>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                Полезно
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Поделиться
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default KnowledgeModule;
