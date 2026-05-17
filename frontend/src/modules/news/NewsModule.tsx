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
      <div className="animate-pulse space-y-5">
        <div className="rounded-[28px] bg-wb-green p-8 sm:p-10">
          <div className="mb-4 h-8 w-48 rounded-full bg-white/20" />
          <div className="h-12 w-80 max-w-full rounded-2xl bg-white/20" />
        </div>
        <div className="space-y-3">
          <div className="h-40 rounded-[28px] bg-white" />
          <div className="h-40 rounded-[28px] bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
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
        <div className="flex flex-col gap-3.5">
          {data.loadingDrafts ? (
            <div className="animate-pulse space-y-3">
              <div className="h-40 rounded-[28px] bg-white" />
              <div className="h-40 rounded-[28px] bg-white" />
            </div>
          ) : data.draftsList.length === 0 ? (
            <div className="rounded-[28px] border-2 border-dashed border-wb-pink-light bg-white p-10 text-center">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-wb-pink-light text-wb-pink-dark">
                <MessageCircle className="h-7 w-7" />
              </div>
              <p className="text-[15px] font-extrabold text-gray-800">Черновиков нет</p>
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
        <>
          <div className="flex flex-col gap-3.5">
            {data.newsList.length === 0 ? (
              <div className="rounded-[28px] border-2 border-dashed border-wb-pink-light bg-white p-10 text-center">
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-wb-pink-light text-wb-pink-dark">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <p className="text-[15px] font-extrabold text-gray-800">Новостей пока нет</p>
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
          </div>

          {data.newsList.length >= PAGE_SIZE && (
            <Pagination
              currentPage={data.currentPage}
              onChangePage={(updater) => data.setCurrentPage(updater)}
              hasNext={data.newsList.length >= PAGE_SIZE}
            />
          )}
        </>
      )}

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
