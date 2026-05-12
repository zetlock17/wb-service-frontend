import { useEffect, useState } from "react";
import {
  addLikeToComment,
  createComment,
  deleteComment,
  getComments,
  removeLikeFromComment,
  updateComment,
  type Comment,
  type CommentSortBy,
} from "../../../api/сommentsApi";

interface UseCommentsParams {
  newsId: number;
  authorId: string | undefined;
  isNewsEditor: boolean;
  isAdmin: boolean;
  currentUserEid: string | undefined;
}

const updateCommentTree = (
  items: Comment[],
  commentId: number,
  updater: (comment: Comment) => Comment
): Comment[] =>
  items.map((item) => {
    if (item.id === commentId) return updater(item);
    if (!item.replies || item.replies.length === 0) return item;
    return { ...item, replies: updateCommentTree(item.replies, commentId, updater) };
  });

const findCommentById = (items: Comment[], id: number): Comment | undefined => {
  for (const item of items) {
    if (item.id === id) return item;
    const nested = findCommentById(item.replies || [], id);
    if (nested) return nested;
  }
  return undefined;
};

export const useComments = ({
  newsId,
  authorId,
  isNewsEditor,
  isAdmin,
  currentUserEid,
}: UseCommentsParams) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentSortBy, setCommentSortBy] = useState<CommentSortBy>("new");
  const [loadingComments, setLoadingComments] = useState(false);
  const [refreshComments, setRefreshComments] = useState(0);

  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({});

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    if (!newsId || Number.isNaN(newsId)) return;

    (async () => {
      setLoadingComments(true);
      try {
        const response = await getComments(newsId, commentSortBy);
        if (response.status === 200 && response.data) {
          setComments(response.data.result);
          setCommentsCount(response.data.count);
          setEditingCommentId(null);
          setEditingCommentContent("");
          setCommentLikes((prev) => {
            const next: Record<number, boolean> = {};
            const collect = (items: Comment[]) => {
              items.forEach((item) => {
                next[item.id] = item.is_liked ?? prev[item.id] ?? false;
                if (item.replies?.length) collect(item.replies);
              });
            };
            collect(response.data.result);
            return next;
          });
        }
      } catch (error) {
        console.error("Ошибка загрузки комментариев:", error);
      } finally {
        setLoadingComments(false);
      }
    })();
  }, [commentSortBy, newsId, refreshComments]);

  const triggerRefresh = () => setRefreshComments((prev) => prev + 1);

  const handleCreateComment = async () => {
    if (!newComment.trim() || !authorId) return;
    try {
      const response = await createComment({
        author_id: authorId,
        news_id: newsId,
        content: newComment.trim(),
      });
      if (response.status === 200) {
        setNewComment("");
        setCommentsCount((prev) => prev + 1);
        triggerRefresh();
      }
    } catch (error) {
      console.error("Ошибка создания комментария:", error);
    }
  };

  const handleReplyToComment = async (parentId: number) => {
    if (!replyContent.trim() || !authorId) return;
    try {
      const response = await createComment({
        author_id: authorId,
        news_id: newsId,
        content: replyContent.trim(),
        parent_id: parentId,
      });
      if (response.status === 200) {
        setReplyContent("");
        setReplyingToCommentId(null);
        setCommentsCount((prev) => prev + 1);
        triggerRefresh();
      }
    } catch (error) {
      console.error("Ошибка создания ответа:", error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const comment = findCommentById(comments, commentId);
    const canDelete =
      isNewsEditor || isAdmin || currentUserEid === String(comment?.author.eid);
    if (!canDelete) return;
    if (!window.confirm("Вы уверены, что хотите удалить этот комментарий?")) return;
    try {
      const response = await deleteComment(commentId);
      if (response.status === 200) {
        setCommentsCount((prev) => Math.max(0, prev - 1));
        triggerRefresh();
      }
    } catch (error) {
      console.error("Ошибка удаления комментария:", error);
    }
  };

  const handleToggleCommentLike = async (commentId: number, isLiked: boolean) => {
    if (!currentUserEid) return;
    try {
      if (isLiked) {
        await removeLikeFromComment(commentId);
      } else {
        await addLikeToComment(commentId);
      }
      setCommentLikes((prev) => ({ ...prev, [commentId]: !isLiked }));
      setComments((prev) =>
        updateCommentTree(prev, commentId, (comment) => ({
          ...comment,
          likes_count: Math.max(0, comment.likes_count + (isLiked ? -1 : 1)),
        }))
      );
    } catch (error) {
      console.error("Ошибка изменения лайка:", error);
    }
  };

  const handleStartEditComment = (comment: Comment) => {
    const canEdit = isAdmin || currentUserEid === String(comment.author.eid);
    if (!canEdit) return;
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  };

  const handleUpdateComment = async (commentId: number) => {
    const comment = findCommentById(comments, commentId);
    const canEdit = isAdmin || currentUserEid === String(comment?.author.eid);
    if (!canEdit) return;
    const content = editingCommentContent.trim();
    if (!content) return;
    try {
      const response = await updateComment({ id: commentId, content });
      if (response.status === 200) {
        setComments((prev) =>
          updateCommentTree(prev, commentId, (c) => ({ ...c, content, is_edited: true }))
        );
        handleCancelEditComment();
      }
    } catch (error) {
      console.error("Ошибка редактирования комментария:", error);
    }
  };

  const canEditComment = (comment: Comment) =>
    isAdmin || currentUserEid === String(comment.author.eid);

  const canDeleteComment = (comment: Comment) =>
    isNewsEditor || isAdmin || currentUserEid === String(comment.author.eid);

  return {
    comments,
    commentsCount,
    commentSortBy,
    setCommentSortBy,
    loadingComments,
    commentLikes,

    newComment,
    setNewComment,
    editingCommentId,
    editingCommentContent,
    setEditingCommentContent,
    replyingToCommentId,
    setReplyingToCommentId,
    replyContent,
    setReplyContent,

    handleCreateComment,
    handleReplyToComment,
    handleDeleteComment,
    handleToggleCommentLike,
    handleStartEditComment,
    handleCancelEditComment,
    handleUpdateComment,
    canEditComment,
    canDeleteComment,
  };
};
