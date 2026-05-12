import { ArrowLeft, Eye, Lock, MessageCircle, MessageCircleOff, Pencil, Share2, Tag, ThumbsUp } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import usePortalStore from "../../store/usePortalStore";
import { useAlert } from "../../hooks/useAlert";
import AlertModal from "../../components/common/AlertModal";
import { useNewsDetail } from "./hooks/useNewsDetail";
import { useComments } from "./hooks/useComments";
import { useMentions } from "./hooks/useMentions";
import { useEditNewsForm } from "./hooks/useEditNewsForm";
import StatusBadge from "./components/StatusBadge";
import NewsMarkdownBody from "./components/NewsMarkdownBody";
import NewsAttachments from "./components/NewsAttachments";
import AcknowledgeBlock from "./components/AcknowledgeBlock";
import CommentsSection from "./components/CommentsSection";
import EditNewsModal from "./components/EditNewsModal";

const NewsDetailPage = () => {
  const { alertState, showAlert, closeAlert } = useAlert();
  const { newsId } = useParams();
  const navigate = useNavigate();
  const { currentUser, roles } = usePortalStore();

  const isNewsEditor = roles.includes("news_editor");
  const isAdmin = roles.includes("admin");
  const parsedId = Number(newsId);

  const detail = useNewsDetail({
    parsedId,
    hasCurrentUser: Boolean(currentUser),
    showAlert,
  });

  const comments = useComments({
    newsId: parsedId,
    authorId: currentUser ? String(currentUser.eid) : undefined,
    isNewsEditor,
    isAdmin,
    currentUserEid: currentUser ? String(currentUser.eid) : undefined,
  });

  const mentions = useMentions(
    {
      new: comments.newComment,
      reply: comments.replyContent,
      edit: comments.editingCommentContent,
    },
    {
      new: comments.setNewComment,
      reply: comments.setReplyContent,
      edit: comments.setEditingCommentContent,
    }
  );

  const editForm = useEditNewsForm({
    isNewsEditor,
    showAlert,
    onSaved: detail.reloadNewsDetail,
  });

  const openProfile = (eid: string) => navigate(`/profile/${eid}`);

  if (!parsedId || Number.isNaN(parsedId)) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/news")}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к новостям
        </button>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-700">Некорректный идентификатор новости.</p>
        </div>
      </div>
    );
  }

  const { newsDetail, loadingNews, downloadingFileId, acknowledging } = detail;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/news")}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к новостям
        </button>
        {isNewsEditor && newsDetail && (
          <button
            onClick={() => editForm.openEditModal(newsDetail)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Pencil className="w-4 h-4" />
            Редактировать
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {loadingNews || !newsDetail ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{newsDetail.title}</h2>
              <p className="text-gray-600 mt-2">{newsDetail.short_description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <StatusBadge status={newsDetail.status} withIcon />
              {newsDetail.categories?.map((cat) => (
                <span key={cat.id} className="px-3 py-1 bg-gray-100 rounded-full text-xs">{cat.name}</span>
              ))}
              <span>{newsDetail.published_at && new Date(newsDetail.published_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span>{newsDetail.author_name}</span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  newsDetail.comments_enabled ? "bg-green-100 text-green-700" : "bg-red-50 text-red-500"
                }`}
              >
                {newsDetail.comments_enabled ? (
                  <><MessageCircle className="w-3 h-3" /> Комментарии открыты</>
                ) : (
                  <><MessageCircleOff className="w-3 h-3" /> Комментарии закрыты</>
                )}
              </span>
              {newsDetail.mandatory_ack && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  <Lock className="w-3 h-3" />
                  Обязательное прочтение
                </span>
              )}
            </div>

            {newsDetail.tags && newsDetail.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newsDetail.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 border border-purple-200 rounded-full text-xs"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <NewsMarkdownBody content={newsDetail.content} />

            <NewsAttachments
              fileIds={newsDetail.file_ids ?? []}
              downloadingFileId={downloadingFileId}
              onDownload={detail.handleDownloadFile}
            />

            <div className="flex items-center gap-6 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Eye className="w-5 h-5" />
                <span>{newsDetail.views_count}</span>
              </div>
              <button
                onClick={() => detail.handleToggleNewsLike(Boolean(newsDetail.is_liked))}
                className={`flex items-center gap-2 transition-colors ${
                  newsDetail.is_liked ? "text-purple-600" : "text-gray-600 hover:text-purple-600"
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                <span>{newsDetail.likes_count}</span>
              </button>
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="w-5 h-5" />
                <span>{comments.commentsCount} комментариев</span>
              </div>
              <button
                onClick={detail.handleShareNews}
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors ml-auto"
                title="Поделиться новостью"
              >
                <Share2 className="w-5 h-5" />
                <span>Поделиться</span>
              </button>
            </div>

            {newsDetail.mandatory_ack && (
              <AcknowledgeBlock
                isAcknowledged={Boolean(newsDetail.is_acknowledged)}
                mustAcknowledge={Boolean(newsDetail.must_acknowledge)}
                acknowledging={acknowledging}
                onAcknowledge={detail.handleAcknowledge}
              />
            )}
          </div>
        )}
      </div>

      {newsDetail?.comments_enabled && (
        <CommentsSection
          commentsCount={comments.commentsCount}
          comments={comments}
          mentions={mentions}
          onOpenProfile={openProfile}
        />
      )}

      {newsDetail && (
        <EditNewsModal newsId={newsDetail.id} controller={editForm} />
      )}

      <AlertModal {...alertState} onClose={closeAlert} />
    </div>
  );
};

export default NewsDetailPage;
