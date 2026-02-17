import {
  ArrowLeft,
  Check,
  Eye,
  MessageCircle,
  Pencil,
  Send,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import usePortalStore from "../../store/usePortalStore";
import {
  addLikeToNews,
  getNewsById,
  removeLikeFromNews,
  type NewsDetail,
  type NewsListItem,
} from "../../api/newsApi";
import {
  addLikeToComment,
  createComment,
  deleteComment,
  getComments,
  removeLikeFromComment,
  updateComment,
  type Comment,
  type CommentSortBy,
} from "../../api/сommentsApi";

type LocationState = {
  news?: NewsDetail | NewsListItem;
};

const NewsDetailPage = () => {
  const { newsId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, roles } = usePortalStore();

  const isNewsEditor = roles.includes("news_editor");
  const parsedId = Number(newsId);

  const initialNews = useMemo(() => {
    const state = location.state as LocationState | null;
    return state?.news ?? null;
  }, [location.state]);

  const [newsDetail, setNewsDetail] = useState<NewsDetail | null>(() =>
    initialNews && "content" in initialNews ? (initialNews as NewsDetail) : null
  );
  const [loadingNews, setLoadingNews] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentSortBy, setCommentSortBy] = useState<CommentSortBy>("new");
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!parsedId || Number.isNaN(parsedId)) {
      return;
    }

    if (newsDetail && newsDetail.id === parsedId) {
      return;
    }

    const fetchNewsDetail = async () => {
      setLoadingNews(true);
      try {
        const response = await getNewsById(parsedId);
        if (response.status === 200 && response.data) {
          setNewsDetail(response.data);
        }
      } catch (error) {
        console.error("Ошибка загрузки новости:", error);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNewsDetail();
  }, [newsDetail, parsedId]);

  useEffect(() => {
    if (!parsedId || Number.isNaN(parsedId)) {
      return;
    }

    const fetchCommentsForNews = async () => {
      setLoadingComments(true);
      try {
        const response = await getComments(parsedId, commentSortBy);
        if (response.status === 200 && response.data) {
          setComments(response.data.result);
          setCommentsCount(response.data.count);
          setEditingCommentId(null);
          setEditingCommentContent("");
          setCommentLikes((prev) => {
            const next: Record<number, boolean> = {};
            const collect = (items: Comment[]) => {
              items.forEach((item) => {
                next[item.id] = prev[item.id] ?? false;
                if (item.replies && item.replies.length > 0) {
                  collect(item.replies);
                }
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
    };

    fetchCommentsForNews();
  }, [commentSortBy, parsedId]);

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

  const handleToggleNewsLike = async (isLiked: boolean) => {
    if (!currentUser || !newsDetail) return;

    try {
      if (isLiked) {
        await removeLikeFromNews(newsDetail.id);
      } else {
        await addLikeToNews(newsDetail.id);
      }

      setNewsDetail((prev) =>
        prev
          ? {
              ...prev,
              is_liked: !isLiked,
              likes_count: Math.max(0, prev.likes_count + (isLiked ? -1 : 1)),
            }
          : prev
      );
    } catch (error) {
      console.error("Ошибка изменения лайка новости:", error);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim() || !currentUser || !newsDetail) return;

    try {
      const response = await createComment({
        author_id: String(currentUser.eid),
        news_id: newsDetail.id,
        content: newComment.trim(),
      });

      if (response.status === 200) {
        setNewComment("");
        setCommentsCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Ошибка создания комментария:", error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!currentUser || !newsDetail) return;

    const canDeleteComment =
      isNewsEditor ||
      String(currentUser.eid) ===
        String(findCommentById(comments, commentId)?.author.eid);

    if (!canDeleteComment) return;

    try {
      const response = await deleteComment(commentId);
      if (response.status === 200) {
        setCommentsCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Ошибка удаления комментария:", error);
    }
  };

  const handleToggleCommentLike = async (commentId: number, isLiked: boolean) => {
    if (!currentUser) return;

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
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  };

  const handleUpdateComment = async (commentId: number) => {
    const content = editingCommentContent.trim();
    if (!content) return;

    try {
      const response = await updateComment({ id: commentId, content });
      if (response.status === 200) {
        setComments((prev) =>
          updateCommentTree(prev, commentId, (comment) => ({
            ...comment,
            content,
            is_edited: true,
          }))
        );
        handleCancelEditComment();
      }
    } catch (error) {
      console.error("Ошибка редактирования комментария:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "только что";
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;

    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const initials = comment.author.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const isLiked = commentLikes[comment.id] ?? false;
    const canEditComment =
      isNewsEditor || String(currentUser?.eid) === String(comment.author.eid);

    return (
      <div key={comment.id} className={`${depth > 0 ? "ml-12 mt-4" : "mt-4"}`}>
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm text-gray-900">{comment.author.full_name}</p>
                <div className="flex items-center gap-2">
                  {canEditComment && editingCommentId !== comment.id && (
                    <button
                      onClick={() => handleStartEditComment(comment)}
                      className="text-gray-400 hover:text-purple-600 transition-colors"
                      aria-label="Редактировать комментарий"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  {canEditComment && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Удалить комментарий"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {editingCommentId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingCommentContent}
                    onChange={(event) => setEditingCommentContent(event.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateComment(comment.id)}
                      disabled={!editingCommentContent.trim()}
                      className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Сохранить
                    </button>
                    <button
                      onClick={handleCancelEditComment}
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
                  {comment.is_edited && (
                    <p className="text-xs text-gray-400 mt-1">изменено</p>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span>{formatDate(comment.created_at)}</span>
              <button
                onClick={() => handleToggleCommentLike(comment.id, isLiked)}
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
            </div>
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2">
                {comment.replies.map((reply) => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!parsedId || Number.isNaN(parsedId)) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/news")}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к новостям
        </button>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-700">Некорректный идентификатор новости.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/news")}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к новостям
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {loadingNews || !newsDetail ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{newsDetail.title}</h2>
              <p className="text-gray-600 mt-2">{newsDetail.short_description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="px-3 py-1 bg-gray-100 rounded">Новость</span>
              <span>{formatDate(newsDetail.published_at)}</span>
              <span>{newsDetail.author_name}</span>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{newsDetail.content}</p>
            </div>

            <div className="flex items-center gap-6 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Eye className="w-5 h-5" />
                <span>{newsDetail.views_count}</span>
              </div>
              <button
                onClick={() => handleToggleNewsLike(Boolean(newsDetail.is_liked))}
                className={`flex items-center gap-2 transition-colors ${
                  newsDetail.is_liked
                    ? "text-purple-600"
                    : "text-gray-600 hover:text-purple-600"
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                <span>{newsDetail.likes_count}</span>
              </button>
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="w-5 h-5" />
                <span>{commentsCount} комментариев</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Комментарии ({commentsCount})</h3>
          <select
            value={commentSortBy}
            onChange={(event) => setCommentSortBy(event.target.value as CommentSortBy)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="new">Сначала новые</option>
            <option value="popular">Популярные</option>
          </select>
        </div>

        {loadingComments ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Комментариев пока нет</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-112 overflow-y-auto">
            {comments.map((comment) => renderComment(comment))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Написать комментарий..."
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleCreateComment();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleCreateComment}
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;
