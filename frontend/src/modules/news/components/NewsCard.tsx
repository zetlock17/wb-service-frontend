import { Eye, MessageCircle, Paperclip, Pin, Tag, ThumbsUp } from "lucide-react";
import type { NewsListItem } from "../../../api/newsApi";
import { formatDate, getStatusLabel } from "../utils";

interface NewsCardProps {
  news: NewsListItem;
  onOpen: (newsId: number, news: NewsListItem) => void;
  onToggleLike: (newsId: number, isLiked: boolean) => void;
  onOpenAuthor: (fullName: string) => void;
}

const NewsCard = ({ news, onOpen, onToggleLike, onOpenAuthor }: NewsCardProps) => {
  const status = getStatusLabel(news.status);

  return (
    <button
      onClick={() => onOpen(news.id, news)}
      className={`w-full text-left border rounded-lg p-6 hover:shadow-md transition-shadow ${
        news.is_pinned ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
      }`}
    >
      {news.is_pinned && (
        <div className="flex items-center gap-2 text-purple-600 text-sm font-medium mb-3">
          <Pin className="w-4 h-4" />
          Закреплено
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-xl font-semibold text-gray-900">{news.title}</h3>
            {news.file_ids && news.file_ids.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                <Paperclip className="w-3 h-3" />
                {news.file_ids.length}
              </span>
            )}
            <span className={`px-2 py-1 rounded text-xs font-medium ${status.className}`}>
              {status.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                news.comments_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
              title={news.comments_enabled ? 'Комментарии включены' : 'Комментарии выключены'}
            >
              <MessageCircle className="w-3 h-3" />
              {news.comments_enabled ? 'Открыты' : 'Закрыты'}
            </span>
          </div>
          <p className="text-gray-600 mb-3">{news.short_description}</p>
          {news.tags && news.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {news.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-full text-xs"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            {news.categories && news.categories.length > 0 && news.categories.map((cat) => (
              <span key={cat.id} className="px-2 py-1 bg-gray-100 rounded text-xs">{cat.name}</span>
            ))}
            <span>{formatDate(news.published_at)}</span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenAuthor(news.author_name);
              }}
              className="hover:text-purple-600 hover:underline"
            >
              {news.author_name}
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
        <span className="flex items-center gap-2 text-gray-600">
          <Eye className="w-4 h-4" />
          <span className="text-sm">{news.views_count}</span>
        </span>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onToggleLike(news.id, Boolean(news.is_liked));
          }}
          className={`flex items-center gap-2 transition-colors ${
            news.is_liked ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span className="text-sm">{news.likes_count}</span>
        </button>
        <span className="flex items-center gap-2 text-gray-600">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">{news.comments_count}</span>
        </span>
      </div>
    </button>
  );
};

export default NewsCard;
