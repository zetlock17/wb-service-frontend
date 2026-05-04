import { LogOut, Settings, User } from "lucide-react";
import { useEffect, useRef } from "react";
import usePortalStore from "../../store/usePortalStore";
import { useAvatar } from "../../hooks/useAvatar";
import { clearTokens } from "../../utils/authTokens";
import Avatar from "../common/Avatar";

interface ProfileMenuProps {
  isOpen: boolean;
  onNavigateHome: () => void;
  onClose: () => void;
}

const ProfileMenu = ({ isOpen, onNavigateHome, onClose }: ProfileMenuProps) => {
  const { currentUser } = usePortalStore();
  const { avatarUrl } = useAvatar();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    let removeListener: (() => void) | undefined;

    const timer = setTimeout(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
          onCloseRef.current();
        }
      };
      document.addEventListener('click', handleClickOutside);
      removeListener = () => document.removeEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      removeListener?.();
    };
  }, [isOpen]);

  const handleLogout = () => {
    clearTokens();
    window.location.href = "/login";
  };

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

  return (
    <div ref={panelRef} className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <Avatar
              avatarUrl={avatarUrl ?? undefined}
              fullName={currentUser.full_name}
              size={16}
            />
          </div>

          <div className="flex-1">
            <p className="font-medium text-gray-900 text-sm">{currentUser.full_name}</p>
            <p className="text-xs text-gray-500">EID: {currentUser.eid}</p>
          </div>
        </div>
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
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
        >
          <LogOut className="w-4 h-4" />
          Выход
        </button>
      </div>
    </div>
  );
};

export default ProfileMenu;
