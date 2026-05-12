import { Paperclip, Tag } from "lucide-react";
import type { NewsListItem } from "../../../api/newsApi";
import { formatDate } from "../utils";

interface DraftCardProps {
  draft: NewsListItem;
  onOpen: (newsId: number, news: NewsListItem) => void;
  onOpenAuthor: (fullName: string) => void;
}

const DraftCard = ({ draft, onOpen, onOpenAuthor }: DraftCardProps) => (
  <button
    onClick={() => onOpen(draft.id, draft)}
    className="w-full text-left border border-dashed border-gray-300 bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <h3 className="text-xl font-semibold text-gray-900">{draft.title}</h3>
          {draft.file_ids && draft.file_ids.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              <Paperclip className="w-3 h-3" />
              {draft.file_ids.length}
            </span>
          )}
          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">Черновик</span>
        </div>
        <p className="text-gray-600 mb-3">{draft.short_description}</p>
        {draft.tags && draft.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {draft.tags.map((tag) => (
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
          {draft.categories && draft.categories.length > 0 && draft.categories.map((cat) => (
            <span key={cat.id} className="px-2 py-1 bg-gray-100 rounded text-xs">{cat.name}</span>
          ))}
          <span>{formatDate(draft.published_at)}</span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenAuthor(draft.author_name);
            }}
            className="hover:text-purple-600 hover:underline"
          >
            {draft.author_name}
          </button>
        </div>
      </div>
    </div>
  </button>
);

export default DraftCard;
