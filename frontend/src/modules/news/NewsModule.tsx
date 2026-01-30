import { Award, Eye, Filter, MessageCircle, Plus, Send, Share2, ThumbsUp, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import usePortalStore from "../../store/usePortalStore";
import { 
  getNews, 
  getNewsById, 
  getCategories,
  type NewsListItem, 
  type NewsDetail, 
  type Category,
  type NewsSortBy 
} from "../../api/newsApi";
import { 
  getComments, 
  createComment, 
  deleteComment,
  addLikeToComment,
  removeLikeFromComment,
  type Comment,
  type CommentSortBy 
} from "../../api/сommentsApi";

const NewsModule = () => {
  const { currentUser } = usePortalStore();
  
  // Состояния для новостей
  const [newsList, setNewsList] = useState<NewsListItem[]>([]);
  const [selectedNewsDetail, setSelectedNewsDetail] = useState<NewsDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Фильтры и сортировка
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<NewsSortBy>('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // Состояния для комментариев
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentSortBy, setCommentSortBy] = useState<CommentSortBy>('new');
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // Состояния для создания новости
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNewsData, setNewNewsData] = useState({
    title: '',
    short_description: '',
    content: '',
    category_id: 1,
    is_pinned: false,
    mandatory_ack: false,
  });

  // Загрузка новостей
  useEffect(() => {
    fetchNews();
    fetchCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await getNews({
        category_id: selectedCategory,
        sort_by: sortBy,
      });
      if (response.status === 200 && response.data) {
        setNewsList(response.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки новостей:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      if (response.status === 200 && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  // Открытие детальной новости
  const openNewsDetail = async (newsId: number) => {
    try {
      const response = await getNewsById(newsId);
      if (response.status === 200 && response.data) {
        setSelectedNewsDetail(response.data);
        fetchCommentsForNews(newsId);
      }
    } catch (error) {
      console.error('Ошибка загрузки новости:', error);
    }
  };

  const closeNewsDetail = () => {
    setSelectedNewsDetail(null);
    setComments([]);
    setNewComment('');
  };

  // Загрузка комментариев
  const fetchCommentsForNews = async (newsId: number) => {
    setLoadingComments(true);
    try {
      const response = await getComments(newsId, commentSortBy);
      if (response.status === 200 && response.data) {
        setComments(response.data.result);
        setCommentsCount(response.data.count);
      }
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Обновление комментариев при изменении сортировки
  useEffect(() => {
    if (selectedNewsDetail) {
      fetchCommentsForNews(selectedNewsDetail.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentSortBy, selectedNewsDetail?.id]);

  // Создание комментария
  const handleCreateComment = async () => {
    if (!newComment.trim() || !currentUser || !selectedNewsDetail) return;

    try {
      const response = await createComment({
        author_id: currentUser.eid,
        news_id: selectedNewsDetail.id,
        content: newComment.trim(),
      });

      if (response.status === 200) {
        setNewComment('');
        fetchCommentsForNews(selectedNewsDetail.id);
        // Обновить счетчик комментариев в списке новостей
        setNewsList(prev => prev.map(news => 
          news.id === selectedNewsDetail.id 
            ? { ...news, comments_count: news.comments_count + 1 }
            : news
        ));
      }
    } catch (error) {
      console.error('Ошибка создания комментария:', error);
    }
  };

  // Удаление комментария
  const handleDeleteComment = async (commentId: number) => {
    if (!currentUser || !selectedNewsDetail) return;

    try {
      const response = await deleteComment(commentId, currentUser.eid);
      if (response.status === 200) {
        fetchCommentsForNews(selectedNewsDetail.id);
        // Обновить счетчик комментариев в списке новостей
        setNewsList(prev => prev.map(news => 
          news.id === selectedNewsDetail.id 
            ? { ...news, comments_count: Math.max(0, news.comments_count - 1) }
            : news
        ));
      }
    } catch (error) {
      console.error('Ошибка удаления комментария:', error);
    }
  };

  // Лайк комментария
  const handleToggleCommentLike = async (commentId: number, isLiked: boolean) => {
    if (!currentUser) return;

    try {
      if (isLiked) {
        await removeLikeFromComment(commentId, currentUser.eid);
      } else {
        await addLikeToComment(commentId, currentUser.eid);
      }
      if (selectedNewsDetail) {
        fetchCommentsForNews(selectedNewsDetail.id);
      }
    } catch (error) {
      console.error('Ошибка изменения лайка:', error);
    }
  };

  // Создание новости
  const handleCreateNews = async () => {
    if (!currentUser || !newNewsData.title.trim() || !newNewsData.content.trim()) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const { createNews } = await import('../../api/newsApi');
      const response = await createNews(currentUser.eid, {
        title: newNewsData.title,
        short_description: newNewsData.short_description,
        content: newNewsData.content,
        category_id: newNewsData.category_id,
        is_pinned: newNewsData.is_pinned,
        mandatory_ack: newNewsData.mandatory_ack,
      });

      if (response.status === 200) {
        setShowCreateModal(false);
        setNewNewsData({
          title: '',
          short_description: '',
          content: '',
          category_id: 1,
          is_pinned: false,
          mandatory_ack: false,
        });
        fetchNews();
      }
    } catch (error) {
      console.error('Ошибка создания новости:', error);
      alert('Произошла ошибка при создании новости');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'только что';
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;
    
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Рендер комментария
  const renderComment = (comment: Comment, depth: number = 0) => {
    const initials = comment.author.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-12 mt-4' : 'mt-4'}`}>
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm text-gray-900">{comment.author.full_name}</p>
                {currentUser?.eid === comment.author.eid && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
              {comment.is_edited && (
                <p className="text-xs text-gray-400 mt-1">изменено</p>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span>{formatDate(comment.created_at)}</span>
              <button
                onClick={() => handleToggleCommentLike(comment.id, false)}
                className="flex items-center gap-1 hover:text-purple-600 transition-colors"
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
                {comment.replies.map(reply => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Внутренние коммуникации</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showFilters 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Фильтры
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Создать новость
            </button>
          </div>
        </div>

        {/* Панель фильтров */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категория
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Все категории</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сортировка
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as NewsSortBy)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="newest">Сначала новые</option>
                  <option value="popular">Популярные</option>
                  <option value="discussed">Обсуждаемые</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Список новостей */}
        <div className="space-y-4">
          {newsList.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Новостей пока нет</p>
            </div>
          ) : (
            newsList.map((newsItem) => (
              <button
                key={newsItem.id}
                onClick={() => openNewsDetail(newsItem.id)}
                className={`w-full text-left border rounded-lg p-6 hover:shadow-md transition-shadow ${
                  newsItem.is_pinned ? "border-purple-300 bg-purple-50" : "border-gray-200"
                }`}
              >
                {newsItem.is_pinned && (
                  <div className="flex items-center gap-2 text-purple-600 text-sm font-medium mb-3">
                    <Award className="w-4 h-4" />
                    Закреплено
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{newsItem.title}</h3>
                    <p className="text-gray-600 mb-3">{newsItem.short_description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">Новость</span>
                      <span>{formatDate(newsItem.published_at)}</span>
                      <span>{newsItem.author_name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{newsItem.views_count}</span>
                  </span>
                  <span className="flex items-center gap-2 text-gray-600">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{newsItem.likes_count}</span>
                  </span>
                  <span className="flex items-center gap-2 text-gray-600">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{newsItem.comments_count}</span>
                  </span>
                  <span className="flex items-center gap-2 text-gray-600 ml-auto">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Поделиться</span>
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Модальное окно с деталями новости */}
      <Modal 
        isOpen={Boolean(selectedNewsDetail)} 
        title={selectedNewsDetail?.title ?? ""} 
        onClose={closeNewsDetail}
      >
        {selectedNewsDetail && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="px-3 py-1 bg-gray-100 rounded">Новость</span>
              <span>{formatDate(selectedNewsDetail.published_at)}</span>
              <span>{selectedNewsDetail.author_name}</span>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedNewsDetail.content}</p>
            </div>

            <div className="flex items-center gap-6 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Eye className="w-5 h-5" />
                <span>{selectedNewsDetail.views_count}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <ThumbsUp className="w-5 h-5" />
                <span>{selectedNewsDetail.likes_count}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="w-5 h-5" />
                <span>{commentsCount} комментариев</span>
              </div>
            </div>

            {/* Секция комментариев */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Комментарии ({commentsCount})
                </h3>
                <select
                  value={commentSortBy}
                  onChange={(e) => setCommentSortBy(e.target.value as CommentSortBy)}
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
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {comments.map(comment => renderComment(comment))}
                </div>
              )}

              {/* Форма добавления комментария */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Написать комментарий..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
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
        )}
      </Modal>

      {/* Модальное окно создания новости */}
      <Modal
        isOpen={showCreateModal}
        title="Создать новость"
        onClose={() => {
          setShowCreateModal(false);
          setNewNewsData({
            title: '',
            short_description: '',
            content: '',
            category_id: 1,
            is_pinned: false,
            mandatory_ack: false,
          });
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Заголовок <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newNewsData.title}
              onChange={(e) => setNewNewsData({ ...newNewsData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Введите заголовок новости"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Краткое описание
            </label>
            <input
              type="text"
              value={newNewsData.short_description}
              onChange={(e) => setNewNewsData({ ...newNewsData, short_description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Краткое описание для списка новостей"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Содержание <span className="text-red-500">*</span>
            </label>
            <textarea
              value={newNewsData.content}
              onChange={(e) => setNewNewsData({ ...newNewsData, content: e.target.value })}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Введите содержание новости"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория
            </label>
            <select
              value={newNewsData.category_id}
              onChange={(e) => setNewNewsData({ ...newNewsData, category_id: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newNewsData.is_pinned}
                onChange={(e) => setNewNewsData({ ...newNewsData, is_pinned: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Закрепить новость</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newNewsData.mandatory_ack}
                onChange={(e) => setNewNewsData({ ...newNewsData, mandatory_ack: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Обязательное ознакомление</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleCreateNews}
              disabled={!newNewsData.title.trim() || !newNewsData.content.trim()}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Создать
            </button>
            <button
              onClick={() => {
                setShowCreateModal(false);
                setNewNewsData({
                  title: '',
                  short_description: '',
                  content: '',
                  category_id: 1,
                  is_pinned: false,
                  mandatory_ack: false,
                });
              }}
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

export default NewsModule;
