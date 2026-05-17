import { Check, MessageCircle, Pencil, Reply, Send, ThumbsUp, Trash2, X } from "lucide-react";
import type { RefObject } from "react";
import type { Comment } from "../../../api/сommentsApi";
import type { ProfileSuggestion } from "../../../api/orgStructureApi";
import Avatar from "../../../components/common/Avatar";
import { formatDate } from "../utils";
import MentionSuggestions from "./MentionSuggestions";
import type { MentionContext } from "../hooks/useMentions";

export interface CommentItemProps {
  comment: Comment;
  depth?: number;
  isLiked: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isEditing: boolean;
  editContent: string;
  isReplying: boolean;
  replyContent: string;

  onOpenProfile: (eid: string) => void;
  onToggleLike: (commentId: number, isLiked: boolean) => void;
  onStartEdit: (comment: Comment) => void;
  onCancelEdit: () => void;
  onUpdateComment: (commentId: number) => void;
  onDeleteComment: (commentId: number) => void;
  onStartReply: (commentId: number) => void;
  onCancelReply: () => void;
  onReply: (parentId: number) => void;

  onEditContentChange: (value: string, cursor: number) => void;
  onReplyContentChange: (value: string, cursor: number) => void;
  onEditKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onReplyKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;

  editRef: RefObject<HTMLTextAreaElement | null>;
  replyRef: RefObject<HTMLTextAreaElement | null>;

  showMentionsForContext: (ctx: MentionContext) => boolean;
  mentionSuggestions: ProfileSuggestion[];
  mentionLoading: boolean;
  activeMentionIndex: number;
  onMentionSelect: (suggestion: ProfileSuggestion, inputEl?: HTMLInputElement | HTMLTextAreaElement | null) => void;

  renderReplies?: () => React.ReactNode;
}

const CommentItem = ({
  comment,
  depth = 0,
  isLiked,
  canEdit,
  canDelete,
  isEditing,
  editContent,
  isReplying,
  replyContent,
  onOpenProfile,
  onToggleLike,
  onStartEdit,
  onCancelEdit,
  onUpdateComment,
  onDeleteComment,
  onStartReply,
  onCancelReply,
  onReply,
  onEditContentChange,
  onReplyContentChange,
  onEditKeyDown,
  onReplyKeyDown,
  onBlur,
  editRef,
  replyRef,
  showMentionsForContext,
  mentionSuggestions,
  mentionLoading,
  activeMentionIndex,
  onMentionSelect,
  renderReplies,
}: CommentItemProps) => (
  <div className={depth > 0 ? "ml-12 mt-4" : "mt-4"}>
    <div className="flex gap-3.5">
      <button
        type="button"
        onClick={() => onOpenProfile(String(comment.author.eid))}
        className="shrink-0 self-start"
      >
        <Avatar fullName={comment.author.full_name} size={10} />
      </button>

      <div className="min-w-0 flex-1">
        {/* bubble */}
        <div className="rounded-2xl bg-wb-pink-light/50 p-4">
          <div className="mb-1 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onOpenProfile(String(comment.author.eid))}
              className="font-extrabold text-gray-900 transition hover:text-wb-green hover:underline"
            >
              {comment.author.full_name}
            </button>
            <div className="flex items-center gap-1">
              {canEdit && !isEditing && (
                <button
                  type="button"
                  onClick={() => onStartEdit(comment)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white hover:text-wb-green"
                  aria-label="Редактировать комментарий"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {canDelete && !isEditing && (
                <button
                  type="button"
                  onClick={() => onDeleteComment(comment.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white hover:text-red-600"
                  aria-label="Удалить комментарий"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  ref={editRef}
                  value={editContent}
                  onChange={(e) =>
                    onEditContentChange(e.target.value, e.target.selectionStart ?? e.target.value.length)
                  }
                  onKeyDown={onEditKeyDown}
                  onBlur={() => window.setTimeout(onBlur, 120)}
                  rows={3}
                  className="w-full resize-y rounded-[14px] bg-white px-4 py-3 text-[14.5px] font-medium text-gray-800 outline-none ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-wb-green transition"
                />
                {showMentionsForContext("edit") && (
                  <MentionSuggestions
                    suggestions={mentionSuggestions}
                    loading={mentionLoading}
                    activeIndex={activeMentionIndex}
                    onSelect={(s) => onMentionSelect(s, editRef.current)}
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateComment(comment.id)}
                  disabled={!editContent.trim()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-wb-green px-4 py-2 text-[13px] font-bold text-white transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Check className="h-3.5 w-3.5" />
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-[13px] font-bold text-gray-700 transition hover:bg-gray-200"
                >
                  <X className="h-3.5 w-3.5" />
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[14.5px] text-gray-700">{comment.content}</p>
              {comment.is_edited && (
                <p className="mt-1 text-[12px] font-semibold text-gray-400">изменено</p>
              )}
            </>
          )}
        </div>

        {/* actions row */}
        <div className="mt-2 flex items-center gap-4 pl-1 text-[12.5px] font-semibold text-gray-400">
          <span>{formatDate(comment.created_at)}</span>
          <button
            type="button"
            onClick={() => onToggleLike(comment.id, isLiked)}
            className={`inline-flex items-center gap-1 transition ${
              isLiked ? "text-wb-pink-dark" : "hover:text-wb-pink-dark"
            }`}
          >
            <ThumbsUp className="h-3 w-3" />
            <span>{comment.likes_count}</span>
          </button>
          {comment.replies_count > 0 && (
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {comment.replies_count}
            </span>
          )}
          <button
            type="button"
            onClick={() => onStartReply(comment.id)}
            className="inline-flex items-center gap-1 transition hover:text-wb-green"
          >
            <Reply className="h-3 w-3" />
            Ответить
          </button>
        </div>

        {/* reply box */}
        {isReplying && (
          <div className="mt-3 space-y-2">
            <div className="relative">
              <textarea
                ref={replyRef}
                value={replyContent}
                onChange={(e) =>
                  onReplyContentChange(e.target.value, e.target.selectionStart ?? e.target.value.length)
                }
                onKeyDown={onReplyKeyDown}
                onBlur={() => window.setTimeout(onBlur, 120)}
                placeholder={`Ответить ${comment.author.full_name}...`}
                rows={3}
                className="w-full resize-y rounded-[14px] bg-white px-4 py-3 text-[14.5px] font-medium text-gray-800 outline-none ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-wb-green transition"
              />
              {showMentionsForContext("reply") && (
                <MentionSuggestions
                  suggestions={mentionSuggestions}
                  loading={mentionLoading}
                  activeIndex={activeMentionIndex}
                  onSelect={(s) => onMentionSelect(s, replyRef.current)}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onReply(comment.id)}
                disabled={!replyContent.trim()}
                className="inline-flex items-center gap-1.5 rounded-full bg-wb-green px-4 py-2 text-[13px] font-bold text-white transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Send className="h-3 w-3" />
                Отправить
              </button>
              <button
                type="button"
                onClick={onCancelReply}
                className="inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-[13px] font-bold text-gray-700 transition hover:bg-gray-200"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {renderReplies && renderReplies()}
      </div>
    </div>
  </div>
);

export default CommentItem;
