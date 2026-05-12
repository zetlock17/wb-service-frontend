import { useCallback, useEffect, useState } from "react";
import {
  getNews,
  getCategories,
  getFollowedCategories,
  followCategory,
  unfollowCategory,
  createCategory,
  deleteCategory,
  addLikeToNews,
  removeLikeFromNews,
  type Category,
  type NewsFilters,
  type NewsListItem,
  type NewsSortBy,
  type NewsStatus,
} from "../../../api/newsApi";
import { PAGE_SIZE } from "../constants";

interface UseNewsDataParams {
  isNewsEditor: boolean;
  isAdmin: boolean;
  hasCurrentUser: boolean;
}

export const useNewsData = ({ isNewsEditor, isAdmin, hasCurrentUser }: UseNewsDataParams) => {
  const [newsList, setNewsList] = useState<NewsListItem[]>([]);
  const [draftsList, setDraftsList] = useState<NewsListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [followedCategories, setFollowedCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingDrafts, setLoadingDrafts] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<NewsSortBy>('newest');
  const [statusFilter, setStatusFilter] = useState<NewsStatus | ''>('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedTag, setAppliedTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [activeTab, setActiveTab] = useState<'news' | 'drafts'>('news');

  const [creatingCategory, setCreatingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const fetchNews = useCallback(async (pageNum: number) => {
    setLoading(true);
    const params: NewsFilters = {
      category_id: selectedCategory,
      sort_by: sortBy,
      status: statusFilter || undefined,
      search: appliedSearch || undefined,
      tag: appliedTag || undefined,
      page: pageNum,
      size: PAGE_SIZE,
    };
    try {
      const response = await getNews(params);
      if (response.status === 200 && response.data) {
        setNewsList(response.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки новостей:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortBy, statusFilter, appliedSearch, appliedTag]);

  const fetchDrafts = useCallback(async () => {
    setLoadingDrafts(true);
    try {
      const response = await getNews({
        status: 'DRAFT',
        sort_by: 'newest',
        page: 1,
        size: 100,
      });
      if (response.status === 200 && response.data) {
        setDraftsList(response.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки черновиков:', error);
    } finally {
      setLoadingDrafts(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      if (response.status === 200 && response.data) {
        setCategories(response.data);
        setSelectedCategory((prev) =>
          prev && response.data.some((cat) => cat.id === prev) ? prev : undefined
        );
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  }, []);

  const fetchFollowedCategories = useCallback(async () => {
    try {
      const response = await getFollowedCategories();
      if (response.status === 200 && response.data) {
        setFollowedCategories(response.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки подписок:', error);
    }
  }, []);

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

  const handleCreateCategory = async (name: string): Promise<number | null> => {
    if (!isAdmin) return null;
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setCategoryError('Название категории должно быть не короче 2 символов');
      return null;
    }
    setCategoryError(null);
    setCreatingCategory(true);
    try {
      const response = await createCategory({ name: trimmed });
      if (response.status === 200 && response.data) {
        await fetchCategories();
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Ошибка создания категории:', error);
      setCategoryError('Не удалось создать категорию');
      return null;
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
        setFollowedCategories((prev) => prev.filter((c) => c.id !== categoryId));
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
        const cat = categories.find((c) => c.id === categoryId);
        if (cat) setFollowedCategories((prev) => [...prev, cat]);
      }
    } catch (error) {
      console.error('Ошибка подписки на категорию:', error);
    }
  };

  const handleUnfollowCategory = async (categoryId: number) => {
    try {
      const response = await unfollowCategory(categoryId);
      if (response.status === 200) {
        setFollowedCategories((prev) => prev.filter((c) => c.id !== categoryId));
      }
    } catch (error) {
      console.error('Ошибка отписки от категории:', error);
    }
  };

  const handleToggleNewsLike = async (newsId: number, isLiked: boolean) => {
    if (!hasCurrentUser) return;
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

  const isFollowedCategory = (categoryId: number) =>
    followedCategories.some((c) => c.id === categoryId);

  return {
    newsList,
    draftsList,
    categories,
    followedCategories,
    loading,
    loadingDrafts,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    statusFilter,
    setStatusFilter,
    appliedSearch,
    setAppliedSearch,
    appliedTag,
    setAppliedTag,
    currentPage,
    setCurrentPage,
    activeTab,
    setActiveTab,
    creatingCategory,
    deletingCategoryId,
    categoryError,
    setCategoryError,
    fetchNews,
    refetchNewsList: () => fetchNews(currentPage),
    handleCreateCategory,
    handleDeleteCategory,
    handleFollowCategory,
    handleUnfollowCategory,
    handleToggleNewsLike,
    isFollowedCategory,
  };
};
