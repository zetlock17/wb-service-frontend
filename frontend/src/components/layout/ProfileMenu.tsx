import { LogOut, Settings, User, Camera, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import usePortalStore from "../../store/usePortalStore";
import { useAvatar } from "../../hooks/useAvatar";

interface ProfileMenuProps {
  isOpen: boolean;
  onNavigateHome: () => void;
}

const ProfileMenu = ({ isOpen, onNavigateHome }: ProfileMenuProps) => {
  const { currentUser } = usePortalStore();
  const { avatarUrl, isLoading, updateAvatar, deleteAvatar } = useAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  if (!isOpen) {
    return null;
  }

  if (!currentUser) {
    return (
      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 animate-pulse">
        <div className="p-4 border-b border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="p-2 space-y-2">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {

      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }

      await updateAvatar(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    if (window.confirm('Удалить аватар?')) {
      await deleteAvatar();
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = () => {
    const arrayOfWords = currentUser.full_name.split(" ")
    return arrayOfWords[0][0] + arrayOfWords[2][0]
  };

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={handleAvatarClick}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={currentUser.full_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-linear-to-br from-fuchsia-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {getInitials()}
              </div>
            )}

            <div className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-opacity ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
              <Camera className="w-6 h-6 text-white" />
            </div>

            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="flex-1">
            <p className="font-medium text-gray-900 text-sm">{currentUser.full_name}</p>
            <p className="text-xs text-gray-500">EID: {currentUser.eid}</p>
          </div>

          {avatarUrl && !isLoading && (
            <button
              onClick={handleDeleteAvatar}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Удалить аватар"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      
      <div className="p-2">
        <button
          onClick={onNavigateHome}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <User className="w-4 h-4" />
          Мой профиль
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
          <Settings className="w-4 h-4" />
          Настройки
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
          <LogOut className="w-4 h-4" />
          Выход
        </button>
      </div>
    </div>
  );
};

export default ProfileMenu;
