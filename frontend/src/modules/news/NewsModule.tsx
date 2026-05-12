import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AlertModal from "../../components/common/AlertModal";
import { useAlert } from "../../hooks/useAlert";
import usePortalStore from "../../store/usePortalStore";
import type { NewsListItem } from "../../api/newsApi";
import { suggestEmployees } from "../../api/profileApi";
import { useNewsData } from "./hooks/useNewsData";
import { useNewsForm } from "./hooks/useNewsForm";
import NewsToolbar from "./components/NewsToolbar";
import FollowedCategories from "./components/FollowedCategories";
import NewsFiltersPanel from "./components/NewsFiltersPanel";
import NewsCard from "./components/NewsCard";
import DraftCard from "./components/DraftCard";
import Pagination from "./components/Pagination";
import CreateNewsModal from "./components/CreateNewsModal";
import ManageCategoriesModal from "./components/ManageCategoriesModal";
import { PAGE_SIZE } from "./constants";

const NewsModule = () => {
  const { alertState, showAlert, closeAlert } = useAlert();
  const { currentUser, roles } = usePortalStore();
  const navigate = useNavigate();

  const isNewsEditor = roles.includes('news_editor');
  const isAdmin = roles.includes('admin');

  const data = useNewsData({
    isNewsEditor,
    isAdmin,
    hasCurrentUser: Boolean(currentUser),
  });

  const form = useNewsForm({
    categories: data.categories,
    isNewsEditor,
    hasCurrentUser: Boolean(currentUser),
    showAlert,
    onCreated: () => data.refetchNewsList(),
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const openNewsDetail = (newsId: number, news?: NewsListItem) => {
    navigate(`/news/${newsId}`, { state: { news } });
  };

  const openAuthorProfile = async (fullName: string) => {
    try {
      const response = await suggestEmployees(fullName, 10);
      if (response.status >= 200 && response.status < 300 && response.data?.suggestions?.length) {
        const normalized = fullName.trim().toLowerCase();
        const exact = response.data.suggestions.find(
          (item) => item.full_name.trim().toLowerCase() === normalized
        );
        const target = exact || response.data.suggestions[0];
        navigate(`/profile/${target.eid}`);
      }
    } catch (error) {
      console.error('Ошибка перехода в профиль автора:', error);
    }
  };

  if (data.loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <NewsToolbar
          isNewsEditor={isNewsEditor}
          isAdmin={isAdmin}
          activeTab={data.activeTab}
          onChangeTab={data.setActiveTab}
          draftsCount={data.draftsList.length}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((s) => !s)}
          onCreateNews={() => form.setShowCreateModal(true)}
          onManageCategories={() => setShowCategoryModal(true)}
        />

        <FollowedCategories
          followedCategories={data.followedCategories}
          selectedCategory={data.selectedCategory}
          onSelect={data.setSelectedCategory}
        />

        {showFilters && (
          <NewsFiltersPanel
            categories={data.categories}
            selectedCategory={data.selectedCategory}
            onSelectCategory={data.setSelectedCategory}
            sortBy={data.sortBy}
            onChangeSortBy={data.setSortBy}
            appliedSearch={data.appliedSearch}
            onApplySearch={data.setAppliedSearch}
            appliedTag={data.appliedTag}
            onApplyTag={data.setAppliedTag}
            statusFilter={data.statusFilter}
            onChangeStatus={data.setStatusFilter}
          />
        )}

        {data.activeTab === 'drafts' && isNewsEditor && (
          <div className="space-y-4">
            {data.loadingDrafts ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
            ) : data.draftsList.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Черновиков нет</p>
              </div>
            ) : (
              data.draftsList.map((draft) => (
                <DraftCard
                  key={draft.id}
                  draft={draft}
                  onOpen={openNewsDetail}
                  onOpenAuthor={openAuthorProfile}
                />
              ))
            )}
          </div>
        )}

        {data.activeTab === 'news' && (
          <div className="space-y-4">
            {data.newsList.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Новостей пока нет</p>
              </div>
            ) : (
              data.newsList.map((news) => (
                <NewsCard
                  key={news.id}
                  news={news}
                  onOpen={openNewsDetail}
                  onToggleLike={data.handleToggleNewsLike}
                  onOpenAuthor={openAuthorProfile}
                />
              ))
            )}

            {data.newsList.length > 0 && (
              <Pagination
                currentPage={data.currentPage}
                onChangePage={(updater) => data.setCurrentPage(updater)}
                hasNext={data.newsList.length >= PAGE_SIZE}
              />
            )}
          </div>
        )}
      </div>

      <CreateNewsModal categories={data.categories} controller={form} />

      <ManageCategoriesModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={data.categories}
        isAdmin={isAdmin}
        creatingCategory={data.creatingCategory}
        deletingCategoryId={data.deletingCategoryId}
        categoryError={data.categoryError}
        setCategoryError={data.setCategoryError}
        isFollowedCategory={data.isFollowedCategory}
        onCreateCategory={data.handleCreateCategory}
        onDeleteCategory={data.handleDeleteCategory}
        onFollowCategory={data.handleFollowCategory}
        onUnfollowCategory={data.handleUnfollowCategory}
      />

      <AlertModal {...alertState} onClose={closeAlert} />
    </div>
  );
};

export default NewsModule;
