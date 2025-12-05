import { Award, MessageCircle, Plus, Send, Share2, ThumbsUp } from "lucide-react";
import { useState } from "react";
import Modal from "../../components/common/Modal";
import usePortalStore from "../../store/usePortalStore";
import type { NewsItem } from "../../types/portal";

const NewsModule = () => {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const { news, loading } = usePortalStore();

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Внутренние коммуникации</h2>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Создать новость
          </button>
        </div>
        <div className="space-y-4">
          {news.map((news) => (
            <button
              key={news.id}
              onClick={() => setSelectedNews(news)}
              className={`w-full text-left border rounded-lg p-6 hover:shadow-md transition-shadow ${
                news.pinned ? "border-purple-300 bg-purple-50" : "border-gray-200"
              }`}
            >
              {news.pinned && (
                <div className="flex items-center gap-2 text-purple-600 text-sm font-medium mb-3">
                  <Award className="w-4 h-4" />
                  Закреплено
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{news.title}</h3>
                  <p className="text-gray-600 mb-3">{news.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{news.category}</span>
                    <span>{news.date}</span>
                    <span>{news.author}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                <span className="flex items-center gap-2 text-gray-600">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">{news.likes}</span>
                </span>
                <span className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{news.comments}</span>
                </span>
                <span className="flex items-center gap-2 text-gray-600 ml-auto">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Поделиться</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Modal isOpen={Boolean(selectedNews)} title={selectedNews?.title ?? ""} onClose={() => setSelectedNews(null)}>
        {selectedNews && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="px-3 py-1 bg-gray-100 rounded">{selectedNews.category}</span>
              <span>{selectedNews.date}</span>
              <span>{selectedNews.author}</span>
            </div>
            <p className="text-gray-700 leading-relaxed">{selectedNews.content}</p>
            <div className="flex items-center gap-6 border-t border-gray-200 pt-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600">
                <ThumbsUp className="w-5 h-5" />
                <span>{selectedNews.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600">
                <MessageCircle className="w-5 h-5" />
                <span>{selectedNews.comments} комментариев</span>
              </button>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Комментарии</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                    АС
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-sm text-gray-900 mb-1">Анна Сидорова</p>
                      <p className="text-sm text-gray-700">Отличные новости! Поздравляю команду с результатами.</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">2 часа назад</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <input
                  type="text"
                  placeholder="Написать комментарий..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Отправить
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NewsModule;
