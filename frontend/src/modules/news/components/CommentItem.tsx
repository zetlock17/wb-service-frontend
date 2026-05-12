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
  <div className={`${depth > 0 ? "ml-12 mt-4" : "mt-4"}`}>
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onOpenProfile(String(comment.author.eid))}
        className="shrink-0 self-start"
      >
        <Avatar fullName={comment.author.full_name} size={10} />
      </button>
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <button
              type="button"
              onClick={() => onOpenProfile(String(comment.author.eid))}
              className="font-medium text-sm text-gray-900 hover:text-purple-600 hover:underline"
            >
              {comment.author.full_name}
            </button>
            <div className="flex items-center gap-2">
              {canEdit && !isEditing && (
                <button
                  onClick={() => onStartEdit(comment)}
                  className="text-gray-400 hover:text-purple-600 transition-colors"
                  aria-label="Редактировать комментарий"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              {canDelete && !isEditing && (
                <button
                  onClick={() => onDeleteComment(comment.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Удалить комментарий"
                >
                  <Trash2 className="w-4 h-4" />
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  onClick={() => onUpdateComment(comment.id)}
                  disabled={!editContent.trim()}
                  className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Сохранить
                </button>
                <button
                  onClick={onCancelEdit}
                  className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-700">{comment.content}</p>
              {comment.is_edited && <p className="text-xs text-gray-400 mt-1">изменено</p>}
            </>
          )}
        </div>

        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
          <span>{formatDate(comment.created_at)}</span>
          <button
            onClick={() => onToggleLike(comment.id, isLiked)}
            className={`flex items-center gap-1 transition-colors ${
              isLiked ? "text-purple-600" : "hover:text-purple-600"
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            <span>{comment.likes_count}</span>
          </button>
          {comment.replies_count > 0 && (
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {comment.replies_count}
            </span>
          )}
          <button
            onClick={() => onStartReply(comment.id)}
            className="flex items-center gap-1 hover:text-purple-600 transition-colors"
          >
            <Reply className="w-3 h-3" />
            Ответить
          </button>
        </div>

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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                onClick={() => onReply(comment.id)}
                disabled={!replyContent.trim()}
                className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                Отправить
              </button>
              <button
                onClick={onCancelReply}
                className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
