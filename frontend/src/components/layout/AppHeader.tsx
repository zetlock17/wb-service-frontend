import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import usePortalStore from "../../store/usePortalStore";
import { useAvatar } from "../../hooks/useAvatar";
import type { ModuleConfig, ModuleId } from "../../types/portal";

interface AppHeaderProps {
  activeModule: ModuleId;
  modules: ModuleConfig[];
  onModuleChange: (moduleId: ModuleId) => void;
  onToggleSearch: () => void;
  onToggleNotifications: () => void;
  onToggleProfileMenu: () => void;
  onToggleSidebar: () => void;
}

const AppHeader = ({
  activeModule,
  modules,
  onModuleChange,
  onToggleSearch,
  onToggleNotifications,
  onToggleProfileMenu,
  onToggleSidebar,
}: AppHeaderProps) => {
  const { currentUser, notifications } = usePortalStore();
  const { avatarUrl } = useAvatar();
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  if (!currentUser) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="animate-pulse flex space-x-4 w-full">
              <div className="rounded-lg bg-gray-200 h-8 w-32"></div>
              <div className="flex-1 space-x-2 flex">
                <div className="h-8 w-24 rounded bg-gray-200"></div>
                <div className="h-8 w-24 rounded bg-gray-200"></div>
                <div className="h-8 w-24 rounded bg-gray-200"></div>
              </div>
              <div className="rounded-full bg-gray-200 h-8 w-8"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => onModuleChange("home")}
              className="flex items-center gap-2 text-xl font-bold text-purple-600"
            >
              <div className="w-8 h-8 bg-linear-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                WB
              </div>
              WB Bank
            </button>
            <nav className="hidden lg:flex items-center gap-1">
              {modules
                .filter((module) => module.id !== "home")
                .map((module) => (
                  <button
                    key={module.id}
                    onClick={() => onModuleChange(module.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeModule === module.id
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {module.name}
                  </button>
                ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSearch}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              aria-label="Глобальный поиск"
            >
              <Search className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={onToggleNotifications}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative"
                aria-label="Уведомления"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
            <div className="relative hidden sm:block">
              <button
                onClick={onToggleProfileMenu}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={currentUser.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {currentUser.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                )}
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              aria-label="Меню"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

