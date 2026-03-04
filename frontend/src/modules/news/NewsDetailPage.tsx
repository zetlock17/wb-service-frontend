import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Lock,
  MessageCircle,
  MessageCircleOff,
  Pencil,
  Reply,
  Send,
  Share2,
  Tag,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import usePortalStore from "../../store/usePortalStore";
import {
  addLikeToNews,
  acknowledgeNews,
  getCategories,
  getNewsAcknowledgements,
  getNewsById,
  removeLikeFromNews,
  updateNews,
  type Category,
  type NewsDetail,
  type NewsListItem,
  type NewsStatus,
  type NewsUpdate,
} from "../../api/newsApi";
import Modal from "../../components/common/Modal";
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
import { fetchStatic } from "../../api/filesApi";
import Avatar from "../../components/common/Avatar";

type LocationState = {
  news?: NewsDetail | NewsListItem;
};

const NewsDetailPage = () => {
  const { newsId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, roles } = usePortalStore();

  const isNewsEditor = roles.includes("news_editor");
  const isAdmin = roles.includes("admin");
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
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [refreshComments, setRefreshComments] = useState(0);
  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null);
  const [acknowledging, setAcknowledging] = useState(false);
  const [acknowledgementsData, setAcknowledgementsData] = useState<{
    acknowledged: { eid: string; full_name: string; acknowledged_at: string }[];
    not_acknowledged: { eid: string; full_name: string }[];
    total: number;
    acknowledged_count: number;
  } | null>(null);
  const [showAckDetails, setShowAckDetails] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategories, setEditCategories] = useState<Category[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  interface EditFormData {
    title: string;
    short_description: string;
    content: string;
    category_ids: number[];
    is_pinned: boolean;
    mandatory_ack: boolean;
    comments_enabled: boolean;
    status: NewsStatus;
    tag_names: string;
    scheduled_publish_at_local: string;
    expires_at_local: string;
    file_ids: number[];
  }
  const [editData, setEditData] = useState<EditFormData>({
    title: '',
    short_description: '',
    content: '',
    category_ids: [],
    is_pinned: false,
    mandatory_ack: false,
    comments_enabled: true,
    status: 'PUBLISHED',
    tag_names: '',
    scheduled_publish_at_local: '',
    expires_at_local: '',
    file_ids: [],
  });

  const fetchedNewsId = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!parsedId || Number.isNaN(parsedId)) {
      return;
    }

    // Если уже загружена новость с этим ID, не загружаем повторно
    if (fetchedNewsId.current === parsedId) {
      return;
    }

    // Если есть новость из location.state с нужным ID и полным контентом, используем её
    if (isInitialMount.current && initialNews && "content" in initialNews && initialNews.id === parsedId) {
      setNewsDetail(initialNews as NewsDetail);
      fetchedNewsId.current = parsedId;
      isInitialMount.current = false;
      return;
    }

    isInitialMount.current = false;

    // Иначе загружаем новость с сервера
    const fetchNewsDetail = async () => {
      setLoadingNews(true);
      try {
        const response = await getNewsById(parsedId);
        if (response.status === 200 && response.data) {
          setNewsDetail(response.data);
          fetchedNewsId.current = parsedId;
          // Загружаем подтверждения если нужно
          if (response.data.mandatory_ack && (isAdmin || isNewsEditor)) {
            fetchAcknowledgements(parsedId);
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки новости:", error);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNewsDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedId]);

  // Fetch acknowledgements when newsDetail loads (covers case when loaded from location.state)
  useEffect(() => {
    if (newsDetail?.mandatory_ack && (isAdmin || isNewsEditor) && !acknowledgementsData) {
      fetchAcknowledgements(newsDetail.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newsDetail?.id, newsDetail?.mandatory_ack]);

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
                // Use is_liked from server response; fall back to prev state
                next[item.id] = item.is_liked ?? prev[item.id] ?? false;
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
  }, [commentSortBy, parsedId, refreshComments]);

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

  const handleShareNews = async () => {
    if (!newsDetail) return;

    const shareUrl = `${window.location.origin}/news/${newsDetail.id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Ссылка на новость скопирована в буфер обмена!");
    } catch (error) {
      console.error("Ошибка копирования ссылки:", error);
      alert("Не удалось скопировать ссылку");
    }
  };

  const handleDownloadFile = async (fileId: number, fileName?: string) => {
    setDownloadingFileId(fileId);
    try {
      const response = await fetchStatic(fileId);
      if (response.status === 200 && response.data) {
        // Создаем ссылку и скачиваем файл
        const link = document.createElement("a");
        link.href = response.data;
        link.download = fileName || `file_${fileId}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Ошибка скачивания файла:", response.message);
        alert("Не удалось скачать файл");
      }
    } catch (error) {
      console.error("Ошибка скачивания файла:", error);
      alert("Ошибка при скачивании файла");
    } finally {
      setDownloadingFileId(null);
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
        setRefreshComments((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Ошибка создания комментария:", error);
    }
  };

  const handleReplyToComment = async (parentId: number) => {
    if (!replyContent.trim() || !currentUser || !newsDetail) return;

    try {
      const response = await createComment({
        author_id: String(currentUser.eid),
        news_id: newsDetail.id,
        content: replyContent.trim(),
        parent_id: parentId,
      });

      if (response.status === 200) {
        setReplyContent("");
        setReplyingToCommentId(null);
        setCommentsCount((prev) => prev + 1);
        setRefreshComments((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Ошибка создания ответа:", error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!currentUser || !newsDetail) return;

    const comment = findCommentById(comments, commentId);
    const canDeleteComment =
      isNewsEditor ||
      isAdmin ||
      String(currentUser.eid) === String(comment?.author.eid);

    if (!canDeleteComment) return;

    if (!window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      return;
    }

    try {
      const response = await deleteComment(commentId);
      if (response.status === 200) {
        setCommentsCount((prev) => Math.max(0, prev - 1));
        setRefreshComments((prev) => prev + 1);
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

  const handleOpenEditModal = async () => {
    if (!newsDetail) return;
    const cats = await getCategories();
    if (cats.status === 200 && cats.data) setEditCategories(cats.data);
    setEditData({
      title: newsDetail.title,
      short_description: newsDetail.short_description,
      content: newsDetail.content,
      category_ids: newsDetail.categories?.map(c => c.id) ?? [],
      is_pinned: newsDetail.is_pinned,
      mandatory_ack: newsDetail.mandatory_ack,
      comments_enabled: newsDetail.comments_enabled,
      status: (newsDetail.status as NewsStatus) ?? 'PUBLISHED',
      tag_names: newsDetail.tags?.join(', ') ?? '',
      scheduled_publish_at_local: newsDetail.scheduled_publish_at
        ? new Date(newsDetail.scheduled_publish_at).toISOString().slice(0, 16)
        : '',
      expires_at_local: newsDetail.expires_at
        ? new Date(newsDetail.expires_at).toISOString().slice(0, 16)
        : '',
      file_ids: newsDetail.file_ids ?? [],
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!newsDetail || !isNewsEditor) return;
    setSavingEdit(true);
    try {
      const parsedTags = editData.tag_names
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      const payload: NewsUpdate = {
        title: editData.title?.trim(),
        short_description: editData.short_description?.trim(),
        content: editData.content?.trim(),
        category_ids: editData.category_ids,
        is_pinned: editData.is_pinned,
        mandatory_ack: editData.mandatory_ack,
        comments_enabled: editData.comments_enabled,
        status: editData.status,
        scheduled_publish_at: editData.status === 'SCHEDULED' && editData.scheduled_publish_at_local
          ? new Date(editData.scheduled_publish_at_local).toISOString()
          : null,
        expires_at: editData.expires_at_local
          ? new Date(editData.expires_at_local).toISOString()
          : null,
        tag_names: parsedTags.length > 0 ? parsedTags : [],
        file_ids: editData.file_ids,
      };
      const response = await updateNews(newsDetail.id, payload);
      if (response.status === 200) {
        setShowEditModal(false);
        // Reload news data
        fetchedNewsId.current = null;
        const refreshed = await getNewsById(newsDetail.id);
        if (refreshed.status === 200 && refreshed.data) {
          setNewsDetail(refreshed.data);
          fetchedNewsId.current = newsDetail.id;
        }
      } else {
        alert('Ошибка при сохранении новости');
      }
    } catch (err) {
      console.error('Ошибка обновления новости:', err);
      alert('Ошибка при сохранении новости');
    } finally {
      setSavingEdit(false);
    }
  };

  const fetchAcknowledgements = async (newsId: number) => {
    try {
      const response = await getNewsAcknowledgements(newsId);
      if (response.status === 200 && response.data) {
        setAcknowledgementsData(response.data);
      }
    } catch (error) {
      console.error("Ошибка загрузки подтверждений:", error);
    }
  };

  const handleAcknowledge = async () => {
    if (!newsDetail || acknowledging) return;
    setAcknowledging(true);
    try {
      const response = await acknowledgeNews(newsDetail.id);
      if (response.status === 200) {
        setNewsDetail((prev) =>
          prev ? { ...prev, is_acknowledged: true, must_acknowledge: false } : prev
        );
        if (isAdmin || isNewsEditor) {
          await fetchAcknowledgements(newsDetail.id);
        }
      }
    } catch (error) {
      console.error("Ошибка подтверждения прочтения:", error);
    } finally {
      setAcknowledging(false);
    }
  };

  const getStatusLabel = (status?: NewsStatus): { label: string; className: string; icon?: React.ReactNode } => {
    switch (status) {
      case 'DRAFT':     return { label: 'Черновик',        className: 'bg-gray-100 text-gray-600' };
      case 'PUBLISHED': return { label: 'Опубликовано',    className: 'bg-green-100 text-green-700' };
      case 'ARCHIVED':  return { label: 'Архив',           className: 'bg-yellow-100 text-yellow-700' };
      case 'SCHEDULED': return { label: 'По расписанию',   className: 'bg-blue-100 text-blue-700',
        icon: <Clock className="w-3 h-3" /> };
      default:          return { label: 'Новость',         className: 'bg-gray-100 text-gray-600' };
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
    const isLiked = commentLikes[comment.id] ?? false;
    const canEditComment =
      isNewsEditor || isAdmin || String(currentUser?.eid) === String(comment.author.eid);
    const canDeleteComment =
      isNewsEditor || isAdmin || String(currentUser?.eid) === String(comment.author.eid);

    return (
      <div key={comment.id} className={`${depth > 0 ? "ml-12 mt-4" : "mt-4"}`}>
        <div className="flex gap-3">
          <Avatar
            fullName={comment.author.full_name}
            size={10}
          />
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
                  {canDeleteComment && editingCommentId !== comment.id && (
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
              <button
                onClick={() => {
                  setReplyingToCommentId(comment.id);
                  setReplyContent("");
                }}
                className="flex items-center gap-1 hover:text-purple-600 transition-colors"
              >
                <Reply className="w-3 h-3" />
                Ответить
              </button>
            </div>
            {replyingToCommentId === comment.id && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(event) => setReplyContent(event.target.value)}
                  placeholder={`Ответить ${comment.author.full_name}...`}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReplyToComment(comment.id)}
                    disabled={!replyContent.trim()}
                    className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Отправить
                  </button>
                  <button
                    onClick={() => {
                      setReplyingToCommentId(null);
                      setReplyContent("");
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
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
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/news")}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к новостям
        </button>
        {isNewsEditor && newsDetail && (
          <button
            onClick={handleOpenEditModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Pencil className="w-4 h-4" />
            Редактировать
          </button>
        )}
      </div>

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

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              {/* Статус */}
              {(() => {
                const s = getStatusLabel(newsDetail.status);
                return (
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium text-xs ${s.className}`}>
                    {s.icon}
                    {s.label}
                  </span>
                );
              })()}
              {/* Категории */}
              {newsDetail.categories && newsDetail.categories.map(cat => (
                <span key={cat.id} className="px-3 py-1 bg-gray-100 rounded-full text-xs">{cat.name}</span>
              ))}
              <span>{formatDate(newsDetail.published_at)}</span>
              <span>{newsDetail.author_name}</span>
              {/* Комментарии включены/выключены */}
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  newsDetail.comments_enabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-50 text-red-500'
                }`}
              >
                {newsDetail.comments_enabled
                  ? <><MessageCircle className="w-3 h-3" /> Комментарии открыты</>
                  : <><MessageCircleOff className="w-3 h-3" /> Комментарии закрыты</>
                }
              </span>
              {/* Обязательное ознакомление badge */}
              {newsDetail.mandatory_ack && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  <Lock className="w-3 h-3" />
                  Обязательное прочтение
                </span>
              )}
            </div>

            {/* Теги */}
            {newsDetail.tags && newsDetail.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newsDetail.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 border border-purple-200 rounded-full text-xs">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{newsDetail.content}</p>
            </div>

            {newsDetail.file_ids && newsDetail.file_ids.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Прикреплённые файлы ({newsDetail.file_ids.length})
                </h4>
                <div className="space-y-2">
                  {newsDetail.file_ids.map((fileId) => (
                    <button
                      key={fileId}
                      onClick={() => handleDownloadFile(fileId)}
                      disabled={downloadingFileId === fileId}
                      className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-purple-600 shrink-0" />
                        <span className="text-sm text-gray-700 text-left truncate">
                          Файл #{fileId}
                        </span>
                      </div>
                      <Download
                        className={`w-4 h-4 ml-2 shrink-0 ${
                          downloadingFileId === fileId
                            ? "animate-bounce text-gray-400"
                            : "text-purple-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

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
              <button
                onClick={handleShareNews}
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors ml-auto"
                title="Поделиться новостью"
              >
                <Share2 className="w-5 h-5" />
                <span>Поделиться</span>
              </button>
            </div>

            {/* Блок подтверждения прочтения (обязательные новости) */}
            {newsDetail.mandatory_ack && (
              <div className={`rounded-lg border p-4 ${
                newsDetail.is_acknowledged
                  ? 'bg-green-50 border-green-200'
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    {newsDetail.is_acknowledged ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <Lock className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-semibold text-sm ${newsDetail.is_acknowledged ? 'text-green-800' : 'text-orange-800'}`}>
                        {newsDetail.is_acknowledged
                          ? 'Вы подтвердили прочтение этой новости'
                          : newsDetail.must_acknowledge
                            ? 'Необходимо подтвердить прочтение'
                            : 'Обязательная новость'}
                      </p>
                      {!newsDetail.is_acknowledged && newsDetail.must_acknowledge && (
                        <p className="text-xs text-orange-700 mt-1">
                          Эта новость требует вашего подтверждения прочтения
                        </p>
                      )}
                    </div>
                  </div>
                  {newsDetail.must_acknowledge && !newsDetail.is_acknowledged && (
                    <button
                      onClick={handleAcknowledge}
                      disabled={acknowledging}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium shrink-0"
                    >
                      <Check className="w-4 h-4" />
                      {acknowledging ? 'Подтверждение...' : 'Подтвердить прочтение'}
                    </button>
                  )}
                </div>

                {/* Статистика подтверждений для редакторов/администраторов */}
                {(isAdmin || isNewsEditor) && acknowledgementsData && (
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <button
                      onClick={() => setShowAckDetails(prev => !prev)}
                      className="flex items-center gap-2 text-sm font-medium text-orange-800 hover:text-orange-900"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Подтверждений: {acknowledgementsData.acknowledged_count} / {acknowledgementsData.total}
                      <span className="text-xs ml-1 underline">{showAckDetails ? '▲ Скрыть' : '▼ Подробнее'}</span>
                    </button>
                    {showAckDetails && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {acknowledgementsData.acknowledged.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Подтвердили ({acknowledgementsData.acknowledged.length})
                            </p>
                            <ul className="space-y-1 max-h-40 overflow-y-auto">
                              {acknowledgementsData.acknowledged.map(u => (
                                <li key={u.eid} className="text-xs text-gray-700 flex items-center justify-between">
                                  <span>{u.full_name}</span>
                                  <span className="text-gray-400 ml-2">{formatDate(u.acknowledged_at)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {acknowledgementsData.not_acknowledged.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                              <X className="w-3 h-3" /> Не подтвердили ({acknowledgementsData.not_acknowledged.length})
                            </p>
                            <ul className="space-y-1 max-h-40 overflow-y-auto">
                              {acknowledgementsData.not_acknowledged.map(u => (
                                <li key={u.eid} className="text-xs text-gray-700">{u.full_name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {newsDetail && newsDetail.comments_enabled && (
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

          <div className="mb-6 pb-4 border-b border-gray-200">
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
        </div>
      )}

      {/* Модальное окно редактирования новости */}
      <Modal
        isOpen={showEditModal}
        title="Редактировать новость"
        onClose={() => setShowEditModal(false)}
        widthClass="max-w-2xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Краткое описание</label>
            <input
              type="text"
              value={editData.short_description}
              onChange={(e) => setEditData({ ...editData, short_description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Содержание <span className="text-red-500">*</span></label>
            <textarea
              rows={8}
              value={editData.content}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {editCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
              <select
                value={editData.category_ids[0] ?? ''}
                onChange={(e) => setEditData({ ...editData, category_ids: [Number(e.target.value)] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {editCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editData.is_pinned} onChange={(e) => setEditData({ ...editData, is_pinned: e.target.checked })} className="w-4 h-4 text-purple-600 border-gray-300 rounded" />
              <span className="text-sm text-gray-700">Закрепить</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editData.mandatory_ack} onChange={(e) => setEditData({ ...editData, mandatory_ack: e.target.checked })} className="w-4 h-4 text-purple-600 border-gray-300 rounded" />
              <span className="text-sm text-gray-700">Обязательное ознакомление</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editData.comments_enabled} onChange={(e) => setEditData({ ...editData, comments_enabled: e.target.checked })} className="w-4 h-4 text-purple-600 border-gray-300 rounded" />
              <span className="text-sm text-gray-700">Комментарии включены</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
            <div className="flex gap-2">
              {(['PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED'] as NewsStatus[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setEditData({ ...editData, status: s })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    editData.status === s
                      ? s === 'DRAFT' ? 'bg-gray-600 text-white border-gray-600'
                        : s === 'SCHEDULED' ? 'bg-blue-600 text-white border-blue-600'
                        : s === 'ARCHIVED' ? 'bg-yellow-600 text-white border-yellow-600'
                        : 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {s === 'PUBLISHED' ? 'Опубликовано' : s === 'DRAFT' ? 'Черновик' : s === 'SCHEDULED' ? 'По расписанию' : 'Архив'}
                </button>
              ))}
            </div>
          </div>
          {editData.status === 'SCHEDULED' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата публикации <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                value={editData.scheduled_publish_at_local}
                onChange={(e) => setEditData({ ...editData, scheduled_publish_at_local: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Теги <span className="text-gray-400 font-normal">(через запятую)</span></label>
              <input
                type="text"
                value={editData.tag_names}
                onChange={(e) => setEditData({ ...editData, tag_names: e.target.value })}
                placeholder="важно, обновление"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата устаревания <span className="text-gray-400 font-normal">(необязательно)</span></label>
              <input
                type="datetime-local"
                value={editData.expires_at_local}
                onChange={(e) => setEditData({ ...editData, expires_at_local: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveEdit}
              disabled={savingEdit || !editData.title?.trim() || !editData.content?.trim()}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {savingEdit ? 'Сохранение...' : editData.status === 'PUBLISHED' ? 'Опубликовать' : editData.status === 'DRAFT' ? 'Сохранить черновик' : editData.status === 'SCHEDULED' ? 'Запланировать' : 'Сохранить'}
            </button>
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NewsDetailPage;
