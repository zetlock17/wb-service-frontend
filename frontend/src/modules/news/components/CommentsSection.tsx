import { ChevronDown, MessageCircle, Send } from "lucide-react";
import { useRef } from "react";
import type { Comment } from "../../../api/сommentsApi";
import type { CommentSortBy } from "../../../api/сommentsApi";
import type { useComments } from "../hooks/useComments";
import type { useMentions } from "../hooks/useMentions";
import CommentItem from "./CommentItem";
import MentionSuggestions from "./MentionSuggestions";

type CommentsController = ReturnType<typeof useComments>;
type MentionsController = ReturnType<typeof useMentions>;

interface CommentsSectionProps {
  commentsCount: number;
  comments: CommentsController;
  mentions: MentionsController;
  onOpenProfile: (eid: string) => void;
}

const CommentsSection = ({
  commentsCount,
  comments,
  mentions,
  onOpenProfile,
}: CommentsSectionProps) => {
  const newCommentRef = useRef<HTMLInputElement>(null);
  const replyCommentRef = useRef<HTMLTextAreaElement>(null);
  const editCommentRef = useRef<HTMLTextAreaElement>(null);

  const {
    mentionSuggestions,
    mentionLoading,
    activeMention,
    activeMentionIndex,
    closeMentionSuggestions,
    handleMentionInputChange,
    handleMentionKeyDown,
    applyMentionSuggestion,
  } = mentions;

  const showMentions = (ctx: import("../hooks/useMentions").MentionContext) =>
    !!(activeMention?.context === ctx && (mentionLoading || mentionSuggestions.length > 0));

  const sharedProps = {
    onOpenProfile,
    onToggleLike: comments.handleToggleCommentLike,
    onStartEdit: (comment: Comment) => {
      comments.handleStartEditComment(comment);
      closeMentionSuggestions();
    },
    onCancelEdit: () => {
      comments.handleCancelEditComment();
      closeMentionSuggestions();
    },
    onUpdateComment: comments.handleUpdateComment,
    onDeleteComment: comments.handleDeleteComment,
    onStartReply: (id: number) => {
      comments.setReplyingToCommentId(id);
      comments.setReplyContent("");
      closeMentionSuggestions();
    },
    onCancelReply: () => {
      comments.setReplyingToCommentId(null);
      comments.setReplyContent("");
      closeMentionSuggestions();
    },
    onReply: comments.handleReplyToComment,
    onEditContentChange: (value: string, cursor: number) => {
      comments.setEditingCommentContent(value);
      handleMentionInputChange("edit", value, cursor);
    },
    onReplyContentChange: (value: string, cursor: number) => {
      comments.setReplyContent(value);
      handleMentionInputChange("reply", value, cursor);
    },
    onEditKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      handleMentionKeyDown(event, "edit");
    },
    onReplyKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      handleMentionKeyDown(event, "reply");
    },
    onBlur: closeMentionSuggestions,
    editRef: editCommentRef,
    replyRef: replyCommentRef,
    showMentionsForContext: showMentions,
    mentionSuggestions,
    mentionLoading,
    activeMentionIndex,
    onMentionSelect: (
      suggestion: import("../../../api/orgStructureApi").ProfileSuggestion,
      inputEl?: HTMLInputElement | HTMLTextAreaElement | null
    ) => applyMentionSuggestion(suggestion, inputEl),
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <CommentItem
      key={comment.id}
      {...sharedProps}
      comment={comment}
      depth={depth}
      isLiked={comments.commentLikes[comment.id] ?? false}
      canEdit={comments.canEditComment(comment)}
      canDelete={comments.canDeleteComment(comment)}
      isEditing={comments.editingCommentId === comment.id}
      editContent={comments.editingCommentContent}
      isReplying={comments.replyingToCommentId === comment.id}
      replyContent={comments.replyContent}
      renderReplies={
        comment.replies && comment.replies.length > 0
          ? () => <div className="mt-2">{comment.replies.map((r) => renderComment(r, depth + 1))}</div>
          : undefined
      }
    />
  );

  const showNewMentions = showMentions("new");

  return (
    <section className="rounded-[28px] bg-white p-6 sm:p-9">
      {/* header */}
      <header className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-[22px] font-extrabold text-gray-900">
          Комментарии{" "}
          <span className="text-gray-400">({commentsCount})</span>
        </h2>
        <div className="relative">
          <select
            value={comments.commentSortBy}
            onChange={(e) => comments.setCommentSortBy(e.target.value as CommentSortBy)}
            className="appearance-none cursor-pointer rounded-full bg-wb-pink-light py-2 pr-9 pl-4 text-[13.5px] font-bold text-wb-green outline-none focus:ring-2 focus:ring-inset focus:ring-wb-green transition"
          >
            <option value="new">Сначала новые</option>
            <option value="popular">Популярные</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-wb-green" />
        </div>
      </header>

      {/* new comment input */}
      <div className="mb-6 border-b-2 border-dashed border-gray-100 pb-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              ref={newCommentRef}
              type="text"
              placeholder="Написать комментарий... (@ для упоминания)"
              value={comments.newComment}
              onChange={(e) => {
                const value = e.target.value;
                comments.setNewComment(value);
                handleMentionInputChange("new", value, e.target.selectionStart ?? value.length);
              }}
              onKeyDown={(e) => {
                if (handleMentionKeyDown(e, "new")) return;
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  comments.handleCreateComment();
                }
              }}
              onBlur={() => window.setTimeout(closeMentionSuggestions, 120)}
              className="w-full rounded-2xl bg-white px-4 py-3 text-[14.5px] font-medium text-gray-800 outline-none ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-wb-green transition"
            />
            {showNewMentions && (
              <MentionSuggestions
                suggestions={mentionSuggestions}
                loading={mentionLoading}
                activeIndex={activeMentionIndex}
                onSelect={(s) => applyMentionSuggestion(s, newCommentRef.current)}
              />
            )}
          </div>
          <button
            type="button"
            onClick={comments.handleCreateComment}
            disabled={!comments.newComment.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-wb-green px-5 py-3 text-[14.5px] font-bold text-white transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
          >
            <Send className="h-4 w-4" />
            Отправить
          </button>
        </div>
      </div>

      {/* comment list */}
      {comments.loadingComments ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 rounded-2xl bg-wb-pink-light" />
          <div className="h-20 rounded-2xl bg-wb-pink-light" />
        </div>
      ) : comments.comments.length === 0 ? (
        <div className="py-8 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-wb-pink-light text-wb-pink-dark">
            <MessageCircle className="h-6 w-6" />
          </div>
          <p className="text-[14.5px] font-semibold text-gray-400">Комментариев пока нет</p>
        </div>
      ) : (
        <div className="max-h-112 space-y-2 overflow-y-auto">
          {comments.comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </section>
  );
};

export default CommentsSection;
