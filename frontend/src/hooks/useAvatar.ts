import { useState, useEffect, useCallback } from 'react';
import { fetchStatic, uploadPhoto, deleteStatic } from '../api/photoApi';
import usePortalStore from '../store/usePortalStore';

// Упрощенная версия хука только для отображения аватарки
export const useAvatar = () => {
  const { currentUser } = usePortalStore();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка аватарки при монтировании или изменении avatar_id
  useEffect(() => {
    const loadAvatar = async () => {
      if (!currentUser?.avatar_id) {
        setAvatarUrl(null);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetchStatic(currentUser.avatar_id);
        
        if (response.status === 200 && response.data) {
          setAvatarUrl(response.data);
        } else {
          setAvatarUrl(null);
        }
      } catch (err) {
        console.error('Failed to load avatar:', err);
        setAvatarUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAvatar();
  }, [currentUser?.avatar_id]);

  return {
    avatarUrl,
    isLoading,
  };
};

// Полная версия хука с функционалом редактирования для использования только в HomeModule
export const useAvatarWithEdit = () => {
  const { currentUser, updateCurrentUser } = usePortalStore();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка аватарки при монтировании или изменении avatar_id
  useEffect(() => {
    const loadAvatar = async () => {
      if (!currentUser?.avatar_id) {
        setAvatarUrl(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchStatic(currentUser.avatar_id);
        
        if (response.status === 200 && response.data) {
          setAvatarUrl(response.data);
        } else {
          setAvatarUrl(null);
        }
      } catch (err) {
        console.error('Failed to load avatar:', err);
        setError('Не удалось загрузить аватар');
        setAvatarUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAvatar();
  }, [currentUser?.avatar_id]);

  // Загрузка новой аватарки
  const uploadAvatar = useCallback(async (file: File) => {
    if (!currentUser) {
      setError('Пользователь не авторизован');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await uploadPhoto(
        file,
        currentUser.eid,
        'image'  // тип для аватарки
      );

      if (response.status === 200 && response.data) {
        const newAvatarId = response.data;
        // Обновляем avatar_id в профиле пользователя
        await updateCurrentUser(currentUser.eid, { avatar_id: newAvatarId });
        
        // Загружаем URL новой аватарки
        const avatarResponse = await fetchStatic(newAvatarId);
        if (avatarResponse.status === 200 && avatarResponse.data) {
          setAvatarUrl(avatarResponse.data);
        }
        
        return true;
      } else {
        setError('Не удалось загрузить аватар');
        return false;
      }
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setError('Ошибка при загрузке аватара');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, updateCurrentUser]);

  // Удаление аватарки
  const deleteAvatar = useCallback(async () => {
    if (!currentUser || currentUser.avatar_id === null || currentUser.avatar_id === undefined) {
      setError('Аватар отсутствует');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await deleteStatic(currentUser.avatar_id, currentUser.eid);

      if (response.status === 200) {
        // Убираем avatar_id из профиля
        await updateCurrentUser(currentUser.eid, { avatar_id: null });
        setAvatarUrl(null);
        return true;
      } else {
        setError('Не удалось удалить аватар');
        return false;
      }
    } catch (err) {
      console.error('Failed to delete avatar:', err);
      setError('Ошибка при удалении аватара');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, updateCurrentUser]);

  // Изменение аватарки (удаление старой + загрузка новой)
  const updateAvatar = useCallback(async (file: File) => {
    if (!currentUser) {
      setError('Пользователь не авторизован');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Если есть старый аватар - удаляем его
      if (currentUser.avatar_id !== null && currentUser.avatar_id !== undefined) {
        try {
          await deleteStatic(currentUser.avatar_id, currentUser.eid);
        } catch (deleteErr) {
          console.warn('Failed to delete old avatar, proceeding with upload:', deleteErr);
          // Продолжаем загрузку новой аватарки даже если удаление старой не удалось
        }
      }

      // Загружаем новый аватар
      const uploadResponse = await uploadPhoto(
        file,
        currentUser.eid,
        'image'  // тип для аватарки
      );

      if (uploadResponse.status === 200 && uploadResponse.data) {
        const newAvatarId = uploadResponse.data;
        // Обновляем avatar_id в профиле
        await updateCurrentUser(currentUser.eid, { avatar_id: newAvatarId });
        
        // Загружаем URL новой аватарки
        const avatarResponse = await fetchStatic(newAvatarId);
        if (avatarResponse.status === 200 && avatarResponse.data) {
          setAvatarUrl(avatarResponse.data);
        }
        
        return true;
      } else {
        setError('Не удалось загрузить новый аватар');
        return false;
      }
    } catch (err) {
      console.error('Failed to update avatar:', err);
      setError('Ошибка при обновлении аватара');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, updateCurrentUser]);

  return {
    avatarUrl,
    isLoading,
    error,
    uploadAvatar,
    deleteAvatar,
    updateAvatar,
  };
};
