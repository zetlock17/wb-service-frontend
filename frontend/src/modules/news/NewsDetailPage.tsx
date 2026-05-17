import {
  ArrowLeft,
  Eye,
  Lock,
  MessageCircle,
  MessageCircleOff,
  Pencil,
  Share2,
  Tag,
  ThumbsUp,
} from "lucide-react";
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
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => navigate("/news")}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13.5px] font-bold text-gray-700 transition hover:bg-wb-pink-light hover:text-wb-green"
        >
          <ArrowLeft className="h-4 w-4" />
          К списку
        </button>
        <div className="rounded-[28px] bg-white p-6">
          <p className="text-[14.5px] font-semibold text-gray-600">Некорректный идентификатор новости.</p>
        </div>
      </div>
    );
  }

  const { newsDetail, loadingNews, downloadingFileId, acknowledging } = detail;

  return (
    <div className="space-y-5">
      {/* nav row */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/news")}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13.5px] font-bold text-gray-700 transition hover:bg-wb-pink-light hover:text-wb-green"
        >
          <ArrowLeft className="h-4 w-4" />
          К списку
        </button>
        {isNewsEditor && newsDetail && (
          <button
            type="button"
            onClick={() => editForm.openEditModal(newsDetail)}
            className="inline-flex items-center gap-2 rounded-full bg-wb-green px-5 py-2.5 text-[13.5px] font-bold text-white transition hover:-translate-y-px"
          >
            <Pencil className="h-4 w-4" />
            Редактировать
          </button>
        )}
      </div>

      {/* article card */}
      <article className="rounded-[28px] bg-white p-6 sm:p-9">
        {loadingNews || !newsDetail ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-2/3 rounded-2xl bg-wb-pink-light" />
            <div className="h-5 w-1/2 rounded-xl bg-wb-pink-light" />
            <div className="h-40 rounded-2xl bg-wb-pink-light" />
          </div>
        ) : (
          <>
            <h1 className="text-[32px] font-black leading-[1.05] tracking-tight text-gray-900 sm:text-[40px]">
              {newsDetail.title}
            </h1>
            {newsDetail.short_description && (
              <p className="mt-2 text-[16px] font-medium text-gray-500">
                {newsDetail.short_description}
              </p>
            )}

            {/* meta row */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <StatusBadge status={newsDetail.status} withIcon />

              {newsDetail.categories?.map((cat) => (
                <span
                  key={cat.id}
                  className="rounded-full bg-wb-pink-light px-3 py-1 text-[12.5px] font-extrabold text-wb-green"
                >
                  {cat.name}
                </span>
              ))}

              {newsDetail.published_at && (
                <span className="text-[14px] font-bold text-gray-700">
                  {new Date(newsDetail.published_at).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}

              <span className="text-[14px] font-semibold text-gray-400">·</span>
              <span className="text-[14px] font-bold text-gray-700">{newsDetail.author_name}</span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-extrabold ${
                  newsDetail.comments_enabled
                    ? "bg-wb-green-light text-wb-green"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {newsDetail.comments_enabled ? (
                  <><MessageCircle className="h-3 w-3" /> Комментарии открыты</>
                ) : (
                  <><MessageCircleOff className="h-3 w-3" /> Комментарии закрыты</>
                )}
              </span>

              {newsDetail.mandatory_ack && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-wb-pink-light px-3 py-1 text-[12.5px] font-extrabold text-wb-pink-dark">
                  <Lock className="h-3 w-3" />
                  Обязательное прочтение
                </span>
              )}
            </div>

            {/* tags */}
            {newsDetail.tags && newsDetail.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {newsDetail.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full bg-wb-pink-light px-3 py-1 text-[12.5px] font-extrabold text-wb-pink-dark ring-1 ring-inset ring-wb-pink-dark/20"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* body */}
            <div className="mt-6 text-[16px] leading-relaxed text-gray-700">
              <NewsMarkdownBody content={newsDetail.content} />
            </div>

            {/* attachments */}
            <NewsAttachments
              fileIds={newsDetail.file_ids ?? []}
              downloadingFileId={downloadingFileId}
              onDownload={detail.handleDownloadFile}
            />

            {/* stats footer */}
            <div className="mt-7 flex flex-wrap items-center gap-5 border-t border-gray-100 pt-4">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-400">
                <Eye className="h-[18px] w-[18px]" />
                {newsDetail.views_count}
              </span>
              <button
                type="button"
                onClick={() => detail.handleToggleNewsLike(Boolean(newsDetail.is_liked))}
                className={`inline-flex items-center gap-1.5 text-[13px] font-semibold transition ${
                  newsDetail.is_liked ? "text-wb-pink-dark" : "text-gray-400 hover:text-wb-pink-dark"
                }`}
              >
                <ThumbsUp className="h-[18px] w-[18px]" />
                {newsDetail.likes_count}
              </button>
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-400">
                <MessageCircle className="h-[18px] w-[18px]" />
                {comments.commentsCount} комментариев
              </span>
              <button
                type="button"
                onClick={detail.handleShareNews}
                className="ml-auto inline-flex items-center gap-2 rounded-full bg-wb-pink-light px-4 py-2 text-[13.5px] font-bold text-wb-green transition hover:opacity-80"
                title="Поделиться новостью"
              >
                <Share2 className="h-4 w-4" />
                Поделиться
              </button>
            </div>

            {/* acknowledge */}
            {newsDetail.mandatory_ack && (
              <div className="mt-5">
                <AcknowledgeBlock
                  isAcknowledged={Boolean(newsDetail.is_acknowledged)}
                  mustAcknowledge={Boolean(newsDetail.must_acknowledge)}
                  acknowledging={acknowledging}
                  onAcknowledge={detail.handleAcknowledge}
                />
              </div>
            )}
          </>
        )}
      </article>

      {/* comments */}
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
