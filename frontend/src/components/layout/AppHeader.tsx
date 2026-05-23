import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import usePortalStore from "../../store/usePortalStore";
import { useAvatar } from "../../hooks/useAvatar";
import type { ModuleConfig, ModuleId } from "../../types/portal";
import MainLogo from '../../assets/main-logo.png'
import Avatar from "../common/Avatar";

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
  const { currentUser, notificationsUnreadCount } = usePortalStore();
  const { avatarUrl } = useAvatar();
  const unreadCount = notificationsUnreadCount;

  if (!currentUser) {
    return (
      <header className="bg-wb-green sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="animate-pulse flex space-x-4 w-full">
              <div className="rounded-lg bg-white/20 h-8 w-32"></div>
              <div className="flex-1 space-x-2 flex">
                <div className="h-8 w-24 rounded bg-white/20"></div>
                <div className="h-8 w-24 rounded bg-white/20"></div>
                <div className="h-8 w-24 rounded bg-white/20"></div>
              </div>
              <div className="rounded-full bg-white/20 h-8 w-8"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-wb-green sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onModuleChange("home")}
              className="flex items-center gap-3 shrink-0"
            >
              <img src={MainLogo} className="h-12 w-12 rounded-xl" />
            </button>

            <div className="hidden lg:block w-px h-8 bg-white/20" />

            <nav className="hidden lg:flex items-center gap-1">
              {modules
                .filter((module) => module.id !== "home")
                .map((module) => (
                  <button
                    key={module.id}
                    onClick={() => onModuleChange(module.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeModule === module.id
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {module.name}
                  </button>
                ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleSearch}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Глобальный поиск"
            >
              <Search className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={onToggleNotifications}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg relative transition-colors"
                aria-label="Уведомления"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-wb-pink text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1 min-w-4">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-wb-pink rounded-full animate-ping opacity-60" />
                  </>
                )}
              </button>
            </div>

            <div className="relative hidden sm:block">
              <button
                onClick={onToggleProfileMenu}
                className="flex items-center gap-1 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Avatar
                  avatarUrl={avatarUrl ?? undefined}
                  fullName={currentUser.full_name}
                  size={8}
                />
                <ChevronDown strokeWidth={1.5} className="w-5 h-5 text-white/70" />
              </button>
            </div>

            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
