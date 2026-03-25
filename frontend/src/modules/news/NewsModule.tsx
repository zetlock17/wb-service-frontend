import { Pin, Eye, Filter, MessageCircle, Paperclip, Plus, ThumbsUp, Trash2, Upload, X, Search, Tag, Bell, BellOff, Users, UserCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/common/Modal";
import AlertModal from "../../components/common/AlertModal";
import { useAlert } from "../../hooks/useAlert";
import usePortalStore from "../../store/usePortalStore";
import {
  getNews,
  getCategories,
  getFollowedCategories,
  followCategory,
  unfollowCategory,
  createNews,
  createCategory,
  deleteCategory,
  addLikeToNews,
  removeLikeFromNews,
  type NewsListItem,
  type Category,
  type NewsSortBy,
  type NewsStatus
} from "../../api/newsApi";
import { uploadPhoto } from "../../api/filesApi";
import {
  getOrgHierarchy,
  searchSuggestHierarchy,
  type OrgUnitHierarchy,
  type ProfileSuggestion,
} from "../../api/orgStructureApi";
import { suggestEmployees } from "../../api/profileApi";

const NewsModule = () => {
  const { alertState, showAlert, closeAlert } = useAlert();
  const { currentUser, roles } = usePortalStore();
  const navigate = useNavigate();

  const [newsList, setNewsList] = useState<NewsListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [followedCategories, setFollowedCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<NewsSortBy>('newest');
  const [statusFilter, setStatusFilter] = useState<NewsStatus | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [appliedTag, setAppliedTag] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'news' | 'drafts'>('news');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [draftsList, setDraftsList] = useState<NewsListItem[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNewsData, setNewNewsData] = useState({
    title: '',
    short_description: '',
    content: '',
    category_ids: [] as number[],
    is_pinned: false,
    mandatory_ack: false,
    comments_enabled: true,
    status: 'PUBLISHED' as NewsStatus,
    scheduled_publish_at: '' as string,
    expires_at: '' as string,
    tag_names: '' as string,
    file_ids: [] as number[],
    ack_target_all: true as boolean,
  });
  const [ackSelectedEmployees, setAckSelectedEmployees] = useState<{ eid: string; full_name: string }[]>([]);
  const [ackTargetMode, setAckTargetMode] = useState<'employees' | 'departments'>('employees');
  const [ackOrgUnitOptions, setAckOrgUnitOptions] = useState<{ id: number; name: string; level: number }[]>([]);
  const [ackSelectedOrgUnits, setAckSelectedOrgUnits] = useState<{ id: number; name: string; level: number }[]>([]);
  const [ackOrgUnitToAdd, setAckOrgUnitToAdd] = useState<string>('');
  const [loadingAckOrgUnits, setLoadingAckOrgUnits] = useState(false);
  const [ackSearchQuery, setAckSearchQuery] = useState('');
  const [ackSearchResults, setAckSearchResults] = useState<ProfileSuggestion[]>([]);
  const [ackSearchLoading, setAckSearchLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ id: number; name: string }[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const isNewsEditor = roles.includes('news_editor');
  const isAdmin = roles.includes('admin');

  useEffect(() => {
    setCurrentPage(1);
    fetchNews(1);
    fetchCategories();
    fetchFollowedCategories();
    if (isNewsEditor) fetchDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy, statusFilter, appliedSearch, appliedTag]);

  useEffect(() => {
    fetchNews(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    if (isNewsEditor && activeTab === 'drafts') {
      fetchDrafts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const flattenOrgUnits = (
    nodes: OrgUnitHierarchy[],
    level: number = 0
  ): { id: number; name: string; level: number }[] =>
    nodes.flatMap((node) => [
      { id: node.id, name: node.name, level },
      ...flattenOrgUnits(node.children || [], level + 1),
    ]);

  const loadOrgUnitsForAck = async () => {
    if (ackOrgUnitOptions.length > 0 || loadingAckOrgUnits) return;

    setLoadingAckOrgUnits(true);
    try {
      const response = await getOrgHierarchy();
      if (response.status === 200 && response.data) {
        setAckOrgUnitOptions(flattenOrgUnits(response.data));
      }
    } catch (error) {
      console.error('Ошибка загрузки отделов для ознакомления:', error);
    } finally {
      setLoadingAckOrgUnits(false);
    }
  };

  const fetchDrafts = async () => {
    setLoadingDrafts(true);
    const params = {
      status: 'DRAFT', 
      sort_by: 'newest',
      page: 1,
      size: 100,
    };
    console.log('📡 fetchDrafts params:', params);
    try {
      console.log('Отправляю запрос на getNews (drafts) с параметрами:', params);
      const response = await getNews(params);
      console.log('✅ Ответ от getNews (drafts):', response);
      if (response.status === 200 && response.data) {
        console.log('✅ Черновиков загружено:', response.data.length);
        setDraftsList(response.data);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки черновиков:', error);
      console.error('Детали ошибки:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null,
      });
    } finally {
      setLoadingDrafts(false);
    }
  };

  const fetchNews = async (pageNum: number = currentPage) => {
    setLoading(true);
    const params = {
      category_id: selectedCategory,
      sort_by: sortBy,
      status: statusFilter || undefined,
      search: appliedSearch || undefined,
      tag: appliedTag || undefined,
      page: pageNum,
      size: PAGE_SIZE,
    };
    console.log('📡 fetchNews params:', params);
    try {
      console.log('Отправляю запрос на getNews с параметрами:', params);
      const response = await getNews(params);
      console.log('✅ Ответ от getNews:', response);
      if (response.status === 200 && response.data) {
        console.log('✅ Новостей загружено:', response.data.length);
        setNewsList(response.data);
      } else {
        console.warn('⚠️ Непредвиденный ответ:', response);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки новостей:', error);
      console.error('Детали ошибки:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowedCategories = async () => {
    try {
      const response = await getFollowedCategories();
      if (response.status === 200 && response.data) {
        setFollowedCategories(response.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки подписок:', error);
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
    if (!isAdmin) return;

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
    if (!isAdmin) return;

    setDeletingCategoryId(categoryId);
    try {
      const response = await deleteCategory(categoryId);
      if (response.status === 200) {
        if (selectedCategory === categoryId) {
          setSelectedCategory(undefined);
        }
        await fetchCategories();
        setFollowedCategories(prev => prev.filter(c => c.id !== categoryId));
      }
    } catch (error) {
      console.error('Ошибка удаления категории:', error);
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleFollowCategory = async (categoryId: number) => {
    try {
      const response = await followCategory(categoryId);
      if (response.status === 200) {
        const cat = categories.find(c => c.id === categoryId);
        if (cat) setFollowedCategories(prev => [...prev, cat]);
      }
    } catch (error) {
      console.error('Ошибка подписки на категорию:', error);
    }
  };

  const handleUnfollowCategory = async (categoryId: number) => {
    try {
      const response = await unfollowCategory(categoryId);
      if (response.status === 200) {
        setFollowedCategories(prev => prev.filter(c => c.id !== categoryId));
      }
    } catch (error) {
      console.error('Ошибка отписки от категории:', error);
    }
  };

  const openNewsDetail = (newsId: number, news?: NewsListItem) => {
    navigate(`/news/${newsId}`, { state: { news } });
  };

  const openAuthorProfile = async (fullName: string) => {
    try {
      const response = await suggestEmployees(fullName, 10);
      if (response.status >= 200 && response.status < 300 && response.data?.suggestions?.length) {
        const normalized = fullName.trim().toLowerCase();
        const exact = response.data.suggestions.find(
          (item) => item.full_name.trim().toLowerCase() === normalized
        );
        const target = exact || response.data.suggestions[0];
        navigate(`/profile/${target.eid}`);
      }
    } catch (error) {
      console.error("Ошибка перехода в профиль автора:", error);
    }
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !currentUser) return;

    setUploadingFiles(true);
    setUploadError(null);

    try {
      const newFileIds: number[] = [];

      for (const file of Array.from(files)) {
        const response = await uploadPhoto(file, Number(currentUser.eid), 'document');

        if (response.status === 200 && response.data) {
          newFileIds.push(response.data);
          setUploadedFiles((prev) => [
            ...prev,
            { id: response.data, name: file.name }
          ]);
          setNewNewsData((prev) => ({
            ...prev,
            file_ids: [...prev.file_ids, response.data]
          }));
        } else {
          throw new Error(response.message || `Ошибка загрузки файла ${file.name}`);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error);
      setUploadError(error instanceof Error ? error.message : 'Ошибка при загрузке файлов');
    } finally {
      setUploadingFiles(false);

      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveFile = (fileId: number) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    setNewNewsData((prev) => ({
      ...prev,
      file_ids: prev.file_ids.filter((id) => id !== fileId)
    }));
  };

  // Создание новости
  const handleCreateNews = async () => {
    const title = newNewsData.title.trim();
    const shortDescription = newNewsData.short_description.trim();
    const content = newNewsData.content.trim();

    if (!currentUser || !isNewsEditor) return;

    if (title.length < 5) {
      showAlert('Заголовок должен быть не короче 5 символов', 'warning');
      return;
    }

    if (!shortDescription) {
      showAlert('Краткое описание обязательно', 'warning');
      return;
    }

    if (!content) {
      showAlert('Содержание обязательно', 'warning');
      return;
    }

    if (newNewsData.category_ids.length === 0) {
      showAlert('Выберите категорию для новости', 'warning');
      return;
    }

    try {
      const parsedTags = newNewsData.tag_names
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const response = await createNews({
        title,
        short_description: shortDescription,
        content,
        category_ids: newNewsData.category_ids,
        is_pinned: newNewsData.is_pinned,
        mandatory_ack: newNewsData.mandatory_ack,
        ack_target_all: newNewsData.mandatory_ack ? newNewsData.ack_target_all : true,
        ack_target_eids: newNewsData.mandatory_ack && !newNewsData.ack_target_all && ackTargetMode === 'employees'
          ? ackSelectedEmployees.map(e => e.eid)
          : undefined,
        ack_target_org_unit_ids: newNewsData.mandatory_ack && !newNewsData.ack_target_all && ackTargetMode === 'departments'
          ? ackSelectedOrgUnits.map(unit => unit.id)
          : undefined,
        comments_enabled: newNewsData.comments_enabled,
        status: newNewsData.status,
        scheduled_publish_at: newNewsData.status === 'SCHEDULED' && newNewsData.scheduled_publish_at
          ? new Date(newNewsData.scheduled_publish_at).toISOString().replace(/\.\d{3}Z$/, '')
          : null,
        expires_at: newNewsData.expires_at
          ? new Date(newNewsData.expires_at).toISOString().replace(/\.\d{3}Z$/, '')
          : null,
        tag_names: parsedTags.length > 0 ? parsedTags : undefined,
        file_ids: newNewsData.file_ids.length > 0 ? newNewsData.file_ids : undefined,
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
          comments_enabled: true,
          status: 'PUBLISHED',
          scheduled_publish_at: '',
          expires_at: '',
          tag_names: '',
          file_ids: [],
          ack_target_all: true,
        });
        setAckSelectedEmployees([]);
        setAckTargetMode('employees');
        setAckSelectedOrgUnits([]);
        setAckOrgUnitToAdd('');
        setAckSearchQuery('');
        setAckSearchResults([]);
        setUploadedFiles([]);
        setUploadError(null);
        fetchNews();
      }
    } catch (error) {
      console.error('Ошибка создания новости:', error);
      showAlert('Произошла ошибка при создании новости', 'error');
    }
  };

  const isCreateNewsDisabled =
    !isNewsEditor ||
    newNewsData.title.trim().length < 5 ||
    !newNewsData.short_description.trim() ||
    !newNewsData.content.trim() ||
    newNewsData.category_ids.length === 0 ||
    (newNewsData.status === 'SCHEDULED' && !newNewsData.scheduled_publish_at) ||
    (newNewsData.mandatory_ack && !newNewsData.ack_target_all && ackTargetMode === 'employees' && ackSelectedEmployees.length === 0) ||
    (newNewsData.mandatory_ack && !newNewsData.ack_target_all && ackTargetMode === 'departments' && ackSelectedOrgUnits.length === 0);

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

  const getStatusLabel = (status?: NewsStatus): { label: string; className: string } => {
    switch (status) {
      case 'DRAFT': return { label: 'Черновик', className: 'bg-gray-100 text-gray-600' };
      case 'PUBLISHED': return { label: 'Опубликовано', className: 'bg-green-100 text-green-700' };
      case 'ARCHIVED': return { label: 'Архив', className: 'bg-yellow-100 text-yellow-700' };
      case 'SCHEDULED': return { label: 'По расписанию', className: 'bg-blue-100 text-blue-700' };
      default: return { label: 'Новость', className: 'bg-gray-100 text-gray-600' };
    }
  };

  const isFollowedCategory = (categoryId: number) =>
    followedCategories.some(c => c.id === categoryId);

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
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Внутренние коммуникации</h2>
            {isNewsEditor && (
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setActiveTab('news')}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === 'news'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Новости
                </button>
                <button
                  onClick={() => setActiveTab('drafts')}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === 'drafts'
                    ? 'bg-gray-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Черновики
                  {draftsList.length > 0 && activeTab !== 'drafts' && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                      {draftsList.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${showFilters
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Filter className="w-4 h-4" />
              Фильтры
            </button>
            {isNewsEditor && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Создать новость
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Управление категориями
              </button>
            )}
          </div>
        </div>

        {/* Отслеживаемые категории */}
        {followedCategories.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 shrink-0 flex items-center gap-1">
              <Bell className="w-3.5 h-3.5" />
              Подписки:
            </span>
            {followedCategories.map(cat => (
              <span
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? undefined : cat.id)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${selectedCategory === cat.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Панель фильтров */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Поиск по названию / описанию
                </label>
                <div className="flex gap-2">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setAppliedSearch(searchInput); }}
                    placeholder="Введите запрос..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <button
                    onClick={() => setAppliedSearch(searchInput)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Фильтр по тегу
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setAppliedTag(tagInput); }}
                    placeholder="Введите тег..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <button
                    onClick={() => setAppliedTag(tagInput)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            {(appliedSearch || appliedTag || statusFilter) && (
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">Активные фильтры:</span>
                {appliedSearch && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    <Search className="w-3 h-3" />
                    {appliedSearch}
                    <button onClick={() => { setAppliedSearch(''); setSearchInput(''); }} className="hover:text-purple-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {appliedTag && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    <Tag className="w-3 h-3" />
                    {appliedTag}
                    <button onClick={() => { setAppliedTag(''); setTagInput(''); }} className="hover:text-purple-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {statusFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {getStatusLabel(statusFilter).label}
                    <button onClick={() => setStatusFilter('')} className="hover:text-purple-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Список черновиков */}
        {activeTab === 'drafts' && isNewsEditor && (
          <div className="space-y-4">
            {loadingDrafts ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
            ) : draftsList.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Черновиков нет</p>
              </div>
            ) : (
              draftsList.map((newsItem) => (
                <button
                  key={newsItem.id}
                  onClick={() => openNewsDetail(newsItem.id, newsItem)}
                  className="w-full text-left border border-dashed border-gray-300 bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-gray-900">{newsItem.title}</h3>
                        {newsItem.file_ids && newsItem.file_ids.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            <Paperclip className="w-3 h-3" />
                            {newsItem.file_ids.length}
                          </span>
                        )}
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">Черновик</span>
                      </div>
                      <p className="text-gray-600 mb-3">{newsItem.short_description}</p>
                      {newsItem.tags && newsItem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {newsItem.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-full text-xs">
                              <Tag className="w-2.5 h-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        {newsItem.categories && newsItem.categories.length > 0 && (
                          newsItem.categories.map(cat => (
                            <span key={cat.id} className="px-2 py-1 bg-gray-100 rounded text-xs">{cat.name}</span>
                          ))
                        )}
                        <span>{formatDate(newsItem.published_at)}</span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openAuthorProfile(newsItem.author_name);
                          }}
                          className="hover:text-purple-600 hover:underline"
                        >
                          {newsItem.author_name}
                        </button>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Список новостей */}
        {activeTab === 'news' && <div className="space-y-4">
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
                className={`w-full text-left border rounded-lg p-6 hover:shadow-md transition-shadow ${newsItem.is_pinned ? "border-purple-300 bg-purple-50" : "border-gray-200"
                  }`}
              >
                {newsItem.is_pinned && (
                  <div className="flex items-center gap-2 text-purple-600 text-sm font-medium mb-3">
                    <Pin className="w-4 h-4" />
                    Закреплено
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-xl font-semibold text-gray-900">{newsItem.title}</h3>
                      {newsItem.file_ids && newsItem.file_ids.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          <Paperclip className="w-3 h-3" />
                          {newsItem.file_ids.length}
                        </span>
                      )}
                      {/* Статус */}
                      {(() => {
                        const s = getStatusLabel(newsItem.status);
                        return (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${s.className}`}>
                            {s.label}
                          </span>
                        );
                      })()}
                      {/* Комментарии включены/выключены */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${newsItem.comments_enabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                          }`}
                        title={newsItem.comments_enabled ? 'Комментарии включены' : 'Комментарии выключены'}
                      >
                        <MessageCircle className="w-3 h-3" />
                        {newsItem.comments_enabled ? 'Открыты' : 'Закрыты'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{newsItem.short_description}</p>
                    {newsItem.tags && newsItem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {newsItem.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-full text-xs">
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      {newsItem.categories && newsItem.categories.length > 0 && (
                        newsItem.categories.map(cat => (
                          <span key={cat.id} className="px-2 py-1 bg-gray-100 rounded text-xs">{cat.name}</span>
                        ))
                      )}
                      <span>{formatDate(newsItem.published_at)}</span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openAuthorProfile(newsItem.author_name);
                        }}
                        className="hover:text-purple-600 hover:underline"
                      >
                        {newsItem.author_name}
                      </button>
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
                    className={`flex items-center gap-2 transition-colors ${newsItem.is_liked ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
                      }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{newsItem.likes_count}</span>
                  </button>
                  <span className="flex items-center gap-2 text-gray-600">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{newsItem.comments_count}</span>
                  </span>
                </div>
              </button>
            ))
          )}

          {/* Пагинация */}
          {newsList.length > 0 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Предыдущая
              </button>
              <span className="text-sm text-gray-600">
                Страница <span className="font-semibold">{currentPage}</span>
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={newsList.length < PAGE_SIZE}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Следующая →
              </button>
            </div>
          )}
        </div>}
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
            comments_enabled: true,
            status: 'PUBLISHED',
            scheduled_publish_at: '',
            expires_at: '',
            tag_names: '',
            file_ids: [],
            ack_target_all: true,
          });
          setAckSelectedEmployees([]);
          setAckTargetMode('employees');
          setAckSelectedOrgUnits([]);
          setAckOrgUnitToAdd('');
          setAckSearchQuery('');
          setAckSearchResults([]);
          setUploadedFiles([]);
          setUploadError(null);
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
                <p className="text-sm text-gray-600">Сначала создайте категорию через "Управление категориями".</p>
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

          <div className="flex items-center gap-4 flex-wrap">
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

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newNewsData.comments_enabled}
                onChange={(e) => setNewNewsData({ ...newNewsData, comments_enabled: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Комментарии включены</span>
            </label>
          </div>

          {newNewsData.mandatory_ack && (
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Кому назначить ознакомление
              </p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={newNewsData.ack_target_all}
                    onChange={() => {
                      setNewNewsData({ ...newNewsData, ack_target_all: true });
                      setAckSelectedEmployees([]);
                      setAckSelectedOrgUnits([]);
                      setAckOrgUnitToAdd('');
                      setAckTargetMode('employees');
                      setAckSearchQuery('');
                      setAckSearchResults([]);
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Всем сотрудникам
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!newNewsData.ack_target_all}
                    onChange={() => setNewNewsData({ ...newNewsData, ack_target_all: false })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Выбранным сотрудникам</span>
                </label>
              </div>

              {!newNewsData.ack_target_all && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAckTargetMode('employees')}
                      className={`px-3 py-1.5 rounded-lg text-sm border ${ackTargetMode === 'employees' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}
                    >
                      Сотрудники
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setAckTargetMode('departments');
                        await loadOrgUnitsForAck();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm border ${ackTargetMode === 'departments' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}
                    >
                      Отделы
                    </button>
                  </div>

                  {ackTargetMode === 'employees' && (
                    <>
                      <div className="relative">
                        <input
                          type="text"
                          value={ackSearchQuery}
                          onChange={async (e) => {
                            const q = e.target.value;
                            setAckSearchQuery(q);
                            if (q.trim().length < 2) { setAckSearchResults([]); return; }
                            setAckSearchLoading(true);
                            try {
                              const res = await searchSuggestHierarchy(q, 8);
                              if (res.status === 200 && res.data) {
                                setAckSearchResults(res.data.suggestions.filter(
                                  s => !ackSelectedEmployees.some(item => String(item.eid) === String(s.eid))
                                ));
                              }
                            } finally {
                              setAckSearchLoading(false);
                            }
                          }}
                          placeholder="Поиск сотрудника..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        {ackSearchResults.length > 0 && (
                          <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                            {ackSearchResults.map(emp => (
                              <button
                                key={emp.eid}
                                type="button"
                                onClick={() => {
                                  setAckSelectedEmployees(prev => [...prev, { eid: String(emp.eid), full_name: emp.full_name }]);
                                  setAckSearchQuery('');
                                  setAckSearchResults([]);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
                              >
                                <p className="text-sm font-medium text-gray-800">{emp.full_name}</p>
                                <p className="text-xs text-gray-500">{emp.position} · {emp.department}</p>
                              </button>
                            ))}
                          </div>
                        )}
                        {ackSearchLoading && (
                          <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-3 text-center text-sm text-gray-500">
                            Поиск...
                          </div>
                        )}
                      </div>

                      {ackSelectedEmployees.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {ackSelectedEmployees.map(emp => (
                            <span
                              key={emp.eid}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                            >
                              {emp.full_name}
                              <button
                                type="button"
                                onClick={() => setAckSelectedEmployees(prev => prev.filter(item => item.eid !== emp.eid))}
                                className="hover:text-blue-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {ackSelectedEmployees.length === 0 && (
                        <p className="text-xs text-amber-600">Добавьте хотя бы одного сотрудника</p>
                      )}
                    </>
                  )}

                  {ackTargetMode === 'departments' && (
                    <>
                      <div className="flex gap-2">
                        <select
                          value={ackOrgUnitToAdd}
                          onFocus={loadOrgUnitsForAck}
                          onChange={(e) => setAckOrgUnitToAdd(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Выберите отдел</option>
                          {ackOrgUnitOptions
                            .filter((unit) => !ackSelectedOrgUnits.some((selected) => selected.id === unit.id))
                            .map((unit) => (
                              <option key={unit.id} value={unit.id}>
                                {`${'\u00A0\u00A0'.repeat(unit.level)}${unit.name}`}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const unit = ackOrgUnitOptions.find((item) => String(item.id) === ackOrgUnitToAdd);
                            if (!unit) return;
                            setAckSelectedOrgUnits((prev) => [...prev, unit]);
                            setAckOrgUnitToAdd('');
                          }}
                          disabled={!ackOrgUnitToAdd}
                          className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:bg-gray-300"
                        >
                          Добавить
                        </button>
                      </div>

                      {loadingAckOrgUnits && (
                        <p className="text-xs text-gray-500">Загрузка отделов...</p>
                      )}

                      {ackSelectedOrgUnits.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {ackSelectedOrgUnits.map((unit) => (
                            <span
                              key={unit.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                            >
                              {unit.name}
                              <button
                                type="button"
                                onClick={() => setAckSelectedOrgUnits((prev) => prev.filter((item) => item.id !== unit.id))}
                                className="hover:text-blue-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {ackSelectedOrgUnits.length === 0 && (
                        <p className="text-xs text-amber-600">Добавьте хотя бы один отдел</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Статус / черновик / отложенная публикация */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус публикации
            </label>
            <div className="flex gap-2">
              {(['PUBLISHED', 'DRAFT', 'SCHEDULED'] as NewsStatus[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNewNewsData({ ...newNewsData, status: s })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${newNewsData.status === s
                    ? s === 'DRAFT'
                      ? 'bg-gray-600 text-white border-gray-600'
                      : s === 'SCHEDULED'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                >
                  {s === 'PUBLISHED' ? 'Опубликовать' : s === 'DRAFT' ? 'Черновик' : 'По расписанию'}
                </button>
              ))}
            </div>
          </div>

          {newNewsData.status === 'SCHEDULED' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата и время публикации <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={newNewsData.scheduled_publish_at}
                onChange={(e) => setNewNewsData({ ...newNewsData, scheduled_publish_at: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Теги <span className="text-gray-400 font-normal">(через запятую)</span>
              </label>
              <input
                type="text"
                value={newNewsData.tag_names}
                onChange={(e) => setNewNewsData({ ...newNewsData, tag_names: e.target.value })}
                placeholder="важно, обновление, кадры"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата устаревания <span className="text-gray-400 font-normal">(необязательно)</span>
              </label>
              <input
                type="datetime-local"
                value={newNewsData.expires_at}
                onChange={(e) => setNewNewsData({ ...newNewsData, expires_at: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Файлы
            </label>
            <div className="relative">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={uploadingFiles}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    {uploadingFiles ? 'Загрузка...' : 'Выберите файлы'}
                  </span>
                </div>
              </label>
            </div>

            {uploadError && (
              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
            )}

            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">Загруженные файлы:</p>
                <div className="space-y-1">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleCreateNews}
              disabled={isCreateNewsDisabled}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {newNewsData.status === 'DRAFT' ? 'Сохранить черновик' : newNewsData.status === 'SCHEDULED' ? 'Запланировать' : 'Опубликовать'}
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
                  comments_enabled: true,
                  status: 'PUBLISHED',
                  scheduled_publish_at: '',
                  expires_at: '',
                  tag_names: '',
                  file_ids: [],
                  ack_target_all: true,
                });
                setAckSelectedEmployees([]);
                setAckTargetMode('employees');
                setAckSelectedOrgUnits([]);
                setAckOrgUnitToAdd('');
                setAckSearchQuery('');
                setAckSearchResults([]);
                setUploadedFiles([]);
                setUploadError(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно управления категориями */}
      <Modal
        isOpen={showCategoryModal}
        title="Управление категориями"
        onClose={() => {
          setShowCategoryModal(false);
          setNewCategoryName('');
          setCategoryError(null);
        }}
        widthClass="max-w-2xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Создать новую категорию
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  setCategoryError(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Название категории"
              />
              <button
                onClick={handleCreateCategory}
                disabled={creatingCategory || !newCategoryName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {creatingCategory ? 'Создание...' : 'Создать'}
              </button>
            </div>
            {categoryError && (
              <p className="mt-2 text-sm text-red-600">{categoryError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Существующие категории ({categories.length})
            </label>
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Категорий пока нет</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {categories.map((cat) => {
                  const isFollowed = isFollowedCategory(cat.id);
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-gray-900 font-medium truncate">{cat.name}</span>
                        {isFollowed && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full shrink-0">
                            Отслеживается
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <button
                          onClick={() => isFollowed ? handleUnfollowCategory(cat.id) : handleFollowCategory(cat.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${isFollowed
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          title={isFollowed ? 'Отписаться от категории' : 'Подписаться на категорию'}
                        >
                          {isFollowed ? (
                            <><BellOff className="w-3 h-3" /> Отписаться</>
                          ) : (
                            <><Bell className="w-3 h-3" /> Подписаться</>
                          )}
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            disabled={deletingCategoryId === cat.id}
                            className="text-gray-400 hover:text-red-600 disabled:text-gray-300 transition-colors"
                            aria-label={`Удалить категорию ${cat.name}`}
                          >
                            {deletingCategoryId === cat.id ? (
                              <span className="text-xs">Удаление...</span>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setShowCategoryModal(false);
                setNewCategoryName('');
                setCategoryError(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </Modal>
      <AlertModal {...alertState} onClose={closeAlert} />
    </div>
  );
};

export default NewsModule;
