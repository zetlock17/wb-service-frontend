import { Paperclip, Tag } from "lucide-react";
import type { NewsListItem } from "../../../api/newsApi";
import { formatDate } from "../utils";

interface DraftCardProps {
  draft: NewsListItem;
  onOpen: (newsId: number, news: NewsListItem) => void;
  onOpenAuthor: (fullName: string) => void;
}

const DraftCard = ({ draft, onOpen, onOpenAuthor }: DraftCardProps) => (
  <article
    onClick={() => onOpen(draft.id, draft)}
    className="group cursor-pointer rounded-[28px] border-2 border-dashed border-wb-pink-light bg-white p-6 transition hover:-translate-y-px sm:p-7"
  >
    {/* title + badges */}
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <h3 className="wrap-break-word text-[22px] font-extrabold leading-tight tracking-tight text-gray-900">
        {draft.title}
      </h3>

      {draft.file_ids && draft.file_ids.length > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-wb-pink-light px-2.5 py-1 text-[12px] font-extrabold text-wb-pink-dark">
          <Paperclip className="h-3 w-3" />
          {draft.file_ids.length}
        </span>
      )}

      <span className="rounded-full bg-gray-100 px-3 py-1 text-[12.5px] font-extrabold text-gray-600">
        Черновик
      </span>
    </div>

    {/* excerpt */}
    {draft.short_description && (
      <p className="mt-3 text-[15px] leading-relaxed text-gray-600">{draft.short_description}</p>
    )}

    {/* tags */}
    {draft.tags && draft.tags.length > 0 && (
      <div className="mt-4 flex flex-wrap gap-2">
        {draft.tags.map((tag) => (
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
      {draft.categories && draft.categories.length > 0 && draft.categories.map((cat) => (
        <span key={cat.id} className="rounded-full bg-wb-pink-light px-3 py-1 text-[12.5px] font-extrabold text-wb-green">
          {cat.name}
        </span>
      ))}
      <span className="text-[13px] font-semibold text-gray-400">{formatDate(draft.published_at)}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onOpenAuthor(draft.author_name); }}
        className="text-[13px] font-bold text-gray-700 transition hover:text-wb-green hover:underline"
      >
        {draft.author_name}
      </button>
    </div>

    <div className="mt-4 flex justify-end">
      <span className="text-[12.5px] font-bold text-wb-pink-dark opacity-0 transition group-hover:opacity-100">
        Открыть →
      </span>
    </div>
  </article>
);

export default DraftCard;
