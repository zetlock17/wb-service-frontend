import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  acknowledgeNews,
  addLikeToNews,
  getNewsById,
  removeLikeFromNews,
  type NewsDetail,
  type NewsListItem,
} from "../../../api/newsApi";
import { fetchStatic } from "../../../api/filesApi";

type LocationState = { news?: NewsDetail | NewsListItem };

type AlertFn = (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;

interface UseNewsDetailParams {
  parsedId: number;
  hasCurrentUser: boolean;
  showAlert: AlertFn;
}

export const useNewsDetail = ({ parsedId, hasCurrentUser, showAlert }: UseNewsDetailParams) => {
  const location = useLocation();

  const initialNews = useMemo(() => {
    const state = location.state as LocationState | null;
    return state?.news ?? null;
  }, [location.state]);

  const [newsDetail, setNewsDetail] = useState<NewsDetail | null>(() =>
    initialNews && 'content' in initialNews ? (initialNews as NewsDetail) : null
  );
  const [loadingNews, setLoadingNews] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null);
  const [acknowledging, setAcknowledging] = useState(false);

  const fetchedNewsId = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!parsedId || Number.isNaN(parsedId)) return;
    if (fetchedNewsId.current === parsedId) return;

    if (isInitialMount.current && initialNews && 'content' in initialNews && initialNews.id === parsedId) {
      setNewsDetail(initialNews as NewsDetail);
      fetchedNewsId.current = parsedId;
      isInitialMount.current = false;
      return;
    }
    isInitialMount.current = false;

    (async () => {
      setLoadingNews(true);
      try {
        const response = await getNewsById(parsedId);
        if (response.status === 200 && response.data) {
          setNewsDetail(response.data);
          fetchedNewsId.current = parsedId;
        }
      } catch (error) {
        console.error('Ошибка загрузки новости:', error);
      } finally {
        setLoadingNews(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedId]);

  const reloadNewsDetail = async () => {
    if (!newsDetail) return;
    fetchedNewsId.current = null;
    const refreshed = await getNewsById(newsDetail.id);
    if (refreshed.status === 200 && refreshed.data) {
      setNewsDetail(refreshed.data);
      fetchedNewsId.current = newsDetail.id;
    }
  };

  const handleToggleNewsLike = async (isLiked: boolean) => {
    if (!hasCurrentUser || !newsDetail) return;
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
      console.error('Ошибка изменения лайка новости:', error);
    }
  };

  const handleShareNews = async () => {
    if (!newsDetail) return;
    const shareUrl = `${window.location.origin}/news/${newsDetail.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showAlert('Ссылка на новость скопирована в буфер обмена!', 'success');
    } catch (error) {
      console.error('Ошибка копирования ссылки:', error);
      showAlert('Не удалось скопировать ссылку', 'error');
    }
  };

  const handleDownloadFile = async (fileId: number, fileName?: string) => {
    setDownloadingFileId(fileId);
    try {
      const response = await fetchStatic(fileId);
      if (response.status === 200 && response.data) {
        const link = document.createElement('a');
        link.href = response.data;
        link.download = fileName || `file_${fileId}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('Ошибка скачивания файла:', response.message);
        showAlert('Не удалось скачать файл', 'error');
      }
    } catch (error) {
      console.error('Ошибка скачивания файла:', error);
      showAlert('Ошибка при скачивании файла', 'error');
    } finally {
      setDownloadingFileId(null);
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
      }
    } catch (error) {
      console.error('Ошибка подтверждения прочтения:', error);
    } finally {
      setAcknowledging(false);
    }
  };

  return {
    newsDetail,
    setNewsDetail,
    loadingNews,
    downloadingFileId,
    acknowledging,
    reloadNewsDetail,
    handleToggleNewsLike,
    handleShareNews,
    handleDownloadFile,
    handleAcknowledge,
  };
};
