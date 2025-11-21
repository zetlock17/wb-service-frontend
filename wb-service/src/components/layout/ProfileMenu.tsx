import { LogOut, Settings, User } from "lucide-react";
import usePortalStore from "../../store/usePortalStore";

interface ProfileMenuProps {
  isOpen: boolean;
  onNavigateHome: () => void;
}

const ProfileMenu = ({ isOpen, onNavigateHome }: ProfileMenuProps) => {
  const { currentUser } = usePortalStore();

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
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <p className="font-medium text-gray-900">{currentUser.employee.full_name}</p>
        <p className="text-sm text-gray-500">EID: {currentUser.employee.id}</p>
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
