import { useEffect, useMemo, useState } from "react";
import { registerApiErrorHandler } from "./api/api";
import AppHeader from "./components/layout/AppHeader";
import GlobalSearchModal, { type SearchFilter } from "./components/layout/GlobalSearchModal";
import MobileNav from "./components/layout/MobileNav";
import NotificationsPanel from "./components/layout/NotificationsPanel";
import ProfileMenu from "./components/layout/ProfileMenu";
import { modules as moduleConfig } from "./data/mockData";
import CalendarModule from "./modules/calendar/CalendarModule";
import DocumentsModule from "./modules/documents/DocumentsModule";
import HomeModule from "./modules/home/HomeModule";
import IdeasModule from "./modules/ideas/IdeasModule";
import KnowledgeModule from "./modules/knowledge/KnowledgeModule";
import NewsModule from "./modules/news/NewsModule";
import ReportsModule from "./modules/reports/ReportsModule";
import StructureModule from "./modules/structure/StructureModule";
import SurveysModule from "./modules/surveys/SurveysModule";
import TrainingModule from "./modules/training/TrainingModule";
import ErrorPage from "./pages/ErrorPage";
import usePortalStore from "./store/usePortalStore";
import type { GlobalSearchResults, ModuleId } from "./types/portal";
import useWindowDimensions from "./hooks/useWindowDimensions";

const emptySearchResults: GlobalSearchResults = {
  documents: [],
  knowledge: [],
  employees: [],
  news: [],
};

function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>("home");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<SearchFilter>("all");
  const { width, height } = useWindowDimensions();

  const { documents, knowledgeBase, employees, news, departments, fetchPortalData, hasApiError, error, setApiError, clearApiError } = usePortalStore();

  useEffect(() => {
    registerApiErrorHandler(setApiError);
  }, [setApiError]);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  const handleModuleChange = (moduleId: ModuleId) => {
    setActiveModule(moduleId);
    setIsMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const searchResults = useMemo<GlobalSearchResults>(() => {
    if (!searchQuery.trim()) {
      return emptySearchResults;
    }

    const query = searchQuery.trim().toLowerCase();
    const matches = (value: string) => value.toLowerCase().includes(query);
    const filterMatches = (section: SearchFilter) => searchFilter === "all" || searchFilter === section;

    const getDepartmentName = (id: number) => {
      const dept = departments.find(d => d.id === id);
      return dept ? dept.name : "";
    };

    return {
      documents: filterMatches("documents")
        ? documents.filter((doc) => matches(doc.title) || matches(doc.author)).slice(0, 5)
        : [],
      knowledge: filterMatches("knowledge")
        ? knowledgeBase.filter((article) => matches(article.title) || matches(article.tags.join(" "))).slice(0, 5)
        : [],
      employees: filterMatches("employees")
        ? employees.filter((employee) => matches(employee.full_name) || matches(getDepartmentName(employee.department_id))).slice(0, 5)
        : [],
      news: filterMatches("news") ? news.filter((item) => matches(item.title)).slice(0, 5) : [],
    };
  }, [searchFilter, searchQuery, documents, knowledgeBase, employees, news, departments]);

  const handleRetry = () => {
    clearApiError();
    fetchPortalData();
  };

  const handleGoHome = () => {
    clearApiError();
    setActiveModule("home");
  };

  if (hasApiError) {
    return <ErrorPage error={error} onRetry={handleRetry} onGoHome={handleGoHome} />;
  }

  const renderModule = () => {
    switch (activeModule) {
      case "home":
        return <HomeModule onNavigate={handleModuleChange} />;
      case "structure":
        return <StructureModule />;
      case "documents":
        return <DocumentsModule />;
      case "knowledge":
        return <KnowledgeModule />;
      case "news":
        return <NewsModule />;
      case "surveys":
        return <SurveysModule />;
      case "ideas":
        return <IdeasModule />;
      case "calendar":
        return <CalendarModule />;
      case "training":
        return <TrainingModule />;
      case "reports":
        return <ReportsModule />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <AppHeader
        activeModule={activeModule}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{renderModule()}</main>

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

      <div className={`fixed top-22 right-6 z-40`} style={width > 1280 ? { right: `${(width / 2 - 1280 / 2) / 16 + 2}rem` } : {}}>
        <div className="relative">
          <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
          <ProfileMenu isOpen={isProfileMenuOpen} onNavigateHome={() => handleModuleChange("home")} />
        </div>
      </div>

      <MobileNav
        isOpen={isMobileNavOpen}
        modules={moduleConfig}
        activeModule={activeModule}
        onSelect={handleModuleChange}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </div>
  );
}

export default App;
