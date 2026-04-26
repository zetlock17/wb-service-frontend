import {
  Archive,
  Check,
  // ChevronDown,
  // ChevronUp,
  Download,
  Edit,
  Eye,
  FileText,
  History,
  Info,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import Modal from "../../../components/common/Modal";
import type { Document, DocumentVersion } from "../../../api/documentsApi";
import { documentTypeOptions, statusBadgeClasses, statusLabels } from "../constants";
import { formatDateTime, isAllowedFile, normalizeDocumentType } from "../utils";
import type { BrowserFolder, EditingDocumentData } from "../types";

type ActiveTab = "overview" | "versions" | "edit";

const buildEditingData = (document: Document | null): EditingDocumentData => ({
  title: document?.title ?? "",
  type: normalizeDocumentType(document?.type) ?? "REGULATION",
  description: document?.description ?? "",
  status: document?.status === "PUBLISHED" ? "ACTIVE" : (document?.status ?? "DRAFT"),
  curator_id: document?.curator_id ?? null,
});

interface DocumentDetailModalProps {
  document: Document | null;
  versions: DocumentVersion[];
  versionsLoading: boolean;
  downloadingId: number | null;
  documentActionLoading: boolean;
  uploading: boolean;
  uploadVersionProgress: number | null;
  canManage: boolean;
  readDocumentIds: Set<number>;
  folders: BrowserFolder[];
  getPersonDisplayName: (eid: string | null | undefined) => string;
  onClose: () => void;
  onDownload: (docId: number) => void;
  onPreview: (doc: Document) => void;
  onMarkAsRead: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onDownloadVersion: (docId: number, versionId: number) => void;
  onSaveEdit: (data: EditingDocumentData) => Promise<boolean>;
  onUploadNewVersion: (file: File, comment: string, major: boolean) => Promise<boolean>;
}

const DocumentDetailModal = ({
  document,
  versions,
  versionsLoading,
  downloadingId,
  documentActionLoading,
  uploading,
  uploadVersionProgress,
  canManage,
  readDocumentIds,
  folders,
  getPersonDisplayName,
  onClose,
  onDownload,
  onPreview,
  onMarkAsRead,
  onArchive,
  onRestore,
  onDelete,
  onDownloadVersion,
  onSaveEdit,
  onUploadNewVersion,
}: DocumentDetailModalProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  const [editingData, setEditingData] = useState<EditingDocumentData>(() => buildEditingData(document));

  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [versionComment, setVersionComment] = useState("");
  const [versionMajor, setVersionMajor] = useState(false);
  const versionFileInputRef = useRef<HTMLInputElement>(null);

  const handleVersionFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      setVersionFile(null);
      return;
    }
    if (!isAllowedFile(f)) {
      setVersionFile(null);
      e.target.value = "";
      return;
    }
    setVersionFile(f);
    e.target.value = "";
  };

  const handleSaveEdit = async () => {
    const success = await onSaveEdit(editingData);
    if (success) setActiveTab("overview");
  };

  const handleUploadVersion = async () => {
    if (!versionFile) return;
    const success = await onUploadNewVersion(versionFile, versionComment, versionMajor);
    if (success) {
      setVersionFile(null);
      setVersionComment("");
      setVersionMajor(false);
      if (versionFileInputRef.current) versionFileInputRef.current.value = "";
    }
  };

  const folderName = document
    ? folders.find((f) => f.id === document.folder_id)?.name ?? "Без папки"
    : "";

  const isRead = document ? readDocumentIds.has(document.id) : false;

  const tabs: { id: ActiveTab; label: string; icon: React.ElementType; show: boolean }[] = [
    { id: "overview", label: "Обзор", icon: Info, show: true },
    { id: "versions", label: `Версии${versions.length ? ` (${versions.length})` : ""}`, icon: History, show: true },
    { id: "edit", label: "Изменить", icon: Edit, show: canManage },
  ];

  return (
    <Modal
      isOpen={Boolean(document)}
      title={document?.title ?? ""}
      onClose={onClose}
      widthClass="max-w-3xl"
    >
      {document && (
        <div className="space-y-0">
          <div className="-mx-6 -mt-4 mb-4 flex border-b border-gray-200">
            {tabs
              .filter((t) => t.show)
              .map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "border-b-2 border-purple-600 text-purple-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
          </div>

          {activeTab === "overview" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses[document.status]}`}>
                  {statusLabels[document.status]}
                </span>
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                  {document.type}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  v{document.current_version}
                </span>
                {isRead && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    <Check className="h-3 w-3" />
                    Прочитан
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <MetaRow label="Автор">{getPersonDisplayName(document.author_id)}</MetaRow>
                {document.curator_id && (
                  <MetaRow label="Куратор">{getPersonDisplayName(document.curator_id)}</MetaRow>
                )}
                <MetaRow label="Дата загрузки">{formatDateTime(document.created_at)}</MetaRow>
                <MetaRow label="Папка">{folderName}</MetaRow>
                <MetaRow label="Файл">
                  <span className="truncate font-mono text-xs">{document.original_filename}</span>
                </MetaRow>
                <MetaRow label="MIME">{document.mime_type}</MetaRow>
              </div>

              {document.description && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Описание</p>
                  <p className="text-sm text-gray-700">{document.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onDownload(document.id)}
                  disabled={downloadingId === document.id}
                  className="inline-flex flex-1 min-w-36 items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  {downloadingId === document.id ? "Скачивание..." : "Скачать"}
                </button>
                <button
                  type="button"
                  onClick={() => onPreview(document)}
                  className="inline-flex flex-1 min-w-36 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  Предпросмотр
                </button>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-2 text-sm font-medium text-gray-700">Статус ознакомления</p>
                <button
                  type="button"
                  onClick={onMarkAsRead}
                  disabled={isRead}
                  className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    isRead
                      ? "cursor-default bg-green-100 text-green-700"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    {isRead ? "Вы отметили документ как прочитанный" : "Отметить как прочитанный"}
                  </span>
                </button>
              </div>

              {canManage && (
                <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className="inline-flex flex-1 min-w-28 items-center justify-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                  >
                    <Edit className="h-4 w-4" />
                    Редактировать
                  </button>
                  {document.status === "ARCHIVED" ? (
                    <button
                      type="button"
                      onClick={onRestore}
                      disabled={documentActionLoading}
                      className="inline-flex flex-1 min-w-28 items-center justify-center gap-1.5 rounded-xl border border-green-300 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-60"
                    >
                      <Check className="h-4 w-4" />
                      Восстановить
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onArchive}
                      disabled={documentActionLoading}
                      className="inline-flex flex-1 min-w-28 items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
                    >
                      <Archive className="h-4 w-4" />
                      В архив
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={documentActionLoading}
                    className="inline-flex flex-1 min-w-28 items-center justify-center gap-1.5 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    Удалить
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "versions" && (
            <div className="space-y-4">
              {canManage && (
                <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
                  <p className="mb-3 text-sm font-semibold text-gray-800">Загрузить новую версию</p>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Файл</label>
                      <input
                        ref={versionFileInputRef}
                        type="file"
                        onChange={handleVersionFileChange}
                        accept=".docx,.pdf,.xlsx,.jpg,.jpeg,.png"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      {versionFile && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                          <FileText className="h-3 w-3" />
                          {versionFile.name}
                        </p>
                      )}
                    </div>

                    {uploading && uploadVersionProgress !== null && (
                      <div>
                        <div className="mb-1 flex justify-between text-xs text-gray-500">
                          <span>Загрузка...</span>
                          <span>{uploadVersionProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-1.5 rounded-full bg-purple-600 transition-all"
                            style={{ width: `${uploadVersionProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Комментарий к версии</label>
                      <input
                        type="text"
                        value={versionComment}
                        onChange={(e) => setVersionComment(e.target.value)}
                        placeholder="Что изменилось?"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={versionMajor}
                        onChange={(e) => setVersionMajor(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      Мажорное обновление (увеличить старшую версию)
                    </label>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleUploadVersion}
                        disabled={uploading || !versionFile}
                        className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <UploadCloud className="h-4 w-4" />
                        {uploading ? "Загрузка..." : "Загрузить"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {versionsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : versions.length ? (
                <div className="space-y-2">
                  {versions.map((version) => {
                    const label = version.version_number ?? `${version.version_major}.${version.version_minor}`;
                    return (
                      <div
                        key={version.id}
                        className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border p-3.5 ${
                          version.is_current
                            ? "border-green-200 bg-green-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">v{label}</span>
                            {version.is_current && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                Актуальная
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-gray-600">
                            {getPersonDisplayName(version.uploaded_by)} · {formatDateTime(version.created_at)}
                          </p>
                          {version.upload_comment && (
                            <p className="mt-0.5 text-xs italic text-gray-500">{version.upload_comment}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onDownloadVersion(document.id, version.id)}
                          disabled={downloadingId === version.id}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {downloadingId === version.id ? "..." : "Скачать"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-gray-400">История версий пуста</p>
              )}
            </div>
          )}

          {activeTab === "edit" && canManage && (
            <div className="space-y-4">
              <FormField label="Название">
                <input
                  type="text"
                  value={editingData.title}
                  onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Тип документа *">
                  <select
                    value={editingData.type}
                    onChange={(e) => setEditingData({ ...editingData, type: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                  >
                    {documentTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Статус">
                  <select
                    value={editingData.status}
                    onChange={(e) => setEditingData({ ...editingData, status: e.target.value as Document["status"] })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="DRAFT">Черновик</option>
                    <option value="ACTIVE">Действующий</option>
                    <option value="ARCHIVED">Архивный</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Куратор (EID)">
                <input
                  type="text"
                  value={editingData.curator_id ?? ""}
                  onChange={(e) =>
                    setEditingData({ ...editingData, curator_id: e.target.value || null })
                  }
                  placeholder="EID куратора"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                />
              </FormField>

              <FormField label="Описание">
                <textarea
                  value={editingData.description}
                  onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                />
              </FormField>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={documentActionLoading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />
                  {documentActionLoading ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  disabled={documentActionLoading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

const MetaRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-0.5 text-sm text-gray-800">{children}</p>
  </div>
);

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    {children}
  </div>
);

export default DocumentDetailModal;
