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
    <article
      onClick={() => onOpen(news.id, news)}
      className={`group cursor-pointer rounded-[28px] p-6 transition hover:-translate-y-px sm:p-7 ${
        news.is_pinned ? 'bg-wb-green-light ring-2 ring-inset ring-wb-green/30' : 'bg-white'
      }`}
    >
      {/* pinned indicator */}
      {news.is_pinned && (
        <div className="mb-3 flex items-center gap-1.5 text-[13px] font-bold text-wb-green">
          <Pin className="h-3.5 w-3.5" />
          Закреплено
        </div>
      )}

      {/* title + badges */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h3 className="wrap-break-word text-[22px] font-extrabold leading-tight tracking-tight text-gray-900">
          {news.title}
        </h3>

        {news.file_ids && news.file_ids.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-wb-pink-light px-2.5 py-1 text-[12px] font-extrabold text-wb-pink-dark">
            <Paperclip className="h-3 w-3" />
            {news.file_ids.length}
          </span>
        )}

        <span className={`rounded-full px-3 py-1 text-[12.5px] font-extrabold ${status.className}`}>
          {status.label}
        </span>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-extrabold ${
            news.comments_enabled
              ? 'bg-wb-green-light text-wb-green'
              : 'bg-gray-100 text-gray-500'
          }`}
          title={news.comments_enabled ? 'Комментарии включены' : 'Комментарии выключены'}
        >
          <MessageCircle className="h-3 w-3" />
          {news.comments_enabled ? 'Открыты' : 'Закрыты'}
        </span>
      </div>

      {/* excerpt */}
      {news.short_description && (
        <p className="mt-3 text-[15px] leading-relaxed text-gray-600">{news.short_description}</p>
      )}

      {/* tags */}
      {news.tags && news.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {news.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full bg-wb-pink-light px-3 py-1 text-[12.5px] font-extrabold text-wb-pink-dark ring-1 ring-inset ring-wb-pink-dark/20"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* meta */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        {news.categories && news.categories.length > 0 && news.categories.map((cat) => (
          <span key={cat.id} className="rounded-full bg-wb-pink-light px-3 py-1 text-[12.5px] font-extrabold text-wb-green">
            {cat.name}
          </span>
        ))}
        <span className="text-[13px] font-semibold text-gray-400">{formatDate(news.published_at)}</span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenAuthor(news.author_name); }}
          className="text-[13px] font-bold text-gray-700 transition hover:text-wb-green hover:underline"
        >
          {news.author_name}
        </button>
      </div>

      {/* footer stats */}
      <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-gray-100 pt-4">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-400">
          <Eye className="h-4 w-4" />
          {news.views_count}
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleLike(news.id, Boolean(news.is_liked)); }}
          className={`inline-flex items-center gap-1.5 text-[13px] font-semibold transition ${
            news.is_liked ? 'text-wb-pink-dark' : 'text-gray-400 hover:text-wb-pink-dark'
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
          {news.likes_count}
        </button>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-400">
          <MessageCircle className="h-4 w-4" />
          {news.comments_count}
        </span>
        <span className="ml-auto text-[12.5px] font-bold text-wb-pink-dark opacity-0 transition group-hover:opacity-100">
          Открыть →
        </span>
      </div>
    </article>
  );
};

export default NewsCard;
