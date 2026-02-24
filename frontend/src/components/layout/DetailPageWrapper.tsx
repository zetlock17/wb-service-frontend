import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePortalStore from "../../store/usePortalStore";
import AppHeader from "./AppHeader";
import GlobalSearchModal, { type SearchFilter } from "./GlobalSearchModal";
import MobileNav from "./MobileNav";
import NotificationsPanel from "./NotificationsPanel";
import ProfileMenu from "./ProfileMenu";
import { modules as moduleConfig } from "../../data/mockData";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { registerApiErrorHandler } from "../../api/api";
import ErrorPage from "../../pages/ErrorPage";
import type { ModuleId } from "../../types/portal";

interface DetailPageWrapperProps {
  isAuthenticated: boolean;
  detailComponent: React.ReactNode;
  moduleFallback?: ModuleId;
}

const DetailPageWrapper = ({
  isAuthenticated,
  detailComponent,
  moduleFallback = "home",
}: DetailPageWrapperProps) => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<SearchFilter>("all");
  const { width } = useWindowDimensions();

  const {
    documents,
    knowledgeBase,
    employees,
    news,
    departments,
    fetchPortalData,
    hasApiError,
    error,
    setApiError,
    clearApiError,
  } = usePortalStore();

  useEffect(() => {
    registerApiErrorHandler(setApiError);
  }, [setApiError]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPortalData();
    }
  }, [fetchPortalData, isAuthenticated]);

  const handleModuleChange = (nextModule: ModuleId) => {
    setIsMobileNavOpen(false);
    navigate(`/${nextModule}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const searchResults = {
    documents: searchFilter === "all" || searchFilter === "documents"
      ? documents.filter(doc => 
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.author.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5)
      : [],
    knowledge: searchFilter === "all" || searchFilter === "knowledge"
      ? knowledgeBase.filter(article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.tags.join(" ").toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5)
      : [],
    employees: searchFilter === "all" || searchFilter === "employees"
      ? employees.filter(employee => {
          const dept = departments.find(d => d.id === employee.department_id);
          return employee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 dept?.name.toLowerCase().includes(searchQuery.toLowerCase());
        }).slice(0, 5)
      : [],
    news: searchFilter === "all" || searchFilter === "news"
      ? news.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
      : [],
  };

  const handleRetry = () => {
    clearApiError();
    fetchPortalData();
  };

  const handleGoHome = () => {
    clearApiError();
    handleModuleChange("home");
  };

  if (hasApiError) {
    return <ErrorPage error={error} onRetry={handleRetry} onGoHome={handleGoHome} />;
  }

  return (
    <div className="min-h-screen bg-purple-50">
      <AppHeader
        activeModule={moduleFallback}
        modules={moduleConfig}
        onModuleChange={handleModuleChange}
        onToggleSearch={() => setIsSearchOpen(true)}
        onToggleNotifications={() => {
          setIsNotificationsOpen((prev) => !prev);
          setIsProfileMenuOpen(false);
        }}
        onToggleProfileMenu={() => {
          setIsProfileMenuOpen((prev) => !prev);
          setIsNotificationsOpen(false);
        }}
        onToggleSidebar={() => setIsMobileNavOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{detailComponent}</main>

      <GlobalSearchModal
        isOpen={isSearchOpen}
        query={searchQuery}
        filter={searchFilter}
        results={searchResults}
        departments={departments}
        onClose={() => setIsSearchOpen(false)}
        onQueryChange={setSearchQuery}
        onFilterChange={setSearchFilter}
        onNavigate={handleModuleChange}
      />

      <div
        className="fixed top-22 right-6 z-40"
        style={width > 1280 ? { right: `${(width / 2 - 1280 / 2) / 16 + 2}rem` } : {}}
      >
        <div className="relative">
          <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
          <ProfileMenu isOpen={isProfileMenuOpen} onNavigateHome={() => handleModuleChange("home")} />
        </div>
      </div>

      <MobileNav
        isOpen={isMobileNavOpen}
        modules={moduleConfig}
        activeModule={moduleFallback}
        onSelect={handleModuleChange}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </div>
  );
};

export default DetailPageWrapper;
