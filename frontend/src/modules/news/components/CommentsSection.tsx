import { MessageCircle, Send } from "lucide-react";
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Комментарии ({commentsCount})</h3>
        <select
          value={comments.commentSortBy}
          onChange={(e) => comments.setCommentSortBy(e.target.value as CommentSortBy)}
          className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="new">Сначала новые</option>
          <option value="popular">Популярные</option>
        </select>
      </div>

      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex gap-3">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            onClick={comments.handleCreateComment}
            disabled={!comments.newComment.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            Отправить
          </button>
        </div>
      </div>

      {comments.loadingComments ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-gray-100 rounded"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      ) : comments.comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Комментариев пока нет</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-112 overflow-y-auto">
          {comments.comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
