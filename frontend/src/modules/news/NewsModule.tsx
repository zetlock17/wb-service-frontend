import { Award, Eye, Filter, MessageCircle, Plus, Share2, ThumbsUp, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/common/Modal";
import usePortalStore from "../../store/usePortalStore";
import { 
  getNews, 
  getCategories,
  createNews,
  createCategory,
  deleteCategory,
  addLikeToNews,
  removeLikeFromNews,
  type NewsListItem, 
  type Category,
  type NewsSortBy 
} from "../../api/newsApi";

const NewsModule = () => {
  const { currentUser, roles } = usePortalStore();
  const navigate = useNavigate();
  
  // Состояния для новостей
  const [newsList, setNewsList] = useState<NewsListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Фильтры и сортировка
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<NewsSortBy>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Состояния для создания новости
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNewsData, setNewNewsData] = useState({
    title: '',
    short_description: '',
    content: '',
    category_ids: [] as number[],
    is_pinned: false,
    mandatory_ack: false,
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const isNewsEditor = roles.includes('news_editor');

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

  const fetchCategories = async (selectCategoryId?: number) => {
    try {
      const response = await getCategories();
      if (response.status === 200 && response.data) {
        setCategories(response.data);

        setNewNewsData((prev) => {
          const requestedId = selectCategoryId ?? prev.category_ids[0];
          const nextId = response.data.some((cat) => cat.id === requestedId)
            ? requestedId
            : response.data[0]?.id;

          return {
            ...prev,
            category_ids: nextId ? [nextId] : [],
          };
        });

        setSelectedCategory((prev) =>
          prev && response.data.some((cat) => cat.id === prev) ? prev : undefined
        );
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!isNewsEditor) return;

    const name = newCategoryName.trim();
    if (name.length < 2) {
      setCategoryError('Название категории должно быть не короче 2 символов');
      return;
    }

    setCategoryError(null);
    setCreatingCategory(true);

    try {
      const response = await createCategory({ name });
      if (response.status === 200 && response.data) {
        setNewCategoryName('');
        await fetchCategories(response.data);
      }
    } catch (error) {
      console.error('Ошибка создания категории:', error);
      setCategoryError('Не удалось создать категорию');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!isNewsEditor) return;

    setDeletingCategoryId(categoryId);
    try {
      const response = await deleteCategory(categoryId);
      if (response.status === 200) {
        if (selectedCategory === categoryId) {
          setSelectedCategory(undefined);
        }
        await fetchCategories();
      }
    } catch (error) {
      console.error('Ошибка удаления категории:', error);
    } finally {
      setDeletingCategoryId(null);
    }
  };

  // Открытие детальной новости
  const openNewsDetail = (newsId: number, news?: NewsListItem) => {
    navigate(`/news/${newsId}`, { state: { news } });
  };

  const handleToggleNewsLike = async (newsId: number, isLiked: boolean) => {
    if (!currentUser) return;

    try {
      if (isLiked) {
        await removeLikeFromNews(newsId);
      } else {
        await addLikeToNews(newsId);
      }

      setNewsList((prev) =>
        prev.map((item) =>
          item.id === newsId
            ? {
                ...item,
                is_liked: !isLiked,
                likes_count: Math.max(0, item.likes_count + (isLiked ? -1 : 1)),
              }
            : item
        )
      );
    } catch (error) {
      console.error('Ошибка изменения лайка новости:', error);
    }
  };

  // Создание новости
  const handleCreateNews = async () => {
    const title = newNewsData.title.trim();
    const shortDescription = newNewsData.short_description.trim();
    const content = newNewsData.content.trim();

    if (!currentUser || !isNewsEditor) return;

    if (title.length < 5) {
      alert('Заголовок должен быть не короче 5 символов');
      return;
    }

    if (!shortDescription) {
      alert('Краткое описание обязательно');
      return;
    }

    if (!content) {
      alert('Содержание обязательно');
      return;
    }

    if (newNewsData.category_ids.length === 0) {
      alert('Выберите категорию для новости');
      return;
    }

    try {
      const response = await createNews({
        title,
        short_description: shortDescription,
        content,
        category_ids: newNewsData.category_ids,
        is_pinned: newNewsData.is_pinned,
        mandatory_ack: newNewsData.mandatory_ack,
      });

      if (response.status === 200) {
        setShowCreateModal(false);
        setNewNewsData({
          title: '',
          short_description: '',
          content: '',
          category_ids: categories[0]?.id ? [categories[0].id] : [],
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

  const isCreateNewsDisabled =
    !isNewsEditor ||
    newNewsData.title.trim().length < 5 ||
    !newNewsData.short_description.trim() ||
    !newNewsData.content.trim() ||
    newNewsData.category_ids.length === 0;

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
              disabled={!isNewsEditor}
              aria-disabled={!isNewsEditor}
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

            {isNewsEditor && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => {
                      setNewCategoryName(e.target.value);
                      setCategoryError(null);
                    }}
                    className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Новая категория"
                  />
                  <button
                    onClick={handleCreateCategory}
                    disabled={creatingCategory || !newCategoryName.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Создать категорию
                  </button>
                </div>
                {categoryError && (
                  <p className="mt-2 text-sm text-red-600">{categoryError}</p>
                )}
                {categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm"
                      >
                        <span>{cat.name}</span>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          disabled={deletingCategoryId === cat.id}
                          className="text-gray-400 hover:text-red-600 disabled:text-gray-300"
                          aria-label={`Удалить категорию ${cat.name}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                onClick={() => openNewsDetail(newsItem.id, newsItem)}
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
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleToggleNewsLike(newsItem.id, Boolean(newsItem.is_liked));
                    }}
                    className={`flex items-center gap-2 transition-colors ${
                      newsItem.is_liked ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{newsItem.likes_count}</span>
                  </button>
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
            category_ids: categories[0]?.id ? [categories[0].id] : [],
            is_pinned: false,
            mandatory_ack: false,
          });
        }}
        widthClass="max-w-2xl"
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
            {categories.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm text-gray-600">Сначала создайте категорию.</p>
                {isNewsEditor && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => {
                        setNewCategoryName(e.target.value);
                        setCategoryError(null);
                      }}
                      className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Новая категория"
                    />
                    <button
                      onClick={handleCreateCategory}
                      disabled={creatingCategory || !newCategoryName.trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Создать
                    </button>
                  </div>
                )}
                {categoryError && (
                  <p className="mt-2 text-sm text-red-600">{categoryError}</p>
                )}
              </div>
            ) : (
              <select
                value={newNewsData.category_ids[0] ?? ''}
                onChange={(e) =>
                  setNewNewsData({ ...newNewsData, category_ids: [Number(e.target.value)] })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
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
              disabled={isCreateNewsDisabled}
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
                  category_ids: categories[0]?.id ? [categories[0].id] : [],
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
